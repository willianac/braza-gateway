import { Request, Response } from "express";
import { Server } from "socket.io";
import { WebHookResponse } from "../types/Webhook.js";
import { transactionMapping } from "../state/transactionMapping.js";
import { createXpressoInvoice } from "../services/createInvoice.js";

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
  if(webhookData.method === "pix_update" && webhookData.data.content.status === "paid") {
    const payload = transactionMapping.get(clientSession)
    if(payload) {
      payload.SenderPaymentId = webhookData.data.content.paymentId.toString()
      createXpressoInvoice(payload)
    } else {
      console.log("NÃO FOI POSSIVEL CRIAR UM INVOICE, CLIENT SESSION NÃO EXISTE")
    }
  }
  io.to(clientSession).emit("response", webhookData)
  res.status(200).send("success")
}