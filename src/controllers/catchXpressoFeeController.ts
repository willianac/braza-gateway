import { NextFunction, Request, Response } from "express";
import { doInternalTransfer } from "../services/doInternalTransfer.js";
import { getMerchantByAccountId } from "../utils/getMerchantByAccountId.js";

export async function catchXpressoFeeController(req: Request, res: Response, next: NextFunction) {
  try {
    const { senderAccount, xFeeAccount, amount, clientCode } = req.body
    const merchant = getMerchantByAccountId(senderAccount, clientCode)
    if(!merchant) throw new Error("sender account-id not found")
    
    const result = await doInternalTransfer({
      accountNumber: merchant.account_number,
      apiKey: merchant.api_Key,
      applicationId: merchant.application_id
    }, xFeeAccount, amount)   
    if("message" in result) {
      res.status(200).send()
    } else {
      throw new Error("nao foi possivel fazer a transferencia interna")
    }
    
  } catch (error) {
    next(error)
  }
}