const EfiPay = require('sdk-node-apis-efi');

console.log('📁 Inicializando efiPix.service.js');

const options = {
  sandbox: process.env.EFI_ENV === 'homolog',
  client_id: process.env.EFI_CLIENT_ID,
  client_secret: process.env.EFI_CLIENT_SECRET,
  certificate: process.env.EFI_CERT_PATH || '/etc/secrets/efi-cert.p12',
};

console.log('🌍 Ambiente:', options.sandbox ? 'homolog' : 'producao');
console.log('📄 Certificado:', options.certificate);

const efipay = new EfiPay(options);

/**
 * Cria cobrança PIX (CobV)
 */
async function criarPix({ amount, description }) {
  try {
    console.log('💰 Criando cobrança PIX...');

    const body = {
      calendario: {
        expiracao: 3600,
      },
      valor: {
        original: amount.toFixed(2),
      },
      chave: process.env.EFI_PIX_KEY,
      solicitacaoPagador: description,
    };

    const response = await efipay.pixCreateImmediateCharge([], body);

    console.log('✅ PIX criado com sucesso:', response);

    return response;

  } catch (error) {
    console.error('🔥 ERRO PIX COMPLETO');
    console.error('error:', error);
    console.error('error.error:', error?.error);
    console.error('error.error_description:', error?.error_description);
    console.error('error.response:', error?.response);
    console.error('error.response?.data:', error?.response?.data);

    throw error;
  }
}

module.exports = {
  criarPix,
};
