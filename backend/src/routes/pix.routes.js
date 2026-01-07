const express = require("express");
const router = express.Router();
const pool = require("../database");

const { criarPix } = require("../services/efiPix.service");

// 🔹 Criar Pix
router.post("/criar", async (req, res) => {
  const { valor, descricao } = req.body;

  if (!valor) {
    return res.status(400).json({ erro: "Valor é obrigatório" });
  }

  const pix = await criarPix(Number(valor), descricao || "Pagamento");

  res.json(pix);
});

// 🔹 Status para frontend
router.get("/status/:txid", async (req, res) => {
  const { txid } = req.params;

  const { rows } = await pool.query(
    `SELECT status FROM pix_pagamentos WHERE txid = $1`,
    [txid]
  );

  if (!rows.length) {
    return res.status(404).json({ erro: "TXID não encontrado" });
  }

  res.json({ status: rows[0].status });
});

module.exports = router;
