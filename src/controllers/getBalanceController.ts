import { NextFunction, Request, Response } from "express";
import { getDailyTransaction } from "../services/getDailyTransactions.js";
import { js2xml } from "xml-js";

export async function getBalanceController(req: Request, res: Response, next: NextFunction) {
  try {
    const { x_Account_Number, x_Api_key, x_Application_Id } = req.body
    const result = await getDailyTransaction({
      accountNumber: x_Account_Number,
      apiKey: x_Api_key,
      applicationId: x_Application_Id
    })
    const balance = { balance: result.balance }
    const xmlData = js2xml(balance, { compact: true, ignoreComment: true })
    res.type("text/xml")
    res.status(200).send(xmlData)
  } catch (error) {
    //testando enviar como resposta para o xpresso erro com status 200.
    res.status(500).send((error as any).message)
    //next(error)
  }
}