import { NextFunction, Request, Response } from "express";
import merchantsConfig from "../../config/EC.json"
import { doInternalTransfer } from "../services/doInternalTransfer.js";

export async function catchXpressoFee(req: Request, res: Response, next: NextFunction) {
  try {
    const { senderAccount, xFeeAccount, amount } = req.body
    const merchant = merchantsConfig.merchants.find(merch => merch.account_number === senderAccount)
    if(!merchant) throw new Error("sender account-id not found")
    
    const result = await doInternalTransfer({
      accountNumber: merchant.account_number,
      apiKey: merchant.api_Key,
      applicationId: merchant.application_id
    }, xFeeAccount, amount)   
    if("message" in result) {
      res.status(200).send("success")
    } else {
      throw new Error("nao foi possivel fazer a transferencia interna")
    }
    
  } catch (error) {
    next(error)
  }
}