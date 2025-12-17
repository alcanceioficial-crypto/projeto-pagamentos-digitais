const fs = require('fs');
const https = require('https');
const axios = require('axios');
const qs = require('querystring');

/**
 * ==========================
 * CONFIGURAÇÃO DE AMBIENTE
 * ==========================
 */

const ENV = process.env.EFI_ENV || 'homolog';

const BASE_URL =
  ENV === 'production'
    ? 'https://pix.api.efipay.com.br'
    : 'https://pix-h.api.efipay.com.br';

const CERT_PATH = process.env.EFI_CERT_PATH || '/etc/secrets/efi-cert.p12';

console.log('📁 Inicializando efiPix.service.js');
console.log('🌍 Ambiente:', ENV);
console.log('🌐 Base URL:', BASE_URL);
console.log('📄 Certificado:', CERT_PATH);

/**
 * ==========================
 * CERTIFICADO
 * ==========================
 */

if (!fs.existsSync(CERT_PATH)) {
  throw new Error(`❌ Certificado NÃO encontrado em ${CERT_PATH}`);
}

const httpsAgent = new https.Agent({
  pfx: fs.readFileSync(CERT_PATH),
  passphrase: process.env.EFI_CERT_PASSPHRASE || undefined,
});

/**
 * ==========================
 * TOKEN OAUTH
 * ==========================
 */
async function getAccessToken() {
  console.log('🔐 Solicitando access token EFÍ...');

  const auth = Buffer.from(
    `${process.env.EFI_CLIENT_ID}:${process.env.EFI_CLIENT_SECRET}`
  ).toString('base64');

  try {
    const response = await axios.post(
      `${BASE_URL}/oauth/token`,
      qs.stringify({ grant_type: 'client_credentials' }),
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        httpsAgent,
        timeout: 15000,
      }
    );

    console.log('✅ Token obtido');
    return response.data.access_token;
  } catch (error) {
    console.error(
      '🔥 ERRO TOKEN:',
      error?.response?.data || error.message
    );
    throw error;
  }
}

/**
 * ==========================
 * CRIAR COBRANÇA PIX
 * ==========================
 */
async function createPixCharge({ amount, description }) {
  console.log('💰 Criando cobrança PIX...');

  const accessToken = await getAccessToken();

  const payload = {
    calendario: {
      expiracao: 3600,
    },
    valor: {
      original: amount.toFixed(2),
    },
    chave: process.env.EFI_PIX_KEY,
    solicitacaoPagador: description,
  };

  try {
    console.log('📤 Enviando cobrança para EFÍ...');
    console.log('📦 Payload:', payload);

    const response = await axios.post(
      `${BASE_URL}/v2/cob`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        httpsAgent,
        timeout: 15000,
      }
    );

    console.log('✅ PIX CRIADO COM SUCESSO');
    return response.data;

  } catch (error) {
    console.error(
      '🔥 ERRO PIX:',
      error?.response?.data || error.message
    );
    throw error;
  }
}

module.exports = {
  createPixCharge,
};
