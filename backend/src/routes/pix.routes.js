const express = require("express");
const router = express.Router();

const { criarPix, consultarPixPorTxid } = require("../services/efiPix.service");

/* ======================================================
   CONFIGURAÇÃO DO PRODUTO (ALTERE AQUI SE PRECISAR)
====================================================== */

// 🔥 PARA TESTE: 0.50
// 🔥 PARA PRODUÇÃO: 9.90
const VALOR_PRODUTO = 0.50;

const DESCRICAO_PRODUTO = "E-book Brigadeiro Gourmet";

/* ======================================================
   CRIAR PIX
====================================================== */
router.post("/gerar_pix", async (req, res) => {
  try {
    const pix = await criarPix(VALOR_PRODUTO, DESCRICAO_PRODUTO);

    console.log("🧾 PIX GERADO:", pix.txid);

    res.json({
      txid: pix.txid,
      pix: pix.pixCopiaECola
    });

  } catch (err) {
    console.error("❌ Erro ao gerar PIX:", err.message);
    res.status(500).json({ erro: "Erro ao gerar PIX" });
  }
});

/* ======================================================
   STATUS DO PIX (CONSULTA DIRETA NA EFÍ — SEM BANCO)
====================================================== */
router.get("/status_pix", async (req, res) => {
  try {
    const { txid } = req.query;

    if (!txid) {
      return res.status(400).json({ erro: "TXID não informado" });
    }

    const pix = await consultarPixPorTxid(txid);

    if (pix.status === "CONCLUIDA") {
      console.log("✅ PIX PAGO:", txid);
      return res.json({ status: "CONCLUIDA" });
    }

    return res.json({ status: "PENDENTE" });

  } catch (err) {
    console.error("❌ Erro ao consultar status:", err.message);
    res.status(500).json({ erro: "Erro ao consultar status" });
  }
});

/* ======================================================
   DOWNLOAD (LIBERADO APÓS CONFIRMAÇÃO)
====================================================== */
router.get("/download/:txid", async (req, res) => {
  try {
    const { txid } = req.params;

    const pix = await consultarPixPorTxid(txid);

    if (pix.status !== "CONCLUIDA") {
      return res.status(403).json({ erro: "Pagamento não confirmado" });
    }

    const path = require("path");
    const fs = require("fs");

    const filePath = path.join(
      __dirname,
      "..",
      "files",
      "ebook-brigadeiro-gourmet.pdf"
    );

    if (!fs.existsSync(filePath)) {
      console.error("❌ PDF não encontrado:", filePath);
      return res.status(404).json({ erro: "Arquivo não encontrado" });
    }

    console.log("📦 Download liberado | TXID:", txid);

    res.download(filePath, "ebook-brigadeiro-gourmet.pdf");

  } catch (err) {
    console.error("❌ Erro no download:", err.message);
    res.status(500).json({ erro: "Erro ao liberar download" });
  }
});

module.exports = router;
