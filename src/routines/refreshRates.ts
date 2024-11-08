import "dotenv/config";
import fs from "node:fs"
import { generateRefreshFile } from "../utils/generateRefreshFile.js";
import { uploadFile } from "../utils/uploadFile.js";
import { getQuotation } from "../services/getQuotation.js";

const MARKUP_VALUE = "0"

async function refreshRates() {
  let fileData: string[][] = [];
  const params = new URLSearchParams({
    markup_type: "P",
    markup_value: MARKUP_VALUE,
    pair: "USDTBRL"
  })

  const result = await getQuotation(params)
  if("quotation" in result) {
    fileData.push(["USD", "BRL", result.quotation.toFixed(2)])
  } else {
    console.log("Não foi possivel pegar o cambio getBraza")
    console.log(result.detail[0])
  }

  let fileName = generateRefreshFile("ECTPFX", ...fileData);

  if(process.env.PRODUCTION === "false") {
    //sobe no 'Checkout'
    await uploadFile(
      fileName,
      process.env.FTP_USER_1 as string,
      process.env.FTP_PASS_1 as string,
      "Rates"
    )

    //sobe no 'Absolute'
    await uploadFile(
      fileName,
      process.env.FTP_USER_2 as string,
      process.env.FTP_PASS_2 as string,
      "Rates"
    )
    fs.rm(fileName + ".txt", err => {if(err) console.log(err)})
  } else {
    //sobe no 'Mittere'
    fileName = generateRefreshFile("MTRPFX", ...fileData);
    await uploadFile(
      fileName,
      process.env.FTP_USER_3 as string,
      process.env.FTP_PASS_3 as string,
      "Rates"
    )
    fs.rm(fileName + ".txt", err => {if(err) console.log(err)})
  }
}

refreshRates();

setInterval(() => {
	refreshRates()
}, 1000 * 60 * 2.5);