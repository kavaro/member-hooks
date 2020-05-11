import stringify from 'json-stable-stringify'
import { HookMethods } from './HookMethods'
import { createDecorator, THookFactory, TDecorator } from './createDecorator'
import { TJSONHook, TCreate } from './types'

const UNHOOK = Symbol()

/**
 * Class used to register, install and uninstall hooks
 */
export class Hooks {
  private factories = new Map<string, THookFactory>()
  private decorators = new Map<string, TDecorator>()

  /**
   * 
   * @param name Register a hook function
   * @param factoryFn A function that defines the before and after hooks to apply the methods of an object and optionally returns a create/destroy function, called at install/uninstall
   * @param force When false, an error will be thrown if the same hook function is registered multiple times
   */
  public register(name: string, factoryFn: THookFactory, force: boolean = false):void {
    if (!force && this.factories.has(name)) {
      throw new Error(`Hook "${name}" is already registered`)
    }
    this.factories.set(name, factoryFn)
  }

  /**
   * Adds an array of hooks to a target object
   * When called multiple times (with or without different hooks), only the first install will be executed.
   * Calls the create functions optionally returned from the hook factory functions.
   * @param target The target object
   * @param hooks [[registerdNameOfHook1: string, hookOptions1], [registerdNameOfHook2, hookOptions2], ...]
   */
  public install(target: any, hooks: TJSONHook[]): void {
    const key = hooks ? stringify(hooks) : ''
    if (target[UNHOOK] && target[UNHOOK].key !== key) {
      this.uninstall(target)
    }
    if (!target[UNHOOK] && hooks) {
      let decorator = this.decorators.get(key)
      if (!decorator) {
        const hookMethods = new HookMethods()
        const creates: Array<TCreate | void> = hooks.map((hook: TJSONHook) => {
          const [name, options] = hook
          const factory = this.factories.get(name)
          if (!factory) {
            throw new Error(`Hook "${name}" has not been registered`)
          }
          return factory(hookMethods, options)
        })
        decorator = createDecorator(hookMethods, creates)
        this.decorators.set(key, decorator)
      }
      target[UNHOOK] = {
        key,
        uninstall: decorator(target)
      }
    }
  }

  /**
   * Removes all hooks that where installed on a target object and 
   * calls the destroy functions optionally returned from the create functions of the factory functions
   * @param target The object on which hooks have been installed
   */
  public uninstall(target: any): void {
    if (target[UNHOOK]) {
      target[UNHOOK].uninstall()
      delete target[UNHOOK]
    }
  }
}

