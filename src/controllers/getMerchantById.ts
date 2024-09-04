import { NextFunction, Request, Response } from "express";
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFileSync } from 'fs';
import { Merchant } from "../types/Merchant.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function getMerchantById(req: Request, res: Response, next: NextFunction) {
  const { id } = req.params
  const configPath = resolve(__dirname, '../config/EC.json');
  const configFile = JSON.parse(readFileSync(configPath, 'utf-8'));
  const merchantList = configFile.merchants as Merchant[]
  const merchant = merchantList.find(merch => merch.merchantId === id)
  
  if(merchant) {
    const { api_Key, application_id, account_number, wallet, ...merchantWithoutKeys } = merchant
    return res.status(200).json(merchantWithoutKeys)
  }
  res.status(204).send()
}