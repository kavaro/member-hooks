import test from 'ava'
import sinon from 'sinon'
import { HookMethods } from '..'

test('ensure: should add entry if it does not exist', t => {
  const methods = new HookMethods()
  const result = methods.ensure('a')
  t.deepEqual(result, methods.get('a'))
  t.deepEqual(result, methods.ensure('a'))
})

test('before: adds a method sorted by priority', t => {
  const methods = new HookMethods()
  const before10 = sinon.spy()
  const before100 = sinon.spy()
  const before1 = sinon.spy()
  methods.before('a', 10, before10)
  t.deepEqual(methods.get('a')?.before.getArray(), [
    { priority: 10, fn: before10 }
  ])
  methods.before('a', 100, before100)
  t.deepEqual(methods.get('a')?.before.getArray(), [
    { priority: 10, fn: before10 }, 
    { priority: 100, fn: before100 }
  ])
  methods.before('a', 1, before1)
  t.deepEqual(methods.get('a')?.before.getArray(), [
    { priority: 1, fn: before1 }, 
    { priority: 10, fn: before10 }, 
    { priority: 100, fn: before100 }
  ])
})

test('after: adds a method sorted by priority', t => {
  const methods = new HookMethods()
  const after10 = sinon.spy()
  const after100 = sinon.spy()
  const after1 = sinon.spy()
  methods.after('a', 10, after10)
  t.deepEqual(methods.get('a')?.after.getArray(), [
    { priority: 10, fn: after10 }
  ])
  methods.after('a', 100, after100)
  t.deepEqual(methods.get('a')?.after.getArray(), [
    { priority: 10, fn: after10 }, 
    { priority: 100, fn: after100 }
  ])
  methods.after('a', 1, after1)
  t.deepEqual(methods.get('a')?.after.getArray(), [
    { priority: 1, fn: after1 }, 
    { priority: 10, fn: after10 }, 
    { priority: 100, fn: after100 }
  ])
})

test('at: adds a method if it does not exist', t => {
  const methods = new HookMethods()
  const at = sinon.spy()
  methods.at('a', 10, at)
  t.deepEqual(methods.get('a')?.at, {
    priority: 10,
    fn: at
  })
})

test('at: replaces a method if it has higher or equal priority', t => {
  const methods = new HookMethods()
  const at1 = sinon.spy()
  const at2 = sinon.spy()
  const at3 = sinon.spy()
  methods.at('a', 10, at1)
  methods.at('a', 100, at2)
  t.deepEqual(methods.get('a')?.at, {
    priority: 100,
    fn: at2
  })
  methods.at('a', 100, at3)
  t.deepEqual(methods.get('a')?.at, {
    priority: 100,
    fn: at3
  })
})

test('at: does not replace a method if it has lower priority', t => {
  const methods = new HookMethods()
  const at1 = sinon.spy()
  const at2 = sinon.spy()
  methods.at('a', 10, at1)
  methods.at('a', 1, at2)
  t.deepEqual(methods.get('a')?.at, {
    priority: 10,
    fn: at1
  })
})