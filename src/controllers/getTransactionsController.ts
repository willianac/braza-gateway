import { NextFunction, Request, Response } from "express";
import { getDailyTransaction } from "../services/getDailyTransactions.js";
import { js2xml } from "xml-js";

export async function getTransactionsController(req: Request, res: Response, next: NextFunction) {
  try {
    const { x_Account_Number, x_Api_key, x_Application_Id } = req.body
    if(!x_Account_Number || !x_Api_key || !x_Application_Id) return res.status(400).send("missing required parameters")

    let result;
    result = await getDailyTransaction({
      accountNumber: x_Account_Number,
      apiKey: x_Api_key,
      applicationId: x_Application_Id
    });

    result = js2xml(result, { compact: true, ignoreComment: true })
    res.type("text/xml")
    res.send(result)
  } catch (error) {
    next(error)
  }
}