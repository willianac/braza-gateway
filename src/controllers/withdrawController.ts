import { NextFunction, Request, Response } from "express";
import { withdraw } from "../services/withdraw.js";
import { js2xml } from "xml-js";
import { getMerchantByAccountId } from "../utils/getMerchantByAccountId.js";
import { Merchant } from "../types/Merchant.js";

export async function withdrawController(req: Request, res: Response, next: NextFunction) {
  try {
    const { 
      x_Account_Number, 
      x_Api_key, 
      x_Application_Id,
      Coin_Name,
      Amount,
      Blockchain,
      Tron_Wallet,
      clientCode
    } = req.body

    let merchant: Merchant | undefined;
    if(!x_Api_key && !x_Application_Id) {
      merchant = getMerchantByAccountId(x_Account_Number, clientCode)
    }

    const result = await withdraw({
      credentials: {
        accountNumber: x_Account_Number,
        apiKey: x_Api_key || merchant?.api_Key,
        applicationId: x_Application_Id || merchant?.application_id
      },
      amount: Amount,
      coin: Coin_Name,
      blockchain: Blockchain,
      wallet: Tron_Wallet || merchant?.wallet
    })
    if("detail" in result) throw new Error(JSON.stringify(result))
    res.status(200).json({message: result.message})
  } catch (error) {
    if(error instanceof Error) {
      //testando enviar como resposta para o xpresso erro com status 200.
      const xmlErr = js2xml(JSON.parse(error.message), { compact: true, ignoreComment: true })
      return res.status(500).send(xmlErr)
    }
    next(error)
  }
}