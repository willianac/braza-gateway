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
  headers.append("Accept", "application/json")

  const res = await fetch(process.env.BRAZA_URL as string + "auth", {
    method: "POST",
    headers: {
      'x-application-id': requester.applicationId,
      'x-api-key': requester.apiKey,
      'x-account-number': requester.accountNumber,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    }
  })

  if(!res.ok) {
    const error = await res.json() as RequestError
    console.log(error)
    return error
  }
  // getBraza está retornando um objeto de keys e values sendo string, em vez de um json. Aqui eu estou substituindo '-' por '_'.
  const data = await res.json() as Record<string, string>
  const keysWithUnderscore: Record<string, string> = {}
  for(let key in data) {
    const newKey = key.replace(/-/g, "_")
    keysWithUnderscore[newKey] = data[key]
  }
  return keysWithUnderscore as GetCredentialsResponse
}