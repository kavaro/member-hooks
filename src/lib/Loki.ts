import Loki from 'lokijs'
import { TLokiConstructor, TDbObject, TDbObjectOptions, TCollection, TCollectionOptions } from './CollectionHooks'
import DbCompilers from './DbCompilers'

const { isArray } = Array
const noop = function (): void { }

export const dbCompilers = new DbCompilers()

const loadJSONObject = Loki.prototype.loadJSONObject
Loki.prototype.loadJSONObject = function (dbObject: TDbObject<any>, options?: TDbObjectOptions): void {
  const self = this as TLokiConstructor
  self.loadingJSONObject = true
  loadJSONObject.call(self, dbObject, options)
  self.hooksStore = dbObject.hooksStore
  const dbCompiler = dbCompilers.ensure(this)
  this.collections.forEach((dbCollection, index) => {
    const collection = dbCollection as TCollection<any>
    collection.hooksStore = dbObject.collections[index].hooksStore
    if (!collection.loaded) {
      collection.loaded = noop
    }
    const collectionCompiler = dbCompiler.ensure(collection)
    console.log('loadJSONObject', collection.name, collectionCompiler.hooks.keys())
    collectionCompiler.compile()
    collection.loaded()
  })
  self.loadingJSONObject = false
}

const addCollection = Loki.prototype.addCollection as unknown as any
Loki.prototype.addCollection = function <F extends object>(name: string, options?: Partial<TCollectionOptions<F>>): Collection<F> {
  const self = this as TLokiConstructor
  const collection = addCollection.call(self, name, options)
  if (!self.loadingJSONObject) {
    const hooks = options && options.hooks
    if (isArray(hooks) && hooks.length) {
      const compiler = dbCompilers.ensure(this).ensure(collection)
      hooks.forEach(hook => hook(compiler.hooks))
      compiler.compile()
    }
  }
  return collection
}

export default Loki
