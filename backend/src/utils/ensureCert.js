const fs = require('fs');
const path = require('path');

function ensureCert() {
  const certPath = process.env.EFI_CERT_PATH;
  const base64 = process.env.EFI_CERT_BASE64;

  if (!certPath || !base64) {
    throw new Error('Variáveis EFI_CERT_PATH ou EFI_CERT_BASE64 ausentes');
  }

  const dir = path.dirname(certPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(certPath)) {
    const buffer = Buffer.from(base64, 'base64');
    fs.writeFileSync(certPath, buffer);
    console.log('✅ Certificado Efí recriado com sucesso');
  }
}

module.exports = ensureCert;
