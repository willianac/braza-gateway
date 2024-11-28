type PixData = {
  type: string | null
  content: {
    pix: string
    image_url: string
  }
}

type PixStatus = {
  type: string | null
  content: {
    paymentId: number
    status: string
  }
}

type WithdrawStatus = {
  message: string
  wallet: string
  installation_id: string
  time: string
}

export type WebHookResponse = {
  action: string
  method: "pix_code" | "pix_update" | "transaction_create"
  data: PixData | PixStatus | WithdrawStatus
}