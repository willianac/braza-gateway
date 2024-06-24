import { Client } from "basic-ftp";

type RemoteFolder = "Ordens" | "Retorno" | "Rates"

export async function uploadFile(file: string, remoteFolder?: RemoteFolder) {
  const client = new Client()
  client.ftp.verbose = true

  try {
    await client.access({
      host: process.env.FTP_HOST,
      user: process.env.FTP_USER,
      password: process.env.FTP_PASS
    })

    await client.cd(`./${remoteFolder}`)

    await client.uploadFrom(file + ".txt", file + ".txt")
    client.close()


  } catch (error) {
    console.error(error)
  }
}