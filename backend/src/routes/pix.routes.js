// src/routes/pix.routes.js
const express = require("express");
const router = express.Router();

const { criarPix } = require("../services/efiPix.service");

router.post("/criar", async (req, res) => {
  try {
    const { valor, descricao } = req.body;

    if (!valor) {
      return res.status(400).json({ erro: "Valor é obrigatório" });
    }

    const pix = await criarPix(Number(valor), descricao || "Pagamento");

    res.json({
      txid: pix.txid,
      copiaECola: pix.pixCopiaECola,
    });
  } catch (err) {
    console.error("Erro criar Pix:", err.response?.data || err.message);

    res.status(500).json({
      erro: err.response?.data || err.message,
    });
  }
});

module.exports = router;
