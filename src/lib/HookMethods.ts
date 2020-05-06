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

export class HookMethods extends Map<string, THookMethod> {
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

  public before(name: string, priority: number, fn: TBeforeMethod): void {
    this.ensure(name).before.insert({ priority, fn })
  }

  public after(name: string, priority: number, fn: TAfterMethod): void {
    this.ensure(name).after.insert({ priority, fn })
  }
}
