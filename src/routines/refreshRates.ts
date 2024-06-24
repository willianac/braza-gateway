import "dotenv/config";
import fs from "node:fs"
import fetch, { Headers } from "node-fetch";
import { generateRefreshFile } from "../utils/generateRefreshFile";
import { uploadFile } from "../utils/uploadFile";

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

const MARKUP_VALUES = ["2", "1", "0"]

async function refreshRates() {
  const headers = new Headers()
  headers.append("x-api-key", process.env.API_KEY as string)
  headers.append("x-application-id", process.env.APPLICATION_ID as string)
  headers.append("x-account-number", process.env.ACCOUNT_NUMBER as string)
  headers.append("Accept", "application/json")

  let fileData: string[][] = [];
  for(let value of MARKUP_VALUES) {
    const params = new URLSearchParams({
      markup_type: "P",
      markup_value: value,
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
    fileData.push(["USD", "BRL", data.quotation.toFixed(2)])
  }

  const fileName = generateRefreshFile("ECTPFX", ...fileData);
  await uploadFile(fileName, "Rates")
  fs.rm(fileName + ".txt", err => {if(err) console.log(err)})
}
refreshRates();

setInterval(() => {
	refreshRates()
}, 1000 * 60 * 15);