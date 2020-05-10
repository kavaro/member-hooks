# member-hooks

Add before and after hooks to an object

# Installation

```
yarn add member-hooks
npm install member-hooks
```

# Usage

A hook is a function that defines a set of before/at/after functions on methods of an object.
The before functions, when present, are executed before the method in order of priority.
The after functions, when present, are executed after the method in order of priority.
The at function with the highest priority, when present, replaces the method

Hooks must be registered by calling the register method on an instance of the Hooks class.  

To install/uninstall an array of hooks to an object, call the install/uninstall method.
The hooks to install are specified as an array of ['hookName', hookOptions] arrays.
Where hookName is the name under which the hook was registered.

The after hook can return a context object that will be passed to the after hook as 3rd argument.

Example:
```typescript
import test from 'ava'
import sinon from 'sinon'
import { HookMethods, Hooks, TDestroy } from '.'

function ensureNumber(methods: HookMethods, options: { defaultValue: number, destroySpy: TDestroy }): TDestroy {
  const { defaultValue, destroySpy } = { defaultValue: 0, ...options }
  // add before hook to 'negative' method at priority 5
  methods.before('negative', 5, function (args: any[]): void {
    const value = args[0]
    args[0] = typeof value === 'number' ? value : defaultValue
  })
  // uncomment to nest line to defined an "at" function that replaces the method
  // methods.at('negative', 1, function() { return -(value * 2) }) 
  return destroySpy
}

function minMax(methods: HookMethods, options: { min: number, max: number }): void {
  const { min, max } = { min: 0, max: 100, ...options }
  // add before hook to 'negative' method at priority 10 (executed after ensureNumber)
  methods.before('negative', 10, function (args: any[]): TObj<any> {
    args[0] = Math.max(Math.min(args[0], max), min)
    // return context to be passed to after method
    return { max }
  })
  // add after hook to 'add' method at priority -100
  methods.after('add', -100, function (result: number, args: any[], context: TObj): number {
    // use context returned from before method
    return Math.max(Math.min(result, context.max), min)
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
  const destroySpy = sinon.spy()
  hooks.install(testInstance, [
    ['minMax', { min: 0, max: 100 }],
    ['ensureNumber', { defaultValue: 200, destroySpy }]
  ])

  t.assert(testInstance.negative(undefined) === -100)
  t.assert(testInstance.add(100, 200) === 100)

  hooks.uninstall(testInstance)
  t.assert(destroySpy.calledOnce)
})
```

# Before hook

A before-hook is a function executed before a method. 
It receives all arguments passed to the method as an array.
This allows the before-hook to change the arguments passed to the method before it is called.
When defined as a normal function (not arrow function), 'this' refers to the object of the method.

Example: A before hook that ensures the first argument to the method is an object with an id field
```typescript
function beforeHook(args: any[]): void {
  let doc = args[0]
  if (!isObject(doc)) {
    doc = {}
  }
  if (!('id' in doc)) {
    doc.id = uuid()
  }
  args[0] = doc
}
``` 

# After hook

A after-hook is a function executed after a method.
It receives the value returned from the method and an array of arguments passed to the method.
This allows the after-hook to modify the returned value.
When defined as a normal function (not arrow function), 'this' refers to the object of the method.

Example: afterHook validates wether returned value is smaller then then the first method argument
```typescript
function afterHook(result: number, args: any[]): number {
  const max = args[0]
  if (result > max) {
    throw new Error(`${result} should be smaller then ${max}`)
  }
  return result
}
```



