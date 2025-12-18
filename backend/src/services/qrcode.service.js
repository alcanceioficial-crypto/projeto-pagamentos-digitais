const QRCode = require('qrcode');

async function gerarQrCodeBase64(pixCopiaECola) {
  const qrCodeBase64 = await QRCode.toDataURL(pixCopiaECola, {
    type: 'image/png',
    width: 400,
    margin: 2
  });

  return qrCodeBase64;
}

module.exports = {
  gerarQrCodeBase64
};
