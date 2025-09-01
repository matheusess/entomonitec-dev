export interface IInviteEmailData {
  toEmail: string;
  toName: string;
  organizationName: string;
  invitedByName: string;
  role: string;
  inviteUrl: string;
  expiresAt: Date;
}

export class EmailService {
  /**
   * Envia email de convite (TEMPLATE ORIGINAL RESTAURADO)
   */
  static async sendInviteEmail(data: IInviteEmailData): Promise<void> {
    try {
      console.log('📧 [EMAIL DEBUG] Iniciando envio de convite via Brevo para:', data.toEmail);
      console.log('📧 [EMAIL DEBUG] Dados do convite:', {
        toEmail: data.toEmail,
        toName: data.toName,
        organizationName: data.organizationName,
        invitedByName: data.invitedByName,
        role: data.role,
        inviteUrl: data.inviteUrl,
        expiresAt: data.expiresAt
      });

      // Verificar se a API key do Brevo está configurada
      const brevoApiKey = process.env.NEXT_PUBLIC_BREVO_API_KEY;
      console.log('📧 [EMAIL DEBUG] BREVO_API_KEY configurada:', brevoApiKey ? '✅ SIM' : '❌ NÃO');
      console.log('📧 [EMAIL DEBUG] BREVO_API_KEY (primeiros 10 chars):', brevoApiKey ? brevoApiKey.substring(0, 10) + '...' : 'N/A');
      
      if (!brevoApiKey) {
        console.warn('⚠️ [EMAIL DEBUG] Brevo não configurado ou falhou, usando simulação');
        throw new Error('BREVO_API_KEY não configurada');
      }

      // Dados para o email simples (SEM TEMPLATE)
      const senderName = process.env.NEXT_PUBLIC_BREVO_SENDER_NAME || 'EntomoVigilância';
      const senderEmail = process.env.NEXT_PUBLIC_BREVO_SENDER_EMAIL || 'noreply@entomonitec.com.br';
      
      console.log('📧 [EMAIL DEBUG] Configurações do remetente:');
      console.log('📧 [EMAIL DEBUG] SENDER_NAME:', senderName);
      console.log('📧 [EMAIL DEBUG] SENDER_EMAIL:', senderEmail);
      
      const emailPayload = {
        to: [{
          email: data.toEmail,
          name: data.toName
        }],
        sender: {
          name: senderName,
          email: senderEmail
        },
        subject: `Convite para ${data.organizationName} - Sistema EntomoVigilância`,
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
              
              <p>Olá <strong>${data.toName}</strong>!</p>
              
              <p>Você foi convidado por <strong>${data.invitedByName}</strong> para participar da organização:</p>
              
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin: 0 0 10px 0; color: #374151;">🏢 ${data.organizationName}</h3>
                <p style="margin: 0; color: #6b7280;">Cargo: <strong>${this.getRoleDisplayName(data.role)}</strong></p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.inviteUrl}" style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                  ✅ Aceitar Convite
                </a>
              </div>
              
              <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #92400e;">
                  ⏰ <strong>Importante:</strong> Este convite expira em <strong>${data.expiresAt.toLocaleDateString('pt-BR')}</strong>
                </p>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
                Se você não conseguir clicar no botão, copie e cole este link no seu navegador:<br>
                <a href="${data.inviteUrl}" style="color: #10b981; word-break: break-all;">${data.inviteUrl}</a>
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

          Olá ${data.toName}!

          Você foi convidado por ${data.invitedByName} para participar da organização ${data.organizationName} como ${this.getRoleDisplayName(data.role)}.

          Link do convite: ${data.inviteUrl}

          Este convite expira em: ${data.expiresAt.toLocaleDateString('pt-BR')}
        `
      };

      console.log('📧 [EMAIL DEBUG] Enviando requisição para API do Brevo...');
      console.log('📧 [EMAIL DEBUG] URL:', 'https://api.brevo.com/v3/smtp/email');
      console.log('📧 [EMAIL DEBUG] Payload (resumido):', {
        to: emailPayload.to,
        sender: emailPayload.sender,
        subject: emailPayload.subject,
        htmlContentLength: emailPayload.htmlContent.length,
        textContentLength: emailPayload.textContent.length
      });

      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'api-key': brevoApiKey
        },
        body: JSON.stringify(emailPayload)
      });

      console.log('📧 [EMAIL DEBUG] Resposta recebida:');
      console.log('📧 [EMAIL DEBUG] Status:', response.status);
      console.log('📧 [EMAIL DEBUG] Status Text:', response.statusText);
      console.log('📧 [EMAIL DEBUG] Headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.json();
        console.error('📧 [EMAIL DEBUG] Erro da API do Brevo:', errorData);
        throw new Error(errorData.message || `Erro na API do Brevo: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('📧 [EMAIL DEBUG] Resposta de sucesso do Brevo:', result);
      console.log('✅ EMAIL ENVIADO VIA BREVO:');
      console.log(`Para: ${data.toEmail}`);
      console.log(`Organização: ${data.organizationName}`);
      console.log(`Link: ${data.inviteUrl}`);
      
    } catch (error: any) {
      console.error('❌ [EMAIL DEBUG] Erro ao enviar email via Brevo:', error);
      console.error('❌ [EMAIL DEBUG] Tipo do erro:', typeof error);
      console.error('❌ [EMAIL DEBUG] Mensagem do erro:', error.message);
      console.error('❌ [EMAIL DEBUG] Stack do erro:', error.stack);
      
      // TEMPLATE ORIGINAL - Fallback para console
      console.log('📧 EMAIL DE CONVITE (SIMULADO - Configure Brevo):');
      console.log('═══════════════════════════════════════════════');
      console.log(`Para: ${data.toEmail}`);
      console.log(`Assunto: Convite para ${data.organizationName} - Sistema EntomoVigilância`);
      console.log('');
      console.log(`🎯 LINK DO CONVITE (COPIE E COLE NO NAVEGADOR):`);
      console.log(`${data.inviteUrl}`);
      console.log('');
      console.log(`👤 Convidado por: ${data.invitedByName}`);
      console.log(`🏢 Organização: ${data.organizationName}`);
      console.log(`👔 Cargo: ${this.getRoleDisplayName(data.role)}`);
      console.log(`⏰ Expira em: ${data.expiresAt.toLocaleDateString('pt-BR')}`);
      console.log('═══════════════════════════════════════════════');
      console.log('💡 Para ativar emails reais, configure BREVO_API_KEY no .env.local');
      console.log('💡 Obtenha sua chave em: https://app.brevo.com/settings/keys/api');
      
      // Re-throw o erro para que o chamador possa lidar com ele
      throw error;
    }
  }

  /**
   * Helper para nome amigável do cargo (TEMPLATE ORIGINAL)
   */
  private static getRoleDisplayName(role: string): string {
    const roles = {
      'administrator': 'Administrador',
      'supervisor': 'Supervisor',
      'agent': 'Agente de Campo'
    };
    return roles[role as keyof typeof roles] || role;
  }
}
