import { Request, Response } from "express";
import { Server } from "socket.io";
import { WebHookResponse } from "../types/Webhook.js";
import { transactionMapping } from "../state/transactionMapping.js";
import { createXpressoInvoice } from "../services/createInvoice.js";
import { CreateXpressoInvoicePayload } from "../types/CreateXpressoInvoicePayload.js";
import { doInternalTransfer } from "../services/doInternalTransfer.js";
import { getMerchantByAccountId } from "../utils/getMerchantByAccountId.js";

export const brazaWebhookController = (io: Server) => async (req: Request, res: Response) => {
  const webhookData = req.body as WebHookResponse
  const webhookId = req.params.id

  if(webhookData.method === "transaction_create") {
    res.status(200).send()
    console.log(webhookData)
    return
  }

  let clientSession = ""

  for(let [key, val] of transactionMapping.entries()) {
    if(val.transactionId === webhookId) {
      clientSession = key
      break
    }
  }
  console.log("RECEBEU NO WEBHOOK:")
  console.log(webhookData)
  if(webhookData.method === "pix_update" && webhookData.data.status === "paid") {
    const xpressoPayload = transactionMapping.get(clientSession)
    if(xpressoPayload) {
      concludeTransaction(xpressoPayload, webhookData.data.paymentId)
    } else {
      console.log("NÃO FOI POSSIVEL CRIAR UM INVOICE, CLIENT SESSION NÃO EXISTE")
    }
  }
  io.to(clientSession).emit("response", webhookData)
  res.status(200).send("success")
}

async function concludeTransaction(xpressoPayload: CreateXpressoInvoicePayload, paymentId: number) {
  xpressoPayload.SenderPaymentId = paymentId.toString()
  createXpressoInvoice(xpressoPayload)

  const merchant = getMerchantByAccountId(xpressoPayload.brazaAccountNum, xpressoPayload.endpoint)
  if(!merchant) return console.log("NÃO FOI POSSIVEL FAZER O XFEE TRANSFER, MERCHANT ACCOUNT NAO EXISTE")

  doInternalTransfer({
    accountNumber: merchant.account_number,
    apiKey: merchant.api_Key,
    applicationId: merchant.application_id
  }, xpressoPayload.xFeeAccountNum, xpressoPayload.xFeeAmount)
}