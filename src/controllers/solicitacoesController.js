const Solicitacao = require('../models/Solicitacao');
const Lar = require('../models/Lar');
const path = require('path');
const fs = require('fs');
const {
  sendNewRequestEmail,
  sendRequestApprovedEmail,
  sendRequestRejectedEmail
} = require('../services/emailService');

// ✅ VERIFICAR SE TUTOR JÁ EXISTE (para RequestStay)
exports.checkTutorEmail = async (req, res, next) => {
  try {
    const email = req.params.email.toLowerCase();
    const solicitacao = await Solicitacao.findOne({ requesterEmail: email });

    if (solicitacao) {
      return res.json({
        success: true,
        exists: true,
        message: 'Email já cadastrado como tutor'
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

// ✅ AUTENTICAR TUTOR (verificar senha)
exports.authenticateTutor = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const solicitacao = await Solicitacao.findOne({ requesterEmail: email.toLowerCase() });

    if (!solicitacao) {
      return res.status(404).json({
        success: false,
        message: 'Email não encontrado'
      });
    }

    const isMatch = await solicitacao.comparePassword(password);

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
        email: solicitacao.requesterEmail,
        name: solicitacao.requesterName
      }
    });
  } catch (error) {
    next(error);
  }
};

// ✅ Criar solicitação (COM SENHA E EMAIL)
exports.createSolicitacao = async (req, res, next) => {
  try {
    const petImageUrl = req.file ? `/uploads/pets/${req.file.filename}` : null;

    // ✅ Verificar se a senha foi fornecida
    if (!req.body.requesterPassword) {
      return res.status(400).json({
        success: false,
        message: 'Senha é obrigatória'
      });
    }

    // ✅ Buscar dados do lar e anfitrião
    const lar = await Lar.findById(req.body.homeId);
    
    if (!lar) {
      return res.status(400).json({ success: false, message: 'Lar não encontrado' });
    }

    const solicitacao = new Solicitacao({
      ...req.body,
      requesterEmail: req.body.requesterEmail.toLowerCase(),
      hostEmail: lar.email,
      petImageUrl,
      status: 'pending'
    });

    await solicitacao.save();

    // ✅ ENVIAR EMAIL PARA O ANFITRIÃO
    try {
      await sendNewRequestEmail(
        lar.email,
        lar.hostName,
        req.body.requesterName,
        req.body.petName,
        req.body.petType
      );
      console.log('✅ Email de nova solicitação enviado para:', lar.email);
    } catch (emailError) {
      console.error('⚠️ Erro ao enviar email (solicitação criada mesmo assim):', emailError);
    }

    const solicitacaoResponse = solicitacao.toObject();
    delete solicitacaoResponse.requesterPassword;

    res.status(201).json({ success: true, data: solicitacaoResponse });
  } catch (error) {
    next(error);
  }
};

// Listar todas as solicitações
exports.getSolicitacoes = async (req, res, next) => {
  try {
    const solicitacoes = await Solicitacao.find().select('-requesterPassword');
    res.json({ success: true, data: solicitacoes });
  } catch (error) {
    next(error);
  }
};

// Listar solicitações por lar (homeId)
exports.getSolicitacoesByLar = async (req, res, next) => {
  try {
    const solicitacoes = await Solicitacao.find({ homeId: req.params.homeId }).select('-requesterPassword');
    res.json({ success: true, data: solicitacoes });
  } catch (error) {
    next(error);
  }
};

// ✅ Listar solicitações por email (tutor OU anfitrião)
exports.getSolicitacoesByEmail = async (req, res, next) => {
  try {
    const email = req.params.email.toLowerCase();
    const solicitacoes = await Solicitacao.find({
      $or: [
        { requesterEmail: email },
        { hostEmail: email }
      ]
    }).select('-requesterPassword');

    res.json({ success: true, data: solicitacoes });
  } catch (error) {
    next(error);
  }
};

