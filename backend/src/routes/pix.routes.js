const express = require("express");
const router = express.Router();
const { criarPix } = require("../services/efiPix.service");

router.post("/criar", async (req, res) => {
  try {
    const { valor, descricao } = req.body;

    const pix = await criarPix(valor, descricao);

    res.json({
      txid: pix.txid,
      copiaECola: pix.pixCopiaECola,
    });
  } catch (err) {
    res.status(500).json({
      erro: err.response?.data || err.message,
    });
  }
});

module.exports = router;
