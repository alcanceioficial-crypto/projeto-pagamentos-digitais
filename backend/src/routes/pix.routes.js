const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");

const {
  criarPix,
  consultarPixPorTxid
} = require("../services/efiPix.service");

/* ======================================================
   CRIAR PIX
====================================================== */
router.post("/criar", async (req, res) => {
  try {
    const { valor, descricao } = req.body;

    if (!valor) {
      return res.status(400).json({ erro: "Valor é obrigatório" });
    }

    const pix = await criarPix(Number(valor), descricao || "Pagamento");

    console.log("💰 PIX GERADO:", pix.txid);

    res.json(pix);

  } catch (err) {
    console.error("❌ Erro ao criar PIX:", err.response?.data || err.message);
    res.status(500).json({ erro: "Erro ao criar PIX" });
  }
});

/* ======================================================
   STATUS PIX (CONSULTA DIRETA NO EFÍ)
====================================================== */
router.get("/status/:txid", async (req, res) => {
  try {
    const { txid } = req.params;

    const pix = await consultarPixPorTxid(txid);

    if (pix.status === "CONCLUIDA") {
      console.log("✅ PIX CONFIRMADO:", txid);
      return res.json({ pago: true });
    }

    return res.json({ pago: false });

  } catch (err) {
    console.error("❌ Erro status PIX:", err.response?.data || err.message);
    res.json({ pago: false });
  }
});

/* ======================================================
   DOWNLOAD PROTEGIDO
====================================================== */
router.get("/download/:txid", async (req, res) => {
  try {
    const { txid } = req.params;

    const pix = await consultarPixPorTxid(txid);

    if (pix.status !== "CONCLUIDA") {
      return res.status(403).json({ erro: "Pagamento não confirmado" });
    }

    const filePath = path.join(
      __dirname,
      "..",
      "files",
      "ebook-brigadeiro-gourmet.pdf"
    );

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ erro: "Arquivo não encontrado" });
    }

    console.log("📦 DOWNLOAD LIBERADO:", txid);
    res.download(filePath, "ebook-brigadeiro-gourmet.pdf");

  } catch (err) {
    console.error("❌ Erro no download:", err.message);
    res.status(500).json({ erro: "Erro ao liberar download" });
  }
});

module.exports = router;
