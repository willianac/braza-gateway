import { CreateXpressoInvoicePayload } from "../types/CreateXpressoInvoicePayload.js"

type SocketSessionId = string
type Transaction = CreateXpressoInvoicePayload & { transactionId: string }
export const transactionMapping = new Map<SocketSessionId, Transaction>()