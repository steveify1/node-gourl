/**
 * ##########################################
 * ###  PLEASE DO NOT MODIFY THIS FILE !  ###
 * ##########################################
 *
 *
 * PHP Cryptocurrency Payment Class
 *
 * @package     GoUrl PHP Bitcoin/Altcoin Payments and Crypto Captcha
 * @copyright   2014-2020 Delta Consultants
 * @category    Libraries
 * @website     https://gourl.io
 * @api         https://gourl.io/bitcoin-payment-gateway-api.html
 * @example     https://gourl.io/lib/examples/example_customize_box.php    <----
 * @gitHub  	https://github.com/cryptoapi/Payment-Gateway
 * @license 	Free GPLv2
 * @version     2.2.1
 *
 *
 *  CLASS CRYPTOBOX - LIST OF METHODS:
 *  --------------------------------------
 *  1a. function display_cryptobox(..)			// Show Cryptocoin Payment Box and automatically displays successful payment message. If $submit_btn = true, display user submit button 'Click Here if you have already sent coins' or not
 *  1b. function display_cryptobox_bootstrap(..) // Show Customize Mobile Friendly Payment Box and automatically displays successful payment message if use ajax.
 *                                               // optional - FREE WHITE-LABEL PRODUCT - BITCOIN/ALTCOIN PAYMENT BOX WITH YOUT LOGO THROUGH YOUR SERVER.
 *                                               // This function use bootstrap4 template; you can use your own template without this function
 *  2. function cryptobox_json_url()            // It generates url with your parameters to gourl.io payment gateway. Using this url you can get bitcoin/altcoin payment box values in JSON format and use it on html page with Jquery/Ajax.
 *  3. function get_json_values()               // Alternatively, you can receive JSON values though php curl on server side and use it in your php file without using Javascript and Jquery/Ajax.
 *  4. function cryptobox_hash(..)              // It generates security md5 hash for all values used in payment box
 *  5. function is_paid(..)	 					// If payment received - return true, otherwise return false
 *  6. function is_confirmed()					// Returns true if transaction/payment have 6+ confirmations. Average transaction/payment confirmation time - 10-20min for 6 confirmations (altcoins)
 *  7. function amount_paid()					// Returns the amount of coins received from the user
 *  8. function amount_paid_usd()				// Returns the approximate amount in USD received from the user using live cryptocurrency exchange rates on the datetime of payment
 *  9. function set_status_processed()			// Optional - if payment received, set payment status to 'processed' and save this status in database
 *  10. function is_processed()					// Optional - if payment status in database is 'processed' - return true, otherwise return false
 *  11.function cryptobox_type()				// Returns cryptobox type - paymentbox or captchabox
 *  12.function payment_id()					// Returns current record id in the table crypto_payments. Crypto_payments table stores all payments from your users
 *  13.function payment_date()					// Returns payment/transaction datetime in GMT format
 *  14.function payment_info()					// Returns object with current user payment details - amount, txID, datetime, usercointry, etc
 *  15.function cryptobox_reset()				// Optional, Delete cookies/sessions and new cryptobox with new payment amount will be displayed. Use this function only if you have not set userID manually.
 *  16.function coin_name()						// Returns coin name (bitcoin, dogecoin, etc)
 *  17.function coin_label()					// Returns coin label (DOGE, BTC, etc)
 *  18.function iframe_id()						// Returns payment box frame id
 *  19.function payment_status_text()           // Return localize message from $cryptobox_localisation for current user language
 *
 *
 *  LIST OF GENERAL FUNCTIONS:
 *  -------------------------------------
 *  A. function payment_history(..) 			// Returns array with history payment details of any of your users / orders / etc.
 *  B. function payment_unrecognised(..) 		// Returns array with unrecognised payments for custom period - $time (users paid wrong amount on your internal wallet address)
 *  C. function payment_ipntest(..)				// Returns an array with test payments sent from the IPN TEST gourl.io web page https://gourl.io/info/ipn/IPN_Website_Testing.html
 *  D. function payment_ipntest_delete(..)		// Delete test payments sent from the IPN TEST gourl.io web page https://gourl.io/info/ipn/IPN_Website_Testing.html
 *  E. function cryptobox_sellanguage(..)       // Get cryptobox current selected language by user (english, spanish, etc)
 *  F. function cryptobox_selcoin(..)			// Get cryptobox current selected coin by user (bitcoin, dogecoin, etc. - for multiple coin payment boxes)
 *  G. function display_language_box(..)		// Language selection dropdown list for cryptocoin payment box
 *  H. function display_currency_box(..)		// Multiple crypto currency selection list. You can accept payments in multiple crypto currencies (for example: bitcoin, bitcoincash, bitcoinsv, litecoin, dogecoin)
 *  I. function get_country_name(..)			// Get country name by country code or reverse
 *  J. function convert_currency_live(..)		// Fiat currency converter using live exchange rates websites
 *  K. function get_url_contents(..)			// get remote url content through curl
 *  L. function validate_gourlkey(..)			// Validate gourl private/public/affiliate keys
 *  M. function run_sql(..)						// Run SQL queries and return result in array/object formats
 *
 *
 *  CONSTANTS
 *  -------------------------------------
 *  CRYPTOBOX_LANGUAGE - cryptobox current selected language
 *  CRYPTOBOX_LOCALISATION - all cryptobox localisations
 *
 *  Note: Complete Description of the Functions, see on the page below or here - https://gourl.io/api-php.html
 *
 *
 */

