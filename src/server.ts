import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { WebHookResponse } from "./types/Webhook.js";


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
  res.status(200).send("received")
})

app.post("/big/pix", (req, res) => {
  const body = req.body
})

httpServer.listen(3000);