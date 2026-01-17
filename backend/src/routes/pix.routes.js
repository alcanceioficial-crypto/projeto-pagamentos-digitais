const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const pool = require("../database");

const { criarPix } = require("../services/efiPix.service");

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

    res.json(pix);
  } catch (err) {
    console.error("❌ Erro criar pix:", err.message);
    res.status(500).json({ erro: "Erro ao criar PIX" });
  }
});

/* ======================================================
   STATUS DO PIX (POLLING)
====================================================== */
router.get("/status/:txid", async (req, res) => {
  try {
    const { txid } = req.params;

    const { rows } = await pool.query(
      `SELECT status FROM pix_pagamentos WHERE txid = $1`,
      [txid]
    );

    if (!rows.length) {
      return res.json({ pago: false });
    }

    if (rows[0].status === "CONCLUIDA") {
      return res.json({ pago: true });
    }

    res.json({ pago: false });
  } catch (err) {
    console.error("❌ Erro status:", err.message);
    res.status(500).json({ erro: "Erro ao consultar status" });
  }
});

/* ======================================================
   DOWNLOAD DO PRODUTO (PDF)
====================================================== */
router.get("/download/:txid", async (req, res) => {
  try {
    const { txid } = req.params;

    // 🔎 Confirma pagamento
    const { rows } = await pool.query(
      `SELECT status FROM pix_pagamentos WHERE txid = $1`,
      [txid]
    );

    if (!rows.length || rows[0].status !== "CONCLUIDA") {
      return res.status(403).json({ erro: "Pagamento não confirmado" });
    }

    // 📁 Caminho absoluto no Render
    const filePath = path.join(
      process.cwd(),
      "backend",
      "src",
      "files",
      "livro-colorir-avatar.pdf"
    );

    // 🛑 Segurança
    if (!fs.existsSync(filePath)) {
      console.error("❌ Arquivo não encontrado:", filePath);
      return res.status(404).json({ erro: "Arquivo não encontrado" });
    }

    console.log("📦 Download liberado | TXID:", txid);

    res.download(filePath, "livro-Colorir-Avatar.pdf");

  } catch (err) {
    console.error("❌ Erro download:", err.message);
    res.status(500).json({ erro: "Erro ao liberar download" });
  }
});

module.exports = router;
