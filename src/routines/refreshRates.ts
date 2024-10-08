import "dotenv/config";
import fs from "node:fs"
import { generateRefreshFile } from "../utils/generateRefreshFile.js";
import { uploadFile } from "../utils/uploadFile.js";
import { getQuotation } from "../services/getQuotation.js";

const MARKUP_VALUES = [process.env.DEFAULT_MARKUP_VALUE as string ?? "0"]

async function refreshRates() {
  let fileData: string[][] = [];
  for(let value of MARKUP_VALUES) {
    const params = new URLSearchParams({
      markup_type: "P",
      markup_value: value,
      pair: "USDTBRL"
    })

    const result = await getQuotation(params)
    if("quotation" in result) {
      fileData.push(["USD", "BRL", result.quotation.toFixed(2)])
    } else {
      console.log(result.detail[0])
      break
    }
  }

  const fileName = generateRefreshFile("ECTPFX", ...fileData);
  await uploadFile(fileName, "Rates")
  fs.rm(fileName + ".txt", err => {if(err) console.log(err)})
}

refreshRates();

setInterval(() => {
	refreshRates()
}, 1000 * 60 * 15);