const app = require('./app');
const ensureCert = require('./utils/ensureCert');
const pixRoutes = require('./routes/pix.routes');

// 🔐 recria o certificado a partir do Base64
ensureCert();

app.use('/api', pixRoutes);

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
