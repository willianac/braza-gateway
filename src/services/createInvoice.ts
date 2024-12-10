import { CreateXpressoInvoicePayload } from "../types/CreateXpressoInvoicePayload.js";
import fetch, { Headers } from "node-fetch";

function makeUrl(baseUrl: string, data: Record<string, string | number | boolean>) {
  const params = new URLSearchParams()
  for(const [key, value] of Object.entries(data)) {
    params.append(key, value.toString())
  }
  return `${baseUrl}?${params.toString()}`
}

export async function createXpressoInvoice(payload: CreateXpressoInvoicePayload) {
  const BASE_URL = `https://api.moneytransmittersystem.com/mts/${payload.endpoint}/mobileApp/xpappstart.cfm/`
  const { endpoint, transactionId, ...payloadWithoutEndpoint } = payload

  const FULL_URL = makeUrl(BASE_URL, payloadWithoutEndpoint)
  console.log("Url do post final:")
  console.log(FULL_URL)

  const res = await fetch(FULL_URL, {
    method: "GET"
  })
  console.log("resposta do create invoice:")
  console.log(res)
}