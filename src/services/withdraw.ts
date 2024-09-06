import fetch, { Headers } from "node-fetch";
import { Credentials } from "../types/GetBrazaAccountCredentials.js";
import { RequestError } from "../types/BrazaRequestError.js";

type WithdrawPayload = {
  credentials: Credentials
  coin: string
  blockchain: string
  amount: string
  wallet: string  
}

export async function withdraw(payload: WithdrawPayload) {
  const headers = new Headers()

  headers.append("x-api-key", payload.credentials.apiKey)
  headers.append("x-application-id", payload.credentials.applicationId)
  headers.append("x-account-number", payload.credentials.accountNumber)
  headers.append("Content-Type", "application/json")
  headers.append("Accept", "application/json")

  const body = {
    amount: payload.amount,
    blockchain: payload.blockchain,
    coin: payload.coin,
    wallet: payload.wallet
  }

  const res = await fetch(process.env.BRAZA_URL as string + "withdraw", {
    method: "POST",
    headers,
    body: JSON.stringify(body)
  })

  if(!res.ok) {
    console.log("withdraw response not okay")
    const err = await res.json() as RequestError
    console.log(err)
    return err
  }

  const data = await res.json() as { message: string }
  return data
}