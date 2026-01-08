const express = require("express");
const router = express.Router();
const path = require("path");
const pool = require("../database");

const { criarPix } = require("../services/efiPix.service");

// 🔹 Criar Pix
router.post("/criar", async (req, res) => {
  try {
    const { valor, descricao } = req.body;

    if (!valor) {
      return res.status(400).json({ erro: "Valor é obrigatório" });
    }

    const pix = await criarPix(Number(valor), descricao || "Pagamento");

    res.json(pix);
  } catch (err) {
    console.error("Erro criar pix:", err.message);
    res.status(500).json({ erro: "Erro ao criar PIX" });
  }
});

// 🔹 Status para frontend (PADRÃO CORRETO)
router.get("/status/:txid", async (req, res) => {
  try {
    const { txid } = req.params;

    const { rows } = await pool.query(
      `SELECT status FROM pix_pagamentos WHERE txid = $1`,
      [txid]
    );

    if (!rows.length) {
      return res.json({ status: "NAO_ENCONTRADO" });
    }

    return res.json({ status: rows[0].status });
  } catch (err) {
    console.error("Erro status:", err.message);
    res.status(500).json({ erro: "Erro ao consultar status" });
  }
});

// 🔹 DOWNLOAD DO PRODUTO (arquivo teste)
router.get("/download/:txid", async (req, res) => {
  try {
    const { txid } = req.params;

    const { rows } = await pool.query(
      `SELECT status FROM pix_pagamentos WHERE txid = $1`,
      [txid]
    );

    if (!rows.length || rows[0].status !== "CONCLUIDA") {
      return res.status(403).json({ erro: "Pagamento não confirmado" });
    }

    const filePath = path.join(
      __dirname,
      "../files/arquivo-teste.jpg"
    );

    res.download(filePath, "arquivo.jpg");
  } catch (err) {
    console.error("Erro download:", err.message);
    res.status(500).json({ erro: "Erro ao liberar download" });
  }
});

module.exports = router;
