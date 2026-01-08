const axios = require("axios");
const https = require("https");
const fs = require("fs");
const crypto = require("crypto");
const pool = require("../database");

console.log("🔥 EFI PIX SERVICE CARREGADO");

const EFI_ENV = process.env.EFI_ENV || "production";

const baseURL =
  EFI_ENV === "homolog"
    ? "https://pix-h.api.efipay.com.br"
    : "https://pix.api.efipay.com.br";

// 🔐 HTTPS Agent
function httpsAgent() {
  return new https.Agent({
    pfx: fs.readFileSync("/tmp/efi-cert.p12"),
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

// 🧾 CRIAR PIX
async function criarPix(valor, descricao) {
  const token = await getToken();

  const txid = crypto.randomBytes(16).toString("hex"); // 32 chars

  const body = {
    calendario: { expiracao: 3600 },
    valor: { original: valor.toFixed(2) },
    chave: process.env.EFI_PIX_KEY,
    solicitacaoPagador: descricao,
  };

  const response = await axios.put(
    `${baseURL}/v2/cob/${txid}`,
    body,
    {
      httpsAgent: httpsAgent(),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  const qr = await axios.get(
    `${baseURL}/v2/loc/${response.data.loc.id}/qrcode`,
    {
      httpsAgent: httpsAgent(),
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  // ✅ GRAVA NO BANCO COMO PENDENTE
  await pool.query(
    `INSERT INTO pix_pagamentos (txid, valor, status)
     VALUES ($1, $2, 'PENDENTE')`,
    [txid, valor]
  );

  return {
    txid,
    pixCopiaECola: qr.data.qrcode,
  };
}

// 🔍 CONSULTAR PIX POR TXID
async function consultarPixPorTxid(txid) {
  const token = await getToken();

  const response = await axios.get(
    `${baseURL}/v2/cob/${txid}`,
    {
      httpsAgent: httpsAgent(),
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
}

// ⏱️ JOB — VERIFICAR PIX PENDENTES
async function verificarPixPendentes() {
  console.log("🔄 Verificando pagamentos Pix...");

  const { rows } = await pool.query(
    `SELECT txid FROM pix_pagamentos WHERE status = 'PENDENTE'`
  );

  for (const row of rows) {
    const txid = row.txid;

    try {
      const pix = await consultarPixPorTxid(txid);

      if (pix.status === "CONCLUIDA") {
        console.log("✅ PIX PAGO:", txid);

        await pool.query(
          `UPDATE pix_pagamentos
           SET status = 'CONCLUIDA', pago_em = NOW()
           WHERE txid = $1`,
          [txid]
        );
      } else {
        console.log("⏳ PIX ainda pendente:", txid);
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
  consultarPixPorTxid,
  verificarPixPendentes,
};
