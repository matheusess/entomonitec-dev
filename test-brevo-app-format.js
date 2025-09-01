// Script para testar a API do Brevo com o mesmo formato da aplicação
const https = require('https');

// Suas credenciais do Brevo
const BREVO_API_KEY = 'SUA_API_KEY_AQUI'; // Substitua pela sua API key
const SENDER_EMAIL = 'help@hubrentalcar.com';
const SENDER_NAME = 'Ajuda @ Ento Monitec';

async function testBrevoAPIAppFormat() {
  console.log('🧪 TESTANDO API DO BREVO COM FORMATO DA APLICAÇÃO...');
  console.log('═══════════════════════════════════════════════');
  
  try {
    // Dados do email no mesmo formato da aplicação (SEM TEMPLATE)
    const emailPayload = {
      to: [{
        email: 'filipeanj@outlook.com', // MUDE AQUI PARA SEU EMAIL
        name: 'Usuário Teste'
      }],
      sender: {
        name: SENDER_NAME,
        email: SENDER_EMAIL
      },
      subject: 'Convite para Organização Teste - Sistema EntomoVigilância',
      htmlContent: `
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Convite EntomoVigilância</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">EntomoVigilância</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Sistema de Vigilância Entomológica</p>
          </div>
          
          <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #10b981; margin-top: 0;">🎯 Você foi convidado!</h2>
            
            <p>Olá <strong>Usuário Teste</strong>!</p>
            
            <p>Você foi convidado por <strong>Admin Teste</strong> para participar da organização:</p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #374151;">🏢 Organização Teste</h3>
              <p style="margin: 0; color: #6b7280;">Cargo: <strong>Agente de Campo</strong></p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:3000/complete-signup?token=teste123" style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                ✅ Aceitar Convite
              </a>
            </div>
            
            <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #92400e;">
                ⏰ <strong>Importante:</strong> Este convite expira em <strong>08/09/2025</strong>
              </p>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              Se você não conseguir clicar no botão, copie e cole este link no seu navegador:<br>
              <a href="http://localhost:3000/complete-signup?token=teste123" style="color: #10b981; word-break: break-all;">http://localhost:3000/complete-signup?token=teste123</a>
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
            <p>Este é um email automático do sistema EntomoVigilância. Não responda a este email.</p>
          </div>
        </body>
        </html>
      `,
      textContent: `
        Convite para EntomoVigilância

        Olá Usuário Teste!

        Você foi convidado por Admin Teste para participar da organização Organização Teste como Agente de Campo.

        Link do convite: http://localhost:3000/complete-signup?token=teste123

        Este convite expira em: 08/09/2025
      `
    };

    console.log('📧 Dados do email (formato da aplicação):');
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
    console.error('❌ ERRO GERAL:', error);
  }
}

testBrevoAPIAppFormat();
