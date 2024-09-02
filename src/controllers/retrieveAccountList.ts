import { NextFunction, Request, Response } from "express";
import { writeFile } from "fs";

export async function retrieveAccountList(req: Request, res: Response, next: NextFunction) {
  const { AccountList, LicenseCode } = req.body
  if(AccountList) {
    writeFile(`./config/${LicenseCode}.json`, AccountList, err => {
      err ? console.log(err) : undefined
    })
    return res.status(200).send()
  }
  res.status(400).send("parametros invalidos.")
}