// import crypto  from 'crypto';
// import https  from 'https';
import { Buffer } from 'buffer';
import crc32 from 'crc-32';
import md5 from 'md5';
import axios, { AxiosResponse } from 'axios';

import CryptoboxOptions from './interfaces/CryptoboxOptions';
import RequestURLKeys from './interfaces/RequestURLKeys';

// IMPORT SOME DEFAULT OPTIONS
import defaults from './_defaults';

// IMPORT CONSTANTS
import {
  ALLOWED_LANGUAGES,
  MINIMUM_REQUIRED_PROPERTIES,
  CRYPTOBOX_VERSION,
} from './constants';

class Cryptobox {
  public baseURL: string = 'https://coins.gourl.io';
  public publicKey = ''; // value from your gourl.io member page - https://gourl.io/info/memberarea
  public privateKey = ''; // value from your gourl.io member page.  Also you setup cryptocoin name on gourl.io member page
  public webdevKey = ''; // optional, web developer affiliate key
  public ipAddress: string = ''; // The IP address of the current user or the server
  public amount = 0; // amount of cryptocoins which will be used in the payment box/captcha, precision is 4 (number of digits after the decimal), example: 0.0001, 2.444, 100, 2455, etc.
  /* we will use this $amount value of cryptocoins in the payment box with a small fraction after the decimal point to uniquely identify each of your users individually
   * (for example, if you enter 0.5 BTC, one of your user will see 0.500011 BTC, and another will see  0.500046 BTC, etc) */
  public amountUSD = 0;
  /* you can specify your price in USD and cryptobox will automatically convert that USD amount to cryptocoin amount using today live cryptocurrency exchange rates.
   * Using that functionality (price in USD), you don't need to worry if cryptocurrency prices go down or up.
   * User will pay you all times the actual price which is linked on current exchange price in USD on the datetime of purchase.
   * You can use in cryptobox options one variable only: amount or amountUSD. You cannot place values of those two variables together. */
  public period = ''; // period after which the payment becomes obsolete and new cryptobox will be shown; allow values: NOEXPIRY, 1 MINUTE..90 MINUTE, 1 HOUR..90 HOURS, 1 DAY..90 DAYS, 1 WEEK..90 WEEKS, 1 MONTH..90 MONTHS
  public language = 'en'; // cryptobox localisation; en - English, es - Spanish, fr - French, de - German, nl - Dutch, it - Italian, ru - Russian, pl - Polish, pt - Portuguese, fa - Persian, ko - Korean, ja - Japanese, id - Indonesian, tr - Turkish, ar - Arabic, cn - Simplified Chinese, zh - Traditional Chinese, hi - Hindi
  public iframeID = ''; // optional, html iframe element id; allow symbols: a..Z0..9_-
  public orderID = ''; // your page name / product name or order name (not unique); allow symbols: a..Z0..9_-@.; max size: 50 symbols
  public userID = ''; // optional, manual setup unique identifier for each of your users; allow symbols: a..Z0..9_-@.; max size: 50 symbols
  /* IMPORTANT - If you use Payment Box/Captcha for registered users on your website, you need to set userID manually with
   * an unique value for each of your registered user. It is better than to use cookies by default. Examples: 'user1', 'user2', '3vIh9MjEis' */
  public userFormat = 'MANUAL'; // this variable use only if $userID above is empty - it will save random userID in cookies, sessions or use user IP address as userID. Available values: COOKIE, SESSION, IPADDRESS

