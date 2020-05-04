export interface TKeyValue {
  [key: string]: any
}

export default class KeyValue {
  private obj: TKeyValue

  constructor(obj: TKeyValue = {}) {
    this.obj = obj
  }

  public has(key: string): boolean {
    return key in this.obj
  }

  public get(key: string): any {
    return this.obj[key]
  }

  public set(key: string, value: any): any {
    return this.obj[key] = value
  }

  public ensure(key: string, value: any): any {
    if (!this.has(key)) {
      this.set(key, value)
    }
    return this.get(key)
  }
}
