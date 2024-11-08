import "dotenv/config";
import fs from "node:fs"
import { generateRefreshFile } from "../utils/generateRefreshFile.js";
import { uploadFile } from "../utils/uploadFile.js";
import { GetBrazaQuotationSuccessResponse, getQuotation } from "../services/getQuotation.js";
import { getAwesomeQuotation } from "../services/getAwesomeApiQuotation.js";

const MARKUP_VALUE = "0"

async function fetchGetBrazaQuotation(): Promise<GetBrazaQuotationSuccessResponse | null> {
  const params = new URLSearchParams({
    markup_type: "P",
    markup_value: MARKUP_VALUE,
    pair: "USDTBRL"
  })
  const result = await getQuotation(params);
  if ("quotation" in result) {
    return result;
  } else {
    console.log("Não foi possivel pegar o cambio getBraza")
    console.log(result.detail[0])
    return null;
  }
}

async function refreshRates() {
  const getQuotationResponse = await fetchGetBrazaQuotation()

  if(!getQuotationResponse) return

  const fileData: string[][] = []
  fileData.push(["USD", "BRL", getQuotationResponse.quotation.toFixed(2)])

  let fileName: string = "";

  if(process.env.PRODUCTION === "false") {
    fileName = generateRefreshFile("ECTPFX", ...fileData);
    await uploadToAbsolute(fileName)
    fs.rmSync(fileName + ".txt")

    //Pega USD-PYG do Awesome API e sobe no FTP do Elvio

    const awesomeQuotation = await getAwesomeQuotation("USD-PYG")
    if("status" in awesomeQuotation) {
      console.log("nao foi possivel capturar USD-PYG do awesome api")
      console.log(awesomeQuotation)
    } else {
      const rate = parseFloat(awesomeQuotation["USDPYG"].bid)
      const reducedRate = reduceRateByPercentageOf(2, rate)
      fileData.push(["USD", "PYG", reducedRate.toFixed(3)])
      fileName = generateRefreshFile("ECTPFX", ...fileData);
      await uploadToCheckout(fileName)
    }
  } else {
    //Mittere

    const extraCurrencies = ["USD-CHF", "USD-EUR", "USD-GBP"]
    for(let currency of extraCurrencies) {
      const currencyQuotation = await getAwesomeQuotation(currency)

      if("status" in currencyQuotation) {
        console.log("não foi possivel capturar o cambio de " + currency)
        console.log(currencyQuotation)
      } else {
        const currencyPairKey = currency.replace("-", "")
        const pair = currency.split("-")
        const reducedRate = reduceRateByPercentageOf(1, parseFloat(currencyQuotation[currencyPairKey].bid))
        fileData.push([pair[0], pair[1], reducedRate.toFixed(3)])
      }
    }
    fileName = generateRefreshFile("MTRPFX", ...fileData)
    await uploadToMittere(fileName)
  }
  fs.rm(fileName + ".txt", err => {if(err) console.log(err)})
}

async function uploadToCheckout(fileName: string) {
  await uploadFile(
    fileName,
    process.env.FTP_USER_1 as string,
    process.env.FTP_PASS_1 as string,
    "Rates"
  )
}

async function uploadToAbsolute(fileName: string) {
  await uploadFile(
    fileName,
    process.env.FTP_USER_2 as string,
    process.env.FTP_PASS_2 as string,
    "Rates"
  )
}

async function uploadToMittere(fileName: string) {
  await uploadFile(
    fileName,
    process.env.FTP_USER_3 as string,
    process.env.FTP_PASS_3 as string,
    "Rates"
  )
}

function reduceRateByPercentageOf(percentage: number, rate: number) {
  return rate - (rate * (percentage / 100))
}

refreshRates();

setInterval(() => {
	refreshRates()
}, 1000 * 60 * 2.5);