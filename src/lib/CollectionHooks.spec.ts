import test from 'ava'
import sinon from 'sinon'
import Loki from 'lokijs'
import { v4 as uuid } from 'uuid'
import BinarySortedArray from 'binary-sorted-array'
import KeyValue from './KeyValue'
import CollectionHooks, { TLokiConstructor, TCollection, THook } from './CollectionHooks'

test.beforeEach(t => {
  const db = new Loki(uuid(), { adapter: new Loki.LokiMemoryAdapter() })
  const collection = db.addCollection('collection');
  (db as TLokiConstructor).hooksStore = { d: 'dv' };
  (collection as TCollection<any>).hooksStore = { c: 'cv' };
  t.context = new CollectionHooks<any>(db, collection)
})

test('constructor: should convert hooksStore property of db and collection into KeyValue', t => {
  const collectionHooks = t.context as CollectionHooks<any>
  t.assert(collectionHooks.dbStore instanceof KeyValue)
  t.is(collectionHooks.dbStore.get('d'), 'dv')
  t.assert(collectionHooks.collectionStore instanceof KeyValue)
  t.is(collectionHooks.collectionStore.get('c'), 'cv')
})

test('add: should insert hook at priority', t => {
  const collectionHooks = t.context as CollectionHooks<any>
  const m10 = sinon.spy()
  collectionHooks.add('m1', 10, m10)
  t.deepEqual((collectionHooks.get('m1') as BinarySortedArray<THook>).getArray(), [
    { priority: 10, fn: m10 }
  ])
  const m11 = sinon.spy()
  collectionHooks.add('m1', 11, m11)
  t.deepEqual((collectionHooks.get('m1') as BinarySortedArray<THook>).getArray(), [
    { priority: 10, fn: m10 },
    { priority: 11, fn: m11 }
  ])
  const m9 = sinon.spy()
  collectionHooks.add('m1', 9, m9)
  t.deepEqual((collectionHooks.get('m1') as BinarySortedArray<THook>).getArray(), [
    { priority: 9, fn: m9 },
    { priority: 10, fn: m10 },
    { priority: 11, fn: m11 }
  ])
  const tminus1 = sinon.spy()
  collectionHooks.add('m2', -1, tminus1)
  t.deepEqual((collectionHooks.get('m2') as BinarySortedArray<THook>).getArray(), [
    { priority: -1, fn: tminus1 }
  ])
  t.deepEqual(Array.from(collectionHooks.keys()), ['m1', 'm2'])
})