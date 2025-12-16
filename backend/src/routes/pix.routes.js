const axios = require('axios');
const https = require('https');
const fs = require('fs');

console.log('📁 Inicializando efiPix.service.js');

const CERT_PATH = '/etc/secrets/efi-cert.p12';

// 🔐 HTTPS Agent (mTLS)
const httpsAgent = new https.Agent({
  pfx: fs.readFileSync(CERT_PATH),
  passphrase: process.env.EFI_CERT_PASSPHRASE || '',
  rejectUnauthorized: true
});

// 🌐 BASE URL
const BASE_URL =
  process.env.EFI_ENV === 'homolog'
    ? 'https://api-h.efipay.com.br'
    : 'https://api.efipay.com.br';

// 🔑 OAuth
async function getAccessToken() {
  console.log('🔐 Solicitando access token EFÍ...');

  const response = await axios.post(
    `${BASE_URL}/oauth/token`,
    'grant_type=client_credentials',
    {
      httpsAgent,
      proxy: false, // 🚨 ESSENCIAL
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

// 💰 Criar cobrança PIX
async function createPixCharge(amount, description) {
  console.log('💰 Criando cobrança PIX...');

  const token = await getAccessToken();

  const chargeResponse = await axios.post(
    `${BASE_URL}/v2/cob`,
    {
      calendario: { expiracao: 3600 },
      valor: { original: Number(amount).toFixed(2) },
      solicitacaoPagador: description
    },
    {
      httpsAgent,
      proxy: false, // 🚨 ESSENCIAL
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  const locId = chargeResponse.data.loc.id;

  const qrResponse = await axios.get(
    `${BASE_URL}/v2/loc/${locId}/qrcode`,
    {
      httpsAgent,
      proxy: false, // 🚨 ESSENCIAL
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return {
    txid: chargeResponse.data.txid,
    qrcode: qrResponse.data.qrcode,
    imagemQrcode: qrResponse.data.imagemQrcode
  };
}

module.exports = { createPixCharge };
