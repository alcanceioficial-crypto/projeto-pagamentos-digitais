const fs = require('fs');
const path = require('path');

module.exports = function ensureCert() {
  if (!process.env.EFI_CERT_BASE64) {
    throw new Error('EFI_CERT_BASE64 não definido');
  }

  const certPath = '/tmp/efi-cert.p12';

  // Se já existir, não recria
  if (!fs.existsSync(certPath)) {
    const certBuffer = Buffer.from(
      process.env.EFI_CERT_BASE64,
      'base64'
    );

    fs.writeFileSync(certPath, certBuffer);
    console.log('📄 Certificado Efí recriado em /tmp');
  }

  // Força o app inteiro a usar esse caminho
  process.env.EFI_CERT_PATH = certPath;
};
