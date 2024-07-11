import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { WebHookResponse } from "./types/Webhook.js";
import { sendTransaction } from "./controllers/sendTransaction.js";
import "dotenv/config";
import { v4 as uuidv4 } from 'uuid';

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
  })
});

app.post("/webhook", (req, res) => {
  const webhookData = req.body as WebHookResponse
  console.log("RECEBEU NO WEBHOOK:")
  console.log(webhookData)

  io.emit("response", webhookData)
  res.status(200).send("received")
})

app.post("/big/pix", async (req, res) => {
  const { amount, socketSessionId } = req.body
  const transactionId = uuidv4()
  transactionIdMapping.set(socketSessionId, transactionId)
  const result = await sendTransaction(amount);
  res.send("done")
})

httpServer.listen(3002);