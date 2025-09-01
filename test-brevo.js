// Script para testar a API do Brevo
const https = require('https');

// Suas credenciais do Brevo
const BREVO_API_KEY = 'SUA_API_KEY_AQUI'; // Substitua pela sua API key
const SENDER_EMAIL = 'ajuda@entomonitec.com.br';
const SENDER_NAME = 'Ajuda @ Ento Monitec';

async function testBrevoAPI() {
  console.log('🧪 TESTANDO API DO BREVO...');
  console.log('═══════════════════════════════════════════════');
  
  try {
    // Dados do email de teste
    const emailPayload = {
      to: [{
        email: 'teste@exemplo.com', // MUDE AQUI PARA SEU EMAIL
        name: 'Usuário Teste'
      }],
      templateId: 1, // ID do template no Brevo
      params: {
        NOME: 'Usuário Teste',
        ORGANIZACAO: 'Organização Teste',
        CONVIDADO_POR: 'Admin Teste',
        CARGO: 'Agente de Campo',
        LINK_CONVITE: 'http://localhost:3000/complete-signup?token=teste123',
        DATA_EXPIRACAO: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')
      }
    };

    console.log('📧 Dados do email:');
    console.log(JSON.stringify(emailPayload, null, 2));
    console.log('');

    // Fazer a requisição para o Brevo
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY
      },
      body: JSON.stringify(emailPayload)
    });

    console.log('📡 Status da resposta:', response.status);
    console.log('📡 Headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorData = await response.json();
      console.log('❌ ERRO DO BREVO:');
      console.log(JSON.stringify(errorData, null, 2));
      return;
    }

    const result = await response.json();
    console.log('✅ SUCESSO! Resposta do Brevo:');
    console.log(JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('❌ ERRO GERAL:', error.message);
  }
}

// Executar o teste
testBrevoAPI();
