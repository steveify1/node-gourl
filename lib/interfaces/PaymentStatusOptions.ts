export default interface PaymentStatusOption {
  privateKey?: string;
  boxID: string;
  orderID: string;
  userID: string;
  language?: string;
  period: string;
  ipAddress: string;
  userAgent: string;
}
