import { NextFunction, Request, Response } from "express";
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { writeFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function updateAccountListController(req: Request, res: Response, next: NextFunction) {
  const { AccountList, LicenseCode } = req.body
  if(AccountList) {
    try {
      const configPath = resolve(__dirname, `../config/${LicenseCode}.json`);
      
      writeFileSync(configPath, AccountList); // Convert AccountList to JSON if it's an object
      return res.status(200).send();
    } catch (error) {
      console.log(error)
      return res.status(500).send("nao foi possivel atualizar a lista de contas")
    }
  }
  res.status(400).send("parametros invalidos.")
}