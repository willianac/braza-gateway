import fetch, { Headers } from "node-fetch";
import { Credentials } from "../types/GetBrazaAccountCredentials.js";
import { RequestError } from "../types/BrazaRequestError.js";

type GetCredentialsResponse = {
  x_account_number: string,
  x_api_key: string,
  x_application_id: string
}

export async function getCredentials(requester: Credentials) {
  const headers = new Headers()

  headers.append("x-api-key", requester.apiKey)
  headers.append("x-application-id", requester.applicationId)
  headers.append("x-account-number", requester.accountNumber)
  headers.append("Content-Type", "application/json")

  const res = await fetch(process.env.BRAZA_URL as string + "auth", {
    method: "POST",
    headers
  })

  if(!res.ok) {
    const error = await res.json() as RequestError
    console.log(error)
    return error
  }

  const data = await res.json() as GetCredentialsResponse
  return data
}