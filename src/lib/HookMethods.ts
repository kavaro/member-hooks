import BinarySortedArray from 'binary-sorted-array'
import { TMethod, TBeforeMethod, TAfterMethod } from './types'

export interface TPrioritizedHookMethod {
  priority: number
  fn: TMethod
}

export interface THookMethod {
  before: BinarySortedArray<TPrioritizedHookMethod>
  at: TPrioritizedHookMethod | undefined
  after: BinarySortedArray<TPrioritizedHookMethod>
}

/**
 * Stores the before, after and at methods for each method in order of priority.
 */
export class HookMethods extends Map<string, THookMethod> {
  /**
   * Ensures an entry the method exists
   * @param name name of the method
   */
  public ensure(name: string): THookMethod {
    let method = this.get(name)
    if (!method) {
      method = {
        before: new BinarySortedArray<TPrioritizedHookMethod>([], (a, b) => a.priority - b.priority),
        at: undefined,
        after: new BinarySortedArray<TPrioritizedHookMethod>([], (a, b) => a.priority - b.priority)
      }
      this.set(name, method)
    }
    return method
  }

  /**
   * Adds a before hook to a method
   * @param name name of the method to add the before hook to
   * @param priority priority of the before hook
   * @param fn the before hook function
   */
  public before(name: string, priority: number, fn: TBeforeMethod): void {
    this.ensure(name).before.insert({ priority, fn })
  }

  /**
   * Adds a after hook to a method
   * @param name name of the method to add the after hook to
   * @param priority priority of the after hook
   * @param fn the after hook function
   */
  public after(name: string, priority: number, fn: TAfterMethod): void {
    this.ensure(name).after.insert({ priority, fn })
  }

  /**
   * 
   * @param name Replace the method with a hook (the original method will not be called), the hook with highest priority wins
   * @param priority priority of the hook
   * @param fn the hook method
   */
  public at(name: string, priority: number, fn: TMethod): void {
    const hookMethod = this.ensure(name)
    const { at } = hookMethod
    if (!at || priority >= at.priority) {
      hookMethod.at = { priority, fn }
    }
  }
}
