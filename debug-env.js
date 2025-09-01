// Script para debugar variáveis de ambiente
const fs = require('fs');

console.log('🔍 DEBUGANDO VARIÁVEIS DE AMBIENTE...');
console.log('═══════════════════════════════════════════════');

// Ler arquivo .env.local
try {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  console.log('📄 Conteúdo do .env.local:');
  console.log(envContent);
  console.log('');
  
  // Extrair variáveis específicas
  const lines = envContent.split('\n');
  let brevoApiKey = null;
  let senderName = null;
  let senderEmail = null;
  
  lines.forEach(line => {
    if (line.startsWith('NEXT_PUBLIC_BREVO_API_KEY=')) {
      brevoApiKey = line.split('=')[1];
    }
    if (line.startsWith('NEXT_PUBLIC_BREVO_SENDER_NAME=')) {
      senderName = line.split('=')[1];
    }
    if (line.startsWith('NEXT_PUBLIC_BREVO_SENDER_EMAIL=')) {
      senderEmail = line.split('=')[1];
    }
  });
  
  console.log('🔍 Variáveis extraídas:');
  console.log('BREVO_API_KEY configurada:', brevoApiKey ? '✅ SIM' : '❌ NÃO');
  console.log('BREVO_API_KEY (primeiros 10 chars):', brevoApiKey ? brevoApiKey.substring(0, 10) + '...' : 'N/A');
  console.log('SENDER_NAME:', senderName);
  console.log('SENDER_EMAIL:', senderEmail);
  
} catch (error) {
  console.error('❌ Erro ao ler .env.local:', error.message);
}
