export interface TObj<T> {
  [key: string]: T
}

export type TMethod = (this: any, ...args: any[]) => any
export type TBeforeMethod = (this: any, args: any[]) => void
export type TAfterMethod = (this: any, result: any, args: any[]) => any

export type TJSONHook = [string, TObj<any>]

