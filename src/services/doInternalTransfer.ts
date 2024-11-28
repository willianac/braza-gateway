import fetch, { Headers } from "node-fetch";
import { Credentials } from "../types/GetBrazaAccountCredentials.js";
import { RequestError } from "../types/BrazaRequestError.js";

export async function doInternalTransfer(
  sourceAccCredentials: Credentials, 
  destinationAcc: string, 
  amount: number
): Promise<{ message: string } | RequestError> {
  const headers = new Headers()

  headers.append("x-api-key", sourceAccCredentials.apiKey)
  headers.append("x-application-id", sourceAccCredentials.applicationId)
  headers.append("x-account-number", sourceAccCredentials.accountNumber)
  headers.append("Content-Type", "application/json")
  
  const body = {
    to_account_number: destinationAcc,
    coin_name: "USDT",
    amount
  }

  const res = await fetch(process.env.BRAZA_URL as string + "internal-transfer", {
    method: "POST",
    headers,
    body: JSON.stringify(body)
  })

  if(!res.ok) {
    console.log("INTERNAL TRANSFER RESPONSE NOT OKAY")
    const error = await res.json() as RequestError
    console.log(error)
    return error
  }

  const data = await res.json() as { message: string }
  return data
}
