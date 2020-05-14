import test from 'ava'
import sinon from 'sinon'
import { v4 as uuid } from 'uuid'
import { HookMethods, Hooks, TObj, TJSONHook, TCreate } from '..'

interface TIdOptions {
  field: string
}

function id(methods: HookMethods, options?: TIdOptions): void {
  const { field = 'id' } = { ...options }
  methods.after('insert', 5, function (this: any, doc: TObj<any>): TObj<any> {
    doc[field] = uuid()
    return doc
  })
}

interface TSeqOptions {
  field?: string,
  store?: string,
  key?: string
}

function seq(methods: HookMethods, options?: TSeqOptions): void {
  const { field = 'seq', store = 'hooksState', key = 'seq' } = { ...options } 
  methods.before('insert', 10, function (this: any, args: any[]):void {
    const state = this[store] || (this[store] = {})
    const doc = args[0]
    doc[field] = state[key] = (state[key] || 0) + 1
  })
}

function contextHook(): TCreate {
  return function(target: any, context: (target: any) => void):void {
    context(target)
  }
}

class Collection {
  public hooks: TJSONHook[]

  constructor(options: TObj<any>) {
    this.hooks = options.hooks
  }

  public insert(doc: TObj<any>): TObj<any> {
    return doc
  }
}

test('register: should throw when already registered and force is false', t => {
  const hooks = new Hooks()
  hooks.register('seq', seq)
  t.throws(() => hooks.register('seq', seq))
})

test('register: should not throw when already registered and force is true', t => {
  const hooks = new Hooks()
  hooks.register('seq', seq)
  t.notThrows(() => hooks.register('seq', seq, true))
})

test('install/uninstall: should install/uninstall hooks', t => {
  const hooks = new Hooks()
  hooks.register('seq', seq)
  hooks.register('id', id)
  const collection = new Collection({
    hooks: [['id', { field: 'uid' }], ['seq', { field: 'seq' }]]
  })
  hooks.install(collection, collection.hooks)
  const { uid: uid1, ...fields1 } = collection.insert({ id: 'id1' })
  t.is(typeof uid1, 'string')
  t.is(uid1.length, 36)
  t.deepEqual(fields1, { id: 'id1', seq: 1 })
  const { uid: uid2, ...fields2 } = collection.insert({ id: 'id1' })
  t.is(typeof uid2, 'string')
  t.is(uid2.length, 36)
  t.deepEqual(fields2, { id: 'id1', seq: 2 })
  t.assert(uid1 !== uid2)
  hooks.uninstall(collection)
  t.deepEqual(collection.insert({ id: 'id1' }), { id: 'id1' })
})

test('install/uninstall: should not install/uninstall hooks twice', t => {
  const hooks = new Hooks()
  hooks.register('seq', seq)
  const collection = new Collection({
    hooks: [['seq', { field: 'seq' }]]
  })
  hooks.install(collection, collection.hooks)
  hooks.install(collection, collection.hooks)
  t.deepEqual(collection.insert({ id: 'id1' }), { id: 'id1', seq: 1 })
  hooks.uninstall(collection)
  t.deepEqual(collection.insert({ id: 'id1' }), { id: 'id1' })
  hooks.uninstall(collection)
  t.deepEqual(collection.insert({ id: 'id1' }), { id: 'id1' })
})

test('install/uninstall: should uninstall/install when hooks change and uninstall when hooks are removed', t => {
  const hooks = new Hooks()
  hooks.register('seq', seq)
  const collection = new Collection({
    hooks: [['seq', { field: 'seq' }]]
  })
  hooks.install(collection, collection.hooks)
  t.deepEqual(collection.insert({ id: 'id1' }), { id: 'id1', seq: 1 })
  collection.hooks = [['seq', { field: 'seq1' }]]
  hooks.install(collection, collection.hooks)
  t.deepEqual(collection.insert({ id: 'id1' }), { id: 'id1', seq1: 2 })
  delete collection.hooks
  hooks.install(collection, collection.hooks)
  t.deepEqual(collection.insert({ id: 'id1' }), { id: 'id1' })
})

test('install: should throw when factory has not been registered', t => {
  const hooks = new Hooks()
  const collection = new Collection({
    hooks: [['seq', { field: 'seq' }]]
  })
  t.throws(() => hooks.install(collection, collection.hooks))
})

test('install: should reuse decorator when possible', t => {
  const hooks = new Hooks()
  hooks.register('seq', seq)
  const collection1 = new Collection({
    hooks: [['seq', { field: 'seq' }]]
  })
  const collection2 = new Collection({
    hooks: [['seq', { field: 'seq' }]]
  })
  hooks.install(collection1, collection1.hooks)
  hooks.install(collection2, collection2.hooks)
  t.deepEqual(collection1.insert({ id: 'id1' }), { id: 'id1', seq: 1 })
  t.deepEqual(collection2.insert({ id: 'id1' }), { id: 'id1', seq: 1 })  
})

test('install: should pass context to create function', t => {
  const hooks = new Hooks()
  hooks.register('context', contextHook)
  const collection = new Collection({
    hooks: [['context', {}]]
  })
  const contextSpy = sinon.spy()
  hooks.install(collection, collection.hooks, contextSpy)
  t.assert(contextSpy.calledOnce)
  t.is(contextSpy.getCall(0).args[0], collection)
})
