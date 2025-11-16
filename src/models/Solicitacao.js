const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

const solicitacaoSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true
  },
  homeId: {
    type: String,
    required: true,
    ref: 'Lar'
  },
  hostEmail: {
    type: String,
    required: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  requesterName: {
    type: String,
    required: true
  },
  requesterEmail: {
    type: String,
    required: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  requesterPassword: { // ✅ NOVO - Senha do tutor (hasheada)
    type: String,
    required: true
  },
  requesterPhone: {
    type: String,
    required: true
  },
  petName: {
    type: String,
    required: true
  },
  petType: {
    type: String,
    required: true,
    enum: ['dog', 'cat']
  },
  petAge: {
    type: String
  },
  petSize: {
    type: String
  },
  healthConditions: {
    type: String
  },
  behavior: {
    type: String
  },
  petImageUrl: {
    type: String
  },
  startDate: {
    type: String
  },
  duration: {
    type: String
  },
  message: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// ✅ Middleware para hashear senha antes de salvar
solicitacaoSchema.pre('save', async function(next) {
  if (!this.isModified('requesterPassword')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.requesterPassword = await bcrypt.hash(this.requesterPassword, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ✅ Método para comparar senhas
solicitacaoSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.requesterPassword);
};

module.exports = mongoose.model('Solicitacao', solicitacaoSchema);
