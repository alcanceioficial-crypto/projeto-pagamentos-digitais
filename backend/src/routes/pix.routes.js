// src/routes/pix.routes.js
const express = require("express");
const router = express.Router();

const {
  criarPix,
  consultarPixPorTxid,
} = require("../services/efiPix.service");

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
    console.error("Erro criar Pix:", err.response?.data || err.message);
    res.status(500).json({ erro: err.message });
  }
});

// 🔹 Consultar status Pix
router.get("/status/:txid", async (req, res) => {
  try {
    const { txid } = req.params;
    const status = await consultarPixPorTxid(txid);
    res.json(status);
  } catch (err) {
    console.error("Erro status Pix:", err.response?.data || err.message);
    res.status(500).json({ erro: err.message });
  }
});

module.exports = router;
