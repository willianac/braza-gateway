import { NextFunction, Request, Response } from "express";
import { getDailyTransaction } from "../services/getDailyTransactions.js";
import { getMerchantByAccountId } from "../utils/getMerchantByAccountId.js";

export async function getTransactionsByAccountNumberController(req: Request, res: Response, next: NextFunction) {
  try {
    const { accNumber, clientCode } = req.query;

    const merchant = getMerchantByAccountId(accNumber as string, clientCode as string)

    if(!merchant) {
      res.status(204).send()
      return
    }
    const result = await getDailyTransaction({
      accountNumber: merchant.account_number,
      apiKey: merchant.api_Key,
      applicationId: merchant.application_id
    })

    const filteredByStatus = result.transactions.filter(transaction => transaction.status === "paid")
    result.transactions = filteredByStatus
    
    res.status(200).json(result);
  } catch (error) {
    next(error)
  }
}