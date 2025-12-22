const fs = require('fs');
const path = require('path');

const certPath = '/tmp/efi-cert.p12';

function ensureCert() {
  if (fs.existsSync(certPath)) {
    return;
  }

  const base64 = process.env.EFI_CERT_BASE64;

  if (!base64) {
    throw new Error('EFI_CERT_BASE64 não definida');
  }

  const buffer = Buffer.from(base64, 'base64');

  fs.writeFileSync(certPath, buffer);

  console.log('📄 Certificado Efí recriado em /tmp');
}

module.exports = ensureCert;
