/**
 * Templates de email compartilhados
 * 
 * Este arquivo centraliza todos os templates de email para garantir
 * consistência visual entre diferentes provedores (Resend, Brevo, Firebase, etc.)
 */

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
 * Helper para nome amigável do cargo
 */
function getRoleDisplayName(role: string): string {
  const roles = {
    'administrator': 'Administrador',
    'supervisor': 'Supervisor',
    'agent': 'Agente de Campo'
  };
  return roles[role as keyof typeof roles] || role;
}

/**
 * Template HTML do email de convite
 * 
 * Este é o template padrão usado por todos os serviços de email
 */
export function getInviteEmailHTML(data: IInviteEmailData): string {
  return `
    <!DOCTYPE html>
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
          <p style="margin: 0; color: #6b7280;">Cargo: <strong>${getRoleDisplayName(data.role)}</strong></p>
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
  `;
}

/**
 * Template texto do email de convite
 * 
 * Versão texto simples para clientes de email que não suportam HTML
 */
export function getInviteEmailText(data: IInviteEmailData): string {
  return `
Convite para EntomoVigilância

Olá ${data.toName}!

Você foi convidado por ${data.invitedByName} para participar da organização ${data.organizationName} como ${getRoleDisplayName(data.role)}.

Link do convite: ${data.inviteUrl}

Este convite expira em: ${data.expiresAt.toLocaleDateString('pt-BR')}

---
Este é um email automático do sistema EntomoVigilância. Não responda a este email.
  `.trim();
}

/**
 * Assunto padrão do email de convite
 */
export function getInviteEmailSubject(organizationName: string): string {
  return `Convite para ${organizationName} - Sistema EntomoVigilância`;
}

/**
 * Interface para dados do email de reset de senha
 */
export interface IPasswordResetEmailData {
  email: string;
  resetUrl: string;
  appName?: string;
}

/**
 * Template HTML do email de reset de senha
 * 
 * Este é o template padrão usado por todos os serviços de email
 */
export function getPasswordResetEmailHTML(data: IPasswordResetEmailData): string {
  const appName = data.appName || 'EntomoVigilância';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Redefinir Senha - ${appName}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">${appName}</h1>
        <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Sistema de Vigilância Entomológica</p>
      </div>
      
      <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
        <h2 style="color: #10b981; margin-top: 0;">🔐 Redefinir Senha</h2>
        
        <p>Olá!</p>
        
        <p>Recebemos uma solicitação para redefinir a senha da sua conta <strong>${data.email}</strong> no sistema ${appName}.</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #374151;">
            <strong>📧 Conta:</strong> ${data.email}
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.resetUrl}" style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            🔑 Redefinir Senha
          </a>
        </div>
        
        <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #92400e;">
            ⚠️ <strong>Importante:</strong> Este link expira em <strong>1 hora</strong>. Se você não solicitou esta redefinição, pode ignorar este email com segurança.
          </p>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          Se você não conseguir clicar no botão, copie e cole este link no seu navegador:<br>
          <a href="${data.resetUrl}" style="color: #10b981; word-break: break-all;">${data.resetUrl}</a>
        </p>
        
        <div style="background: #eff6ff; border: 1px solid #3b82f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #1e40af; font-size: 14px;">
            💡 <strong>Dica de Segurança:</strong> Nunca compartilhe este link com outras pessoas. Nossa equipe nunca solicitará sua senha por email.
          </p>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
        <p>Este é um email automático do sistema ${appName}. Não responda a este email.</p>
        <p style="margin-top: 10px;">
          Se você não solicitou esta redefinição, sua conta está segura e nenhuma ação é necessária.
        </p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Template texto do email de reset de senha
 * 
 * Versão texto simples para clientes de email que não suportam HTML
 */
export function getPasswordResetEmailText(data: IPasswordResetEmailData): string {
  const appName = data.appName || 'EntomoVigilância';
  
  return `
Redefinir Senha - ${appName}

Olá!

Recebemos uma solicitação para redefinir a senha da sua conta ${data.email} no sistema ${appName}.

Link para redefinir senha: ${data.resetUrl}

IMPORTANTE: Este link expira em 1 hora. Se você não solicitou esta redefinição, pode ignorar este email com segurança.

Dica de Segurança: Nunca compartilhe este link com outras pessoas. Nossa equipe nunca solicitará sua senha por email.

---
Este é um email automático do sistema ${appName}. Não responda a este email.
Se você não solicitou esta redefinição, sua conta está segura e nenhuma ação é necessária.
  `.trim();
}

/**
 * Assunto padrão do email de reset de senha
 */
export function getPasswordResetEmailSubject(appName?: string): string {
  const name = appName || 'EntomoVigilância';
  return `Redefinir Senha - ${name}`;
}

