import BinarySortedArray from 'binary-sorted-array'
import Loki from 'lokijs'
import KeyValue, { TKeyValue } from './KeyValue'

export type THookMethod = (...args: any[]) => any

export interface THook {
  priority: number
  fn: THookMethod
}

export interface TCollection<F extends object> extends Collection<F> {
  hooksStore: TKeyValue
  loaded: () => void
}

export interface TDbObject<F extends object> {
  name?: string
  throttledSaves: boolean
  collections: Array<TCollection<F>>
  databaseVersion: number
  hooksStore: KeyValue
}

export interface TDbObjectOptions {
  [collName: string]: any
  retainDirtyFlags?: boolean
  throttledSaves?: boolean
}

export type THookFactory = (context: CollectionHooks<any>) => void

export interface TCollectionOptions<F> extends Partial<CollectionOptions<F>> {
  hooks?: THookFactory[]
}

export interface TLokiConstructor extends LokiConstructor {
  hooksStore: TKeyValue
  loadingJSONObject: boolean
  loadJSONObject<F extends object>(dbObject: TDbObject<F>, options?: TDbObjectOptions): void
  addCollection<F extends object>(name: string, options?: TCollectionOptions<F>): TCollection<F>
}

export default class CollectionHooks<F extends object> extends Map<string, BinarySortedArray<THook>>{
  public readonly db: Loki
  public readonly dbStore: KeyValue
  public readonly collection: Collection<F>
  public readonly collectionStore: KeyValue

  constructor(db: Loki, collection: Collection<F>) {
    super()
    this.db = db
    this.collection = collection as TCollection<F>
    const hooksDb = this.db as TLokiConstructor
    if (!hooksDb.hooksStore) {
      hooksDb.hooksStore = {}
    }
    this.dbStore = new KeyValue(hooksDb.hooksStore)
    const hooksCollection = this.collection as TCollection<F>
    if (!hooksCollection.hooksStore) {
      hooksCollection.hooksStore = {}
    }
    this.collectionStore = new KeyValue(hooksCollection.hooksStore)
  }

  public add(method: string, priority: number, fn: THookMethod):void {
    let hooks = this.get(method)
    if (!hooks) {
      hooks = new BinarySortedArray<THook>([], (a, b) => a.priority - b.priority)
      this.set(method, hooks)
    }
    hooks.insert({ priority, fn })
  }
}