  /* PLEASE NOTE -
   * If you use multiple stores/sites online, please create separate GoUrl Payment Box (with unique payment box public/private keys) for each of your stores/websites.
   * Do not use the same GoUrl Payment Box with the same public/private keys on your different websites/stores.
   * if you use the same $public_key, $orderID and $userID in your multiple cryptocoin payment boxes on different website pages and a user has made payment; a successful result for that user will be returned on all those pages (if $period time valid).
   * if you change - $public_key or $orderID or $userID - new cryptocoin payment box will be shown for exisiting paid user. (function $this->is_paid() starts to return 'false').
   * */

  // Internal Variables
  private boxID = 0; // cryptobox id, the same as on gourl.io member page. For each your cryptocoin payment boxes you will have unique public / private keys
  private coinLabel = ''; // current cryptocoin label (BTC, DOGE, etc.)
  private coinName = ''; // current cryptocoin name (Bitcoin, Dogecoin, etc.)
  private paid = false; // paid or not
  private confirmed = false; // transaction/payment have 6+ confirmations or not
  private paymentID = false; // current record id in the table crypto_payments (table stores all payments from your users)
  private paymentDate = ''; // transaction/payment datetime in GMT format
  private amountPaid = 0; // exact paid amount; for example, $amount = 0.5 BTC and user paid - $amountPaid = 0.50002 BTC
  private amountPaidUSD = 0; // approximate paid amount in USD; using cryptocurrency exchange rate on datetime of payment
  private boxType = ''; // cryptobox type - 'paymentbox' or 'captchabox'
  private processed = false; // optional - set flag to paid & processed
  private cookieName = ''; // user cookie/session name (if cookies/sessions use)
  private localisation = ''; // localisation; en - English, es - Spanish, fr - French, de - German, nl - Dutch, it - Italian, ru - Russian, pl - Polish, pt - Portuguese, fa - Persian, ko - Korean, ja - Japanese, id - Indonesian, tr - Turkish, ar - Arabic, cn - Simplified Chinese, zh - Traditional Chinese, hi - Hindi
  private version = `version | gourlphp ${CRYPTOBOX_VERSION}`;
  public userAgent: string = '';

  /**
   * Creates an new Cryptobox object for interfacing with a `gourl` cryptobox
   * (payment box or capcha box)
   */
  constructor(options: CryptoboxOptions = defaults) {
    this.checkAndInitMinRequirements(options);
    this.setBoxID();
    this.validatePublicKey();
    this.validatePrivateKey();
    this.validateWebDevKey();
    this.setCoinInfo();
    this.setExpiry();
    this.setAmount();
    this.validateAmount();
    this.setLanguage();
  }

  /**
   * This method ends checks and defines the minimum required keys that makes up a valid
   * object that will be used to compose the gourl.io `url`
   * @param { defaults } options - The options object passed by the user
   *
   * @returns { void } void
   */
  checkAndInitMinRequirements(options: CryptoboxOptions): void {
    Object.keys(options).forEach((option: string, index: number) => {
      if (!MINIMUM_REQUIRED_PROPERTIES.includes(option)) return;
      const { value } = Object.getOwnPropertyDescriptor(options, option)!;
      Object.defineProperty(this, option, { value });
    });
  }

