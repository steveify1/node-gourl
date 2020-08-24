"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
// // import https  from 'https';
// import querystring from 'querystring';
const buffer_1 = require("buffer");
const crc_32_1 = __importDefault(require("crc-32"));
const md5_1 = __importDefault(require("md5"));
const axios_1 = __importDefault(require("axios"));
// IMPORT SOME DEFAULT OPTIONS
const _defaults_1 = __importDefault(require("./_defaults"));
// IMPORT CONSTANTS
const constants_1 = require("./constants");
const formatExpiryPeriod_1 = __importDefault(require("./utils/formatExpiryPeriod"));
class Cryptobox {
    /**
     * Creates an new Cryptobox object for interfacing with a `gourl` cryptobox
     * (payment box or capcha box)
     */
    constructor(options = _defaults_1.default) {
        this.baseURL = 'https://coins.gourl.io';
        this.publicKey = ''; // value from your gourl.io member page - https://gourl.io/info/memberarea
        this.privateKey = ''; // value from your gourl.io member page.  Also you setup cryptocoin name on gourl.io member page
        this.webdevKey = ''; // optional, web developer affiliate key
        this.ipAddress = ''; // The IP address of the current user or the server
        this.amount = 0; // amount of cryptocoins which will be used in the payment box/captcha, precision is 4 (number of digits after the decimal), example: 0.0001, 2.444, 100, 2455, etc.
        /* we will use this $amount value of cryptocoins in the payment box with a small fraction after the decimal point to uniquely identify each of your users individually
         * (for example, if you enter 0.5 BTC, one of your user will see 0.500011 BTC, and another will see  0.500046 BTC, etc) */
        this.amountUSD = 0;
        /* you can specify your price in USD and cryptobox will automatically convert that USD amount to cryptocoin amount using today live cryptocurrency exchange rates.
         * Using that functionality (price in USD), you don't need to worry if cryptocurrency prices go down or up.
         * User will pay you all times the actual price which is linked on current exchange price in USD on the datetime of purchase.
         * You can use in cryptobox options one variable only: amount or amountUSD. You cannot place values of those two variables together. */
        this.period = ''; // period after which the payment becomes obsolete and new cryptobox will be shown; allow values: NOEXPIRY, 1 MINUTE..90 MINUTE, 1 HOUR..90 HOURS, 1 DAY..90 DAYS, 1 WEEK..90 WEEKS, 1 MONTH..90 MONTHS
        this.language = 'en'; // cryptobox localisation; en - English, es - Spanish, fr - French, de - German, nl - Dutch, it - Italian, ru - Russian, pl - Polish, pt - Portuguese, fa - Persian, ko - Korean, ja - Japanese, id - Indonesian, tr - Turkish, ar - Arabic, cn - Simplified Chinese, zh - Traditional Chinese, hi - Hindi
        this.iframeID = ''; // optional, html iframe element id; allow symbols: a..Z0..9_-
        this.orderID = ''; // your page name / product name or order name (not unique); allow symbols: a..Z0..9_-@.; max size: 50 symbols
        this.userID = ''; // optional, manual setup unique identifier for each of your users; allow symbols: a..Z0..9_-@.; max size: 50 symbols
        /* IMPORTANT - If you use Payment Box/Captcha for registered users on your website, you need to set userID manually with
         * an unique value for each of your registered user. It is better than to use cookies by default. Examples: 'user1', 'user2', '3vIh9MjEis' */
        this.userFormat = 'MANUAL'; // this variable use only if $userID above is empty - it will save random userID in cookies, sessions or use user IP address as userID. Available values: COOKIE, SESSION, IPADDRESS
        /* PLEASE NOTE -
         * If you use multiple stores/sites online, please create separate GoUrl Payment Box (with unique payment box public/private keys) for each of your stores/websites.
         * Do not use the same GoUrl Payment Box with the same public/private keys on your different websites/stores.
         * if you use the same $public_key, $orderID and $userID in your multiple cryptocoin payment boxes on different website pages and a user has made payment; a successful result for that user will be returned on all those pages (if $period time valid).
         * if you change - $public_key or $orderID or $userID - new cryptocoin payment box will be shown for exisiting paid user. (function $this->is_paid() starts to return 'false').
         * */
        // Internal Variables
        this.boxID = 0; // cryptobox id, the same as on gourl.io member page. For each your cryptocoin payment boxes you will have unique public / private keys
        this.coinLabel = ''; // current cryptocoin label (BTC, DOGE, etc.)
        this.coinName = ''; // current cryptocoin name (Bitcoin, Dogecoin, etc.)
        this.paid = false; // paid or not
        this.confirmed = false; // transaction/payment have 6+ confirmations or not
        this.paymentID = false; // current record id in the table crypto_payments (table stores all payments from your users)
        this.paymentDate = ''; // transaction/payment datetime in GMT format
        this.amountPaid = 0; // exact paid amount; for example, $amount = 0.5 BTC and user paid - $amountPaid = 0.50002 BTC
        this.amountPaidUSD = 0; // approximate paid amount in USD; using cryptocurrency exchange rate on datetime of payment
        this.boxType = ''; // cryptobox type - 'paymentbox' or 'captchabox'
        this.processed = false; // optional - set flag to paid & processed
        this.cookieName = ''; // user cookie/session name (if cookies/sessions use)
        this.localisation = ''; // localisation; en - English, es - Spanish, fr - French, de - German, nl - Dutch, it - Italian, ru - Russian, pl - Polish, pt - Portuguese, fa - Persian, ko - Korean, ja - Japanese, id - Indonesian, tr - Turkish, ar - Arabic, cn - Simplified Chinese, zh - Traditional Chinese, hi - Hindi
        this.version = `version | gourlphp ${constants_1.CRYPTOBOX_VERSION}`;
        this.userAgent = '';
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
    checkAndInitMinRequirements(options) {
        Object.keys(options).forEach((option, index) => {
            if (!constants_1.MINIMUM_REQUIRED_PROPERTIES.includes(option))
                return;
            const { value } = Object.getOwnPropertyDescriptor(options, option);
            Object.defineProperty(this, option, { value });
        });
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
        this.boxID = Number(this.left(this.publicKey, 'AA'));
    }
    /**
     * Sets the coin label and coin name
     * @return { void } void
     */
    setCoinInfo() {
        const c = this.right(this.left(this.publicKey, 'PUB'), 'AA').substring(5);
        this.coinLabel = this.right(c, '77');
        this.coinName = this.left(c, '77');
    }
    /**
     * Sets the `amount` and `amountUSD` properties of the class
     */
    setAmount() {
        const amount = this.amount.toString();
        const amountUSD = this.amountUSD.toString();
        if (amount && amount.indexOf('.')) {
            this.amount = Number(amount.trim());
        }
        if (amountUSD && amountUSD.indexOf('.')) {
            this.amountUSD = Number(amountUSD.trim());
        }
        if (!this.amount || this.amount <= 0)
            this.amount = 0;
        if (!this.amountUSD || this.amountUSD <= 0)
            this.amountUSD = 0;
    }
    /**
     * Set cryptobox expiry period. This sets the value of the `period` property
     * which determines the period after which the cryptobox will be obselete and a new cryptobox must then be created.
     */
    setExpiry() {
        this.period = formatExpiryPeriod_1.default(this.period);
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
    setLanguage(lang = 'en') {
        if (!constants_1.ALLOWED_LANGUAGES.includes(lang)) {
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
     * Sets the user's IP address
     * @param { string } ip - The user's IP address
     */
    setIPAddress(ip) {
        this.ipAddress = ip;
    }
    /**
     * Sets the client's user agent
     * @param { string } agent - The client's agent
     * returns
     */
    ua(agent) {
        this.userAgent = agent;
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
            throw new Error(`Invalid User ID - ${userID} Allowed symbols: a..Z0..9_-@.`);
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
            throw new Error(`Invalid Order ID - ${orderID} Allowed symbols: a..Z0..9_-@.`);
        }
        if (orderID.length > 50) {
            throw new Error(`Invalid Order ID - ${orderID} Max: 50 characters`);
        }
    }
    /**
     * Validate amount and amountUSD
     */
    validateAmount() {
        if ((this.amount <= 0 && this.amountUSD <= 0) ||
            (this.amount > 0 && this.amountUSD > 0))
            throw new Error(`You can use in cryptobox options one of variable only: amount or amountUSD. You cannot place values in that two variables together (submitted amount = '".this.amount."' and amountUSD = '".this.amountUSD."' )`);
        if (this.amount &&
            (typeof this.amount !== 'number' ||
                this.amount < 0.0001 ||
                this.amount > 500000000))
            throw new Error(`Invalid Amount - "${this.amount}" ${this.coinLabel}. Allowed range: 0.0001 .. 500,000,000`);
        if (this.amountUSD &&
            (typeof this.amountUSD !== 'number' ||
                this.amountUSD < 0.01 ||
                this.amountUSD > 1000000))
            throw new Error(`Invalid amountUSD - ${this.amountUSD}." USD. Allowed range: 0.01 .. 1,000,000`);
    }
    /**
     * Checks the validity of the public key. Throws an error if the
     * public key is empty or invalid
     * @returns { void } void
     */
    validatePublicKey() {
        if (!this.checkKeyPattern(this.publicKey) ||
            this.publicKey.length !== 50 ||
            this.publicKey.indexOf('AA') === -1 ||
            !this.boxID ||
            typeof this.boxID !== 'number' ||
            this.publicKey.indexOf('77') === -1 ||
            this.publicKey.indexOf('PUB') === -1) {
            throw new Error(`Invalid Cryptocoin Payment Box PUBLIC KEY - ${this.publicKey ? this.publicKey : 'cannot be empty'}`);
        }
    }
    /**
     * Checks the validity of the private key. Throws an error if the
     * private key is empty or invalid
     * @returns { void } void
     */
    validatePrivateKey() {
        if (!this.checkKeyPattern(this.privateKey) ||
            this.privateKey.length !== 50 ||
            this.privateKey.indexOf('AA') === -1 ||
            String(this.boxID) !== this.left(this.privateKey, 'AA') ||
            this.privateKey.indexOf('PRV') === -1 ||
            this.left(this.privateKey, 'PRV') != this.left(this.publicKey, 'PUB')) {
            throw new Error(`Invalid Cryptocoin Payment Box PRIVATE KEY - ${this.privateKey ? '' : 'cannot be empty'}`);
        }
    }
    /**
     * Validate the `webdevKey` property
     */
    validateWebDevKey() {
        if (this.webdevKey &&
            (!this.checkKeyPattern(this.webdevKey) ||
                this.webdevKey.indexOf('DEV') !== 0 ||
                this.webdevKey != this.webdevKey.toUpperCase() ||
                String(this.icrc32(this.left(this.webdevKey, 'G', false))) !==
                    this.right(this.webdevKey, 'G', false))) {
            this.webdevKey = '';
        }
    }
    /**
     * Composes the URL for the request to the gourl.io API
     */
    composeURL() {
        const data = {
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
            j: 1,
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
            const { value } = Object.getOwnPropertyDescriptor(data, current);
            return prev + `/${current}/${value}`;
        }, this.baseURL);
    }
    /**
     * Creates a payment.
     * @returns { Promise<Response> } - A Promise that resolves to the response from the payment gateway
     */
    async createPayment() {
        const res = await axios_1.default.get(this.composeURL());
        return res.data;
    }
    /**
     * Checks the payment status by sending a request to the GoURL server
     * options
     */
    static async checkPaymentStatus(options) {
        const privateKeyHash = crypto_1.default
            .createHash('sha512')
            .update(options.privateKey)
            .digest('hex');
        const period = formatExpiryPeriod_1.default(options.period);
        const toHash = `${options.boxID}${privateKeyHash}${options.userID}${options.orderID}${options.language}${period}${options.ipAddress}`;
        const hash = md5_1.default(toHash);
        const data = {
            g: privateKeyHash,
            b: options.boxID,
            o: options.orderID,
            u: options.userID,
            l: options.language,
            e: period,
            i: options.ipAddress,
            h: hash,
        };
        const url = `https://coins.gourl.io/result.php`;
        const res = await axios_1.default.post(url, null, {
            params: data,
            headers: {
                'User-Agent': options.userAgent,
            },
            timeout: 20000,
        });
        return res.data;
    }
    left(str = '', findme = '', firstpos = true) {
        const strCopy = str.toLowerCase();
        const findmeCopy = findme.toLowerCase();
        const pos = firstpos
            ? strCopy.indexOf(findmeCopy)
            : strCopy.lastIndexOf(findmeCopy);
        if (pos === -1)
            return str;
        return str.substr(0, pos);
    }
    right(str = '', findme = '', firstpos = true) {
        const strCopy = str.toLowerCase();
        const findmeCopy = findme.toLowerCase();
        const pos = firstpos
            ? strCopy.indexOf(findmeCopy)
            : strCopy.lastIndexOf(findmeCopy);
        if (pos === -1)
            return str;
        else
            return str.substr(pos + findme.length);
    }
    /**
     * Checks mutation using the `crc32` checksum
     * @param { string } str - The string to be tested
     * @returns { number }
     */
    icrc32(str) {
        const input = crc_32_1.default.str(str);
        const intMax = Math.pow(2, 31) - 1;
        let output;
        if (input > intMax)
            output = input - intMax * 2 - 2;
        else
            output = input;
        output = Math.abs(output);
        return output;
    }
    /**
     * Encodes a simple string value to base64
     * @param { string } value - Value to convert to base64
     * @returns { string } The base64 value
     */
    convertToBase64(value = '') {
        return buffer_1.Buffer.from(value).toString('base64');
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
        return md5_1.default(hashStr);
    }
}
exports.default = Cryptobox;
