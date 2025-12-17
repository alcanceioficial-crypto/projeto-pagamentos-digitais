const axios = require('axios');
const https = require('https');
const fs = require('fs');

console.log('📁 Inicializando efiPix.service.js');

const CERT_PATH = '/etc/secrets/efi-cert.p12';

if (!fs.existsSync(CERT_PATH)) {
  console.error('❌ Certificado NÃO encontrado em', CERT_PATH);
} else {
  console.log('📄 Certificado encontrado em', CERT_PATH);
}

/**
 * ⚠️ AGENT DE TESTE
 * Use APENAS para diagnóstico
 * REMOVER depois
 */
const agent = new https.Agent({
  rejectUnauthorized: false
});

// =============================
// CONFIGURAÇÕES EFÍ
// =============================
const BASE_URL =
  process.env.EFI_ENV === 'production'
    ? 'https://api.efipay.com.br'
    : 'https://api-homologacao.efipay.com.br';

async function getAccessToken() {
  const response = await axios.post(
    `${BASE_URL}/oauth/token`,
    'grant_type=client_credentials',
    {
      httpsAgent: agent,
      auth: {
        username: process.env.EFI_CLIENT_ID,
        password: process.env.EFI_CLIENT_SECRET
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  );

  return response.data.access_token;
}

async function createPixCharge(amount, description) {
  const token = await getAccessToken();

  const response = await axios.post(
    `${BASE_URL}/v2/cob`,
    {
      calendario: { expiracao: 3600 },
      valor: { original: amount.toFixed(2) },
      chave: process.env.EFI_PIX_KEY,
      solicitacaoPagador: description
    },
    {
      httpsAgent: agent,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data;
}

module.exports = {
  createPixCharge
};
