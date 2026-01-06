const axios = require("axios");
const https = require("https");
const fs = require("fs");
const crypto = require("crypto");

const EFI_ENV = process.env.EFI_ENV || "production";

const baseURL =
  EFI_ENV === "homolog"
    ? "https://pix-h.api.efipay.com.br"
    : "https://pix.api.efipay.com.br";

function httpsAgent() {
  return new https.Agent({
    pfx: fs.readFileSync("/tmp/efi-cert.p12"),
    passphrase: "",
  });
}

async function getToken() {
  const res = await axios.post(
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

  return res.data.access_token;
}

function gerarTxid() {
  return crypto.randomBytes(16).toString("hex"); // 32 chars
}

async function criarPix(valor, descricao) {
  const txid = gerarTxid();
  const token = await getToken();

  const payload = {
    calendario: { expiracao: 3600 },
    valor: { original: valor.toFixed(2) },
    chave: process.env.EFI_PIX_KEY,
    solicitacaoPagador: descricao,
  };

  const res = await axios.put(
    `${baseURL}/v2/cob/${txid}`,
    payload,
    {
      httpsAgent: httpsAgent(),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  return {
    txid,
    pixCopiaECola: res.data.pixCopiaECola,
  };
}

module.exports = { criarPix };
