const express = require('express')
const router = express.Router()

const { createPixCharge } = require('../services/efiPix.service')

router.post('/create', async (req, res) => {
  try {
    const { amount, description } = req.body

    if (!amount || !description) {
      return res.status(400).json({
        error: 'amount e description são obrigatórios',
      })
    }

    const charge = await createPixCharge({ amount, description })

    res.json(charge)
  } catch (err) {
    console.error('🔥 ERRO AO GERAR PIX:', err.message)
    res.status(500).json({
      error: 'Erro ao gerar cobrança PIX',
      detalhes: err.message,
    })
  }
})

module.exports = router
