import logger from '@/lib/logger';
import { IInviteEmailData } from '@/lib/emailTemplates';

// Interface IInviteEmailData já está importada de @/lib/emailTemplates
// Não precisa redeclarar aqui

/**
 * Serviço de email usando Resend
 * 
 * Resend é um serviço moderno de email transacional com:
 * - API REST simples
 * - Boa deliverability
 * - Plano gratuito: 3.000 emails/mês
 * - Sem necessidade de autorizar IPs
 * 
 * Documentação: https://resend.com/docs
 */
export class ResendEmailService {
  private static readonly API_URL = 'https://api.resend.com/emails';
  
  /**
   * Envia email de convite usando Resend API
   */
  static async sendInviteEmail(data: IInviteEmailData): Promise<void> {
    try {
      logger.log('📧 [RESEND] Iniciando envio de convite para:', data.toEmail);

      logger.log('📧 [RESEND] Enviando requisição via API route...');
      logger.log('📧 [RESEND] URL: /api/send-invite-email');

      // Fazer requisição para API route do Next.js (servidor)
      // Isso evita problemas de CORS e mantém a API key segura
      const response = await fetch('/api/send-invite-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          toEmail: data.toEmail,
          toName: data.toName,
          organizationName: data.organizationName,
          invitedByName: data.invitedByName,
          role: data.role,
          inviteUrl: data.inviteUrl,
          expiresAt: data.expiresAt.toISOString() // Converter Date para string
        })
      });

      logger.log('📧 [RESEND] Resposta recebida:');
      logger.log('📧 [RESEND] Status:', response.status);
      logger.log('📧 [RESEND] Status Text:', response.statusText);

      if (!response.ok) {
        const errorData = await response.json();
        logger.error('📧 [RESEND] Erro da API route:', errorData);
        
        throw new Error(errorData.error || errorData.message || `Erro ao enviar email: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      logger.log('📧 [RESEND] Resposta de sucesso:', result);
      logger.log('✅ EMAIL ENVIADO VIA RESEND:');
      logger.log(`Para: ${data.toEmail}`);
      logger.log(`Organização: ${data.organizationName}`);
      logger.log(`Link: ${data.inviteUrl}`);
      logger.log(`ID do email: ${result.emailId || 'N/A'}`);
      
    } catch (error: any) {
      logger.error('❌ [RESEND] Erro ao enviar email via Resend:', error);
      logger.error('❌ [RESEND] Tipo do erro:', typeof error);
      logger.error('❌ [RESEND] Mensagem do erro:', error.message);
      logger.error('❌ [RESEND] Stack do erro:', error.stack);
      
      // Re-throw o erro para que o chamador possa lidar com ele
      throw error;
    }
  }

  // Templates de email agora estão em src/lib/emailTemplates.ts
  // Importados no topo do arquivo para uso compartilhado
  // 
  // NOTA: Reset de senha usa Firebase Auth diretamente (sendPasswordResetEmail)
  // O template HTML é configurado no Firebase Console
  // Ver: docs/FIREBASE_RESET_SENHA_TEMPLATE.md
}

