import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
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

/**
 * Serviço de email usando Firebase Extensions (Trigger Email)
 * 
 * Este serviço cria documentos na coleção 'mail' do Firestore,
 * que são processados automaticamente pela extensão "Trigger Email" do Firebase.
 * 
 * Para configurar:
 * 1. Instale a extensão "Trigger Email" no Firebase Console
 * 2. Configure um provedor SMTP (Gmail, SendGrid, Mailgun, etc.)
 * 3. A extensão processará automaticamente os documentos criados aqui
 */
export class FirebaseEmailService {
  private static readonly MAIL_COLLECTION = 'mail';

  /**
   * Envia email de convite usando Firebase Extension Trigger Email
   */
  static async sendInviteEmail(data: IInviteEmailData): Promise<void> {
    try {
      logger.log('📧 [FIREBASE EMAIL] Criando documento de email para:', data.toEmail);

      // Criar documento na coleção 'mail' que será processado pela extensão Trigger Email
      // Usando templates compartilhados
      const mailDocument = {
        to: data.toEmail,
        toUids: [], // Opcional: UIDs de usuários do Firebase Auth
        message: {
          subject: getInviteEmailSubject(data.organizationName),
          html: getInviteEmailHTML({
            toEmail: data.toEmail,
            toName: data.toName,
            organizationName: data.organizationName,
            invitedByName: data.invitedByName,
            role: data.role,
            inviteUrl: data.inviteUrl,
            expiresAt: data.expiresAt
          }),
          text: getInviteEmailText({
            toEmail: data.toEmail,
            toName: data.toName,
            organizationName: data.organizationName,
            invitedByName: data.invitedByName,
            role: data.role,
            inviteUrl: data.inviteUrl,
            expiresAt: data.expiresAt
          }),
        },
        // Metadados adicionais
        metadata: {
          type: 'invite',
          organizationName: data.organizationName,
          role: data.role,
          invitedByName: data.invitedByName,
          expiresAt: data.expiresAt.toISOString(),
        },
        // Timestamp para processamento
        createdAt: Timestamp.now(),
      };

      // Adicionar documento à coleção 'mail'
      const docRef = await addDoc(collection(db, this.MAIL_COLLECTION), mailDocument);
      
      logger.log('✅ [FIREBASE EMAIL] Documento de email criado:', docRef.id);
      logger.log('📧 [FIREBASE EMAIL] Email será processado pela extensão Trigger Email');
      logger.log(`Para: ${data.toEmail}`);
      logger.log(`Organização: ${data.organizationName}`);
      logger.log(`Link: ${data.inviteUrl}`);

      // Nota: O email será enviado automaticamente pela extensão
      // Não precisamos aguardar o envio aqui
            
    } catch (error: any) {
      logger.error('❌ [FIREBASE EMAIL] Erro ao criar documento de email:', error);
      
      // Fallback: mostrar link no console
      logger.warn('⚠️ [FIREBASE EMAIL] Usando fallback - link no console:');
      logger.log('═══════════════════════════════════════════════');
      logger.log(`🎯 LINK DO CONVITE (COPIE E COLE NO NAVEGADOR):`);
      logger.log(`${data.inviteUrl}`);
      logger.log('═══════════════════════════════════════════════');
      
      // Não lançar erro - o convite ainda foi criado, apenas o email falhou
      // O usuário pode copiar o link do console
    }
  }

  // Templates de email agora estão em src/lib/emailTemplates.ts
  // Importados no topo do arquivo para uso compartilhado
}

