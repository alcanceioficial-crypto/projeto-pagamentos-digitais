const express = require('express');
const router = express.Router();
const { createPixCharge } = require('../services/efiPix.service');


router.post('/create', async (req, res) => {
try {
const { amount, description } = req.body;


if (!amount || !description) {
return res.status(400).json({ error: 'amount e description são obrigatórios' });
}


const result = await createPixCharge(amount, description);


res.status(201).json(result);


} catch (error) {
console.error('Erro PIX:', error.response?.data || error.message);
res.status(500).json({ error: 'Erro ao gerar cobrança PIX' });
}
});


module.exports = router;
