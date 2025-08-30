import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { toEmail, toName, organizationName, invitedByName, role, inviteUrl, expiresAt } = body;

    // Validar dados obrigatórios
    if (!toEmail || !toName || !organizationName || !inviteUrl) {
      return NextResponse.json(
        { error: 'Dados obrigatórios faltando' },
        { status: 400 }
      );
    }

    if (!process.env.BREVO_API_KEY) {
      throw new Error('BREVO_API_KEY não configurada');
    }

    // Usar fetch API diretamente para Brevo (mais compatível)
    const emailData = {
      sender: {
        name: process.env.BREVO_SENDER_NAME || 'EntomoVigilância',
        email: process.env.BREVO_SENDER_EMAIL || 'noreply@entomonitec.app'
      },
      to: [
        {
          email: toEmail,
          name: toName
        }
      ],
      subject: `Convite para ${organizationName} - Sistema EntomoVigilância`,
      htmlContent: generateInviteEmailHTML({
        toName,
        organizationName,
        invitedByName,
        role,
        inviteUrl,
        expiresAt: new Date(expiresAt)
      })
    };

    // Tentativa 1: Enviar via Brevo API
    console.log('🔄 Tentando enviar email via Brevo...');
    
    try {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'api-key': process.env.BREVO_API_KEY
        },
        body: JSON.stringify(emailData)
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.log('⚠️ Brevo falhou, usando fallback. Erro:', errorData);
        throw new Error(`Brevo API error: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Email enviado via Brevo:', result);
      
      return NextResponse.json({ 
        success: true, 
        messageId: result.messageId,
        method: 'brevo'
      });
      
    } catch (brevoError) {
      // Fallback: Log detalhado para desenvolvimento
      console.log('📧 FALLBACK - Email que seria enviado:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📤 Para: ${toName} <${toEmail}>`);
      console.log(`📋 Assunto: Convite para ${organizationName}`);
      console.log(`🏢 Organização: ${organizationName}`);
      console.log(`👤 Convidado por: ${invitedByName}`);
      console.log(`🎯 Cargo: ${role}`);
      console.log(`🔗 Link: ${inviteUrl}`);
      console.log(`⏰ Expira: ${new Date(expiresAt).toLocaleString('pt-BR')}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ Email "enviado" via console (desenvolvimento)');
    }

    return NextResponse.json({ 
      success: true, 
      messageId: 'fallback-' + Date.now(),
      method: 'console'
    });

  } catch (error: any) {
    console.error('❌ Erro ao enviar email via API:', error);
    
    return NextResponse.json(
      { 
        error: 'Falha ao enviar email',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

function getRoleDisplayName(role: string): string {
  const roles = {
    'administrator': 'Administrador',
    'supervisor': 'Supervisor',
    'agent': 'Agente de Campo'
  };
  return roles[role as keyof typeof roles] || role;
}

function generateInviteEmailHTML(data: {
  toName: string;
  organizationName: string;
  invitedByName: string;
  role: string;
  inviteUrl: string;
  expiresAt: Date;
}): string {
  return `
  <!DOCTYPE html>
  <html lang="pt-BR">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Convite EntomoVigilância</title>
      <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
          .header { text-align: center; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: bold; color: #2563eb; margin-bottom: 10px; }
          .title { font-size: 20px; color: #333; margin-bottom: 20px; }
          .content { color: #555; margin-bottom: 30px; }
          .highlight { background-color: #eff6ff; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .button { display: inline-block; background-color: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #777; font-size: 14px; }
          .warning { color: #dc2626; font-weight: bold; }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <div class="logo">🦟 EntomoVigilância</div>
              <div class="title">Você foi convidado!</div>
          </div>
          
          <div class="content">
              <p>Olá <strong>${data.toName}</strong>,</p>
              
              <p>Você foi convidado(a) por <strong>${data.invitedByName}</strong> para fazer parte da organização <strong>${data.organizationName}</strong> no Sistema de Vigilância Entomológica.</p>
              
              <div class="highlight">
                  <p><strong>📋 Detalhes do Convite:</strong></p>
                  <ul>
                      <li><strong>Organização:</strong> ${data.organizationName}</li>
                      <li><strong>Seu cargo:</strong> ${getRoleDisplayName(data.role)}</li>
                      <li><strong>Convidado por:</strong> ${data.invitedByName}</li>
                      <li><strong>Expira em:</strong> ${data.expiresAt.toLocaleDateString('pt-BR')}</li>
                  </ul>
              </div>
              
              <p>Para aceitar o convite e completar seu cadastro, clique no botão abaixo:</p>
              
              <div style="text-align: center;">
                  <a href="${data.inviteUrl}" class="button">Aceitar Convite e Criar Conta</a>
              </div>
              
              <p><small>Ou copie e cole este link no seu navegador:<br>
              <a href="${data.inviteUrl}">${data.inviteUrl}</a></small></p>
              
              <p class="warning">⚠️ Este convite expira em ${data.expiresAt.toLocaleDateString('pt-BR')}. Após essa data, será necessário solicitar um novo convite.</p>
          </div>
          
          <div class="footer">
              <p>Este email foi enviado automaticamente pelo Sistema EntomoVigilância.</p>
              <p>Se você não esperava este convite, pode ignorar este email.</p>
          </div>
      </div>
  </body>
  </html>
  `;
}
