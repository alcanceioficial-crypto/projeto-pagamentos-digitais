const axios = require('axios');
const https = require('https');
const fs = require('fs');
const path = require('path');

/**
 * LOGS DE INICIALIZAÇÃO
 * Esses logs aparecem assim que o Render sobe o app
 */
console.log('📁 Inicializando efiPix.service.js');

const certPath = path.resolve(__dirname, '../../certs/efi-cert.p12');
console.log('📄 Caminho esperado do certificado:', certPath);

let agent;

try {
  const certBuffer = fs.readFileSync(certPath);
  console.log('✅ Certificado .p12 carregado com sucesso');

  agent = new https.Agent({
    pfx: certBuffer,
    passphrase: ''
  });

} catch (err) {
  console.error('❌ ERRO AO CARREGAR CERTIFICADO .p12');
  console.error(err.message);
}

/**
 * URL BASE EFÍ
 */
const baseURL =
  process.env.EFI_ENV === 'homolog'
    ? 'https://api-homologacao.efipay.com.br'
    : 'https://api.efipay.com.br';

/**
 * OAUTH2 - TOKEN
 */
async function getAccessToken() {
  console.log('🔐 Solicitando access token EFÍ...');

  const response = await axios.post(
    `${baseURL}/oauth/token`,
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

  console.log('✅ Access token obtido');
  return response.data.access_token;
}

/**
 * CRIA COBRANÇA PIX + QRCODE
 */
async function createPixCharge(amount, description) {
  console.log('💰 Criando cobrança PIX...');
  const token = await getAccessToken();

  const chargeResponse = await axios.post(
    `${baseURL}/v2/cob`,
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

  console.log('✅ Cobrança PIX criada');

  const locId = chargeResponse.data.loc.id;

  const qrCodeResponse = await axios.get(
    `${baseURL}/v2/loc/${locId}/qrcode`,
    {
      httpsAgent: agent,
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  console.log('✅ QR Code gerado');

  return {
    txid: chargeResponse.data.txid,
    qrcode: qrCodeResponse.data.qrcode,
    imagemQrcode: qrCodeResponse.data.imagemQrcode
  };
}

module.exports = {
  createPixCharge
};
