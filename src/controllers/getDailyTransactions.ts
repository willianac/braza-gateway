import fetch, { Headers } from "node-fetch";
import { Transaction } from "../types/Transaction.js";

type GetDailyTransactionResponse = {
  balance: string
  transactions: Transaction[]
}

export async function getDailyTransaction() {
  const headers = new Headers()

  headers.append("x-api-key", process.env.API_KEY as string)
  headers.append("x-application-id", process.env.APPLICATION_ID as string)
  headers.append("x-wallet", process.env.WALLET as string)

  const res = await fetch(process.env.BRAZA_URL as string + "transactions", {
    method: "POST",
    headers
  })

  if(!res.ok) {
    console.log(res)
    if(res.status === 504) {
      throw new Error("Gateway Timeout. GetBraza took too long to respond");
    }
    throw new Error("Unknown error")
  }

  const data = await res.json() as GetDailyTransactionResponse;
  return data
}