  /**
   * Checks if a key matches the `/[^A-Za-z0-9]/` Regex pattern.
   * @param { string } key - A string to be tested for a match
   * @returns { Boolean } true if a match is found. Otherwise, false
   */
  checkKeyPattern(key: string): boolean {
    const patternMatch = key.replace(/[^A-Za-z0-9]/, '');
    return patternMatch === key;
  }

  /**
   * Sets the value of the boxID based on the crypto box public key
   */
  setBoxID() {
    this.boxID = Number(this.left(this.publicKey, 'AA'));
  }

  /**
   * Sets the coin label and coin name
   * @return { void } void
   */
  setCoinInfo(): void {
    const c: string = this.right(
      this.left(this.publicKey, 'PUB'),
      'AA'
    ).substring(5);
    this.coinLabel = this.right(c, '77');
    this.coinName = this.left(c, '77');
  }

  /**
   * Sets the `amount` and `amountUSD` properties of the class
   */
  setAmount(): void {
    const amount: string = this.amount.toString();
    const amountUSD: string = this.amountUSD.toString();
    if (amount && amount.indexOf('.')) {
      this.amount = Number(amount.trim());
    }

    if (amountUSD && amountUSD.indexOf('.')) {
      this.amountUSD = Number(amountUSD.trim());
    }

    if (!this.amount || this.amount <= 0) this.amount = 0;
    if (!this.amountUSD || this.amountUSD <= 0) this.amountUSD = 0;
  }

  /**
   * Set cryptobox expiry period. This sets the value of the `period` property
   * which determines the period after which the cryptobox will be obselete and a new cryptobox must then be created.
   */
  setExpiry(): void {
    this.period = this.period.replace(' ', '').toUpperCase().trim();
    if (this.period.substring(-1) === 'S') {
      this.period = this.period.substring(0, -1);
    }

    const arr: string[] = [];
    for (let i = 1; i <= 90; i++) {
      arr.push(`${i}MINUTE`);
      arr.push(`${i}HOUR`);
      arr.push(`${i}DAY`);
      arr.push(`${i}WEEK`);
      arr.push(`${i}MONTH`);
    }

    if (this.period !== 'NOEXPIRY' && !arr.includes(this.period)) {
      throw new Error(`Invalid Cryptobox Period - ${this.period}`);
    }

    this.period = this.period.replace(
      /(minute|hour|day|week|month)/i,
      (match) => ` ${match}`
    );
  }

  /**
   * Sets the user's language. Defaults to `en` for English users.
   * You can collect this value from the client's request
   * @param { string } lang - A language. One of:
   * - 'en',
   * - 'es',
   * - 'fr',
   * - 'de',
   * - 'nl',
   * - 'it',
   * - 'ru',
   * - 'pl',
   * - 'pt',
   * - 'fa',
   * - 'ko',
   * - 'ja',
   * - 'id',
   * - 'tr',
   * - 'ar',
   * - 'cn',
   * - 'zh',
   * - 'hi',
   *
   */
  setLanguage(lang: string = 'en'): void {
    if (!ALLOWED_LANGUAGES.includes(lang)) {
      const errMsg = `Invalid lanuage value '"${lang}" in CRYPTOBOX_LANGUAGE; function setLanguage()`;
      throw new Error(errMsg);
    }
    this.language = lang;
  }

  /**
   * Sets the `userID` property of the Cryptobox instance.
   * `userID is a required field! This function stores the value of this
   * parameter as a string even if you pass a number.
   * @param { string | number } userID - The ID of the user making the payment.
   * It is recommended to use a value that you can track once a response is recieved from
   * gourl.io
   */
  setUserID(userID: string | number = ''): void {
    userID = `${userID}`;
    this.validateUserID(userID);
    this.userID = userID;
  }

  /**
   * Sets the `orderID` property of the Cryptobox instance.
   * `orderID is a required field! This function stores the value of this
   * parameter as a string even if you pass a number.
   * @param { string | number } orderID - The ID of the order
   * It is recommended to use a value that you can track once a response is recieved from
   * gourl.io
   */
  setOrderID(orderID: string | number = ''): void {
    orderID = `${orderID}`;
    this.validateOrderID(orderID);
    this.orderID = orderID;
  }

