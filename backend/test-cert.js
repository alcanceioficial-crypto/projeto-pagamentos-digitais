const fs = require('fs');
const https = require('https');

console.log('🔎 TESTE DE CERTIFICADO EFÍ');

const certPath = '/etc/secrets/efi-cert.p12';

if (!fs.existsSync(certPath)) {
  console.error('❌ Arquivo NÃO encontrado:', certPath);
  process.exit(1);
}

console.log('✅ Arquivo encontrado:', certPath);

try {
  const agent = new https.Agent({
    pfx: fs.readFileSync(certPath),
    passphrase: process.env.EFI_CERT_PASSPHRASE || '',
  });

  console.log('✅ Certificado carregado pelo Node com sucesso');
} catch (err) {
  console.error('❌ ERRO ao carregar certificado:', err.message);
}
