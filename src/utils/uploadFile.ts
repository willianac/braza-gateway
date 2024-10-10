import { Client } from "basic-ftp";

type RemoteFolder = "Ordens" | "Retorno" | "Rates"

export async function uploadFile(file: string, ftpUser: string, ftpPass: string, remoteFolder?: RemoteFolder) {
  const client = new Client()
  client.ftp.verbose = true

  try {
    await client.access({
      host: process.env.FTP_HOST,
      user: ftpUser,
      password: ftpPass
    })

    await client.cd(`./${remoteFolder}`)

    await client.uploadFrom(file + ".txt", file + ".txt")

    client.close()
  } catch (error) {
    console.error(error)
  }
}