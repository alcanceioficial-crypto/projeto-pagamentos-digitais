const fs = require('fs');
const https = require('https');
const axios = require('axios');

/**
 * ===============================
 * CONFIGURAÇÃO DE AMBIENTE
 * ===============================
 */
const EFI_ENV = process.env.EFI_ENV || 'homolog';

const BASE_URL =
  EFI_ENV === 'production'
    ? 'https://pix.api.efipay.com.br'
    : 'https://pix-h.api.efipay.com.br';

console.log('🌍 Ambiente:', EFI_ENV);
console.log('🌐 Base URL:', BASE_URL);
console.log('📄 Certificado: /etc/secrets/efi-cert.p12');

/**
 * ===============================
 * CERTIFICADO (.p12 em Base64)
 * ===============================
 */
if (!fs.existsSync('/etc/secrets/efi-cert.p12')) {
  throw new Error('❌ Certificado PIX não encontrado em /etc/secrets/efi-cert.p12');
}

const certBase64 = fs.readFileSync('/etc/secrets/efi-cert.p12', 'utf8');

const httpsAgent = new https.Agent({
  pfx: Buffer.from(certBase64, 'base64'),
  rejectUnauthorized: true
});

/**
 * ===============================
 * OBTÉM ACCESS TOKEN EFÍ
 * ===============================
 */
async function getAccessToken() {
  const auth = Buffer.from(
    `${process.env.EFI_CLIENT_ID}:${process.env.EFI_CLIENT_SECRET}`
  ).toString('base64');

  const response = await axios.post(
    `${BASE_URL}/oauth/token`,
    { grant_type: 'client_credentials' },
    {
      httpsAgent,
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data.access_token;
}

/**
 * ===============================
 * CRIAR COBRANÇA PIX
 * ===============================
 */
async function createPixCharge({ amount, description }) {
  if (!amount || !description) {
    throw new Error('amount e description são obrigatórios');
  }

  const accessToken = await getAccessToken();

  const body = {
    calendario: {
      expiracao: 3600
    },
    valor: {
      original: amount.toFixed(2)
    },
    chave: process.env.EFI_PIX_KEY,
    solicitacaoPagador: description
  };

  const response = await axios.post(
    `${BASE_URL}/v2/cob`,
    body,
    {
      httpsAgent,
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
