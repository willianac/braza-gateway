export type Merchant = {
  merchantId: string,
  name: string,
  type: string,
  login: {
    email: string,
    password: string
  },
  account_number: string,	  
  wallet: string,
  application_id: string,
  api_Key: string,
  markupType: "P" | "C" | "F",
  markupValue:  number
}