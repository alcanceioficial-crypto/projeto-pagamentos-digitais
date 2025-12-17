const axios = require('axios');
const https = require('https');
const fs = require('fs');
const path = require('path');

console.log('📁 Inicializando efiPix.service.js');

/**
 * ======================================================
 *  CONFIGURAÇÕES DE AMBIENTE
 * ======================================================
 */
const EFI_ENV = process.env.EFI_ENV || 'homolog';

const BASE_URL =
  EFI_ENV === 'production'
    ? 'https://api.efipay.com.br'
    : 'https://api-homologacao.efipay.com.br';

const CERT_PATH = '/etc/secrets/efi-cert.p12';

if (!fs.existsSync(CERT_PATH)) {
  console.error(`❌ Certificado NÃO encontrado em ${CERT_PATH}`);
  process.exit(1);
}

console.log(`📄 Certificado encontrado em ${CERT_PATH}`);

/**
 * ======================================================
 *  HTTPS AGENT (mTLS EFÍ)
 * ======================================================
 */
const agent = new https.Agent({
  pfx: fs.readFileSync(CERT_PATH),

  // 👉 Se o certificado NÃO tem senha, deixe undefined
  passphrase: process.env.EFI_CERT_PASSPHRASE || undefined
});

/**
 * ======================================================
 *  OBTÉM ACCESS TOKEN (SEM header duplicado)
 * ======================================================
 */
async function getAccessToken() {
  console.log('🔐 Solicitando access token EFÍ...');

  const credentials = Buffer.from(
    `${process.env.EFI_CLIENT_ID}:${process.env.EFI_CLIENT_SECRET}`
  ).toString('base64');

  const response = await axios.post(
    `${BASE_URL}/oauth/token`,
    'grant_type=client_credentials',
    {
      httpsAgent: agent,
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  );

  return response.data.access_token;
}

/**
 * ======================================================
 *  CRIA COBRANÇA PIX IMEDIATA
 * ======================================================
 */
async function createPixCharge(amount, description) {
  try {
    console.log('💰 Criando cobrança PIX...');

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
        httpsAgent: agent,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  } catch (error) {
    console.error('🔥 ERRO AO GERAR PIX:', error.message);

    if (error.response) {
      console.error('🔥 STATUS:', error.response.status);
      console.error('🔥 DATA:', error.response.data);
    }

    throw new Error(error.message);
  }
}

/**
 * ======================================================
 *  EXPORTS
 * ======================================================
 */
module.exports = {
  createPixCharge
};
