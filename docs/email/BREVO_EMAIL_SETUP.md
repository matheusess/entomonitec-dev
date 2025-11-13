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

**⚠️ IMPORTANTE:** 
- Obtenha a chave API em: [https://app.brevo.com/settings/keys/api](https://app.brevo.com/settings/keys/api)
- Login: `matheus.esilva@icloud.com`
- **NUNCA** commite a chave API no Git!

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

### **Como Obter a Chave API:**

1. Acesse [https://app.brevo.com/settings/keys/api](https://app.brevo.com/settings/keys/api)
2. Faça login com: `matheus.esilva@icloud.com`
3. Copie a chave API
4. Adicione no `.env.local`:

```env
NEXT_PUBLIC_BREVO_API_KEY=sua-chave-api-aqui
```

**⚠️ IMPORTANTE:** 
- **NUNCA** commite a chave API no Git
- Mantenha apenas no `.env.local` (não commitado)

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

## 🔄 Status Atual

**⚠️ NOTA:** Brevo não é mais o serviço principal. O sistema agora usa **Resend** para convites.

- **Convites de Usuário:** Resend (serviço principal)
- **Reset de Senha:** Firebase Auth (método padrão)

Este documento é mantido apenas para referência histórica.

---

## 📊 Limites do Plano Gratuito

- **300 emails/dia** (plano gratuito)
- **Sem limite de emails** (planos pagos)

Para verificar seu plano:
1. Acesse [https://app.brevo.com](https://app.brevo.com)
2. Vá em **Settings** → **Account** → **Plan**

---

## 🧪 Testar Envio de Email

### **Testar Envio:**

1. Configure a chave API no `.env.local`
2. Acesse o sistema
3. Crie um convite de usuário
4. Verifique o console do navegador (F12) para logs

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

