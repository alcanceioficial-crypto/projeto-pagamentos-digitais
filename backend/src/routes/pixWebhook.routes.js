const express = require('express');
const router = express.Router();

router.post('/pix', (req, res) => {
  console.log('🔔 WEBHOOK PIX RECEBIDO');
  console.log(JSON.stringify(req.body, null, 2));

  // A EFÍ exige resposta 200
  res.status(200).send('ok');
});

module.exports = router;
