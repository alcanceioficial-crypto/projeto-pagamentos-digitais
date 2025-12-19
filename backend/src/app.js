const express = require('express');
const cors = require('cors');

const pixRoutes = require('./routes/pix.routes');
const pixWebhookRoutes = require('./routes/pixWebhook.routes');

const app = express();

app.use(cors());
app.use(express.json());

// 🔹 Rotas da API
app.use('/api/pix', pixRoutes);
app.use('/api/webhook', pixWebhookRoutes);

// 🔹 Rota de teste (opcional)
app.get('/', (req, res) => {
  res.send('API Pix Efí rodando');
});

module.exports = app;
