'use client';

import { useState } from 'react';
import { EmailService } from '@/services/emailService';
import logger from '@/lib/logger';

export default function TestEmailPage() {
  const [email, setEmail] = useState('teste@exemplo.com');
  const [name, setName] = useState('Usuário Teste');
  const [organization, setOrganization] = useState('Organização Teste');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const testEmail = async () => {
    setLoading(true);
    setResult('');
    
    try {
      logger.log('🧪 TESTANDO BREVO...');
      
      const emailData = {
        toEmail: email,
        toName: name,
        organizationName: organization,
        invitedByName: 'Admin Teste',
        role: 'agent',
        inviteUrl: 'http://localhost:3000/complete-signup?token=teste123',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 dias
      };

      await EmailService.sendInviteEmail(emailData);
      
      setResult('✅ EMAIL ENVIADO COM SUCESSO! Verifique o console para detalhes.');
      
    } catch (error: any) {
      setResult(`❌ ERRO: ${error.message}`);
      logger.error('Erro no teste:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          🧪 Teste do Brevo
        </h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email de destino:
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="teste@exemplo.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nome:
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Usuário Teste"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Organização:
            </label>
            <input
              type="text"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Organização Teste"
            />
          </div>
          
          <button
            onClick={testEmail}
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
          >
            {loading ? '⏳ Enviando...' : '📧 Testar Email'}
          </button>
          
          {result && (
            <div className={`p-3 rounded-md text-sm ${
              result.includes('✅') 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {result}
            </div>
          )}
        </div>
        
        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            📋 Variáveis de Ambiente:
          </h3>
          <div className="text-xs text-gray-600 space-y-1">
            <div>BREVO_API_KEY: {process.env.NEXT_PUBLIC_BREVO_API_KEY ? '✅ Configurada' : '❌ Não configurada'}</div>
            <div>SENDER_NAME: {process.env.NEXT_PUBLIC_BREVO_SENDER_NAME || 'Não configurado'}</div>
            <div>SENDER_EMAIL: {process.env.NEXT_PUBLIC_BREVO_SENDER_EMAIL || 'Não configurado'}</div>
          </div>
        </div>
        
        <div className="mt-4 text-xs text-gray-500">
          💡 Abra o Console do navegador (F12) para ver logs detalhados
        </div>
      </div>
    </div>
  );
}
