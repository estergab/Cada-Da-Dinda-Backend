const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// ✅ Definir caminhos das pastas de upload
const uploadsDir = path.join(__dirname, '../../uploads');
const laresDir = path.join(__dirname, '../../uploads/lares');
const petsDir = path.join(__dirname, '../../uploads/pets');

// ✅ Função para criar diretórios se não existirem
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Pasta criada: ${dirPath}`);
  }
};

// ✅ Criar pastas necessárias ao iniciar
ensureDirectoryExists(uploadsDir);
ensureDirectoryExists(laresDir);
ensureDirectoryExists(petsDir);

// ✅ Configuração de storage do multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = '';
    
    // Determinar pasta baseado na rota
    if (req.baseUrl.includes('lares')) {
      uploadPath = laresDir;
    } else if (req.baseUrl.includes('solicitacoes')) {
      uploadPath = petsDir;
    } else {
      return cb(new Error('Rota de upload inválida'), null);
    }
    
    // ✅ Garantir que a pasta existe antes de salvar
    ensureDirectoryExists(uploadPath);
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Gerar nome único: uuid-timestamp.extensão
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}-${Date.now()}${ext}`;
    cb(null, filename);
  }
});

// ✅ Filtro de arquivos (apenas imagens)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Apenas imagens são permitidas (JPG, JPEG, PNG, WEBP, GIF)'));
  }
};

// ✅ Configuração final do multer
const upload = multer({
  storage: storage,
  limits: { 
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880 // 5MB padrão
  },
  fileFilter: fileFilter
});

module.exports = upload;
