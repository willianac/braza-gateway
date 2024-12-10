export type CreateXpressoInvoicePayload = {
  SessionKey: string
  ReceiverID: string
  AcctID: string
  Amount: string
  Nacional: string
  PayorServId: string
  lang: string
  PayorID: string
  SenderPaymentId: string
  Geolocation: string
  endpoint: string
  brazaAccountNum: string
  xFeeAccountNum: string
  xFeeAmount: number
  transactionId?: string
}