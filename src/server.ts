import express, { NextFunction, Request, Response } from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import "dotenv/config";
import { quotationController } from "./controllers/quotationController.js";
import { getTransactionsController } from "./controllers/getTransactionsController.js";
import { getMerchantByAccountNumber } from "./controllers/getMerchantByAccountNumber.js";
import { catchXpressoFeeController } from "./controllers/catchXpressoFeeController.js";
import { updateAccountListController } from "./controllers/updateAccountListController.js";
import { getNewCredentials } from "./controllers/getNewCredentialsController.js";
import { withdrawController } from "./controllers/withdrawController.js";
import { internalTransferController } from "./controllers/internalTransferController.js";
import { getBalanceController } from "./controllers/getBalanceController.js";
import { getTransactionsByAccountNumberController } from "./controllers/getTransactionsByAccountNumberController.js";
import { transactionMapping } from "./state/transactionMapping.js";
import { brazaWebhookController } from "./controllers/brazaWebhook.js";
import { pixController } from "./controllers/pixController.js";

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

io.on("connection", (socket) => {
  console.log("CONECTADO")

  socket.on("disconnect", () => {
    transactionMapping.delete(socket.id)
    console.log("desconectado: " + socket.id)
  })
  
});

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

app.post("/webhook/:id", brazaWebhookController(io))
app.post("/big/pix", pixController)

app.get("/", (req, res) => {
  res.status(200).send("api accessible")
})

const PORT = process.env.PRODUCTION === "true" ? 3002 : 3003
httpServer.listen(PORT);

function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  res.status(500).send(err.message || "Unexpected server error")
}
app.use(errorHandler)
