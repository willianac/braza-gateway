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

const app = express();
app.use(express.json())
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
  const { amount, socketSessionId } = req.body
  const transactionId = uuidv4()
  transactionIdMapping.set(socketSessionId, transactionId)
  const result = await sendTransaction(amount, transactionId);
  res.send()
})

app.get("/daily-transactions", async (req, res) => {
  try {
    const result = await getDailyTransaction();
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

app.get("/", (req, res) => {
  res.status(200).send("api accessible")
})

httpServer.listen(3002);