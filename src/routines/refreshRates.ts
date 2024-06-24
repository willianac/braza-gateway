import "dotenv/config";
import fetch, { Headers } from "node-fetch";
import { generateRefreshFile } from "../utils/generateRefreshFile";

type SuccessResponse = {
  quotation: number
  quotation_original: number
  time_exp: string
}

type ErrorResponse = {
  detail: {
    type: string
    msg: string
    input: any
    loc: string[]
  }[]
}

async function refreshRates() {
  const headers = new Headers()
  headers.append("x-api-key", process.env.API_KEY as string)
  headers.append("x-application-id", process.env.APPLICATION_ID as string)
  headers.append("x-account-number", process.env.ACCOUNT_NUMBER as string)
  headers.append("Accept", "application/json")

  const params = new URLSearchParams({
    markup_type: "C",
    markup_value: "0",
    pair: "USDTBRL"
  })

  const res = await fetch(process.env.BRAZA_URL + `quote?${params}`, {
    method: "GET",
    headers,
    
  })

  if(!res.ok) {
    const errorData = await res.json() as ErrorResponse
    return
  }

  const data = await res.json() as SuccessResponse
  const d = ["USD", "BRL", data.quotation.toFixed(2)]
  generateRefreshFile("ECTPFX", d);
}
refreshRates();