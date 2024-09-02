import { NextFunction, Request, Response } from "express";
import merchantsConfig from "../../config/EC.json"

export async function getMerchantById(req: Request, res: Response, next: NextFunction) {
  const { id } = req.params
  const merchantsList = merchantsConfig.merchants
  const merchant = merchantsList.find(merch => merch.merchantId === id)
  if(merchant) {
    const { api_Key, application_id, account_number, wallet, ...merchantWithoutKeys } = merchant
    return res.status(200).json(merchantWithoutKeys)
  }
  res.status(204).send()
}