#!/bin/bash

echo "🧪 TESTANDO API DO BREVO COM CURL..."
echo "═══════════════════════════════════════════════"

# Suas credenciais do Brevo
BREVO_API_KEY="SUA_API_KEY_AQUI" # Substitua pela sua API key

# Dados do email de teste (SEM TEMPLATE - EMAIL SIMPLES)
EMAIL_DATA='{
  "to": [
    {
      "email": "filipeanj@outlook.com",
      "name": "Usuário Teste"
    }
  ],
  "sender": {
    "name": "Ajuda @ Ento Monitec",
    "email": "ajuda@entomonitec.com.br"
  },
  "subject": "Convite para Organização Teste - Sistema EntomoVigilância",
  "htmlContent": "<h1>Convite para EntomoVigilância</h1><p>Olá <strong>Usuário Teste</strong>!</p><p>Você foi convidado por <strong>Admin Teste</strong> para participar da organização <strong>Organização Teste</strong> como <strong>Agente de Campo</strong>.</p><p><a href=\"http://localhost:3000/complete-signup?token=teste123\" style=\"background-color: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;\">Aceitar Convite</a></p><p>Este convite expira em: <strong>08/09/2025</strong></p>",
  "textContent": "Convite para EntomoVigilância\n\nOlá Usuário Teste!\n\nVocê foi convidado por Admin Teste para participar da organização Organização Teste como Agente de Campo.\n\nLink do convite: http://localhost:3000/complete-signup?token=teste123\n\nEste convite expira em: 08/09/2025"
}'

echo "📧 Dados do email:"
echo "$EMAIL_DATA" | jq .
echo ""

echo "📡 Fazendo requisição para o Brevo..."
echo ""

# Fazer a requisição curl
curl -X POST "https://api.brevo.com/v3/smtp/email" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -H "api-key: $BREVO_API_KEY" \
  -d "$EMAIL_DATA" \
  -w "\n\n📊 Status Code: %{http_code}\n📊 Response Time: %{time_total}s\n" \
  -v

echo ""
echo "✅ Teste concluído!"
