import test from 'ava'
import sinon from 'sinon'
import { createDecorator, HookMethods } from '..'

test('should not throw when there are no hooks', t => {
  const methods = new HookMethods()
  methods.ensure('a')
  const method = sinon.spy(value => value + 1)
  const destroy = sinon.spy()
  const decorator = createDecorator(methods, destroy)
  const target = { a: method }
  const remove = decorator(target)
  t.is(target.a(10), 11)
  remove()
  t.assert(destroy.calledOnce)
})

test('should create decorator with single before hook', t => {
  const methods = new HookMethods()
  const result: number[] = []
  const method = sinon.spy(value => result.push(value))
  const before10 = sinon.spy(args => {
    result.push(args[0])
    args[0] = args[0] + 1
  })
  methods.before('a', 10, before10)
  const decorator = createDecorator(methods,sinon.spy())
  const target = { a: method }
  decorator(target)
  target.a(10)
  t.assert(method.calledOnce)
  t.assert(before10.calledOnce)
  t.deepEqual(result, [10, 11])
})

test('should create decorator with 2 before hooks', t => {
  const methods = new HookMethods()
  const result: number[] = []
  const method = sinon.spy(value => result.push(value))
  const before1 = sinon.spy(args => {
    result.push(args[0])
    args[0] = args[0] + 1
  })
  const before10 = sinon.spy(args => {
    result.push(args[0])
    args[0] = args[0] + 2
  })
  methods.before('a', 1, before1)
  methods.before('a', 10, before10)
  const decorator = createDecorator(methods, sinon.spy())
  const target = { a: method }
  decorator(target)
  target.a(10)
  t.assert(method.calledOnce)
  t.assert(before1.calledOnce)
  t.assert(before10.calledOnce)
  t.deepEqual(result, [10, 11, 13])
})

test('should create decorator with single after hook', t => {
  const methods = new HookMethods()
  const result: number[] = []
  const method = sinon.spy(value => {
    result.push(value)
    return value + 1
  })
  const after10 = sinon.spy((value, args) => {
    value += args[0]
    result.push(value)
    return value
  })
  methods.after('a', 10, after10)
  const decorator = createDecorator(methods, sinon.spy())
  const target = { a: method }
  decorator(target)
  t.is(target.a(10), 21)
  t.assert(method.calledOnce)
  t.assert(after10.calledOnce)
  t.deepEqual(result, [10, 21])
})

test('should create decorator with 2 after hooks', t => {
  const methods = new HookMethods()
  const result: number[] = []
  const method = sinon.spy(value => {
    result.push(value)
    return value + 1
  })
  const after1 = sinon.spy((value, args) => {
    value += args[0]
    result.push(value)
    return value
  })
  const after10 = sinon.spy((value, args) => {
    value += args[0]
    result.push(value)
    return value
  })
  methods.after('a', 1, after1)
  methods.after('a', 10, after10)
  const decorator = createDecorator(methods, sinon.spy())
  const target = { a: method }
  decorator(target)
  t.is(target.a(10), 31)
  t.assert(method.calledOnce)
  t.assert(after1.calledOnce)
  t.assert(after10.calledOnce)
  t.deepEqual(result, [10, 21, 31])
})

test('should create decorator with before and after hook', t => {
  const methods = new HookMethods()
  const result: number[] = []
  const before1 = sinon.spy(args => {
    result.push(args[0])
    args[0] = args[0] + 1
  })
  const method = sinon.spy(value => {
    result.push(value)
    return value + 1
  })
  const after1 = sinon.spy((value, args) => {
    value += args[0]
    result.push(value)
    return value
  })
  methods.before('a', 1, before1)
  methods.after('a', 1, after1)
  const decorator = createDecorator(methods, sinon.spy)
  const target = { a: method }
  decorator(target)
  t.is(target.a(10), 23)
  t.assert(method.calledOnce)
  t.assert(before1.calledOnce)
  t.assert(after1.calledOnce)
  t.deepEqual(result, [10, 11, 23])
})

test('should return function that removes decorator', t => {
  const methods = new HookMethods()
  function b():void {}
  class T {
    public b: ()=>void = b
    public a():void {}
  }
  const beforeA = sinon.spy(() => {})
  const afterB = sinon.spy(value => value)
  methods.before('a', 1, beforeA) 
  methods.after('b', 1, afterB) 
  const destroy = sinon.spy()
  const decorator = createDecorator(methods, destroy)
  const target = new T()
  t.assert(target.a === T.prototype.a)
  t.assert(target.b === b)
  const remove = decorator(target)
  t.assert(target.a !== T.prototype.a)
  t.assert(target.b !== b)
  target.a()
  target.b()
  t.assert(beforeA.calledOnce)
  t.assert(afterB.calledOnce)
  remove()
  t.assert(target.a === T.prototype.a)
  t.assert(target.b === b)
  t.assert(destroy.calledOnce)
})