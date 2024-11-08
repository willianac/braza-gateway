import fetch from "node-fetch"

type QuotationData = {
  code: string
  codein: string
  name: string
  high: string
  low: string
  varBid: string
  pctChange: string
  bid: string
  ask: string
  timestamp: string
  create_date: string
}

type GetQuotationResponse = {
  [currencyPair: string]: QuotationData
}

type GetQuotationError = {
  status: number,
  code: string,
  message: string
}

export async function getAwesomeQuotation(currencies: string): Promise<GetQuotationResponse | GetQuotationError> {
  const URL = "https://economia.awesomeapi.com.br/json/last/"

  const res = await fetch(URL + currencies)

  if(!res.ok) {
    const err = await res.json() as GetQuotationError
    console.log(err)
    return err
  }
  
  const data = await res.json() as GetQuotationResponse
  return data
}