import CollectionHooks, { THook } from './CollectionHooks'
import BinarySortedArray from 'binary-sorted-array'
import Loki from 'lokijs'

export const COMPILED = Symbol()

export default class CollectionCompiler<F extends object> {
  public readonly hooks: CollectionHooks<any>

  constructor(db: Loki, collection: Collection<F>) {
    this.hooks = new CollectionHooks<F>(db, collection)
  }

  public compile(): void {
    const collection = this.hooks.collection
    const hooks = this.hooks
    Array.from(hooks.keys()).forEach(method => {
      // @ts-ignore
      const oldMethod = collection[method]
      console.log('method', [this.hooks.db.filename, collection.name, method].join('/'))
      // @ts-ignore
      if (!oldMethod || oldMethod[COMPILED]) {
        console.log('already compiled')
        return
      }
      console.log('compiling', method)
      const fns = (hooks.get(method) as BinarySortedArray<THook>).getArray()
      const postIndex = fns.findIndex(({ priority }) => priority >= 0)
      const pre = fns.slice(0, postIndex === -1 ? fns.length : postIndex).map(({ fn }) => fn)
      const post = postIndex === -1 ? [] : fns.slice(postIndex).map(({ fn }) => fn)
      let newMethod = oldMethod
      if (pre.length) {
        if (post.length) {
          newMethod = function (...args: any[]): any {
            pre.forEach(fn => fn.call(collection, args))
            let result = oldMethod.apply(collection, args)
            post.forEach(fn => result = fn.call(collection, result, args))
            return result
          }
        } else {
          newMethod = function (...args: any[]): any {
            pre.forEach(fn => fn.call(collection, args))
            return oldMethod.call(collection, ...args)
          }
        }
      } else {
        newMethod = function (...args: any[]): any {
          let result = oldMethod.call(collection, ...args)
          post.forEach(fn => result = fn.call(collection, result, args))
          return result
        }
      }
      // @ts-ignore
      collection[method] = newMethod
      newMethod[COMPILED] = true
    });
  }
}
