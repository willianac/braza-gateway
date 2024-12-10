type PixData = {
  type: string | null
  content: {
    pix: string
    image_url: string
  }
}

type PixStatus = {
  type: string | null
  paymentId: number
  status: string
}

type WithdrawStatus = {
  message: string
  wallet: string
  installation_id: string
  time: string
}

export type WebHookResponse =
  | {
      action: string;
      method: "pix_code";
      data: PixData;
    }
  | {
      action: string;
      method: "pix_update";
      data: PixStatus;
    }
  | {
      action: string;
      method: "transaction_create";
      data: WithdrawStatus;
    };