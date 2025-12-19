require('dotenv').config();

const app = require('./app');
const ensureCert = require('./utils/ensureCert');
const pixRoutes = require('./routes/pix.routes');

ensureCert(); // 🔐 SEM ISSO NADA FUNCIONA

app.use('/api', pixRoutes);

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
