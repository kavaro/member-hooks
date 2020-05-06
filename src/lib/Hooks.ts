import stringify from 'json-stable-stringify'
import { HookMethods } from './HookMethods'
import { createDecorator, THookFactory, TDecorator } from './createDecorator'
import { TJSONHook } from './types'

const UNHOOK = Symbol()

export class Hooks {
  private factories = new Map<string, THookFactory>()
  private decorators = new Map<string, TDecorator>()

  public register(name: string, factoryFn: THookFactory, force: boolean = false):void {
    if (!force && this.factories.has(name)) {
      throw new Error(`Hook "${name}" is already registered`)
    }
    this.factories.set(name, factoryFn)
  }

  public install(target: any, hooks: TJSONHook[]): void {
    if (!target[UNHOOK] && hooks) {
      const key = stringify(hooks)
      let decorator = this.decorators.get(key)
      if (!decorator) {
        const hookMethods = new HookMethods()
        hooks.map((hook: TJSONHook) => {
          const [name, options] = hook
          const factory = this.factories.get(name)
          if (!factory) {
            throw new Error(`Hook "${name}" has not been registered`)
          }
          factory(hookMethods, options)
        })
        decorator = createDecorator(hookMethods)
        this.decorators.set(key, decorator)
      }
      target[UNHOOK] = decorator(target)
    }
  }

  public uninstall(target: any): void {
    if (target[UNHOOK]) {
      target[UNHOOK]()
      delete target[UNHOOK]
    }
  }
}

