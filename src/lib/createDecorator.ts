
import { HookMethods } from './HookMethods'
import { TMethod, TBeforeMethod, TAfterMethod, TCreate } from './types'

export type TMethodDecorator = (oldMethod: TMethod) => TMethod
export type TDecorator = (target: any, context?: any) => () => void
export type THookFactory = (methods: HookMethods, options: any) => TCreate | void
export type TUnhook = () => void
export interface TOldMethod {
  isOwnProperty: boolean
  oldMethod: TMethod
}

/**
 * Compiles a set of before, after and at hook methods into a install function that installs the hooks to an object.
 * When executed, the install function returns an uninstall function that will remove the hooks from the object.
 * Ensures that the before and after methods are executed according to the specified priorities.
 * On install the create functions optionally returned from the factory functions are executed.
 * On uninstall the destroy function optionally returned from the create functions are executed.
 * @param hookMethods set of before and after hooks 
 * @param creates array of create functions, called after install, returned destroy functions are called after uninstall
 * @return decorator function
 */
export function createDecorator(hookMethods: HookMethods, creates: Array<TCreate | void>): TDecorator {
  const methodDecorators = new Map<string, TMethodDecorator>()
  hookMethods.forEach((hookMethod, name) => {
    let before: TBeforeMethod | undefined
    let after: TAfterMethod | undefined
    const beforeFns = hookMethod.before.getArray().map(entry => entry.fn)
    if (beforeFns.length) {
      before = beforeFns.reduce((fn: TBeforeMethod, nextFn: TBeforeMethod) => {
        if (fn) {
          return function (this: any, args: any[]): void {
            fn.call(this, args)
            nextFn.call(this, args)
          }
        } else {
          return nextFn
        }
      }, undefined as unknown as TBeforeMethod)
    }
    const afterFns = hookMethod.after.getArray().map(entry => entry.fn)
    if (afterFns.length) {
      after = afterFns.reduce((fn: TAfterMethod, nextFn: TAfterMethod) => {
        if (fn) {
          return function (this: any, result: any, args: any[]): void {
            return nextFn.call(this, fn.call(this, result, args), args)
          }
        } else {
          return nextFn
        }
      }, undefined as unknown as TAfterMethod)
    }
    let methodDecorator
    const at = hookMethod.at?.fn
    if (before) {
      const beforeMethod = before
      if (after) {
        const afterMethod = after
        methodDecorator = (oldMethod: TMethod) => {
          oldMethod = at || oldMethod
          return function newMethod(this: any, ...args: any[]): any {
            const context = beforeMethod.call(this, args)
            return afterMethod.call(this, oldMethod.call(this, ...args), args, context)
          }
        }
      } else {
        methodDecorator = (oldMethod: TMethod) => {
          oldMethod = at || oldMethod
          return function (this: any, ...args: any[]): any {
            beforeMethod.call(this, args)
            return (at || oldMethod).call(this, ...args)
          }
        }
      }
    } else if (after) {
      const afterMethod = after
      methodDecorator = (oldMethod: TMethod) => {
        oldMethod = at || oldMethod
        return function (this: any, ...args: any[]): any {
          return afterMethod.call(this, (at || oldMethod).call(this, ...args), args)
        }
      }
    } else if (at) {
      methodDecorator = () => function (this: any, ...args: any[]): any {
        return at.call(this, ...args)
      }
    }
    if (methodDecorator) {
      methodDecorators.set(name, methodDecorator)
    }
  })
  return (target: any, context?: any): TUnhook => {
    const destroys = creates.map(fn => fn && fn(target, context))
    const oldMethods = new Map<string, TOldMethod>()
    methodDecorators.forEach((decorator, name) => {
      const oldMethod = target[name]
      oldMethods.set(name, {
        isOwnProperty: target.hasOwnProperty(name),
        oldMethod
      })
      target[name] = decorator(oldMethod)
    })
    return () => {
      destroys.map(fn => fn && fn())
      oldMethods.forEach((entry, name) => {
        const { isOwnProperty, oldMethod } = entry
        if (isOwnProperty) {
          target[name] = oldMethod
        } else {
          delete target[name]
        }
      })
    }
  }
}

