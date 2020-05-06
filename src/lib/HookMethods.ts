import BinarySortedArray from 'binary-sorted-array'
import { TMethod, TBeforeMethod, TAfterMethod } from './types'

export interface TPrioritizedHookMethod {
  priority: number
  fn: TMethod
}

export interface THookMethod {
  before: BinarySortedArray<TPrioritizedHookMethod>,
  after: BinarySortedArray<TPrioritizedHookMethod>
}

/**
 * Stores the before and after methods for each method in order of priority.
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
   * @param name name of the method to add hte after hook to
   * @param priority priority of the after hook
   * @param fn the after hook function
   */
  public after(name: string, priority: number, fn: TAfterMethod): void {
    this.ensure(name).after.insert({ priority, fn })
  }
}
