import fetch, { Headers } from "node-fetch"
import { RequestError } from "../types/BrazaRequestError.js"
import { Credentials } from "../types/GetBrazaAccountCredentials.js"

export async function sendTransaction(
  amount: string, 
  transactionId: string,
  credentials: Credentials
): Promise<{ message: string } | RequestError> {
  const bodyData = {
    url_callback: "https://api.moneytransfersystem.com/webhook/" + transactionId,
    markup_type: "P",
    markup_value: "0",
    pair: "USDTBRL",
    coin: "USDT",
    amount
  }

  const headers = new Headers()
  headers.append("x-api-key", credentials.apiKey)
  headers.append("x-application-id", credentials.applicationId)
  headers.append("x-account-number", credentials.accountNumber)
  headers.append("Content-Type", "application/json")

  const res = await fetch(process.env.BRAZA_URL as string, {
    method: "POST",
    headers,
    body: JSON.stringify(bodyData),
    signal: AbortSignal.timeout(12000)
  })

  if(!res.ok) {
    console.log("RESPONSE NOT OKAY")
    const error = await res.json() as RequestError
    console.log(error)
    return error
  }

  const data = await res.json() as { message: string }
  return data
}