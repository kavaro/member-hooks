import test from 'ava'
import KeyValue from './KeyValue'

test('constructor: should allow to initialize keys and values', t => {
  const store = new KeyValue({ k: 'v' })
  t.is(store.get('k'), 'v')
})

test('set: should set value at key and return value', t => {
  const store = new KeyValue()
  t.is(store.set('k', 'v'), 'v')
  t.is(store.get('k'), 'v')
})

test('has: should return true when key exists', t => {
  const store = new KeyValue()
  t.is(store.has('k'), false)
  store.set('k', 'v')
  t.is(store.has('k'), true)
})

test('ensure: set key if not present else set key, returns value', t => {
  const store = new KeyValue()
  t.is(store.ensure('k', 'v'), 'v')
  store.set('e', 'e0')
  t.is(store.ensure('e', 'e1'), 'e0')
})

