import logger from '@/lib/logger';
import { getInviteEmailHTML, getInviteEmailText, getInviteEmailSubject } from '@/lib/emailTemplates';
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
      logger.log('📧 [EMAIL DEBUG] Iniciando envio de convite via Brevo para:', data.toEmail);
      logger.log('📧 [EMAIL DEBUG] Dados do convite:', {
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
      logger.log('📧 [EMAIL DEBUG] BREVO_API_KEY configurada:', brevoApiKey ? '✅ SIM' : '❌ NÃO');
      logger.log('📧 [EMAIL DEBUG] BREVO_API_KEY (primeiros 10 chars):', brevoApiKey ? brevoApiKey.substring(0, 10) + '...' : 'N/A');
      
      if (!brevoApiKey) {
        logger.warn('⚠️ [EMAIL DEBUG] Brevo não configurado ou falhou, usando simulação');
        throw new Error('BREVO_API_KEY não configurada');
      }

      // Dados para o email simples (SEM TEMPLATE)
      const senderName = process.env.NEXT_PUBLIC_BREVO_SENDER_NAME || 'EntomoVigilância';
      const senderEmail = process.env.NEXT_PUBLIC_BREVO_SENDER_EMAIL || 'noreply@entomonitec.com.br';
      
      logger.log('📧 [EMAIL DEBUG] Configurações do remetente:');
      logger.log('📧 [EMAIL DEBUG] SENDER_NAME:', senderName);
      logger.log('📧 [EMAIL DEBUG] SENDER_EMAIL:', senderEmail);
      
      const emailPayload = {
        to: [{
          email: data.toEmail,
          name: data.toName
        }],
        sender: {
          name: senderName,
          email: senderEmail
        },
        subject: getInviteEmailSubject(data.organizationName),
        htmlContent: getInviteEmailHTML({
          toEmail: data.toEmail,
          toName: data.toName,
          organizationName: data.organizationName,
          invitedByName: data.invitedByName,
          role: data.role,
          inviteUrl: data.inviteUrl,
          expiresAt: data.expiresAt
        }),
        textContent: getInviteEmailText({
          toEmail: data.toEmail,
          toName: data.toName,
          organizationName: data.organizationName,
          invitedByName: data.invitedByName,
          role: data.role,
          inviteUrl: data.inviteUrl,
          expiresAt: data.expiresAt
        })
      };

      logger.log('📧 [EMAIL DEBUG] Enviando requisição para API do Brevo...');
      logger.log('📧 [EMAIL DEBUG] URL:', 'https://api.brevo.com/v3/smtp/email');
      logger.log('📧 [EMAIL DEBUG] Payload (resumido):', {
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

      logger.log('📧 [EMAIL DEBUG] Resposta recebida:');
      logger.log('📧 [EMAIL DEBUG] Status:', response.status);
      logger.log('📧 [EMAIL DEBUG] Status Text:', response.statusText);
      logger.log('📧 [EMAIL DEBUG] Headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.json();
        logger.error('📧 [EMAIL DEBUG] Erro da API do Brevo:', errorData);
        
        // Detectar erro específico de IP não autorizado
        const errorMessage = errorData.message || '';
        if (errorMessage.includes('unrecognised IP address') || errorMessage.includes('unrecognized IP')) {
          const ipMatch = errorMessage.match(/IP address ([^\s]+)/);
          const ipAddress = ipMatch ? ipMatch[1] : 'seu servidor';
          
          const detailedError = new Error(
            `IP do servidor não autorizado no Brevo. ` +
            `O IP ${ipAddress} precisa ser adicionado na lista de IPs autorizados. ` +
            `Acesse: https://app.brevo.com/security/authorised_ips para autorizar. ` +
            `Nota: Em serviços como Vercel, o IP pode mudar. Considere desabilitar a restrição de IP no Brevo.`
          );
          (detailedError as any).code = 'BREVO_UNAUTHORIZED_IP';
          (detailedError as any).ipAddress = ipAddress;
          (detailedError as any).brevoUrl = 'https://app.brevo.com/security/authorised_ips';
          throw detailedError;
        }
        
        throw new Error(errorData.message || `Erro na API do Brevo: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      logger.log('📧 [EMAIL DEBUG] Resposta de sucesso do Brevo:', result);
      logger.log('✅ EMAIL ENVIADO VIA BREVO:');
      logger.log(`Para: ${data.toEmail}`);
      logger.log(`Organização: ${data.organizationName}`);
      logger.log(`Link: ${data.inviteUrl}`);
      
    } catch (error: any) {
      logger.error('❌ [EMAIL DEBUG] Erro ao enviar email via Brevo:', error);
      logger.error('❌ [EMAIL DEBUG] Tipo do erro:', typeof error);
      logger.error('❌ [EMAIL DEBUG] Mensagem do erro:', error.message);
      logger.error('❌ [EMAIL DEBUG] Stack do erro:', error.stack);
      
      // Se for erro de IP não autorizado, mostrar mensagem específica
      if (error.code === 'BREVO_UNAUTHORIZED_IP') {
        logger.error('🚨 ERRO DE IP NÃO AUTORIZADO NO BREVO:');
        logger.error(`IP do servidor: ${error.ipAddress}`);
        logger.error(`Acesse para autorizar: ${error.brevoUrl}`);
        logger.error('⚠️ IMPORTANTE: Em serviços como Vercel, o IP pode mudar dinamicamente.');
        logger.error('💡 SOLUÇÃO: Desabilite a restrição de IP no Brevo ou use whitelist de domínios.');
      }
      
      // TEMPLATE ORIGINAL - Fallback para console
      logger.log('📧 EMAIL DE CONVITE (SIMULADO - Configure Brevo):');
      logger.log('═══════════════════════════════════════════════');
      logger.log(`Para: ${data.toEmail}`);
      logger.log(`Assunto: Convite para ${data.organizationName} - Sistema EntomoVigilância`);
      logger.log('');
      logger.log(`🎯 LINK DO CONVITE (COPIE E COLE NO NAVEGADOR):`);
      logger.log(`${data.inviteUrl}`);
      logger.log('');
      logger.log(`👤 Convidado por: ${data.invitedByName}`);
      logger.log(`🏢 Organização: ${data.organizationName}`);
      logger.log(`👔 Cargo: ${data.role}`);
      logger.log(`⏰ Expira em: ${data.expiresAt.toLocaleDateString('pt-BR')}`);
      logger.log('═══════════════════════════════════════════════');
      logger.log('💡 Para ativar emails reais, configure BREVO_API_KEY no .env.local');
      logger.log('💡 Obtenha sua chave em: https://app.brevo.com/settings/keys/api');
      
      // Re-throw o erro para que o chamador possa lidar com ele
      throw error;
    }
  }

  // Templates de email agora estão em src/lib/emailTemplates.ts
  // Importados no topo do arquivo para uso compartilhado
}
