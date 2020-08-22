import CryptoboxOptions from './interfaces/CryptoboxOptions';

const defaults: CryptoboxOptions = {
  // Custom Variables

  publicKey: '', // value from your gourl.io member page - https://gourl.io/info/memberarea
  privateKey: '', // value from your gourl.io member page.  Also you setup cryptocoin name on gourl.io member page
  webdevKey: '', // optional, web developer affiliate key
  amount: 0, // amount of cryptocoins which will be used in the payment box/captcha, precision is 4 (number of digits after the decimal), example: 0.0001, 2.444, 100, 2455, etc.
  /* we will use this $amount value of cryptocoins in the payment box with a small fraction after the decimal point to uniquely identify each of your users individually
   * (for example, if you enter 0.5 BTC, one of your user will see 0.500011 BTC, and another will see  0.500046 BTC, etc) */
  amountUSD: 0,
  /* you can specify your price in USD and cryptobox will automatically convert that USD amount to cryptocoin amount using today live cryptocurrency exchange rates.
   * Using that functionality (price in USD), you don't need to worry if cryptocurrency prices go down or up.
   * User will pay you all times the actual price which is linked on current exchange price in USD on the datetime of purchase.
   * You can use in cryptobox options one variable only: amount or amountUSD. You cannot place values of those two variables together. */
  period: '', // period after which the payment becomes obsolete and new cryptobox will be shown; allow values: NOEXPIRY, 1 MINUTE..90 MINUTE, 1 HOUR..90 HOURS, 1 DAY..90 DAYS, 1 WEEK..90 WEEKS, 1 MONTH..90 MONTHS
  language: 'en', // cryptobox localisation; en - English, es - Spanish, fr - French, de - German, nl - Dutch, it - Italian, ru - Russian, pl - Polish, pt - Portuguese, fa - Persian, ko - Korean, ja - Japanese, id - Indonesian, tr - Turkish, ar - Arabic, cn - Simplified Chinese, zh - Traditional Chinese, hi - Hindi
  iframeID: '', // optional, html iframe element id; allow symbols: a..Z0..9_-
  orderID: '', // your page name / product name or order name (not unique); allow symbols: a..Z0..9_-@.; max size: 50 symbols
  userID: '', // optional, manual setup unique identifier for each of your users; allow symbols: a..Z0..9_-@.; max size: 50 symbols
  /* IMPORTANT - If you use Payment Box/Captcha for registered users on your website, you need to set userID manually with
   * an unique value for each of your registered user. It is better than to use cookies by default. Examples: 'user1', 'user2', '3vIh9MjEis' */
  userFormat: 'COOKIE', // this variable use only if $userID above is empty - it will save random userID in cookies, sessions or use user IP address as userID. Available values: COOKIE, SESSION, IPADDRESS

  /* PLEASE NOTE -
   * If you use multiple stores/sites online, please create separate GoUrl Payment Box (with unique payment box public/private keys) for each of your stores/websites.
   * Do not use the same GoUrl Payment Box with the same public/private keys on your different websites/stores.
   * if you use the same $public_key, $orderID and $userID in your multiple cryptocoin payment boxes on different website pages and a user has made payment; a successful result for that user will be returned on all those pages (if $period time valid).
   * if you change - $public_key or $orderID or $userID - new cryptocoin payment box will be shown for exisiting paid user. (function $this->is_paid() starts to return 'false').
   * */

  // Internal Variables

  boxID: 0, // cryptobox id, the same as on gourl.io member page. For each your cryptocoin payment boxes you will have unique public / private keys
  coinLabel: '', // current cryptocoin label (BTC, DOGE, etc.)
  coinName: '', // current cryptocoin name (Bitcoin, Dogecoin, etc.)
  paid: false, // paid or not
  confirmed: false, // transaction/payment have 6+ confirmations or not
  paymentID: false, // current record id in the table crypto_payments (table stores all payments from your users)
  paymentDate: '', // transaction/payment datetime in GMT format
  amountPaid: 0, // exact paid amount; for example, $amount = 0.5 BTC and user paid - $amountPaid = 0.50002 BTC
  amountPaidUSD: 0, // approximate paid amount in USD; using cryptocurrency exchange rate on datetime of payment
  boxType: '', // cryptobox type - 'paymentbox' or 'captchabox'
  processed: false, // optional - set flag to paid & processed
  cookieName: '', // user cookie/session name (if cookies/sessions use)
  localisation: '', // localisation; en - English, es - Spanish, fr - French, de - German, nl - Dutch, it - Italian, ru - Russian, pl - Polish, pt - Portuguese, fa - Persian, ko - Korean, ja - Japanese, id - Indonesian, tr - Turkish, ar - Arabic, cn - Simplified Chinese, zh - Traditional Chinese, hi - Hindi
  ver: '', // version
};

export default defaults;
