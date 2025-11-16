require('dotenv').config(); // Carregar variáveis do .env
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Pegando dados do .env
    const { DB_USER, DB_PASS, DB_NAME, DB_CLUSTER1, DB_CLUSTER2 } = process.env;

    // Montando a URI do MongoDB Atlas
    const uri = `mongodb+srv://${DB_USER}:${DB_PASS}${DB_CLUSTER1}/${DB_NAME}?${DB_CLUSTER2}`;

    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ MongoDB conectado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao conectar ao MongoDB:', error.message);
    process.exit(1); // Encerra a aplicação se falhar
  }
};

module.exports = connectDB;
