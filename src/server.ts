import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { WebHookResponse } from "./types/Webhook.js";
import { sendTransaction } from "./services/sendTransaction.js";
import "dotenv/config";
import { v4 as uuidv4 } from 'uuid';
import { quotationController } from "./controllers/quotationController.js";
import { getTransactionsController } from "./controllers/getTransactionsController.js";
import { getMerchantByAccountNumber } from "./controllers/getMerchantByAccountNumber.js";
import { catchXpressoFeeController } from "./controllers/catchXpressoFeeController.js";
import { updateAccountListController } from "./controllers/updateAccountListController.js";
import { getNewCredentials } from "./controllers/getNewCredentialsController.js";
import { getMerchantByAccountId } from "./utils/getMerchantByAccountId.js";
import { withdrawController } from "./controllers/withdrawController.js";
import { internalTransferController } from "./controllers/internalTransferController.js";
import { getBalanceController } from "./controllers/getBalanceController.js";
import { getTransactionsByAccountNumberController } from "./controllers/getTransactionsByAccountNumberController.js";
import { CreateXpressoInvoicePayload } from "./types/CreateXpressoInvoicePayload.js";
import { createXpressoInvoice } from "./services/createInvoice.js";

const app = express();
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cors())

app.set("trust proxy", true)

if(process.env.PRODUCTION === "true") {
  const trustedIPs = ["::ffff:192.168.151.10"]
  const allowedOrigins = [
    "https://checkout.moneytransmittersystem.com", 
    "https://mittere.moneytransmittersystem.com", 
    "https://pix.travelagentsystems.com",
    "http://localhost:4200"
  ]
  app.use((req, res, next) => {
    const requestIp = req.ip
    const origin = req.headers.origin

    if(req.path.startsWith("/webhook/")) {
      return next()
    }

    if(trustedIPs.includes(requestIp!) || allowedOrigins.includes(origin!)) {
      if(origin) {
        res.header('Access-Control-Allow-Origin', origin);
      }
      next()
    } else {
      res.status(403).json({ message: "Origin not allowed" })
    }
  })
}

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*"
  }
});

type SocketSessionId = string
type Transaction = CreateXpressoInvoicePayload & { transactionId: string }
const transactionMapping = new Map<SocketSessionId, Transaction>()

io.on("connection", (socket) => {
  console.log("CONECTADO")

  socket.on("disconnect", () => {
    transactionMapping.delete(socket.id)
    console.log("desconectado: " + socket.id)
  })
  
});

app.post("/webhook/:id", async (req, res) => {
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
})

app.post("/big/pix", async (req, res) => {
  try {
    const { amount, socketSessionId, accountId, clientCode, xpressoPayload } = req.body
    const transaction = {
      ...xpressoPayload as CreateXpressoInvoicePayload,
      transactionId: uuidv4()
    }
    transactionMapping.set(socketSessionId, transaction)
    const merchant = getMerchantByAccountId(accountId, clientCode)
    if(!merchant) return res.status(204).send("não encontramos nenhuma conta com este id")
    
    const result = await sendTransaction(amount, transaction.transactionId, {
      accountNumber: merchant.account_number,
      apiKey: merchant.api_Key,
      applicationId: merchant.application_id
    });
    
    if("message" in result) {
      res.status(200).send()
    } else {
      console.log(result)
      res.status(500).json({
        erro: "nao foi possivel iniciar uma transação pix",
        ...result
    })
  }
  } catch (error) {
    console.log(error)
    res.status(500).send(error)
  }
})

app.get("/quotation", quotationController)
app.get("/merchants/", getMerchantByAccountNumber)
app.get("/transactions/", getTransactionsByAccountNumberController)

app.post("/daily-transactions", getTransactionsController)
app.post("/catch-xfee", catchXpressoFeeController)
app.post("/account-list", updateAccountListController)
app.post("/new-authorization", getNewCredentials)
app.post("/withdraw", withdrawController)
app.post("/inner-transfer", internalTransferController)
app.post("/balance", getBalanceController)

app.get("/", (req, res) => {
  res.status(200).send("api accessible")
})

const PORT = process.env.PRODUCTION === "true" ? 3002 : 3003
httpServer.listen(PORT);

function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  res.status(500).send(err.message || "Unexpected server error")
}
app.use(errorHandler)
