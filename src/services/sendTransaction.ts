import fetch, { Headers } from "node-fetch"
import { RequestError } from "../types/BrazaRequestError.js"

export async function sendTransaction(
  amount: string, 
  markupValue: string, 
  transactionId: string
): Promise<{ message: string } | RequestError> {
  const bodyData = {
    url_callback: "https://api.moneytransfersystem.com/webhook/" + transactionId,
    markup_type: "P",
    markup_value: markupValue ?? "0",
    pair: "USDTBRL",
    coin: "USDT",
    amount
  }

  const headers = new Headers()
  headers.append("x-api-key", process.env.API_KEY as string)
  headers.append("x-application-id", process.env.APPLICATION_ID as string)
  headers.append("x-account-number", process.env.ACCOUNT_NUMBER as string)
  headers.append("Content-Type", "application/json")

  const res = await fetch(process.env.BRAZA_URL as string, {
    method: "POST",
    headers,
    body: JSON.stringify(bodyData)
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