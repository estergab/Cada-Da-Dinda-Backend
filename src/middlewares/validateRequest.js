const Joi = require('joi');

// Validação para Lar
const larValidation = (req, res, next) => {
  const schema = Joi.object({
    hostName: Joi.string().max(100).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().length(2).required(),
    address: Joi.string().required(),
    capacity: Joi.number().integer().min(1).required(),
    hasYard: Joi.boolean(),
    hasFence: Joi.boolean(),
    experience: Joi.string().allow(''),
    availableFor: Joi.array()
      .items(Joi.string().valid('Cães', 'Gatos', 'Cães de Grande Porte', 'Filhotes'))
      .min(1) // ✅ Pelo menos 1 item
      .required(),
    description: Joi.string().allow('')
  });

  const { error } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors: error.details.map(detail => detail.message)
    });
  } // ✅ CHAVE FECHADA AQUI!

  next(); // ✅ Agora o next() será chamado corretamente
};

// Validação para Solicitação
const solicitacaoValidation = async (req, res, next) => {
  const schema = Joi.object({
    homeId: Joi.string().required(),
    requesterName: Joi.string().required(),
    requesterEmail: Joi.string().email().required(),
    requesterPhone: Joi.string().required(),
    petName: Joi.string().required(),
    petType: Joi.string().valid('dog', 'cat').required(),
    petAge: Joi.string().allow(''),
    petSize: Joi.string().allow(''),
    healthConditions: Joi.string().allow(''),
    behavior: Joi.string().allow(''),
    startDate: Joi.string().allow(''),
    duration: Joi.string().allow(''),
    message: Joi.string().allow('')
  });

  const { error } = schema.validate(req.body);
  
  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors: error.details.map(detail => detail.message)
    });
  } // ✅ CHAVE FECHADA AQUI!

  next(); // ✅ Agora funciona
};

module.exports = {
  larValidation,
  solicitacaoValidation
};
