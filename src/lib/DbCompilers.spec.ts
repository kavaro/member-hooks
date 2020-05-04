import test from 'ava'
import Loki from 'lokijs'
import { v4 as uuid } from 'uuid'
import DbCompiler from './DbCompiler'
import DbCompilers from './DbCompilers'

test.beforeEach(t => {
  t.context = new DbCompilers()
})

test('ensure: should add and return compiler if it does not exist', t => {
  const compiler = t.context as DbCompilers
  const db = new Loki(uuid(), { adapter: new Loki.LokiMemoryAdapter() })
  const dbCompiler = compiler.ensure(db)
  t.assert(dbCompiler instanceof DbCompiler)
})

test('ensure: should return compiler if it exists', t => {
  const compiler = t.context as DbCompilers
  const db = new Loki(uuid(), { adapter: new Loki.LokiMemoryAdapter() })
  const dbCompiler1 = compiler.ensure(db)
  const dbCompiler2 = compiler.ensure(db)
  t.assert(dbCompiler1 === dbCompiler2)
})