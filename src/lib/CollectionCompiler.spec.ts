import test from 'ava'
import sinon from 'sinon'
import { v4 as uuid } from 'uuid'
import Loki from 'lokijs'
import CollectionCompiler from './CollectionCompiler'

test.beforeEach(t => {
  const db = new Loki(uuid(), { adapter: new Loki.LokiMemoryAdapter() })
  const collection = db.addCollection('collection', { disableMeta: true });
  t.context = new CollectionCompiler<any>(db, collection)
})

test('compile: should add pre hook when priority < 0', t => {
  const compiler = t.context as CollectionCompiler<any>
  const preInsert = sinon.spy((args) => args[0].name = 'Name2')
  compiler.hooks.add('insert', -10, preInsert)
  compiler.compile()
  const { collection } = compiler.hooks
  const inserted = collection.insert({ name: 'Name1' })
  t.deepEqual(inserted, { $loki: 1, name: 'Name2' })
})

test('compile: should add post hook when priority >= 0', t => {
  const compiler = t.context as CollectionCompiler<any>
  const postInsert = sinon.spy(doc => {
    doc.name = [doc.firstName, doc.lastName].join(' ')
    return doc
  })
  compiler.hooks.add('insert', 0, postInsert)
  compiler.compile()
  const { collection } = compiler.hooks
  const inserted = collection.insert({ firstName: 'first', lastName: 'last' })
  t.deepEqual(inserted, { $loki: 1, name: 'first last', firstName: 'first', lastName: 'last' })
})

test('compile: should add pre and post hook', t => {
  const compiler = t.context as CollectionCompiler<any>
  const preInsert = sinon.spy(args => args[0].id = 'id1')
  const postInsert = sinon.spy(doc => {
    doc.name = [doc.firstName, doc.lastName].join(' ')
    return doc
  })
  compiler.hooks.add('insert', -10, preInsert)
  compiler.hooks.add('insert', 0, postInsert)
  compiler.compile()
  const { collection } = compiler.hooks
  const inserted = collection.insert({ firstName: 'first', lastName: 'last' })
  t.deepEqual(inserted, { id: 'id1', $loki: 1, name: 'first last', firstName: 'first', lastName: 'last' })
})

test('compile: should not throw when method does not exist', t => {
  const compiler = t.context as CollectionCompiler<any>
  const pre = sinon.spy()
  compiler.hooks.add('NoMethod', 0, pre)
  t.notThrows(() => compiler.compile())
})

test('compile: should not compile twice', t => {
  const compiler = t.context as CollectionCompiler<any>
  let index = 2
  const preInsert = sinon.spy((args) => args[0].name = `Name${index++}`)
  compiler.hooks.add('insert', -10, preInsert)
  compiler.compile()
  compiler.compile()
  const { collection } = compiler.hooks
  const inserted = collection.insert({ name: 'Name1' })
  t.deepEqual(inserted, { $loki: 1, name: 'Name2' })
})