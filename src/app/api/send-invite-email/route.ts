/**
 * API Route para enviar email de convite via Resend
 * 
 * Esta rota é necessária porque a API do Resend deve ser chamada do servidor
 * para evitar problemas de CORS e manter a API key segura.
 * 
 * Uso: POST /api/send-invite-email
 * Body: { toEmail, toName, organizationName, invitedByName, role, inviteUrl, expiresAt }
 */

import { NextRequest, NextResponse } from 'next/server';
import logger from '@/lib/logger';
import { 
  getInviteEmailHTML, 
  getInviteEmailText, 
  getInviteEmailSubject 
} from '@/lib/emailTemplates';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // Validar dados obrigatórios
    const requiredFields = ['toEmail', 'toName', 'organizationName', 'invitedByName', 'role', 'inviteUrl', 'expiresAt'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `Campo obrigatório faltando: ${field}` },
          { status: 400 }
        );
      }
    }

    logger.log('📧 [API] Iniciando envio de convite para:', data.toEmail);

    // Verificar se a API key do Resend está configurada
    const resendApiKey = process.env.NEXT_PUBLIC_RESEND_API_KEY;
    
    if (!resendApiKey) {
      logger.warn('⚠️ [API] Resend não configurado');
      return NextResponse.json(
        { error: 'RESEND_API_KEY não configurada' },
        { status: 500 }
      );
    }

    // Configurações do remetente
    const senderName = process.env.NEXT_PUBLIC_RESEND_SENDER_NAME || 'EntomoVigilância';
    const senderEmail = process.env.NEXT_PUBLIC_RESEND_SENDER_EMAIL || 'noreply@entomonitec.com.br';
    const fromEmail = `${senderName} <${senderEmail}>`;

    logger.log('📧 [API] Configurações do remetente:');
    logger.log('📧 [API] From:', fromEmail);

    // Preparar payload para API do Resend usando template compartilhado
    const emailPayload = {
      from: fromEmail,
      to: [data.toEmail],
      subject: getInviteEmailSubject(data.organizationName),
      html: getInviteEmailHTML({
        toEmail: data.toEmail,
        toName: data.toName,
        organizationName: data.organizationName,
        invitedByName: data.invitedByName,
        role: data.role,
        inviteUrl: data.inviteUrl,
        expiresAt: new Date(data.expiresAt)
      }),
      text: getInviteEmailText({
        toEmail: data.toEmail,
        toName: data.toName,
        organizationName: data.organizationName,
        invitedByName: data.invitedByName,
        role: data.role,
        inviteUrl: data.inviteUrl,
        expiresAt: new Date(data.expiresAt)
      }),
      // Opcional: Reply-to
      reply_to: process.env.NEXT_PUBLIC_RESEND_REPLY_TO || senderEmail,
    };

    logger.log('📧 [API] Enviando requisição para API do Resend...');
    logger.log('📧 [API] URL: https://api.resend.com/emails');

    // Fazer requisição para API do Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload)
    });

    logger.log('📧 [API] Resposta recebida:');
    logger.log('📧 [API] Status:', response.status);
    logger.log('📧 [API] Status Text:', response.statusText);

    if (!response.ok) {
      const errorData = await response.json();
      logger.error('📧 [API] Erro da API do Resend:', errorData);
      
      // Tratar erros específicos do Resend
      const errorMessage = errorData.message || errorData.error || '';
      
      if (errorMessage.includes('domain') || errorMessage.includes('Domain')) {
        return NextResponse.json(
          {
            error: `Domínio não verificado no Resend. Verifique se o domínio ${senderEmail.split('@')[1]} está verificado. Acesse: https://resend.com/domains para verificar.`
          },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: errorData.message || `Erro na API do Resend: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const result = await response.json();
    logger.log('📧 [API] Resposta de sucesso:', result);
    logger.log('✅ EMAIL ENVIADO VIA RESEND:');
    logger.log(`Para: ${data.toEmail}`);
    logger.log(`Organização: ${data.organizationName}`);
    logger.log(`Link: ${data.inviteUrl}`);
    logger.log(`ID do email: ${result.id || 'N/A'}`);

    return NextResponse.json({
      success: true,
      message: 'Email enviado com sucesso',
      emailId: result.id
    });

  } catch (error: any) {
    logger.error('❌ [API] Erro ao enviar email via Resend:', error);
    logger.error('❌ [API] Mensagem do erro:', error.message);
    
    return NextResponse.json(
      {
        error: 'Erro ao processar solicitação de envio de email',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

