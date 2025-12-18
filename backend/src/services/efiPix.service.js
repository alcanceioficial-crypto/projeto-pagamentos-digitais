const axios = require('axios');
const https = require('https');
const fs = require('fs');
const path = require('path');

console.log('📁 Inicializando efiPix.service.js');

const {
  EFI_CLIENT_ID,
  EFI_CLIENT_SECRET,
  EFI_CERT_BASE64,
  EFI_ENV
} = process.env;

if (!EFI_CERT_BASE64) {
  throw new Error('EFI_CERT_BASE64 não definido');
}

// ===== AMBIENTE =====
const isHomolog = EFI_ENV === 'homolog';

const baseURL = isHomolog
  ? 'https://pix-h.api.efipay.com.br'
  : 'https://pix.api.efipay.com.br';

console.log('🌍 Ambiente:', EFI_ENV);
console.log('🌐 Base URL:', baseURL);

// ===== DECODIFICA CERTIFICADO =====
const certBuffer = Buffer.from(EFI_CERT_BASE64, 'base64');

// salva em arquivo temporário (node https exige buffer OU arquivo)
const certPath = path.join('/tmp', 'efi-cert.p12');
fs.writeFileSync(certPath, certBuffer);

console.log('📄 Certificado decodificado em:', certPath);

// ===== HTTPS AGENT =====
const httpsAgent = new https.Agent({
  pfx: fs.readFileSync(certPath),
  rejectUnauthorized: true
});

// ===== TOKEN =====
async function getAccessToken() {
  console.log('🔐 Solicitando access token EFÍ...');

  const auth = Buffer.from(
    `${EFI_CLIENT_ID}:${EFI_CLIENT_SECRET}`
  ).toString('base64');

  const response = await axios.post(
    `${baseURL}/oauth/token`,
    'grant_type=client_credentials',
    {
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      httpsAgent
    }
  );

  return response.data.access_token;
}

// ===== CRIAR COBRANÇA =====
async function criarCobrancaPix(amount, description) {
  try {
    console.log('💰 Criando cobrança PIX...');

    const token = await getAccessToken();

    const payload = {
      calendario: { expiracao: 3600 },
      valor: { original: amount.toFixed(2) },
      chave: process.env.EFI_PIX_KEY,
      solicitacaoPagador: description
    };

    const response = await axios.post(
      `${baseURL}/v2/cob`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        httpsAgent
      }
    );

    return response.data;

  } catch (err) {
    console.error('🔥 ERRO AO GERAR PIX:', err.response?.data || err.message);
    throw err;
  }
}

module.exports = { criarCobrancaPix };
