"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const defaults = {
    // Custom Variables
    publicKey: '',
    privateKey: '',
    webdevKey: '',
    amount: 0,
    /* we will use this $amount value of cryptocoins in the payment box with a small fraction after the decimal point to uniquely identify each of your users individually
     * (for example, if you enter 0.5 BTC, one of your user will see 0.500011 BTC, and another will see  0.500046 BTC, etc) */
    amountUSD: 0,
    /* you can specify your price in USD and cryptobox will automatically convert that USD amount to cryptocoin amount using today live cryptocurrency exchange rates.
     * Using that functionality (price in USD), you don't need to worry if cryptocurrency prices go down or up.
     * User will pay you all times the actual price which is linked on current exchange price in USD on the datetime of purchase.
     * You can use in cryptobox options one variable only: amount or amountUSD. You cannot place values of those two variables together. */
    period: '',
    language: 'en',
    iframeID: '',
    orderID: '',
    userID: '',
    /* IMPORTANT - If you use Payment Box/Captcha for registered users on your website, you need to set userID manually with
     * an unique value for each of your registered user. It is better than to use cookies by default. Examples: 'user1', 'user2', '3vIh9MjEis' */
    userFormat: 'COOKIE',
    /* PLEASE NOTE -
     * If you use multiple stores/sites online, please create separate GoUrl Payment Box (with unique payment box public/private keys) for each of your stores/websites.
     * Do not use the same GoUrl Payment Box with the same public/private keys on your different websites/stores.
     * if you use the same $public_key, $orderID and $userID in your multiple cryptocoin payment boxes on different website pages and a user has made payment; a successful result for that user will be returned on all those pages (if $period time valid).
     * if you change - $public_key or $orderID or $userID - new cryptocoin payment box will be shown for exisiting paid user. (function $this->is_paid() starts to return 'false').
     * */
    // Internal Variables
    boxID: 0,
    coinLabel: '',
    coinName: '',
    paid: false,
    confirmed: false,
    paymentID: false,
    paymentDate: '',
    amountPaid: 0,
    amountPaidUSD: 0,
    boxType: '',
    processed: false,
    cookieName: '',
    localisation: '',
    ver: '',
};
exports.default = defaults;
