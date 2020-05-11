export interface TObj<T> {
  [key: string]: T
}

export type TMethod = (this: any, ...args: any[]) => any
export type TBeforeMethod = (this: any, args: any[]) => TObj<any> | void
export type TAfterMethod = (this: any, result: any, args: any[], context: TObj<any> | void) => any

export type TJSONHook = [string, TObj<any>]

export type TCreate = (target: any) => void
export type TDestroy = () => void

export interface TCreateDestroy { 
  create?: TCreate
  destroy?: TDestroy
}