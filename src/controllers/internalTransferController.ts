import { NextFunction, Request, Response } from "express";
import { doInternalTransfer } from "../services/doInternalTransfer.js";

export async function internalTransferController(req: Request, res: Response, next: NextFunction) {
  try {
    const { 
      x_Account_Number, 
      x_Api_key, 
      x_Application_Id,
      Destination_Account,
      Amount
    } = req.body
  
    const result = await doInternalTransfer(
      {
        accountNumber: x_Account_Number,
        apiKey: x_Api_key,
        applicationId: x_Application_Id
      },
      Destination_Account,
      parseFloat(Amount)
    )
    if("message" in result) {
      res.status(200).send("success")
    } else {
      throw new Error("nao foi possivel fazer a transferencia interna")
    }
  } catch (error) {
    next(error)
  }
}