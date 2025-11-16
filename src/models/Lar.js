const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

const larSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true,
    required: true
  },
  hostName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // ✅ NOVO - Senha hasheada
  phone: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  address: { type: String, required: true },
  capacity: { type: Number, required: true },
  hasYard: { type: Boolean, default: false },
  hasFence: { type: Boolean, default: false },
  experience: { type: String },
  availableFor: { type: [String], default: [] },
  description: { type: String },
  imageUrl: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// ✅ Middleware para hashear senha antes de salvar
larSchema.pre('save', async function(next) {
  // Só hashear se a senha foi modificada (ou é nova)
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ✅ Método para comparar senhas
larSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Lar', larSchema);