  /**
   * Sets the user's IP address
   * @param { string } ip - The user's IP address
   */
  setIPAddress(ip: string): void {
    this.ipAddress = ip;
  }

  /**
   * Sets the client's user agent
   * @param { string } agent - The client's agent
   * returns
   */
  ua(agent: string): void {
    this.userAgent = agent;
  }

  /**
   * Validates the user ID.
   * @param { string } userID - The ID of the user making the payment.
   * @returns { void } void
   */
  validateUserID(userID: string): void {
    if (!userID) {
      throw new Error('User ID is required');
    }
    if (userID && userID.replace(/[^A-Za-z0-9\.\_\-\@]/, '') != userID) {
      throw new Error(
        `Invalid User ID - ${userID} Allowed symbols: a..Z0..9_-@.`
      );
    }
    if (userID.length > 50) {
      throw new Error(`Invalid User ID - ${userID} Max: 50 characters`);
    }
  }

  /**
   * Validates the order ID.
   * @param { string } orderID - The ID of the Order
   * @returns { void } void
   */
  validateOrderID(orderID: string): void {
    if (!orderID) {
      throw new Error('Order ID is required');
    }
    if (orderID && orderID.replace(/[^A-Za-z0-9\.\_\-\@]/, '') != orderID) {
      throw new Error(
        `Invalid Order ID - ${orderID} Allowed symbols: a..Z0..9_-@.`
      );
    }
    if (orderID.length > 50) {
      throw new Error(`Invalid Order ID - ${orderID} Max: 50 characters`);
    }
  }

  /**
   * Validate amount and amountUSD
   */
  validateAmount(): void {
    if (
      (this.amount <= 0 && this.amountUSD <= 0) ||
      (this.amount > 0 && this.amountUSD > 0)
    )
      throw new Error(
        `You can use in cryptobox options one of variable only: amount or amountUSD. You cannot place values in that two variables together (submitted amount = '".this.amount."' and amountUSD = '".this.amountUSD."' )`
      );

    if (
      this.amount &&
      (typeof this.amount !== 'number' ||
        this.amount < 0.0001 ||
        this.amount > 500000000)
    )
      throw new Error(
        `Invalid Amount - "${this.amount}" ${this.coinLabel}. Allowed range: 0.0001 .. 500,000,000`
      );
    if (
      this.amountUSD &&
      (typeof this.amountUSD !== 'number' ||
        this.amountUSD < 0.01 ||
        this.amountUSD > 1000000)
    )
      throw new Error(
        `Invalid amountUSD - ${this.amountUSD}." USD. Allowed range: 0.01 .. 1,000,000`
      );
  }

  /**
   * Checks the validity of the public key. Throws an error if the
   * public key is empty or invalid
   * @returns { void } void
   */
  validatePublicKey(): void {
    if (
      !this.checkKeyPattern(this.publicKey) ||
      this.publicKey.length !== 50 ||
      this.publicKey.indexOf('AA') === -1 ||
      !this.boxID ||
      typeof this.boxID !== 'number' ||
      this.publicKey.indexOf('77') === -1 ||
      this.publicKey.indexOf('PUB') === -1
    ) {
      throw new Error(
        `Invalid Cryptocoin Payment Box PUBLIC KEY - ${
          this.publicKey ? this.publicKey : 'cannot be empty'
        }`
      );
    }
  }

  /**
   * Checks the validity of the private key. Throws an error if the
   * private key is empty or invalid
   * @returns { void } void
   */
  validatePrivateKey(): void {
    if (
      !this.checkKeyPattern(this.privateKey) ||
      this.privateKey.length !== 50 ||
      this.privateKey.indexOf('AA') === -1 ||
      String(this.boxID) !== this.left(this.privateKey, 'AA') ||
      this.privateKey.indexOf('PRV') === -1 ||
      this.left(this.privateKey, 'PRV') != this.left(this.publicKey, 'PUB')
    ) {
      throw new Error(
        `Invalid Cryptocoin Payment Box PRIVATE KEY - ${
          this.privateKey ? '' : 'cannot be empty'
        }`
      );
    }
  }

