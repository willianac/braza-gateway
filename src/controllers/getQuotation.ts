import fetch, { Headers } from "node-fetch";

type SuccessResponse = {
  quotation: number
  quotation_original: number
  time_exp: string
}

type ErrorResponse = {
  detail: {
    type: string
    msg: string
    input: any
    loc: string[]
  }[]
}

export async function getQuotation(params: URLSearchParams): Promise<SuccessResponse | ErrorResponse> {
  const headers = new Headers()
  headers.append("x-api-key", process.env.API_KEY as string)
  headers.append("x-application-id", process.env.APPLICATION_ID as string)
  headers.append("x-account-number", process.env.ACCOUNT_NUMBER as string)
  headers.append("Accept", "application/json")

  const res = await fetch(process.env.BRAZA_URL + `quote?${params}`, {
    method: "GET",
    headers,
  })

  if(!res.ok) {
    const errorData = await res.json() as ErrorResponse
    return errorData
  }

  const data = await res.json() as SuccessResponse
  return data
}