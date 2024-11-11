import fetch, { Headers } from "node-fetch";
import { RequestError } from "../types/BrazaRequestError.js";
import { Credentials } from "../types/GetBrazaAccountCredentials.js";

export async function getBalance(credentials: Credentials): Promise<string | RequestError> {
  const headers = new Headers()
  headers.append("x-api-key", credentials.apiKey)
  headers.append("x-application-id", credentials.applicationId)
  headers.append("x-account-number", credentials.accountNumber)
  headers.append("Accept", "application/json")

  const params = new URLSearchParams({
    markup_type: "P",
    markup_value: "0",
    pair: "USDTBRL"
  })

  const res = await fetch(process.env.BRAZA_URL + `quote?${params}`, {
    method: "GET",
    headers,
  })

  if(!res.ok) {
    const errorData = await res.json() as RequestError
    return errorData
  }

  const data = res.headers.get("x-balance") as string
  return data
}