  /**
   * Validate the `webdevKey` property
   */
  validateWebDevKey() {
    if (
      this.webdevKey &&
      (!this.checkKeyPattern(this.webdevKey) ||
        this.webdevKey.indexOf('DEV') !== 0 ||
        this.webdevKey != this.webdevKey.toUpperCase() ||
        String(this.icrc32(this.left(this.webdevKey, 'G', false))) !==
          this.right(this.webdevKey, 'G', false))
    ) {
      this.webdevKey = '';
    }
  }

  /**
   * Composes the URL for the request to the gourl.io API
   */
  composeURL() {
    const data: RequestURLKeys = {
      b: this.boxID,
      c: this.coinName,
      p: this.publicKey,
      a: this.amount,
      au: this.amountUSD,
      pe: this.period.replace(' ', '_'),
      l: this.language,
      o: this.orderID,
      u: this.userID,
      us: this.userFormat,
      j: 1, // indicating that we are sending/requesting JSON data
      d: this.convertToBase64(this.ipAddress),
      f: this.convertToBase64(this.userAgent),
      t: this.convertToBase64(this.version),
      h: this.createCryptoboxHash(),
    };

    if (this.webdevKey) {
      data.w = this.webdevKey;
    }

    data.z = Math.floor(Math.random() * (10000000 + 1));

    return Object.keys(data).reduce((prev, current) => {
      const { value } = Object.getOwnPropertyDescriptor(data, current)!;
      return prev + `/${current}/${value}`;
    }, this.baseURL);
  }

  /**
   * Creates a payment.
   * @returns { Promise<Response> } - A Promise that resolves to the response from the payment gateway
   */
  async createPayment(): Promise<AxiosResponse> {
    // return new Promise((resolve, reject) => {
    //   https.get(this.composeURL(), (response) => {
    //     let body = '';
    //     response.on('data', (data) => (body += data));
    //     response.on('error', (error) => reject(error));
    //     response.on('end', () => resolve(JSON.parse(body)));
    //   });
    // });
    const res = await axios.get(this.composeURL());
    return res.data;
  }

  left(str = '', findme = '', firstpos = true): string {
    const strCopy = str.toLowerCase();
    const findmeCopy = findme.toLowerCase();

    const pos = firstpos
      ? strCopy.indexOf(findmeCopy)
      : strCopy.lastIndexOf(findmeCopy);
    if (pos === -1) return str;
    return str.substr(0, pos);
  }

  right(str = '', findme = '', firstpos = true): string {
    const strCopy = str.toLowerCase();
    const findmeCopy = findme.toLowerCase();

    const pos = firstpos
      ? strCopy.indexOf(findmeCopy)
      : strCopy.lastIndexOf(findmeCopy);
    if (pos === -1) return str;
    else return str.substr(pos + findme.length);
  }

  /**
   * Checks mutation using the `crc32` checksum
   * @param { string } str - The string to be tested
   * @returns { number }
   */

  icrc32(str: string): number {
    const input = crc32.str(str);
    const intMax = Math.pow(2, 31) - 1;
    let output;
    if (input > intMax) output = input - intMax * 2 - 2;
    else output = input;
    output = Math.abs(output);
    return output;
  }

  /**
   * Encodes a simple string value to base64
   * @param { string } value - Value to convert to base64
   * @returns { string } The base64 value
   */
  convertToBase64(value: string = ''): string {
    return Buffer.from(value).toString('base64');
  }

  // UTILIIES

  /**
   *
   * It generates security md5 hash for all values used in payment boxes.
   * This protects payment box parameters from changes by end user in web browser.
   * $json = true - generate md5 hash for json payment data output
   * or generate hash for iframe html box with sizes $width x $height
   */
  createCryptoboxHash() {
    const hashStr = `${this.boxID}|${this.coinName}|${this.publicKey}|${this.privateKey}|${this.webdevKey}|${this.amount}|${this.amountUSD}|${this.period}|${this.language}|${this.orderID}|${this.userID}|${this.userFormat}|${this.version}|${this.ipAddress}`;
    return md5(hashStr);
  }
}

export default Cryptobox;
