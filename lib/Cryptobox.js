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

// IMPORT SOME DEFAULT OPTIONS
const crc32 = require('crc-32');
const defaults = require('./_defaults');

// IMPORT CONSTANTS
const {
  ALLOWED_LANGUAGES,
  MINIMUM_REQUIRED_PROPERTIES,
} = require('./constants');

class Cryptobox {
  /**
   * Creates an new Cryptobox object for interfacing with a `gourl` cryptobox
   * (payment box or capcha box)
   */
  constructor(options = defaults) {
    this.baseURL = 'https://coins.gourl.io';
    this.userFormat = 'MANUAL';

    this.checkAndInitMinRequirements(options);
    this.validatePublicKey();
    this.validatePrivateKey();
    this.validateWebDevKey();
    this.setBoxID();
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
  checkAndInitMinRequirements(options) {
    let value = '';
    for (let key in options) {
      value = options[key];
      MINIMUM_REQUIRED_PROPERTIES[key]
        ? (this[key] = typeof value === 'string' ? value.trim() : value)
        : null;
    }
  }

  /**
   * Checks if a key matches the `/[^A-Za-z0-9]/` Regex pattern.
   * @param { string } key - A string to be tested for a match
   * @returns { Boolean } true if a match is found. Otherwise, false
   */
  checkKeyPattern(key) {
    const patternMatch = key.replace(/[^A-Za-z0-9]/, '');
    return patternMatch === key;
  }

  /**
   * Sets the value of the boxID based on the crypto box public key
   */
  setBoxID() {
    this.boxID = this.left(this.publicKey, 'AA');
  }

  /**
   * Sets the coin label and coin name
   * @return { void } void
   */
  setCoinInfo() {
    const c = substr(this.right(this.left(this.publicKey, 'PUB'), 'AA'), 5);
    this.coinLabel = this.right(c, '77');
    this.coinName = this.left(c, '77');
  }

  /**
   * Sets the `amount` and `amountUSD` properties of the class
   */
  setAmount() {
    if (this.amount && this.amount.indexOf('.')) {
      this.amount = this.amount.trim();
    }

    if (this.amountUSD && this.amountUSD.indexOf('.')) {
      this.amountUSD = this.amountUSD.trim();
    }

    if (!this.amount || this.amount <= 0) this.amount = 0;
    if (!this.amountUSD || this.amountUSD <= 0) this.amountUSD = 0;
  }

  /**
   * Set cryptobox expiry period. This sets the value of the `period` property
   * which determines the period after which the cryptobox will be obselete and a new cryptobox must then be created.
   */
  setExpiry() {
    this.period = this.period.replace(' ', '').toUpperCase().trim();
    if (this.period.substring(-1) === 'S') {
      this.period = his.period.substring(0, -1);
    }

    const arr = [];
    for (let i = 1; i <= 90; i++) {
      arr.push(`${i}MINUTE`);
      arr.push(`${i}HOUR`);
      arr.push(`${i}DAY`);
      arr.push(`${i}WEEK`);
      arr.push(`${i}MONTH`);
    }

    if (this.period != 'NOEXPIRY' && !arr.includes(this.period)) {
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
   * 'en',
   * 'es',
   * 'fr',
   * 'de',
   * 'nl',
   * 'it',
   * 'ru',
   * 'pl',
   * 'pt',
   * 'fa',
   * 'ko',
   * 'ja',
   * 'id',
   * 'tr',
   * 'ar',
   * 'cn',
   * 'zh',
   * 'hi',
   *
   */
  setLanguage(lang = 'en') {
    if (!ALLOWED_LANGUAGES.includes(lang)) {
      const errMsg = `Invalid lanuage value '"${lang}" in CRYPTOBOX_LANGUAGE; function cryptobox_language()`;
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
  setUserID(userID = '') {
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
  setOrderID(orderID = '') {
    orderID = `${orderID}`;
    this.validateOrderID(orderID);
    this.orderID = orderID;
  }

  /**
   * Validates the user ID.
   * @param { string } userID - The ID of the user making the payment.
   * @returns { void } void
   */
  validateUserID(userID) {
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
  validateOrderID(orderID) {
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
  validateAmount() {
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
  validatePublicKey() {
    if (
      !this.checkKeyPattern(this.publicKey) ||
      this.publicKey.length != 50 ||
      this.publicKey.indexOf('AA') === -1 ||
      !this.boxID ||
      typeof this.boxID !== 'number' ||
      this.publicKey.indexOf('77') === -1 ||
      this.publicKey.indexOf('PUB')
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
  validatePrivateKey() {
    // if (preg_replace('/[^A-Za-z0-9]/', '', this.privateKey) != this.privateKey || strlen(this.privateKey) != 50 || !strpos(this.privateKey, "AA") || this.boxID != this.left(this.privateKey, "AA") || !strpos(this.privateKey, "PRV") || this.left(this.privateKey, "PRV") != this.left(this.publicKey, "PUB")) die("Invalid Cryptocoin Payment Box PRIVATE KEY".(this.privateKey?"":" - cannot be empty"));
    if (
      !this.checkKeyPattern(this.privateKey) ||
      this.privateKey.length != 50 ||
      this.privateKey.indexOf('AA') === -1 ||
      this.boxID != this.left(this.privateKey, 'AA') ||
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
        this.icrc32(this.left(this.webdevKey, 'G', false)) !=
          this.right(this.webdevKey, 'G', false))
    ) {
      this.webdevKey = '';
    }
  }

  left(str = '', findme = '', firstpos = true) {
    const strCopy = str.toLowerCase();
    const findmeCopy = findme.toLowerCase();

    const pos = firstpos
      ? strCopy.indexOf(findmeCopy)
      : strCopy.lastIndexOf(findmeCopy);
    console.log(pos);
    if (pos === -1) return str;
    return str.substr(0, pos);
  }

  right(str = '', findme = '', firstpos = true) {
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
  icrc32(str) {
    const input = crc32.str(str);
    const intMax = Math.pow(2, 31) - 1;
    let output;
    if (input > intMax) output = input - intMax * 2 - 2;
    else output = input;
    output = Math.abs(output);
    return output;
  }
}

module.exports = Cryptobox;
