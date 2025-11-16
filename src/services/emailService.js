const nodemailer = require('nodemailer');

// ✅ Configurar transporter com Outlook/Office365
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.office365.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false, // true para 465, false para outros ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    ciphers: 'SSLv3'
  }
});

// ✅ Verificar conexão (opcional, para debug)
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Erro na configuração do email:', error);
  } else {
    console.log('✅ Servidor de email pronto para enviar mensagens');
  }
});

// ✅ ENVIAR EMAIL PARA ANFITRIÃO (Nova Solicitação)
const sendNewRequestEmail = async (hostEmail, hostName, requesterName, petName, petType) => {
  const loginUrl = `${process.env.FRONTEND_URL}/solicitacoes-login`;
  
  const petTypeLabel = petType === 'dog' ? '🐕 Cão' : '🐱 Gato';
  
  const mailOptions = {
    from: `"Casa da Dinda" <${process.env.EMAIL_USER}>`,
    to: hostEmail,
    subject: '🏠 Nova Solicitação de Hospedagem Recebida!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Casa da Dinda</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Conectando pets a lares temporários com amor</p>
        </div>
        
        <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1f2937; margin-top: 0;">Olá, ${hostName}! 👋</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #374151;">
            Você recebeu uma <strong>nova solicitação de hospedagem</strong> na Casa da Dinda!
          </p>
          
          <div style="background-color: white; padding: 25px; border-radius: 8px; margin: 25px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <h3 style="margin-top: 0; color: #374151; font-size: 18px; border-bottom: 2px solid #667eea; padding-bottom: 10px;">
              📋 Detalhes da Solicitação
            </h3>
            <p style="margin: 12px 0; color: #4b5563;"><strong>👤 Tutor:</strong> ${requesterName}</p>
            <p style="margin: 12px 0; color: #4b5563;"><strong>🐾 Pet:</strong> ${petName}</p>
            <p style="margin: 12px 0; color: #4b5563;"><strong>🏷️ Tipo:</strong> ${petTypeLabel}</p>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; color: #374151;">
            Para visualizar todos os detalhes e <strong>responder à solicitação</strong>, clique no botão abaixo:
          </p>
          
          <div style="text-align: center; margin: 35px 0;">
            <a href="${loginUrl}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; padding: 15px 40px; text-decoration: none; 
                      border-radius: 8px; font-weight: bold; display: inline-block;
                      font-size: 16px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.4);">
              🔐 Acessar Minhas Solicitações
            </a>
          </div>
          
          <div style="background-color: #eff6ff; padding: 15px; border-radius: 6px; border-left: 4px solid #3b82f6;">
            <p style="font-size: 13px; color: #1e40af; margin: 0;">
              💡 <strong>Dica:</strong> Responda rapidamente para não perder a oportunidade de ajudar este pet!
            </p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="font-size: 13px; color: #9ca3af; margin: 5px 0;">
            Caso o botão não funcione, copie e cole este link no navegador:
          </p>
          <p style="font-size: 13px; word-break: break-all;">
            <a href="${loginUrl}" style="color: #667eea;">${loginUrl}</a>
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
          <p>Casa da Dinda © 2025 - Todos os direitos reservados</p>
          <p style="margin-top: 5px;">❤️ Conectando pets a lares temporários com amor</p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email enviado para anfitrião:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error);
    return { success: false, error: error.message };
  }
};

// ✅ ENVIAR EMAIL PARA TUTOR (Solicitação Aprovada)
const sendRequestApprovedEmail = async (tutorEmail, tutorName, hostName, petName) => {
  const loginUrl = `${process.env.FRONTEND_URL}/solicitacoes-login`;
  
  const mailOptions = {
    from: `"Casa da Dinda" <${process.env.EMAIL_USER}>`,
    to: tutorEmail,
    subject: '✅ Sua Solicitação foi Aprovada!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Boa Notícia!</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Sua solicitação foi aprovada</p>
        </div>
        
        <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1f2937; margin-top: 0;">Olá, ${tutorName}! ✨</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #374151;">
            Temos uma excelente notícia! Sua solicitação de hospedagem para <strong>${petName}</strong> 
            foi <strong style="color: #10b981;">APROVADA</strong>! 🎊
          </p>
          
          <div style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); 
                      padding: 25px; border-radius: 8px; margin: 25px 0; 
                      border-left: 5px solid #10b981;">
            <h3 style="margin-top: 0; color: #065f46; font-size: 20px;">
              ✅ Status: APROVADO
            </h3>
            <p style="margin: 12px 0; color: #047857;"><strong>🏠 Anfitrião:</strong> ${hostName}</p>
            <p style="margin: 12px 0; color: #047857;"><strong>🐾 Pet:</strong> ${petName}</p>
            <p style="margin: 12px 0; color: #047857;"><strong>📅 Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; color: #374151;">
            O anfitrião <strong>${hostName}</strong> aceitou hospedar seu pet com muito carinho! 💚
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #374151;">
            Acesse a plataforma para visualizar os <strong>detalhes completos</strong> e entrar em 
            <strong>contato direto</strong> com o anfitrião:
          </p>
          
          <div style="text-align: center; margin: 35px 0;">
            <a href="${loginUrl}" 
               style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
                      color: white; padding: 15px 40px; text-decoration: none; 
                      border-radius: 8px; font-weight: bold; display: inline-block;
                      font-size: 16px; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.4);">
              📱 Ver Detalhes da Solicitação
            </a>
          </div>
          
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b;">
            <p style="font-size: 13px; color: #92400e; margin: 0;">
              ⭐ <strong>Próximos Passos:</strong> Entre em contato com ${hostName} para combinar 
              os detalhes finais da hospedagem do ${petName}!
            </p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="font-size: 13px; color: #9ca3af; margin: 5px 0;">
            Caso o botão não funcione, copie e cole este link no navegador:
          </p>
          <p style="font-size: 13px; word-break: break-all;">
            <a href="${loginUrl}" style="color: #10b981;">${loginUrl}</a>
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
          <p>Casa da Dinda © 2025 - Todos os direitos reservados</p>
          <p style="margin-top: 5px;">❤️ Conectando pets a lares temporários com amor</p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email de aprovação enviado:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error);
    return { success: false, error: error.message };
  }
};

