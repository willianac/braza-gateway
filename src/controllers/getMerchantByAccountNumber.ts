import { NextFunction, Request, Response } from "express";
import { getMerchantByAccountId } from "../utils/getMerchantByAccountId.js";

export async function getMerchantByAccountNumber(req: Request, res: Response, next: NextFunction) {
  const { accNumber, clientCode } = req.query
  
  const merchant = getMerchantByAccountId(accNumber as string, clientCode as string)
  
  if(merchant) {
    const { api_Key, application_id, account_number, ...merchantWithoutKeys } = merchant
    return res.status(200).json(merchantWithoutKeys)
  }
  res.status(204).send()
}