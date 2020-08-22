require('dotenv').config();
const Cryptobox = require('../index');

const options = {
  publicKey: process.env.GOURL_PUBLIC_KEY,
  privateKey: process.env.GOURL_PRIVATE_KEY,
  period: '8Month',
  amount: 4.0,
  orderID: 12,
  userID: 4545,
};

Cryptobox.instatiate = (options) => {
  return new Cryptobox({ ...options });
};

const UseCryptobox = (cb) => {
  return async (req, res, next) => {
    const defaults = {
      userAgent: headers['user-agent'],
      acceptLanguage: headers['accept-language'],
      language: acceptLanguage ? acceptLanguage.split('-')[0] : 'en',
      ipAddress: '127.0.0.1',
    };

    Cryptobox.instatiate = (options) => {
      return new Cryptobox({ ...defaults, ...options });
    };

    await cb(req, res, next, Cryptobox);
  };
};

const useCryptobox = UseCryptobox((req, res, next, Cryptobox) => {
  const options = {
    publicKey: process.env.GOURL_PUBLIC_KEY,
    privateKey: process.env.GOURL_PRIVATE_KEY,
    period: '1Minute',
    amount: 4.0,
    orderID: 12,
    userID: req.user.id,
  };

  const cryptobox = Cryptobox.instatiate(options);
  const result = cryptobox.createPayment();

  res.status(201).json({
    status: 'success',
    data: result,
  });
});
