import { NextFunction, Request, Response } from "express";
import { withdraw } from "../services/withdraw.js";
import { js2xml } from "xml-js";

export async function withdrawController(req: Request, res: Response, next: NextFunction) {
  try {
    const { 
      x_Account_Number, 
      x_Api_key, 
      x_Application_Id,
      Coin_Name,
      Amount,
      Blockchain,
      Tron_Wallet
    } = req.body

    const result = await withdraw({
      credentials: {
        accountNumber: x_Account_Number,
        apiKey: x_Api_key,
        applicationId: x_Application_Id
      },
      amount: Amount,
      coin: Coin_Name,
      blockchain: Blockchain,
      wallet: Tron_Wallet
    })
    if("detail" in result) throw new Error(JSON.stringify(result))
    res.status(200).send(result.message)
  } catch (error) {
    if(error instanceof Error) {
      //testando enviar como resposta para o xpresso erro com status 200.
      const xmlErr = js2xml(JSON.parse(error.message), { compact: true, ignoreComment: true })
      return res.status(500).send(xmlErr)
    }
    next(error)
  }
}