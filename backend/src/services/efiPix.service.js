const axios = require('axios');
const https = require('https');
const fs = require('fs');

console.log('📁 Inicializando efiPix.service.js');

const CERT_PATH = '/etc/secrets/efi-cert.p12';

if (!fs.existsSync(CERT_PATH)) {
  console.error(`❌ Certificado NÃO encontrado em ${CERT_PATH}`);
  process.exit(1);
}

console.log(`📄 Certificado encontrado em ${CERT_PATH}`);

const httpsAgent = new https.Agent({
  pfx: fs.readFileSync(CERT_PATH),
  rejectUnauthorized: true
});

const BASE_URL =
  process.env.EFI_ENV === 'production'
    ? 'https://api.efipay.com.br'
    : 'https://api-homologacao.efipay.com.br';

async function getAccessToken() {
  console.log('🔐 Solicitando access token EFÍ...');

  const auth = Buffer.from(
    `${process.env.EFI_CLIENT_ID}:${process.env.EFI_CLIENT_SECRET}`
  ).toString('base64');

  const response = await axios.post(
    `${BASE_URL}/oauth/token`,
    'grant_type=client_credentials',
    {
      httpsAgent, // 🔥 AQUI É O ÚNICO LUGAR CORRETO
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  );

  return response.data.access_token;
}

async function createPixCharge({ amount, description }) {
  console.log('💰 Criando cobrança PIX...');

  const accessToken = await getAccessToken();

  const response = await axios.post(
    `${BASE_URL}/v2/cob`,
    {
      calendario: { expiracao: 3600 },
      valor: { original: amount.toFixed(2) },
      chave: process.env.EFI_PIX_KEY,
      solicitacaoPagador: description
    },
    {
      httpsAgent, // 🔥 AQUI TAMBÉM
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data;
}

module.exports = {
  createPixCharge
};
