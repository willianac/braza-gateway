import { Client } from "basic-ftp";

type RemoteFolder = "Ordens" | "Retorno" | "Rates"

export async function uploadFile(file: string, remoteFolder?: RemoteFolder) {
  const client = new Client()
  client.ftp.verbose = true

  try {
    //sobe no FTP 'Checkout'
    await client.access({
      host: process.env.FTP_HOST,
      user: process.env.FTP_USER_1,
      password: process.env.FTP_PASS_1
    })

    await client.cd(`./${remoteFolder}`)

    await client.uploadFrom(file + ".txt", file + ".txt")

    //sobe no FTP 'Absolute'
    await client.access({
      host: process.env.FTP_HOST,
      user: process.env.FTP_USER_2,
      password: process.env.FTP_PASS_2
    })
    await client.cd(`./${remoteFolder}`)

    await client.uploadFrom(file + ".txt", file + ".txt")
    client.close()
  } catch (error) {
    console.error(error)
  }
}