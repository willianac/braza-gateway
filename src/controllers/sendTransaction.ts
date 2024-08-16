import fetch, { Headers } from "node-fetch"

export async function sendTransaction(amount: string, transactionId: string) {
  const bodyData = {
    url_callback: "https://api.moneytransfersystem.com/webhook/" + transactionId,
    markup_type: "P",
    markup_value: process.env.DEFAULT_MARKUP_VALUE ?? "0",
    pair: "USDTBRL",
    coin: "USDT",
    amount
  }

  const headers = new Headers()
  headers.append("x-api-key", process.env.API_KEY as string)
  headers.append("x-application-id", process.env.APPLICATION_ID as string)
  headers.append("x-wallet", process.env.WALLET as string)
  headers.append("Content-Type", "application/json")

  const res = await fetch(process.env.BRAZA_URL as string, {
    method: "POST",
    headers,
    body: JSON.stringify(bodyData)
  })

  if(!res.ok) {
    console.log("RESPONSE NOT OKAY")
    const error = await res.json()
    console.log(error)
    return
  }

  const data = await res.json() as { message: string }
  return data
}