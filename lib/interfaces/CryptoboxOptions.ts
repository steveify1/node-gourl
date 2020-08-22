export default interface CryptoboxOptions {
  publicKey: string;
  privateKey: string;
  webdevKey?: string;
  amount?: number;
  amountUSD?: number;
  period: string;
  language: 'en';
  iframeID?: string;
  orderID: string;
  userID: string;
  userFormat: 'COOKIE' | 'MANUAL';
  boxID: number;
  coinLabel?: string;
  coinName?: string;
  paid: false;
  confirmed: false;
  paymentID?: false;
  paymentDate?: string;
  amountPaid?: number;
  amountPaidUSD?: number;
  boxType: string;
  processed?: false;
  cookieName?: string;
  localisation: string;
  ver?: string;
}
