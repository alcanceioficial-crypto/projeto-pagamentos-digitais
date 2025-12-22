require('dotenv').config();

const ensureCert = require('./utils/ensureCert');
ensureCert(); // 👈 ESSENCIAL

const app = require('./app');

const pixRoutes = require('./routes/pix.routes');
const pixWebhookRoutes = require('./routes/pixWebhook.routes');

const PORT = process.env.PORT || 3333;

app.use('/api/pix', pixRoutes);
app.use('/api/webhook', pixWebhookRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
const app = require('./app');

const pixRoutes = require('./routes/pix.routes');
const pixWebhookRoutes = require('./routes/pixWebhook.routes');

app.use('/api/pix', pixRoutes);
app.use('/api/webhook', pixWebhookRoutes);

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
