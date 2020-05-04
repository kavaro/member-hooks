import DbCompiler from './DbCompiler'

export default class DbCompilers extends Map<Loki, DbCompiler> {
  public ensure(db: Loki): DbCompiler {
    let compiler = this.get(db)
    if (!compiler) {
      compiler = new DbCompiler(db)
      this.set(db, compiler)
    }
    return compiler
  }
}
