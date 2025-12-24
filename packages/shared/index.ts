export const add = (a: number, b: number) => a+b

export const sleep = (ms: number) => {
  return new Promise<void>(resolve => setTimeout(resolve, ms))
}


export const isString = (value: any) => typeof value === 'string' || value instanceof String


