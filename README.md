# loki-hooks

Adds hooks to lokijs to extend its functionality in a modular way

# Design

make hooks and their options serializable 
  -> hooks can be saved and loaded with collection
  -> addCollection/loadJSONObject is then responsible to re-instate the hooks from the persisted data

addCollection
  - when options.hooks is present
    - collection.hooks = compile(options.hooks) // compiled hooks must be pure JSON

hooks.register(name, options => decorator => {
  decorator.before('method', priority, (args, { db, dbStore, collectionStore }) => void)
  decorator.after('method', priority, (result, args, { db, dbStore, collectionStore }) => result)
})

-> given a set of options -> same set of methods