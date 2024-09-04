import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFileSync } from 'fs';
import { Merchant } from "../types/Merchant.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function getMerchantByAccountId(id: string): Merchant | undefined {
  const configPath = resolve(__dirname, '../config/EC.json');
  const configFile = JSON.parse(readFileSync(configPath, 'utf-8'));
  const merchantList = configFile.merchants as Merchant[]
  return merchantList.find(merch => merch.account_number === id)
}