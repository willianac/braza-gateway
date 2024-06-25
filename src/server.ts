import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { WebHookResponse } from "./types/Webhook.js";
import { sendTransaction } from "./controllers/sendTransaction.js";


const app = express();
app.use(express.json())
app.use(cors())
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*"
  }
});

io.on("connection", (socket) => {
  console.log("CONECTADO")

  socket.on("test", (data) => {
    console.log("evento 'test' recebido!");
    console.log(data);
    socket.emit("test", "enviando test para o client, recebeu?");
  });
});

app.post("/webhook", (req, res) => {
  const webhookData = req.body as WebHookResponse
  console.log(webhookData)

  io.emit("response", webhookData)
  res.status(200).send("received")
})

app.post("/big/pix", async (req, res) => {
  const amount = req.body.amount
  const result = await sendTransaction(amount);
  console.log(result?.message)
  res.send(result)
})

httpServer.listen(3002);