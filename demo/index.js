require('dotenv').config();

const options = {
  publicKey: process.env.GOURL_PUBLIC_KEY,
  privateKey: process.env.GOURL_PRIVATE_KEY,
  period: '8Month',
  amount: 4.0,
  orderID: 12,
  userID: 4545,
};

const Cryptobox = require('../index');

const cryptobox = new Cryptobox(options);

console.log(cryptobox.composeURL());

cryptobox.createPayment().then((res) => console.log(res));
