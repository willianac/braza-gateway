import { NextFunction, Request, Response } from "express";
import { js2xml } from "xml-js";
import { getBalance } from "../services/getBalance.js";

export async function getBalanceController(req: Request, res: Response, next: NextFunction) {
  try {
    const { x_Account_Number, x_Api_key, x_Application_Id } = req.body
    const result = await getBalance({
      accountNumber: x_Account_Number,
      apiKey: x_Api_key,
      applicationId: x_Application_Id
    })

    const balance = { balance: result }
    const xmlData = js2xml(balance, { compact: true, ignoreComment: true })
    res.type("text/xml")
    res.status(200).send(xmlData)
  } catch (error) {
    next(error)
  }
}