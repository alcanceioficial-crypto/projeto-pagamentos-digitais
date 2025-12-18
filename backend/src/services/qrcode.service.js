const QRCode = require('qrcode');

async function gerarQrCodeBase64(texto) {
  if (!texto) {
    throw new Error('Texto para gerar QR Code não informado');
  }

  const base64 = await QRCode.toDataURL(texto);

  return base64;
}

module.exports = {
  gerarQrCodeBase64
};
