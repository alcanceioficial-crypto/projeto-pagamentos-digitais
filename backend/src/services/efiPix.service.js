import fs from 'fs';
import https from 'https';
import axios from 'axios';
import qs from 'qs';

/**
 * ============================================
 * CONFIGURAÇÕES GERAIS
 * ============================================
 */

console.log('📁 Inicializando efiPix.service.js');

const CERT_PATH = '/etc/secrets/efi-cert.p12';

console.log('📄 Caminho esperado do certificado:', CERT_PATH);

// Validação do certificado
let pfx;
try {
  pfx = fs.readFileSync(CERT_PATH);
  console.log('✅ Certificado .p12 carregado com sucesso');
} catch (err) {
  console.error('❌ ERRO AO CARREGAR CERTIFICADO .p12');
  throw err;
}

// HTTPS Agent (EFÍ exige mTLS)
const httpsAgent = new https.Agent({
  pfx,
  passphrase: process.env.EFI_CERT_PASSPHRASE || '',
  rejectUnauthorized: true
});

// Base URL EFÍ
const baseURL =
  process.env.EFI_ENV === 'homolog'
    ? 'https://apis-homologacao.efipay.com.br'
    : 'https://apis.efipay.com.br';

/**
 * ============================================
 * OAUTH – ACCESS TOKEN
 * ============================================
 */
async function getAccessToken() {
  console.log('🔐 Solicitando access token EFÍ...');

  const auth = Buffer.from(
    `${process.env.EFI_CLIENT_ID}:${process.env.EFI_CLIENT_SECRET}`
  ).toString('base64');

  try {
    const response = await axios.post(
      `${baseURL}/oauth/token`,
      qs.stringify({ grant_type: 'client_credentials' }),
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        httpsAgent
      }
    );

    console.log('✅ Access token obtido com sucesso');
    return response.data.access_token;
  } catch (error) {
    console.error('🔥 ERRO AO OBTER TOKEN');
    console.error('MESSAGE:', error.message);
    console.error('STATUS:', error.response?.status);
    console.error('DATA:', error.response?.data);
    throw error;
  }
}

/**
 * ============================================
 * CRIAR COBRANÇA PIX
 * ============================================
 */
export async function createPixCharge({ amount, description }) {
  console.log('💰 Criando cobrança PIX...');

  const accessToken = await getAccessToken();

  try {
    const response = await axios.post(
      `${baseURL}/v2/cob`,
      {
        calendario: {
          expiracao: 3600
        },
        valor: {
          original: Number(amount).toFixed(2)
        },
        chave: process.env.EFI_PIX_KEY,
        solicitacaoPagador: description
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        httpsAgent
      }
    );

    console.log('✅ Cobrança PIX criada com sucesso');
    return response.data;
  } catch (error) {
    console.error('🔥 ERRO AO CRIAR COBRANÇA PIX');
    console.error('MESSAGE:', error.message);
    console.error('STATUS:', error.response?.status);
    console.error('DATA:', error.response?.data);
    throw error;
  }
}
