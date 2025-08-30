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
   * Envia email de convite usando API route (server-side)
   */
  static async sendInviteEmail(data: IInviteEmailData): Promise<void> {
    try {
      console.log('📧 Enviando convite via API para:', data.toEmail);

      const response = await fetch('/api/send-invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Erro ao enviar email');
      }

      const result = await response.json();
      console.log('✅ Email enviado com sucesso via Brevo:', result);
      
    } catch (error: any) {
      console.error('❌ Erro ao enviar email via API:', error);
      throw new Error(`Falha ao enviar email: ${error.message}`);
    }
  }

}
