type PixData = {
  pix: string
  image_url: string
}

type PixStatus = {
  paymentId: number
  status: string
}

export type WebHookResponse = {
  action: string
  method: "pix_code" | "pix_update"
  data: {
    type: string | null
    content: PixData | PixStatus
  }
}