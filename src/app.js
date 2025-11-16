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

// ✅ CORS CORRIGIDO - permite localhost e produção Vercel
const allowedOrigins = [
  'http://localhost:8080',                          // Desenvolvimento local (Vite)
  'http://localhost:5173',                          // Vite padrão alternativo
  'https://casa-da-dinda-front.vercel.app',         // ✅ Produção Vercel (SEU DOMÍNIO)
  'https://casa-da-dinda-front-64bfscfyg-esters-projects-48d5751d.vercel.app', // ✅ Deploy preview
  process.env.FRONTEND_URL                          // Variável de ambiente (opcional)
].filter(Boolean); // Remove undefined

app.use(cors({
  origin: function (origin, callback) {
    // Permite requests sem origin (mobile apps, curl, postman, Render)
    if (!origin) return callback(null, true);
    
    // Permite se estiver na lista OU se terminar com .vercel.app
    if (allowedOrigins.indexOf(origin) !== -1 || origin.endsWith('.vercel.app')) {
      console.log('✅ Origem permitida pelo CORS:', origin);
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

// Servir arquivos estáticos (imagens de uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ✅ Rota de health check (para monitoramento Render)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Casa da Dinda API está rodando',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    message: '🏠 Casa da Dinda API',
    version: '1.0.0',
    status: 'Online',
    endpoints: {
      lares: '/api/lares',
      solicitacoes: '/api/solicitacoes',
      health: '/health'
    }
  });
});

// Rotas da API
app.use('/api/lares', laresRoutes);
app.use('/api/solicitacoes', solicitacoesRoutes);

// Middleware de tratamento de erros (deve ser o último)
app.use(errorHandler);

module.exports = app;

