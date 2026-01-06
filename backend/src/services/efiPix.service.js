const axios = require("axios");
const https = require("https");
const fs = require("fs");

console.log("🔥 EFI PIX SERVICE CARREGADO");

const EFI_ENV = process.env.EFI_ENV || "production";

const baseURL =
  EFI_ENV === "homolog"
    ? "https://pix-h.api.efipay.com.br"
    : "https://pix.api.efipay.com.br";

// 🔐 HTTPS Agent com certificado
function httpsAgent() {
  return new https.Agent({
    pfx: fs.readFileSync("/tmp/efi-cert.p12"),
    passphrase: "",
  });
}

// 🔑 TOKEN
async function getToken() {
  const { data } = await axios.post(
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

  return data.access_token;
}

// 💸 CRIAR COBRANÇA PIX
async function criarPix(valor, descricao) {
  const token = await getToken();

  const { data } = await axios.post(
    `${baseURL}/v2/cob`,
    {
      calendario: { expiracao: 3600 },
      valor: { original: valor.toFixed(2) },
      chave: process.env.EFI_PIX_KEY,
      solicitacaoPagador: descricao,
    },
    {
      httpsAgent: httpsAgent(),
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return data;
}

module.exports = { criarPix };
