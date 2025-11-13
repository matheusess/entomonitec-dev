# 📧 Configuração de Email com Firebase

Este documento explica como configurar o envio de emails usando o padrão do Firebase através da extensão **Trigger Email**.

## 🎯 Visão Geral

O sistema usa a **Firebase Extension "Trigger Email"** para enviar emails de forma nativa, sem depender de serviços externos como Brevo. A extensão monitora a coleção `mail` do Firestore e envia emails automaticamente quando novos documentos são criados.

---

## 📋 Pré-requisitos

1. ✅ Projeto Firebase configurado
2. ✅ Firestore habilitado
3. ✅ Acesso ao Firebase Console
4. ✅ Conta em um provedor SMTP (Gmail, SendGrid, Mailgun, etc.)

---

## 🚀 Instalação da Extensão Trigger Email

### **Passo 1: Acessar Firebase Console**

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto
3. No menu lateral, clique em **Extensions** (ou **Extensões**)

### **Passo 2: Instalar Extensão**

1. Clique em **"Browse all extensions"** (ou **"Explorar todas as extensões"**)
2. Procure por **"Trigger Email"**
3. Clique em **"Install"** (ou **"Instalar"**)

### **Passo 3: Configurar Extensão**

Durante a instalação, você precisará configurar:

#### **3.1. Coleção do Firestore**
- **Collection path**: `mail` (padrão)
- Esta é a coleção que será monitorada

#### **3.2. Provedor SMTP**

Escolha um dos provedores:

##### **Opção A: Gmail (Recomendado para testes)**
```
SMTP connection URI: smtps://seu-email@gmail.com:senha-de-app@smtp.gmail.com:465
```

**Como obter senha de app do Gmail:**
1. Acesse [Google Account](https://myaccount.google.com/)
2. Vá em **Segurança** → **Verificação em duas etapas** (deve estar ativada)
3. Vá em **Senhas de app**
4. Crie uma nova senha de app para "Email"
5. Use essa senha no lugar de `senha-de-app`

##### **Opção B: SendGrid**
```
SMTP connection URI: smtps://apikey:SUA_API_KEY@smtp.sendgrid.net:465
```

**Como obter API Key do SendGrid:**
1. Acesse [SendGrid](https://app.sendgrid.com/)
2. Vá em **Settings** → **API Keys**
3. Crie uma nova API Key
4. Use no formato acima

##### **Opção C: Mailgun**
```
SMTP connection URI: smtps://postmaster@seu-dominio.mailgun.org:senha@smtp.mailgun.org:465
```

##### **Opção D: Outros Provedores**
Consulte a documentação do seu provedor SMTP para obter a URI de conexão.

#### **3.3. Remetente Padrão**

Configure o email remetente:
- **From email**: `noreply@entomonitec.com.br` (ou seu domínio)
- **From name**: `EntomoVigilância`

#### **3.4. Reply-to (Opcional)**

- **Reply-to email**: (deixe vazio ou configure um email de suporte)

### **Passo 4: Finalizar Instalação**

1. Revise as configurações
2. Clique em **"Install"** (ou **"Instalar"**)
3. Aguarde a instalação (pode levar alguns minutos)

---

## ✅ Verificação da Instalação

### **Teste Manual**

1. Acesse o Firestore no Firebase Console
2. Crie um documento na coleção `mail` com:

```json
{
  "to": "seu-email@exemplo.com",
  "message": {
    "subject": "Teste de Email",
    "html": "<h1>Teste</h1><p>Este é um email de teste.</p>",
    "text": "Teste\n\nEste é um email de teste."
  }
}
```

3. O email deve ser enviado automaticamente em alguns segundos

### **Teste via Código**

O código já está configurado para usar o Firebase Email Service. Ao criar um convite, o sistema automaticamente:

1. Cria um documento na coleção `mail`
2. A extensão processa e envia o email
3. Logs são gerados no console

---

## 🔧 Configuração Avançada

### **Personalizar Templates**

Os templates HTML são gerados no código (`firebaseEmailService.ts`). Você pode personalizar:

- Cores e estilos
- Layout
- Conteúdo
- Branding

### **Configurar Domínios Autorizados**

Se usar um domínio customizado:

1. Firebase Console → **Authentication** → **Settings**
2. Adicione seu domínio em **Authorized domains**
3. Configure DNS para verificação (se necessário)

### **Monitoramento**

1. Firebase Console → **Functions** → **Trigger Email**
2. Veja logs de execução
3. Monitore erros e tentativas

---

## 🔄 Fallback para Brevo

O sistema mantém compatibilidade com Brevo como fallback:

1. Se a extensão Trigger Email não estiver instalada, tenta Brevo
2. Se Brevo também falhar, mostra link no console

Para usar Brevo como fallback, configure:
```env
NEXT_PUBLIC_BREVO_API_KEY=sua-chave
NEXT_PUBLIC_BREVO_SENDER_EMAIL=noreply@entomonitec.com.br
NEXT_PUBLIC_BREVO_SENDER_NAME=EntomoVigilância
```

---

## 🐛 Troubleshooting

### **Email não está sendo enviado**

1. ✅ Verifique se a extensão está instalada e ativa
2. ✅ Verifique os logs da Cloud Function no Firebase Console
3. ✅ Verifique se o documento foi criado na coleção `mail`
4. ✅ Verifique as credenciais SMTP
5. ✅ Verifique se o email não foi para SPAM

### **Erro de autenticação SMTP**

- **Gmail**: Certifique-se de usar senha de app, não a senha normal
- **SendGrid**: Verifique se a API Key está correta
- **Outros**: Verifique formato da URI de conexão

### **Emails indo para SPAM**

1. Configure SPF no DNS do seu domínio
2. Configure DKIM (se suportado pelo provedor)
3. Use um domínio verificado
4. Evite palavras-chave de spam no conteúdo

---

## 📚 Referências

- [Firebase Extensions - Trigger Email](https://firebase.google.com/docs/extensions/official/firestore-send-email)
- [Documentação do Projeto](./README.md)
- [Configuração SMTP - Gmail](https://support.google.com/mail/answer/7126229)
- [SendGrid SMTP](https://docs.sendgrid.com/for-developers/sending-email/getting-started-smtp)

---

## 🎯 Vantagens do Firebase Email

✅ **Nativo**: Integrado com Firebase  
✅ **Sem IPs**: Não precisa autorizar IPs  
✅ **Escalável**: Processa automaticamente  
✅ **Confiável**: Usa Cloud Functions  
✅ **Monitoramento**: Logs integrados  
✅ **Flexível**: Suporta múltiplos provedores SMTP  

---

**Última Atualização**: 02/09/2025  
**Versão**: 1.0  
**Sistema**: Entomonitec - Vigilância Entomológica

