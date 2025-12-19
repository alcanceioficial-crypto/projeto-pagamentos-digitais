const app = require('./app');
require('./utils/ensureCert'); // mantém isso, já está funcionando

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log('🚀 Servidor rodando na porta', PORT);
});
