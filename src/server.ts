import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { WebHookResponse } from "./types/Webhook.js";
import { sendTransaction } from "./controllers/sendTransaction.js";
import "dotenv/config";
import { v4 as uuidv4 } from 'uuid';
import { js2xml } from "xml-js";
import { getDailyTransaction } from "./controllers/getDailyTransactions.js";
import { getQuotation } from "./controllers/getQuotation.js";
import merchantsConfig from "../config/EC.json"
import { doInternalTransfer } from "./controllers/doInternalTransfer.js";
import { writeFile } from "fs";

const app = express();
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cors())
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*"
  }
});

type SocketSessionId = string
type TransactionId = string
const transactionIdMapping = new Map<SocketSessionId, TransactionId>()

io.on("connection", (socket) => {
  console.log("CONECTADO")

  socket.on("disconnect", () => {
    transactionIdMapping.delete(socket.id)
    console.log("desconectado: " + socket.id)
  })
  
});

app.post("/webhook/:id", (req, res) => {
  const webhookData = req.body as WebHookResponse
  const transactionId = req.params.id

  if(webhookData.method === "transaction_create") {
    res.status(200).send()
    console.log(webhookData)
    return
  }

  let clientSession = ""

  for(let [key, val] of transactionIdMapping.entries()) {
    if(val === transactionId) {
      clientSession = key
      break
    }
  }
  console.log("RECEBEU NO WEBHOOK:")
  console.log(webhookData)
  io.to(clientSession).emit("response", webhookData)
  res.status(200).send("success")
})

app.post("/big/pix", async (req, res) => {
  const { amount, socketSessionId, markupValue } = req.body
  const transactionId = uuidv4()
  transactionIdMapping.set(socketSessionId, transactionId)
  const result = await sendTransaction(amount, markupValue, transactionId);
  res.send()
})

app.post("/daily-transactions", async (req, res) => {
  try {
    const { x_Account_Number, x_Api_key, x_Application_Id } = req.body
    const result = await getDailyTransaction({
      accountNumber: x_Account_Number || process.env.ACCOUNT_NUMBER,
      apiKey: x_Api_key || process.env.API_KEY,
      applicationId: x_Application_Id || process.env.APPLICATION_ID
    });

    const xmlData = js2xml(result, { compact: true, ignoreComment: true })
    res.type("text/xml")
    res.send(xmlData)
  } catch (error) {
    if(error instanceof Error) {
      console.log(error)
      return res.status(500).send(error.message);
    }
    res.send(500).send("Unexpected Server Error")
  }
})

app.get("/quotation", async (req, res) => {
  try {
    const { markupType, markupValue, pair } = req.query
    if(!markupType || !markupValue || !pair) return res.status(400).send("Missing required parameters.")

    const params = new URLSearchParams({
      markup_type: markupType as string,
      markup_value: markupValue as string,
      pair: pair as string
    })
    const result = await getQuotation(params)
    if("quotation" in result) {
      res.status(200).json(result)
    } else {
      throw new Error("Unable to get quotation")
    }
  } catch (error) {
    if(error instanceof Error) {
      return res.status(500).send(error.message)
    }
    res.status(500).send("Internal error")
  }
})

app.get("/merchants/:id", (req, res) => {
  const { id } = req.params
  const merchantsList = merchantsConfig.merchants
  const merchant = merchantsList.find(merch => merch.merchantId === id)
  if(merchant) {
    const { api_Key, application_id, account_number, wallet, ...merchantWithoutKeys } = merchant
    return res.status(200).json(merchantWithoutKeys)
  }
  res.status(204).send()
})

app.get("/", (req, res) => {
  res.status(200).send("api accessible")
})

app.post("/catch-xfee", async (req, res) => {
  try {
    const { senderAccount, xFeeAccount, amount } = req.body
    const merchant = merchantsConfig.merchants.find(merch => merch.account_number === senderAccount)
    if(!merchant) return res.status(400).send("sender account-id not found")
    
    const result = await doInternalTransfer({
      accountNumber: merchant.account_number,
      apiKey: merchant.api_Key,
      applicationId: merchant.application_id
    }, xFeeAccount, amount)   
    if("message" in result) {
      res.status(200).send("success")
    } else {
      console.log(result)
      res.status(500).json({
        erro: "nao foi possivel fazer a transferencia interna",
        ...result
      })
    }
    
  } catch (error) {
    console.log(error)
    res.status(500).send("internal server error")
  }
})

app.post("/account-list", (req, res) => {
  const { AccountList, LicenseCode } = req.body
  if(AccountList) {
    writeFile(`./config/${LicenseCode}.json`, AccountList, err => {
      err ? console.log(err) : undefined
    })
    return res.status(200).send()
  }
  res.status(400).send("não foi possivel capturar a lista de sender.")
})

httpServer.listen(3002);