// ✅ ENVIAR EMAIL PARA TUTOR (Solicitação Negada)
const sendRequestRejectedEmail = async (tutorEmail, tutorName, hostName, petName) => {
  const loginUrl = `${process.env.FRONTEND_URL}/solicitacoes-login`;
  const searchUrl = `${process.env.FRONTEND_URL}/lares`;
  
  const mailOptions = {
    from: `"Casa da Dinda" <${process.env.EMAIL_USER}>`,
    to: tutorEmail,
    subject: '📬 Atualização sobre sua Solicitação',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Casa da Dinda</h1>
          <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Atualização sobre sua solicitação</p>
        </div>
        
        <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1f2937; margin-top: 0;">Olá, ${tutorName}</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #374151;">
            Infelizmente, sua solicitação de hospedagem para <strong>${petName}</strong> 
            não pôde ser aceita desta vez pelo anfitrião <strong>${hostName}</strong>.
          </p>
          
          <div style="background-color: #f3f4f6; padding: 25px; border-radius: 8px; 
                      margin: 25px 0; border-left: 5px solid #6b7280;">
            <h3 style="margin-top: 0; color: #374151; font-size: 18px;">
              📋 Status da Solicitação
            </h3>
            <p style="margin: 12px 0; color: #4b5563;"><strong>🏠 Anfitrião:</strong> ${hostName}</p>
            <p style="margin: 12px 0; color: #4b5563;"><strong>🐾 Pet:</strong> ${petName}</p>
            <p style="margin: 12px 0; color: #ef4444;"><strong>❌ Status:</strong> Não Aprovado</p>
          </div>
          
          <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <p style="font-size: 16px; line-height: 1.6; color: #1e40af; margin: 0;">
              <strong>🌟 Mas não desanime!</strong> Existem muitos outros lares disponíveis na 
              Casa da Dinda que podem ser perfeitos para o <strong>${petName}</strong>!
            </p>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; color: #374151; text-align: center;">
            Continue buscando o lar ideal:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${searchUrl}" 
               style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); 
                      color: white; padding: 15px 40px; text-decoration: none; 
                      border-radius: 8px; font-weight: bold; display: inline-block;
                      font-size: 16px; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.4);
                      margin-bottom: 15px;">
              🔍 Buscar Outros Lares
            </a>
            
            <br>
            
            <a href="${loginUrl}" 
               style="background-color: white; color: #374151; padding: 12px 35px; 
                      text-decoration: none; border-radius: 8px; font-weight: 500; 
                      display: inline-block; font-size: 15px; border: 2px solid #e5e7eb;">
              📱 Ver Minhas Solicitações
            </a>
          </div>
          
          <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b;">
            <p style="font-size: 13px; color: #92400e; margin: 0;">
              💡 <strong>Dica:</strong> Quanto mais detalhes você fornecer sobre o ${petName}, 
              maiores as chances de encontrar o lar perfeito!
            </p>
          </div>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="font-size: 13px; color: #9ca3af; text-align: center;">
            Estamos aqui para ajudar você e o ${petName} a encontrarem o melhor lar temporário! 🏡
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
          <p>Casa da Dinda © 2025 - Todos os direitos reservados</p>
          <p style="margin-top: 5px;">❤️ Conectando pets a lares temporários com amor</p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email de rejeição enviado:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendNewRequestEmail,
  sendRequestApprovedEmail,
  sendRequestRejectedEmail,
};
