import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFileSync } from 'fs';
import { Merchant } from "../types/Merchant.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function getMerchantByAccountId(id: string, clientCode: string): Merchant | undefined {
  try {
    const configPath = resolve(__dirname, `../config/${clientCode}.json`);
    const configFile = JSON.parse(readFileSync(configPath, 'utf-8'));
    const merchantList = configFile.merchants as Merchant[]
    return merchantList.find(merch => merch.account_number === id)
  } catch (error) {
    console.log(error)
    return undefined
  }
}