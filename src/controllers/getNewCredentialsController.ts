import { NextFunction, Request, Response } from "express";
import { getCredentials } from "../services/getCredentials.js";
import { js2xml } from "xml-js";

export async function getNewCredentials(req: Request, res: Response, next: NextFunction) {
  try {
    const { x_Account_Number, x_Api_key, x_Application_Id } = req.body
    if(!x_Account_Number || !x_Api_key || !x_Application_Id) return res.status(400).send("missing required parameters")

    const result = await getCredentials({ 
      accountNumber: x_Account_Number, 
      apiKey: x_Api_key, 
      applicationId: x_Application_Id
    })

    if("detail" in result) throw new Error("erro ao gerar uma nova credencial")

    const response = {
      new_authorization: {
        ...result
      }
    }

    const xmlData = js2xml(response, { compact: true, ignoreComment: true })
    res.type("text/xml")
    res.send(xmlData)
  } catch (error) {
    next(error)
  }
}