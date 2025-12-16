console.log('📁 Inicializando efiPix.service.js');

const axios = require('axios');
const https = require('https');
const fs = require('fs');

/**
 * CAMINHO DO CERTIFICADO NO RENDER
 * Secret Files SEMPRE montam em /etc/secrets
 */
const CERT_PATH = '/etc/secrets/efi-cert.p12';

console.log('📄 Caminho esperado do certificado:', CERT_PATH);

/**
 * Carrega certificado .p12
 */
let httpsAgent;

try {
  const pfxBuffer = fs.readFileSync(CERT_PATH);

  const agent = new https.Agent({
  pfx: fs.readFileSync('/etc/secrets/efi-cert.p12'),
  rejectUnauthorized: true
});

  console.log('✅ Certificado .p12 carregado com sucesso');
} catch (err) {
  console.error('❌ ERRO AO CARREGAR CERTIFICADO .p12');
  console.error(err.message);
}

/**
 * BASE URL EFÍ
 */
const baseURL = process.env.EFI_ENV === 'homolog'
  ? 'https://apis-homologacao.efipay.com.br'
  : 'https://apis.efipay.com.br';


/**
 * OAUTH TOKEN
 */
async function getAccessToken() {
  console.log('🔐 Solicitando access token EFÍ...');

  const response = await axios.post(
    `${BASE_URL}/oauth/token`,
    'grant_type=client_credentials',
    {
      httpsAgent,
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
 * CRIA COBRANÇA PIX + QR CODE
 */
async function createPixCharge(amount, description) {
  console.log('⏳ INICIANDO createPixCharge...');
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
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  console.log('✅ Cobrança PIX criada');

  const locId = chargeResponse.data.loc.id;

  console.log('📸 Gerando QR Code...');

  const qrCodeResponse = await axios.get(
    `${BASE_URL}/v2/loc/${locId}/qrcode`,
    {
      httpsAgent,
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
