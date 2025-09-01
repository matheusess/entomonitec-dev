// Script para testar o sistema de email da aplicação
const { EmailService } = require('./src/services/emailService.ts');

async function testEmailService() {
  console.log('🧪 TESTANDO EMAIL SERVICE DA APLICAÇÃO...');
  console.log('═══════════════════════════════════════════════');
  
  try {
    const emailData = {
      toEmail: 'filipeanj@outlook.com',
      toName: 'Usuário Teste',
      organizationName: 'Organização Teste',
      invitedByName: 'Admin Teste',
      role: 'agent',
      inviteUrl: 'http://localhost:3000/complete-signup?token=teste123',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias
    };

    console.log('📧 Dados do email:');
    console.log(JSON.stringify(emailData, null, 2));
    console.log('');

    await EmailService.sendInviteEmail(emailData);
    
    console.log('✅ EMAIL ENVIADO COM SUCESSO!');
    
  } catch (error) {
    console.error('❌ ERRO:', error.message);
    console.error('❌ Stack:', error.stack);
  }
}

testEmailService();
