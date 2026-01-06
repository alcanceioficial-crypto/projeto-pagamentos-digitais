const axios = require("axios");
const https = require("https");
const fs = require("fs");
const pixStore = require("../store/pixStore");

console.log("🔥 EFI PIX SERVICE CARREGADO");
console.log("📁 Inicializando efiPix.service.js");

const EFI_ENV = process.env.EFI_ENV || "production";

const baseURL =
  EFI_ENV === "homolog"
    ? "https://pix-h.api.efipay.com.br"
    : "https://pix.api.efipay.com.br";

console.log("🌍 Ambiente:", EFI_ENV);
console.log("🌐 Base URL:", baseURL);

// 🔐 HTTPS Agent
function httpsAgent() {
  const certPath = "/tmp/efi-cert.p12";

  if (!fs.existsSync(certPath)) {
    throw new Error("Certificado Efí não encontrado");
  }

  return new https.Agent({
    pfx: fs.readFileSync(certPath),
    passphrase: "",
  });
}

// 🔑 TOKEN
async function getToken() {
  const response = await axios.post(
    `${baseURL}/oauth/token`,
    { grant_type: "client_credentials" },
    {
      httpsAgent: httpsAgent(),
      auth: {
        username: process.env.EFI_CLIENT_ID,
        password: process.env.EFI_CLIENT_SECRET,
      },
    }
  );

  return response.data.access_token;
}

// 💰 CRIAR PIX
async function criarPix(valor, descricao) {
  const token = await getToken();

  const body = {
    calendario: { expiracao: 3600 },
    valor: { original: valor.toFixed(2) },
    chave: process.env.EFI_PIX_KEY,
    solicitacaoPagador: descricao,
  };

  const response = await axios.post(
    `${baseURL}/v2/cob`,
    body,
    {
      httpsAgent: httpsAgent(),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  const pix = response.data;

  // 💾 SALVA COMO PENDENTE
  pixStore.set(pix.txid, {
    status: "PENDENTE",
    valor,
    criadoEm: new Date(),
  });

  console.log("🧾 PIX criado:", pix.txid);

  return {
    txid: pix.txid,
    pixCopiaECola: pix.pixCopiaECola,
  };
}

// 🔍 CONSULTAR PIX POR TXID
async function consultarPixPorTxid(txid) {
  const token = await getToken();

  const response = await axios.get(
    `${baseURL}/v2/pix/${txid}`,
    {
      httpsAgent: httpsAgent(),
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

// 🔄 JOB AUTOMÁTICO
async function verificarPixPendentes() {
  console.log("🔄 Verificando pagamentos Pix...");

  for (const [txid, registro] of pixStore.entries()) {
    if (registro.status !== "PENDENTE") continue;

    try {
      const pix = await consultarPixPorTxid(txid);

      if (pix.status === "CONCLUIDA") {
        registro.status = "PAGO";
        registro.pagoEm = pix.horario;

        pixStore.set(txid, registro);

        console.log("✅ PIX PAGO:", txid);
      }
    } catch (err) {
      console.error(
        "❌ Erro ao consultar Pix:",
        err.response?.data || err.message
      );
    }
  }
}

module.exports = {
  criarPix,
  verificarPixPendentes,
};
