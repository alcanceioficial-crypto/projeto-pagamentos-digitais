const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Backend online e funcionando 🚀',
    timestamp: new Date()
  });
});

module.exports = router;

