const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");

const { criarPix } = require("../services/efiPix.service");

// 🧠 memória simples (Render Free)
const pagamentos = {};

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

    pagamentos[pix.txid] = {
      status: "PENDENTE",
      criadoEm: Date.now()
    };

    res.json(pix);
  } catch (err) {
    console.error("❌ Erro criar pix:", err);
    res.status(500).json({ erro: "Erro ao criar PIX" });
  }
});

/* ======================================================
   STATUS DO PIX
   (frontend faz polling)
====================================================== */
const { consultarPixPorTxid } = require("../services/efiPix.service");

router.get("/status/:txid", async (req, res) => {
  try {
    const pix = await consultarPixPorTxid(req.params.txid);

    if (pix.status === "CONCLUIDA") {
      return res.json({ pago: true });
    }

    res.json({ pago: false });
  } catch (err) {
    console.error("Erro status PIX:", err.message);
    res.json({ pago: false });
  }
});


/* ======================================================
   DOWNLOAD DO PRODUTO
====================================================== */
router.get("/download/:txid", (req, res) => {
  const { txid } = req.params;

  if (!pagamentos[txid] || pagamentos[txid].status !== "CONCLUIDA") {
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

  res.download(filePath, "ebook-brigadeiro-gourmet.pdf");
});

module.exports = router;
