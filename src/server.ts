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
  try {
    const { amount, socketSessionId, accountId } = req.body
    const transactionId = uuidv4()
    transactionIdMapping.set(socketSessionId, transactionId)
    const merchant = getMerchantByAccountId(accountId)
    if(!merchant) return res.status(204).send("não encontramos nenhuma conta com este id")
    
    const result = await sendTransaction(amount, transactionId, {
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
app.get("/merchants/:accNumber", getMerchantByAccountNumber)
app.get("/transactions/:accNumber", getTransactionsByAccountNumberController)

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

httpServer.listen(3002);

function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  console.log(err.message)
  res.status(500).send(err.message || "Unexpected server error")
}
app.use(errorHandler)