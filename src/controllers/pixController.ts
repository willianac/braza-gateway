import { NextFunction, Request, Response } from "express";
import { v4 as uuidv4 } from 'uuid';

import { transactionMapping } from "../state/transactionMapping.js";
import { CreateXpressoInvoicePayload } from "../types/CreateXpressoInvoicePayload.js";
import { getMerchantByAccountId } from "../utils/getMerchantByAccountId.js";
import { sendTransaction } from "../services/sendTransaction.js";

export async function pixController(req: Request, res: Response, next: NextFunction) {
  try {
    const { amount, socketSessionId, xpressoPayload } = req.body
    const xpresso = xpressoPayload as CreateXpressoInvoicePayload
    const transaction = {
      ...xpressoPayload,
      transactionId: uuidv4()
    }
    transactionMapping.set(socketSessionId, transaction)
    const merchant = getMerchantByAccountId(xpresso.brazaAccountNum, xpresso.endpoint)
    if(!merchant) return res.status(204).send("não encontramos nenhuma conta com este id")
    
    const result = await sendTransaction(amount, transaction.transactionId, {
      accountNumber: merchant.account_number,
      apiKey: merchant.api_Key,
      applicationId: merchant.application_id
    });
    
    if("message" in result) {
      res.status(200).send()
    } else {
      console.log(result)
      res.status(500).json({
        erro: "nao foi possivel iniciar uma transação pix",
        ...result
      })
    }
  } catch (error) {
    console.log("ERRO AO INICIAR UM PIX")
    console.log(error)
    next(error)
  }
}