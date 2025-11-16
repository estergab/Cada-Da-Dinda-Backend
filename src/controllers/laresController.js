const Lar = require('../models/Lar');
const path = require('path');
const fs = require('fs');

// ✅ VERIFICAR SE EMAIL JÁ EXISTE (para RegisterHome)
exports.checkEmail = async (req, res, next) => {
  try {
    const email = req.params.email.toLowerCase();
    const lar = await Lar.findOne({ email });
    
    if (lar) {
      return res.json({ 
        success: true, 
        exists: true,
        message: 'Email já cadastrado' 
      });
    }
    
    res.json({ 
      success: true, 
      exists: false,
      message: 'Email disponível' 
    });
  } catch (error) {
    next(error);
  }
};

// ✅ AUTENTICAR ANFITRIÃO (verificar senha)
exports.authenticateHost = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    const lar = await Lar.findOne({ email: email.toLowerCase() });
    
    if (!lar) {
      return res.status(404).json({
        success: false,
        message: 'Email não encontrado'
      });
    }
    
    const isMatch = await lar.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Senha incorreta'
      });
    }
    
    res.json({
      success: true,
      message: 'Autenticação bem-sucedida',
      data: {
        email: lar.email,
        hostName: lar.hostName
      }
    });
  } catch (error) {
    next(error);
  }
};

// ✅ Criar lar (com senha)
exports.createLar = async (req, res, next) => {
  try {
    const imageUrl = req.file ? `/uploads/lares/${req.file.filename}` : null;
    
    // Verificar se a senha foi fornecida
    if (!req.body.password) {
      return res.status(400).json({
        success: false,
        message: 'Senha é obrigatória'
      });
    }
    
    const lar = new Lar({
      ...req.body,
      email: req.body.email.toLowerCase(), // Normalizar email
      imageUrl,
      availableFor: Array.isArray(req.body.availableFor)
        ? req.body.availableFor
        : req.body.availableFor ? [req.body.availableFor] : []
    });
    
    await lar.save();
    
    // Não retornar a senha no response
    const larResponse = lar.toObject();
    delete larResponse.password;
    
    res.status(201).json({ success: true, data: larResponse });
  } catch (error) {
    next(error);
  }
};

// ✅ Listar todos os lares ATIVOS
exports.getLares = async (req, res, next) => {
  try {
    const lares = await Lar.find({ isActive: true }).select('-password'); // Não retornar senha
    res.json({ success: true, data: lares });
  } catch (error) {
    next(error);
  }
};

// ✅ Buscar lar por ID
exports.getLarById = async (req, res, next) => {
  try {
    const lar = await Lar.findById(req.params.id).select('-password');
    
    if (!lar) {
      return res.status(404).json({
        success: false,
        message: 'Lar não encontrado'
      });
    }
    
    res.json({ success: true, data: lar });
  } catch (error) {
    next(error);
  }
};

// ✅ BUSCAR LAR POR EMAIL
exports.getLarByEmail = async (req, res, next) => {
  try {
    const lar = await Lar.findOne({ email: req.params.email.toLowerCase() }).select('-password');
    
    if (!lar) {
      return res.status(404).json({
        success: false,
        message: 'Lar não encontrado'
      });
    }
    
    res.json({ success: true, data: lar });
  } catch (error) {
    next(error);
  }
};

// ✅ ATUALIZAR LAR
exports.updateLar = async (req, res, next) => {
  try {
    const lar = await Lar.findById(req.params.id);
    
    if (!lar) {
      return res.status(404).json({
        success: false,
        message: 'Lar não encontrado'
      });
    }
    
    // Se enviou nova imagem, deletar a antiga
    if (req.file && lar.imageUrl) {
      const oldImagePath = path.join(__dirname, '../../', lar.imageUrl);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }
    
    const imageUrl = req.file
      ? `/uploads/lares/${req.file.filename}`
      : lar.imageUrl;
    
    const updatedData = {
      ...req.body,
      imageUrl,
      availableFor: Array.isArray(req.body.availableFor)
        ? req.body.availableFor
        : req.body.availableFor ? [req.body.availableFor] : lar.availableFor,
      updatedAt: Date.now()
    };
    
    // Não permitir atualizar senha por esta rota
    delete updatedData.password;
    
    const updatedLar = await Lar.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    ).select('-password');
    
    res.json({
      success: true,
      data: updatedLar,
      message: 'Lar atualizado com sucesso!'
    });
  } catch (error) {
    next(error);
  }
};

// ✅ ATIVAR/DESATIVAR LAR
exports.toggleActiveLar = async (req, res, next) => {
  try {
    const lar = await Lar.findById(req.params.id);
    
    if (!lar) {
      return res.status(404).json({
        success: false,
        message: 'Lar não encontrado'
      });
    }
    
    lar.isActive = !lar.isActive;
    lar.updatedAt = Date.now();
    await lar.save();
    
    const status = lar.isActive ? 'ativado' : 'desativado';
    
    const larResponse = lar.toObject();
    delete larResponse.password;
    
    res.json({
      success: true,
      data: larResponse,
      message: `Lar ${status} com sucesso!`
    });
  } catch (error) {
    next(error);
  }
};

// ✅ Deletar lar (permanentemente)
exports.deleteLar = async (req, res, next) => {
  try {
    const lar = await Lar.findByIdAndDelete(req.params.id);
    
    if (!lar) {
      return res.status(404).json({
        success: false,
        message: 'Lar não encontrado'
      });
    }
    
    // Remover imagem
    if (lar.imageUrl) {
      const imagePath = path.join(__dirname, '../../', lar.imageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    res.json({
      success: true,
      message: 'Lar removido com sucesso'
    });
  } catch (error) {
    next(error);
  }
};
