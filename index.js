const Cryptobox = require('./lib/Cryptobox');

const cryptobox = new Cryptobox();

const result = cryptobox.icrc32(
  'Time is the only thing that is never going to chnage its nature, after God'
);
console.log(result);
