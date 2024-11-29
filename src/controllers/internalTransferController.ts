import { NextFunction, Request, Response } from "express";
import { doInternalTransfer } from "../services/doInternalTransfer.js";
import { js2xml } from "xml-js";
import { Merchant } from "../types/Merchant.js";
import { getMerchantByAccountId } from "../utils/getMerchantByAccountId.js";

export async function internalTransferController(req: Request, res: Response, next: NextFunction) {
  try {
    const { 
      x_Account_Number, 
      x_Api_key, 
      x_Application_Id,
      Destination_Account,
      Amount,
      clientCode
    } = req.body

    if(!x_Account_Number || !Destination_Account || !Amount) return res.status(400).send("missing required parameters")

    let merchant: Merchant | undefined;

    if(!x_Api_key && !x_Application_Id) {
      merchant = getMerchantByAccountId(x_Account_Number, clientCode)
      if(!merchant) return res.status(400).send("conta não encontrada")
    }
  
    const result = await doInternalTransfer(
      {
        accountNumber: x_Account_Number,
        apiKey: x_Api_key || merchant?.api_Key,
        applicationId: x_Application_Id || merchant?.application_id
      },
      Destination_Account,
      parseFloat(Amount)
    )
    if("message" in result) {
      res.status(200).json({ message: "success" })
    } else {
      throw new Error(JSON.stringify(result))
    }
  } catch (error) {
    next(error)
  }
}