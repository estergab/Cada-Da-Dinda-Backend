# 🏠 Casa da Dinda - Backend API

## 📖 Sobre

API RESTful para a plataforma Casa da Dinda, que conecta pessoas que resgatam pets com anfitriões dispostos a oferecer lares temporários. Desenvolvida em Node.js com Express e MongoDB.

### 🚀 Status
**MVP (Minimum Viable Product)** - Em desenvolvimento

---

## 🛠️ Tecnologias

![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![Express](https://img.shields.io/badge/Express-4-lightgrey)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)
![Mongoose](https://img.shields.io/badge/Mongoose-8-red)

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB Atlas (Mongoose ODM)
- **File Upload**: Multer
- **Validation**: Joi
- **CORS**: Habilitado para desenvolvimento

---

## 🏗️ Estrutura de Pastas

backend/
├── src/
│ ├── models/ # Modelos Mongoose
│ ├── controllers/ # Controllers da API
│ ├── routes/ # Rotas da API
│ ├── middlewares/ # Middlewares customizados
│ ├── config/ # Configurações (DB, upload)
│ └── app.js # Configuração do Express
├── uploads/ # Arquivos enviados
│ ├── lares/ # Fotos dos lares
│ └── pets/ # Fotos dos pets
├── server.js # Entry point do servidor
├── ativar-lares.js # Script auxiliar
└── package.json

text

---

## 🚀 Instalação

### **Pré-requisitos**
- Node.js 18+
- npm ou yarn
- Conta MongoDB Atlas (ou MongoDB local)

### **1. Instalar Dependências**
cd backend
npm install

text

### **2. Configurar Variáveis de Ambiente**

Crie um arquivo `.env` na raiz do backend:

PORT=5000
NODE_ENV=development
DB_USER=seu_usuario_mongodb
DB_PASS=sua_senha_mongodb
DB_NAME=casa_da_dinda
DB_CLUSTER1=@cluster0.xxxxx.mongodb.net
DB_CLUSTER2=retryWrites=true&w=majority&appName=Cluster0
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880

text

### **3. Executar o Servidor**

**Modo desenvolvimento:**
npm run dev

text

**Modo produção:**
npm start

text

O servidor estará rodando em `http://localhost:5000`

### **4. Script de Ativação de Lares**
Para ativar lares no banco de dados:
node ativar-lares.js

text

---

## 📊 Modelos de Dados

### **Lar (Host/Anfitrião)**
{
id: String, // UUID único
hostName: String, // Nome do anfitrião (obrigatório)
email: String, // Email único (obrigatório)
phone: String, // Telefone (obrigatório)
city: String, // Cidade (obrigatório)
state: String, // Estado - 2 caracteres (obrigatório)
address: String, // Endereço (obrigatório)
capacity: Number, // Capacidade mínima: 1 (obrigatório)
hasYard: Boolean, // Possui quintal
hasFence: Boolean, // Possui cerca
experience: String, // Experiência com pets
availableFor: [String], // ["Cães", "Gatos", "Cães de Grande Porte", "Filhotes"]
description: String, // Descrição do lar
imageUrl: String, // URL da foto
isActive: Boolean, // Ativo (padrão: true)
createdAt: Date,
updatedAt: Date
}

text

### **Solicitação de Estadia**
{
id: String, // UUID único
homeId: String, // Referência ao Lar
hostEmail: String, // Email do anfitrião
requesterName: String, // Nome do solicitante (obrigatório)
requesterEmail: String, // Email do solicitante (obrigatório)
requesterPhone: String, // Telefone (obrigatório)
petName: String, // Nome do pet (obrigatório)
petType: String, // "dog" ou "cat"
petAge: String, // Idade do pet
petSize: String, // Porte do pet
healthConditions: String,// Condições de saúde
behavior: String, // Comportamento
petImageUrl: String, // URL da foto do pet
startDate: String, // Data de início
duration: String, // Duração da estadia
message: String, // Mensagem adicional
status: String, // "pending", "approved", "rejected"
createdAt: Date,
updatedAt: Date
}

text

---

## 🔌 API Endpoints

### **Lares (/api/lares)**
POST / # Criar lar (com upload de imagem)
GET / # Listar lares ativos
GET /:id # Buscar lar por ID
GET /email/:email # Buscar lar por email
PUT /:id # Atualizar lar (com upload)
PATCH /:id/toggle-active # Ativar/desativar lar (usado no frontend)
DELETE /:id # Deletar lar permanentemente (administrativo/LGPD)

text

### **Solicitações (/api/solicitacoes)**
POST / # Criar solicitação (com upload de foto do pet)
GET / # Listar todas solicitações
GET /email/:email # Buscar solicitações por email do solicitante
GET /lar/:homeId # Buscar solicitações de um lar específico
GET /:id # Buscar solicitação por ID
PUT /:id # Atualizar solicitação
PATCH /:id/aceitar # Aceitar solicitação (muda status para "approved")
PATCH /:id/negar # Negar solicitação (muda status para "rejected")
DELETE /:id # Deletar solicitação

text

---

## 🔧 Middlewares

### **Multer (Upload de Arquivos)**
- Configuração dinâmica baseada na rota
- Formatos suportados: JPEG, JPG, PNG, WEBP
- Limite: 5MB por arquivo
- Pastas organizadas: `/uploads/lares/` e `/uploads/pets/`

### **Validação com Joi**
- Validação de dados de entrada para lares e solicitações
- Validação de emails e telefones
- Validação de tipos de pet permitidos

### **Error Handler**
- Middleware centralizado de tratamento de erros
- Logs detalhados para desenvolvimento
- Respostas padronizadas JSON

---

## 🚧 Próximas Funcionalidades

- [ ] Sistema de autenticação JWT
- [ ] Notificações por email (Nodemailer)
- [ ] Documentação Swagger/OpenAPI
- [ ] Testes automatizados (Jest)
- [ ] Rate limiting
- [ ] Cache Redis
- [ ] Deploy no Railway/Render

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/NovaFeature`)
3. Commit suas mudanças (`git commit -m 'Add NovaFeature'`)
4. Push para a branch (`git push origin feature/NovaFeature`)
5. Abra um Pull Request

---

## 📝 Licença

MIT License - Veja o arquivo `LICENSE` para detalhes

---

## 📞 Suporte

Para dúvidas e suporte, abra uma issue no GitHub