import CollectionCompiler from './CollectionCompiler'

export default class DbCompiler extends Map<Collection<any>, CollectionCompiler<any>> {
  private db: Loki

  constructor(db: Loki) {
    super()
    this.db = db
  }

  public compile():void {
    Array.from(this.values()).forEach(compiler => compiler.compile())
  }

  public ensure(collection: Collection<any>): CollectionCompiler<any> {
    let compiler = this.get(collection)
    if (!compiler) {
      compiler = new CollectionCompiler<any>(this.db, collection)
      this.set(collection, compiler)
    }
    return compiler
  }
}

