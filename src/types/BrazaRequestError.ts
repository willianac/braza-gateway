export type RequestError = {
  detail: {
    type: string
    msg: string
    input: any
    loc: string[]
  }[]
}