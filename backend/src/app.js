const express = require('express');
const cors = require('cors');

const pixRoutes = require('./routes/pix.routes');

const app = express();

app.use(cors());
app.use(express.json());

// 👇 ESSA LINHA É O QUE ESTAVA FALTANDO
app.use('/api/pix', pixRoutes);

// rota simples pra teste
app.get('/', (req, res) => {
  res.send('API PIX EFÍ OK');
});

module.exports = app;
