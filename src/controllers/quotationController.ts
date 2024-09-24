import { NextFunction, Request, Response } from "express";
import { getQuotation } from "../services/getQuotation.js";

export async function quotationController(req: Request, res: Response, next: NextFunction) {
  try {
    const { markupType, markupValue, pair } = req.query
    if(!markupType || !markupValue || !pair) return res.status(400).send("missing required parameters")

    const params = new URLSearchParams({
      markup_type: markupType as string,
      markup_value: markupValue as string,
      pair: pair as string
    })
    const result = await getQuotation(params)
    if("quotation" in result) {
      res.status(200).json(result)
    } else {
      throw new Error(JSON.stringify(result))
    }
  } catch (error) {
    next(error)
  }
}