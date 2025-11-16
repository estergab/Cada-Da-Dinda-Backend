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

// ✅ CORS CORRIGIDO - permite localhost e produção
const allowedOrigins = [
  'http://localhost:8080',           // Desenvolvimento local
  'http://localhost:5173',           // Vite padrão
  'https://casadadinda-frontend.vercel.app',  // ⚠️ SUBSTITUA pela sua URL do Vercel
  process.env.FRONTEND_URL           // Variável de ambiente (opcional)
].filter(Boolean); // Remove undefined

app.use(cors({
  origin: function (origin, callback) {
    // Permite requests sem origin (mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('❌ Origem bloqueada pelo CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos (imagens)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ✅ Rota de health check (para monitoramento)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Rota raiz
app.get('/', (req, res) => {
  res.json({ 
    message: 'Casa da Dinda API',
    version: '1.0.0',
    endpoints: {
      lares: '/api/lares',
      solicitacoes: '/api/solicitacoes'
    }
  });
});

// Rotas da API
app.use('/api/lares', laresRoutes);
app.use('/api/solicitacoes', solicitacoesRoutes);

// Middleware de erro
app.use(errorHandler);

module.exports = app;
