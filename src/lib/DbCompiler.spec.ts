import test from 'ava'
import sinon from 'sinon'
import { v4 as uuid } from 'uuid'
import Loki from 'lokijs'
import DbCompiler from './DbCompiler'
import CollectionCompiler from './CollectionCompiler'

test.beforeEach(t => {
  const db = new Loki(uuid(), { adapter: new Loki.LokiMemoryAdapter() })
  t.context = new DbCompiler(db)
})

test('ensure: should add and return collection compiler when it does not exist', t => {
  const compiler = t.context as DbCompiler
  // @ts-ignore
  const collection = compiler.db.addCollection('c1')
  const collectionCompiler = compiler.ensure(collection)
  t.assert(collectionCompiler instanceof CollectionCompiler)
  t.is(compiler.has(collection), true)
  t.assert(compiler.get(collection) === collectionCompiler)
})

test('ensure: should return existing collection compiler when it exist', t => {
  const compiler = t.context as DbCompiler
  // @ts-ignore
  const collection = compiler.db.addCollection('c1')
  const collectionCompiler = compiler.ensure(collection)
  t.assert(compiler.ensure(collection) === collectionCompiler)
})

test('compile: chould call compile method of all collectionCompilers', t => {
  const compiler = t.context as DbCompiler
  // @ts-ignore
  const collection1 = compiler.db.addCollection('c1')
  const collectionCompiler1 = compiler.ensure(collection1)
  const spy1 = collectionCompiler1.compile = sinon.spy()
  // @ts-ignore
  const collection2 = compiler.db.addCollection('c2')
  const collectionCompiler2 = compiler.ensure(collection2)
  const spy2 = collectionCompiler2.compile = sinon.spy()
  compiler.compile()
  t.assert(spy1.calledOnce)
  t.assert(spy2.calledOnce)
})
