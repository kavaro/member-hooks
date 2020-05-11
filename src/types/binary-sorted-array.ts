declare module 'binary-sorted-array' {
  export default class BinarySortedArray<TData> {
    constructor(arr: TData[], compare: (a: TData, b: TData) => number)
    public getArray(): TData[]
    public insert(data: TData): void
    public indexOf(item: TData, returnPossiblePlace: boolean): number
    public slice(start: number, end: number): TData[]
    public remove(item: TData): void
    public clear(): void
  }
}