import test from 'ava'
import { v4 as uuid } from 'uuid'
import Loki from './Loki'
import CollectionHooks, { TLokiConstructor } from './CollectionHooks'

test.beforeEach(t => {
  t.context = new Loki(uuid(), { 
    adapter: new Loki.LokiMemoryAdapter({ asyncResponses: true }) 
  })
})


function testHook(did: string, cid: string) {
  return (context: CollectionHooks<any>) => {
    const { dbStore, collectionStore } = context
    context.add('insertOne', -100, (args: any[]) => {
      args[0][did] = dbStore.set('seq', dbStore.ensure('seq', 10) + 1)
      args[0][cid] = collectionStore.set('seq', collectionStore.ensure('seq', 100) + 1)
    })
  }
}

test('should implement hooks specified via collection options', t => {
  const db = t.context as TLokiConstructor
  const collection = db.addCollection('collection', { 
    hooks: [testHook('did', 'cid')]
  })
  const doc = collection.insert({ name: 'NoName' }) as { did: number, cid: number, name: string }
  t.is(doc.did, 11)
  t.is(doc.cid, 101)
})

test('should add hooks after loading', async t => {
  const db = t.context as TLokiConstructor
  const collection = db.addCollection('collection', { 
    hooks: [testHook('did', 'cid')],
    disableMeta: true
  })
  const doc = collection.insert({ name: 'NoName' }) as { $loki: number, did: number, cid: number, name: string }
  t.deepEqual(doc, { $loki: 1, name: 'NoName', did: 11, cid: 101 })
  return new Promise<void>(resolve => {
    console.log('saving')
    db.saveDatabase(() => {
      console.log('loading')
      db.loadDatabase({}, () => {
        console.log('loaded')
        const collection = db.getCollection('collection')
        const doc = collection.insert({ name: 'NoName' }) as { $loki: number, did: number, cid: number, name: string }
        console.log('inserted', doc)
        t.deepEqual(doc, { $loki: 2, name: 'NoName', did: 12, cid: 102 })
        resolve()
      })
    })
  })
})