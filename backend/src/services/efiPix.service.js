const axios = require('axios');
const https = require('https');
const fs = require('fs');
const path = require('path');

/**
 * ============================
 * CONFIGURAÇÃO DE AMBIENTE
 * ============================
 */
const ENV = process.env.EFI_ENV || 'homolog';

const BASE_URL =
  ENV === 'production'
    ? 'https://pix.api.efipay.com.br'
    : 'https://pix-h.api.efipay.com.br';

const CLIENT_ID = process.env.EFI_CLIENT_ID;
const CLIENT_SECRET = process.env.EFI_CLIENT_SECRET;

const CERT_PATH = '/etc/secrets/efi-cert.p12';

console.log('🌍 Ambiente:', ENV);
console.log('🌐 Base URL:', BASE_URL);
console.log('📄 Certificado:', CERT_PATH);

/**
 * ============================
 * CERTIFICADO
 * ============================
 * ⚠️ A EFÍ NÃO exige passphrase
 * se o certificado não tiver senha.
 */
if (!fs.existsSync(CERT_PATH)) {
  throw new Error(`❌ Certificado NÃO encontrado em ${CERT_PATH}`);
}

const httpsAgent = new https.Agent({
  pfx: fs.readFileSync(CERT_PATH),
  rejectUnauthorized: true
});

/**
 * ============================
 * TOKEN OAUTH
 * ============================
 */
async function getAccessToken() {
  const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

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
 * ============================
 * CRIAR COBRANÇA PIX
 * ============================
 */
async function createPixCharge({ amount, description }) {
  try {
    const token = await getAccessToken();

    const body = {
      calendario: {
        expiracao: 3600
      },
      valor: {
        original: Number(amount).toFixed(2)
      },
      chave: process.env.EFI_PIX_KEY,
      solicitacaoPagador: description || 'Cobrança PIX'
    };

    const response = await axios.post(
      `${BASE_URL}/v2/cob`,
      body,
      {
        httpsAgent,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('🔥 ERRO AO GERAR PIX:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = {
  createPixCharge
};
