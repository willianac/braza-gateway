import { NextFunction, Request, Response } from "express";

import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFileSync } from 'fs';
import { Merchant } from "../types/Merchant.js";
import { getDailyTransaction } from "../services/getDailyTransactions.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function getTransactionsByAccountNumberController(req: Request, res: Response, next: NextFunction) {
  try {
    const { accNumber } = req.params;

    const configPath = resolve(__dirname, '../config/EC.json');
    const configFile = JSON.parse(readFileSync(configPath, 'utf-8'));
    const merchantList = configFile.merchants as Merchant[]
    const merchant = merchantList.find(merch => merch.account_number === accNumber)

    if(!merchant) {
      res.status(204).send()
      return
    }
    const result = await getDailyTransaction({
      accountNumber: merchant.account_number,
      apiKey: merchant.api_Key,
      applicationId: merchant.application_id
    })
    res.status(200).json(result);
  } catch (error) {
    next(error)
  }
}