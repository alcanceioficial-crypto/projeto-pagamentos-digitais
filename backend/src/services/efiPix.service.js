const EfiPay = require('sdk-node-apis-efi')

const isHomolog = process.env.EFI_ENV === 'homolog'

console.log('🌍 Ambiente:', isHomolog ? 'homolog' : 'produção')
console.log('📄 Certificado:', '/etc/secrets/efi-cert.p12')

const options = {
  sandbox: isHomolog,
  client_id: process.env.EFI_CLIENT_ID,
  client_secret: process.env.EFI_CLIENT_SECRET,
  certificate: '/etc/secrets/efi-cert.p12',
}

const efipay = new EfiPay(options)

async function createPixCharge({ amount, description }) {
  const valor = Math.round(Number(amount) * 100)

  const body = {
    calendario: {
      expiracao: 3600,
    },
    valor: {
      original: (valor / 100).toFixed(2),
    },
    chave: process.env.EFI_PIX_KEY,
    solicitacaoPagador: description,
  }

  return efipay.pixCreateImmediateCharge([], body)
}

module.exports = {
  createPixCharge,
}
