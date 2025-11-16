const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/database');
const errorHandler = require('./middlewares/errorHandler');

// Importar rotas
const laresRoutes = require('./routes/laresRoutes');
const solicitacoesRoutes = require('./routes/solicitacoesRoutes');

const app = express();

// Conectar ao banco
connectDB();

// Middlewares
app.use(cors({
  origin: 'http://localhost:8080', // Frontend Vite
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos (imagens)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rotas
app.use('/api/lares', laresRoutes);
app.use('/api/solicitacoes', solicitacoesRoutes);

// Middleware de erro
app.use(errorHandler);

module.exports = app;