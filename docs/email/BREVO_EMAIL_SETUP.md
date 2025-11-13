# 📧 Configuração de Email com Brevo

Este documento explica a configuração do envio de emails usando **Brevo** (anteriormente Sendinblue).

## 🔐 Informações da Conta

**Conta Brevo:** `matheus.esilva@icloud.com`

**Acesso:**
- Dashboard: [https://app.brevo.com](https://app.brevo.com)
- Login com: `matheus.esilva@icloud.com`

---

## 📋 Configuração Atual

### **Variáveis de Ambiente**

As seguintes variáveis estão configuradas no `.env.local`:

```env
# Brevo Configuration
NEXT_PUBLIC_BREVO_API_KEY=sua-chave-api-aqui
NEXT_PUBLIC_BREVO_SENDER_NAME=Ajuda @ Ento Monitec
NEXT_PUBLIC_BREVO_SENDER_EMAIL=ajuda@entomonitec.com.br
```

**⚠️ IMPORTANTE:** A chave API foi atualizada. Certifique-se de usar a chave mais recente no `.env.local`.

### **Remetente Configurado**

- **Nome:** Ajuda @ Ento Monitec
- **Email:** ajuda@entomonitec.com.br

---

## 🔑 Como Obter/Atualizar API Key

1. Acesse [https://app.brevo.com](https://app.brevo.com)
2. Faça login com: `matheus.esilva@icloud.com`
3. Vá em **Settings** → **SMTP & API** → **API Keys**
4. Você verá suas chaves existentes ou pode criar uma nova
5. Copie a chave e adicione no `.env.local`:

```env
NEXT_PUBLIC_BREVO_API_KEY=sua-chave-aqui
```

### **Chave API Atual (Setembro 2025):**

**⚠️ IMPORTANTE:** Atualize o `.env.local` com esta chave:

```env
NEXT_PUBLIC_BREVO_API_KEY=sua-chave-api-aqui
```

**Nota:** Esta chave foi enviada para `matheus.esilva@icloud.com` em 02/09/2025.

---

## ⚠️ Problema Comum: IP Não Autorizado

### **Erro:**
```
We have detected you are using an unrecognised IP address...
```

### **Solução:**

1. Acesse [https://app.brevo.com/security/authorised_ips](https://app.brevo.com/security/authorised_ips)
2. Faça login com: `matheus.esilva@icloud.com`
3. **Opção A (Recomendado):** Desabilite a restrição de IP
   - Isso permite que qualquer IP do Vercel envie emails
   - Mais prático para serviços serverless
4. **Opção B:** Adicione o IP do servidor
   - Adicione o IP que aparece no erro
   - Nota: IPs do Vercel podem mudar

---

## 🔄 Ordem de Prioridade no Sistema

O sistema tenta enviar emails nesta ordem:

1. **Firebase Trigger Email** (se extensão instalada)
2. **Resend** (se `RESEND_API_KEY` configurada)
3. **Brevo** (se `BREVO_API_KEY` configurada) ← **Atual**
4. **Console Log** (último recurso)

---

## 📊 Limites do Plano Gratuito

- **300 emails/dia** (plano gratuito)
- **Sem limite de emails** (planos pagos)

Para verificar seu plano:
1. Acesse [https://app.brevo.com](https://app.brevo.com)
2. Vá em **Settings** → **Account** → **Plan**

---

## 🧪 Testar Envio de Email

### **Script de Teste (Recomendado):**

Use o script de teste para verificar se o envio está funcionando:

```bash
# Testar com email padrão (matheus.esilva@icloud.com)
npx tsx scripts/test-email-brevo.ts

# Ou especificar outro email
npx tsx scripts/test-email-brevo.ts seu-email@exemplo.com
```

O script irá:
- ✅ Verificar se as variáveis de ambiente estão configuradas
- ✅ Testar o envio de email
- ✅ Mostrar erros detalhados se houver problema
- ✅ Dar instruções de como resolver problemas comuns

### **Via Sistema:**

1. Acesse o sistema
2. Vá em **Usuários** → **Criar Convite**
3. Preencha os dados e envie
4. Verifique o console do navegador (F12)
5. Deve aparecer: `✅ EMAIL ENVIADO VIA BREVO`

### **Verificar no Dashboard Brevo:**

1. Acesse [https://app.brevo.com](https://app.brevo.com)
2. Faça login com: `matheus.esilva@icloud.com`
3. Vá em **Statistics** → **Email Activity**
4. Você verá todos os emails enviados
5. Status: **"Delivered"** ✅ ou **"Bounced"** ❌

---

## 🐛 Troubleshooting

### **Email não está sendo enviado**

1. ✅ Verifique se `BREVO_API_KEY` está configurada no `.env.local`
2. ✅ Verifique se a API Key está correta
3. ✅ Verifique os logs no console do navegador (F12)
4. ✅ Verifique o dashboard do Brevo → **Email Activity**
5. ✅ Verifique se não excedeu o limite de 300 emails/dia

### **Erro de IP não autorizado**

**Solução:** Desabilite a restrição de IP em:
- [https://app.brevo.com/security/authorised_ips](https://app.brevo.com/security/authorised_ips)

### **Emails indo para SPAM**

1. ✅ Configure SPF no DNS do domínio `entomonitec.com.br`
2. ✅ Configure DKIM no Brevo (Settings → SMTP & API → DKIM)
3. ✅ Use um domínio verificado
4. ✅ Evite palavras-chave de spam no conteúdo

---

## 📚 Referências

- [Brevo Dashboard](https://app.brevo.com)
- [Brevo API Documentation](https://developers.brevo.com/)
- [Brevo SMTP Settings](https://app.brevo.com/settings/keys/api)
- [Documentação do Projeto](./README.md)

---

## ✅ Checklist

- [x] Conta Brevo configurada: `matheus.esilva@icloud.com`
- [x] API Key configurada no `.env.local`
- [x] Remetente configurado: `ajuda@entomonitec.com.br`
- [x] Nome do remetente: `Ajuda @ Ento Monitec`
- [ ] Restrição de IP desabilitada (se necessário)
- [ ] Domínio verificado no Brevo (opcional)
- [ ] SPF/DKIM configurados (opcional, para melhor deliverability)

---

**Última Atualização**: 02/09/2025  
**Versão**: 1.0  
**Sistema**: Entomonitec - Vigilância Entomológica  
**Conta Brevo**: matheus.esilva@icloud.com

