const EfiPay = require('efi-api-sdk-node');
const path = require('path');

const certPath = path.resolve(__dirname, '../../certs/efi-cert.p12');

const options = {
  sandbox: process.env.EFI_SANDBOX === 'true',
  client_id: process.env.EFI_CLIENT_ID,
  client_secret: process.env.EFI_CLIENT_SECRET,
  certificate: certPath
};

const efi = new EfiPay(options);

module.exports = efi;
