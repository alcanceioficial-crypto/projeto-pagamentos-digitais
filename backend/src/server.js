const ensureCert = require('./utils/ensureCert');
ensureCert(); // 🔐 recria o certificado em /tmp

const app = require('./app');
const initDb = require('./initDb');

const pixRoutes = require('./routes/pix.routes');
const pixWebhookRoutes = require('./routes/pixWebhook.routes');

const PORT = process.env.PORT || 3333;

initDb();

// Rotas
app.use('/api/pix', pixRoutes);
app.use('/api/webhook', pixWebhookRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
