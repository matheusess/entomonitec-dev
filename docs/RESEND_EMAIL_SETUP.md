# 📧 Configuração de Email com Resend

Este documento explica como configurar o envio de emails usando **Resend**, um serviço moderno de email transacional.

## 🎯 Por que Resend?

✅ **API REST simples** - Fácil de integrar  
✅ **Boa deliverability** - Emails chegam na caixa de entrada  
✅ **Plano gratuito generoso** - 3.000 emails/mês  
✅ **Sem necessidade de autorizar IPs** - Funciona em qualquer servidor  
✅ **Dashboard moderno** - Interface fácil de usar  
✅ **Documentação excelente** - Muito bem documentado  

---

## 📋 Pré-requisitos

1. ✅ Conta no Resend (gratuita)
2. ✅ Domínio verificado (opcional, mas recomendado)
3. ✅ Variáveis de ambiente configuradas

---

## 🚀 Passo 1: Criar Conta no Resend

1. Acesse [https://resend.com](https://resend.com)
2. Clique em **"Sign up"** ou **"Get started"**
3. Crie sua conta (pode usar Google/GitHub)
4. Confirme seu email

---

## 🔑 Passo 2: Obter API Key

1. Após fazer login, vá para **"API Keys"** no menu lateral
2. Clique em **"Create API Key"**
3. Dê um nome: `EntomoVigilância - Produção` (ou `Desenvolvimento`)
4. Escolha permissões: **"Sending access"** (ou **"Full access"**)
5. Clique em **"Add"**
6. **COPIE A API KEY** (só aparece uma vez!)

   **Formato:** `re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

## 📧 Passo 3: Verificar Domínio (Opcional mas Recomendado)

### **Por que verificar?**

- ✅ Emails vêm do seu domínio (ex: `noreply@entomonitec.com.br`)
- ✅ Melhor deliverability
- ✅ Mais profissional
- ✅ Menos chance de ir para SPAM

### **Como verificar:**

1. Resend Dashboard → **"Domains"**
2. Clique em **"Add Domain"**
3. Digite seu domínio: `entomonitec.com.br`
4. Resend fornecerá registros DNS para adicionar:
   - **SPF record**
   - **DKIM record**
   - **DMARC record** (opcional)

5. Adicione os registros no seu provedor DNS
6. Aguarde verificação (pode levar alguns minutos)
7. Status mudará para **"Verified"** ✅

### **Usar domínio não verificado:**

Se não verificar o domínio, você pode usar:
- `onboarding@resend.dev` (apenas para testes)
- Ou um domínio verificado do Resend

**Limitação:** Emails de domínios não verificados podem ter menor deliverability.

---

## ⚙️ Passo 4: Configurar Variáveis de Ambiente

### **Local (.env.local)**

```env
# Resend Configuration
NEXT_PUBLIC_RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_RESEND_SENDER_EMAIL=noreply@entomonitec.com.br
NEXT_PUBLIC_RESEND_SENDER_NAME=EntomoVigilância
NEXT_PUBLIC_RESEND_REPLY_TO=suporte@entomonitec.com.br
```

### **Vercel (Produção)**

1. Vercel Dashboard → Seu projeto → **Settings** → **Environment Variables**
2. Adicione as mesmas variáveis:
   - `NEXT_PUBLIC_RESEND_API_KEY`
   - `NEXT_PUBLIC_RESEND_SENDER_EMAIL`
   - `NEXT_PUBLIC_RESEND_SENDER_NAME`
   - `NEXT_PUBLIC_RESEND_REPLY_TO`

3. Selecione os ambientes: **Production**, **Preview**, **Development**
4. Clique em **"Save"**

---

## 🧪 Passo 5: Testar

### **Teste via Código:**

1. Acesse o sistema
2. Vá em **Usuários** → **Criar Convite**
3. Preencha os dados:
   - Nome: "Teste"
   - Email: seu email pessoal
   - Cargo: Agente
4. Clique em **"Enviar Convite"**
5. Verifique o console do navegador (F12) para logs
6. Verifique sua caixa de entrada

### **Verificar no Resend Dashboard:**

1. Resend Dashboard → **"Emails"**
2. Você verá todos os emails enviados
3. Status: **"Delivered"** ✅ ou **"Bounced"** ❌
4. Clique em um email para ver detalhes

---

## 🔄 Serviço de Email Atual

O sistema usa **Resend** como serviço principal de envio de emails.

- ✅ **Resend** (se `RESEND_API_KEY` configurada) ← **SERVIÇO PRINCIPAL**
- ⚠️ **Console Log** (fallback se Resend falhar)

---

## 📊 Comparação: Resend vs Brevo

| Recurso | Resend | Brevo |
|---------|--------|-------|
| **Plano Gratuito** | 3.000 emails/mês | 300 emails/dia |
| **API** | REST simples | REST |
| **Autorizar IPs** | ❌ Não precisa | ✅ Precisa |
| **Deliverability** | ✅ Excelente | ✅ Boa |
| **Dashboard** | ✅ Moderno | ✅ Completo |
| **Documentação** | ✅ Excelente | ✅ Boa |
| **Suporte** | ✅ Rápido | ✅ Bom |

---

## 🐛 Troubleshooting

### **Problema: Email não está sendo enviado**

**Soluções:**

1. ✅ Verifique se `RESEND_API_KEY` está configurada
2. ✅ Verifique se a API Key está correta
3. ✅ Verifique os logs do console (F12)
4. ✅ Verifique o dashboard do Resend → **"Emails"**
5. ✅ Verifique se o domínio está verificado (se usar domínio próprio)

### **Problema: Erro "Domain not verified"**

**Solução:**

1. Verifique o domínio no Resend Dashboard → **"Domains"**
2. Adicione os registros DNS fornecidos
3. Aguarde verificação
4. Ou use `onboarding@resend.dev` para testes

### **Problema: Emails indo para SPAM**

**Soluções:**

1. ✅ Verifique o domínio no Resend
2. ✅ Configure SPF, DKIM e DMARC
3. ✅ Use um domínio verificado
4. ✅ Evite palavras-chave de spam no conteúdo
5. ✅ Peça para adicionar remetente aos contatos

### **Problema: "Invalid API Key"**

**Soluções:**

1. ✅ Verifique se copiou a API Key completa
2. ✅ Verifique se não há espaços extras
3. ✅ Gere uma nova API Key se necessário
4. ✅ Verifique se está usando a variável correta: `NEXT_PUBLIC_RESEND_API_KEY`

---

## 📚 Referências

- [Resend Documentation](https://resend.com/docs)
- [Resend API Reference](https://resend.com/docs/api-reference)
- [Resend Dashboard](https://resend.com/emails)
- [Documentação do Projeto](./README.md)

---

## ✅ Checklist

Antes de considerar configurado:

- [ ] Conta criada no Resend
- [ ] API Key gerada e copiada
- [ ] Domínio verificado (opcional mas recomendado)
- [ ] Variáveis de ambiente configuradas
- [ ] Teste de envio funcionou
- [ ] Email chegou na caixa de entrada
- [ ] Dashboard do Resend mostra email como "Delivered"

---

## 💡 Dicas

1. **Para desenvolvimento:** Use `onboarding@resend.dev` (não precisa verificar domínio)
2. **Para produção:** Verifique seu domínio para melhor deliverability
3. **Monitore o dashboard:** Veja estatísticas de envio e bounce
4. **Use webhooks:** Configure webhooks para receber eventos (opcional)
5. **Teste sempre:** Teste antes de usar em produção

---

**Última Atualização**: 02/09/2025  
**Versão**: 1.0  
**Sistema**: Entomonitec - Vigilância Entomológica

