export const add = (a: number, b: number) => a+b

export const sleep = (ms: number) => {
  return new Promise<void>(resolve => setTimeout(resolve, ms))
}


