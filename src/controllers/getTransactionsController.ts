import { NextFunction, Request, Response } from "express";
import { getDailyTransaction } from "../services/getDailyTransactions.js";
import { js2xml } from "xml-js";

export async function getTransactionsController(req: Request, res: Response, next: NextFunction) {
  try {
    const { x_Account_Number, x_Api_key, x_Application_Id } = req.body
    if(!x_Account_Number || !x_Api_key || !x_Application_Id) return res.status(400).send("missing required parameters")
    
    const result = await getDailyTransaction({
      accountNumber: x_Account_Number || process.env.ACCOUNT_NUMBER,
      apiKey: x_Api_key || process.env.API_KEY,
      applicationId: x_Application_Id || process.env.APPLICATION_ID
    });

    const xmlData = js2xml(result, { compact: true, ignoreComment: true })
    res.type("text/xml")
    res.send(xmlData)
  } catch (error) {
    next(error)
  }
}