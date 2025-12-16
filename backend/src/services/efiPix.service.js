console.log('📁 Inicializando efiPix.service.js');

const axios = require('axios');
const https = require('https');
const fs = require('fs');

const certPath = '/etc/secrets/efi-cert.p12';

console.log('📄 Caminho esperado do certificado:', certPath);

let agent;
try {
  agent = new https.Agent({
    pfx: fs.readFileSync(certPath),
    passphrase: process.env.EFI_CERT_PASSPHRASE,
    rejectUnauthorized: true
  });

  console.log('✅ Certificado .p12 carregado com sucesso');
} catch (err) {
  console.error('❌ ERRO AO CARREGAR CERTIFICADO .p12');
  console.error(err.message);
}

const BASE_URL =
  process.env.EFI_ENV === 'homolog'
    ? 'https://api-homologacao.efipay.com.br'
    : 'https://api.efipay.com.br';

async function getAccessToken() {
  console.log('🔐 Solicitando access token EFÍ...');

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
  console.log('💰 Criando cobrança PIX...');

  const token = await getAccessToken();

  const charge = await axios.post(
    `${BASE_URL}/v2/cob`,
    {
      calendario: { expiracao: 3600 },
      valor: { original: Number(amount).toFixed(2) },
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

  const locId = charge.data.loc.id;

  const qrCode = await axios.get(
    `${BASE_URL}/v2/loc/${locId}/qrcode`,
    {
      httpsAgent: agent,
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  return {
    txid: charge.data.txid,
    qrcode: qrCode.data.qrcode,
    imagemQrcode: qrCode.data.imagemQrcode
  };
}

module.exports = { createPixCharge };
