import fetch, { Headers } from "node-fetch";
import { Transaction } from "../types/Transaction.js";
import { Credentials } from "../types/GetBrazaAccountCredentials.js";

type GetDailyTransactionResponse = {
  balance: string
  transactions: Transaction[]
}

export async function getDailyTransaction(credentials: Credentials) {
  const headers = new Headers()

  headers.append("x-api-key", credentials.apiKey)
  headers.append("x-application-id", credentials.applicationId)
  headers.append("x-account-number", credentials.accountNumber)

  const res = await fetch(process.env.BRAZA_URL as string + "transactions", {
    method: "POST",
    headers
  })

  if(!res.ok) {
    console.log(res)
    if(res.status === 504) {
      throw new Error("Gateway Timeout. GetBraza took too long to respond");
    }
    throw new Error("Unknown error at request to GetBraza")
  }

  const data = await res.json() as GetDailyTransactionResponse;
  const filteredByStatus = data.transactions.filter(transaction => transaction.status === "paid")
  return { balance: data.balance, transactions: filteredByStatus }
}