// Buscar solicitação por ID
exports.getSolicitacaoById = async (req, res, next) => {
  try {
    const solicitacao = await Solicitacao.findOne({ id: req.params.id }).select('-requesterPassword');

    if (!solicitacao) {
      return res.status(404).json({ success: false, message: 'Solicitação não encontrada' });
    }

    res.json({ success: true, data: solicitacao });
  } catch (error) {
    next(error);
  }
};

// ✅ ACEITAR SOLICITAÇÃO (COM EMAIL)
exports.aceitarSolicitacao = async (req, res, next) => {
  try {
    const solicitacao = await Solicitacao.findOneAndUpdate(
      { id: req.params.id },
      { status: 'approved' },
      { new: true }
    ).select('-requesterPassword');

    if (!solicitacao) {
      return res.status(404).json({ success: false, message: 'Solicitação não encontrada' });
    }

    // ✅ Buscar dados do anfitrião
    const lar = await Lar.findOne({ email: solicitacao.hostEmail });

    // ✅ ENVIAR EMAIL PARA O TUTOR
    try {
      await sendRequestApprovedEmail(
        solicitacao.requesterEmail,
        solicitacao.requesterName,
        lar?.hostName || 'Anfitrião',
        solicitacao.petName
      );
      console.log('✅ Email de aprovação enviado para:', solicitacao.requesterEmail);
    } catch (emailError) {
      console.error('⚠️ Erro ao enviar email:', emailError);
    }

    res.json({
      success: true,
      data: solicitacao,
      message: 'Solicitação aprovada com sucesso! Email enviado ao tutor.'
    });
  } catch (error) {
    next(error);
  }
};

// ✅ NEGAR SOLICITAÇÃO (COM EMAIL)
exports.negarSolicitacao = async (req, res, next) => {
  try {
    const solicitacao = await Solicitacao.findOneAndUpdate(
      { id: req.params.id },
      { status: 'rejected' },
      { new: true }
    ).select('-requesterPassword');

    if (!solicitacao) {
      return res.status(404).json({ success: false, message: 'Solicitação não encontrada' });
    }

    // ✅ Buscar dados do anfitrião
    const lar = await Lar.findOne({ email: solicitacao.hostEmail });

    // ✅ ENVIAR EMAIL PARA O TUTOR
    try {
      await sendRequestRejectedEmail(
        solicitacao.requesterEmail,
        solicitacao.requesterName,
        lar?.hostName || 'Anfitrião',
        solicitacao.petName
      );
      console.log('✅ Email de rejeição enviado para:', solicitacao.requesterEmail);
    } catch (emailError) {
      console.error('⚠️ Erro ao enviar email:', emailError);
    }

    res.json({
      success: true,
      data: solicitacao,
      message: 'Solicitação negada. Email enviado ao tutor.'
    });
  } catch (error) {
    next(error);
  }
};

// Atualizar solicitação
exports.updateSolicitacao = async (req, res, next) => {
  try {
    delete req.body.requesterPassword;

    const solicitacao = await Solicitacao.findOneAndUpdate(
      { id: req.params.id },
      req.body,
      { new: true }
    ).select('-requesterPassword');

    if (!solicitacao) {
      return res.status(404).json({ success: false, message: 'Solicitação não encontrada' });
    }

    res.json({ success: true, data: solicitacao });
  } catch (error) {
    next(error);
  }
};

// Deletar solicitação
exports.deleteSolicitacao = async (req, res, next) => {
  try {
    const solicitacao = await Solicitacao.findOneAndDelete({ id: req.params.id });

    if (!solicitacao) {
      return res.status(404).json({ success: false, message: 'Solicitação não encontrada' });
    }

    if (solicitacao.petImageUrl) {
      const imagePath = path.join(__dirname, '../../', solicitacao.petImageUrl);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    res.json({ success: true, message: 'Solicitação removida com sucesso' });
  } catch (error) {
    next(error);
  }
};
