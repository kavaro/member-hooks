import test from 'ava'
import sinon from 'sinon'
import { HookMethods, Hooks, TCreate, TDestroy, TCreateDestroy } from '.'

function ensureNumber(methods: HookMethods, options: { defaultValue: number, createSpy: TCreate, destroySpy: TDestroy }): TCreateDestroy {
  const { defaultValue, createSpy, destroySpy } = { defaultValue: 0, ...options }
  // add before hook to 'negative' method at priority 5
  methods.before('negative', 5, function (args: any[]): void {
    const value = args[0]
    args[0] = typeof value === 'number' ? value : defaultValue
  })
  return {create: createSpy, destroy: destroySpy }
}

function minMax(methods: HookMethods, options: { min: number, max: number }): void {
  const { min, max } = { min: 0, max: 100, ...options }
  // add before hook to 'negative' method at priority 10 (executed after ensureNumber)
  methods.before('negative', 10, function (args: any[]): void {
    args[0] = Math.max(Math.min(args[0], max), min)
  })
  // add after hook to 'add' method at priority -100
  methods.after('add', -100, function (result: number): number {
    return Math.max(Math.min(result, max), min)
  })
}

class TestClass {
  public negative(value: any): any {
    return -value
  }

  public add(a: number, b: number): number {
    return a + b
  }
}

test('TestClass', t => {
  // register hooks
  const hooks = new Hooks()
  hooks.register('ensureNumber', ensureNumber)
  hooks.register('minMax', minMax)

  // install/uninstall the hooks on test object
  const testInstance = new TestClass()
  // The hooks to install are specified as an array of array where the inner array
  // has the format ['hookName', hookOptions]
  const createSpy = sinon.spy()
  const destroySpy = sinon.spy()
  hooks.install(testInstance, [
    ['minMax', { min: 0, max: 100 }],
    ['ensureNumber', { defaultValue: 200, createSpy, destroySpy }]
  ])

  t.assert(testInstance.negative(undefined) === -100)
  t.assert(testInstance.add(100, 200) === 100)

  hooks.uninstall(testInstance)
  t.assert(destroySpy.calledOnce)
})
