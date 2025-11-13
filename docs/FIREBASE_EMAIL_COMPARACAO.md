# 📧 Diferença: Firebase Auth Templates vs Trigger Email Extension

## 🎯 Resumo Rápido

| Recurso | Firebase Auth Templates | Trigger Email Extension |
|---------|------------------------|-------------------------|
| **Uso** | Apenas autenticação | Emails transacionais personalizados |
| **Exemplos** | Verificação de email, reset de senha | Convites, notificações, relatórios |
| **Personalização** | Limitada (templates pré-definidos) | Total (HTML customizado) |
| **Onde configurar** | Firebase Console → Authentication → Templates | Firebase Console → Extensions |
| **Como funciona** | Automático quando usuário faz ação de auth | Cria documento no Firestore → envia email |

---

## 🔐 Firebase Auth Templates (O que você está vendo)

### **O que são:**
Templates de email **pré-configurados** do Firebase Authentication para ações de autenticação.

### **Templates disponíveis:**
1. ✅ **Verificação de endereço de e-mail** - Quando usuário se cadastra
2. ✅ **Redefinição de senha** - Quando usuário solicita reset
3. ✅ **Alteração de endereço de e-mail** - Quando usuário muda email
4. ✅ **Notificação de registro** - Quando novo dispositivo faz login

### **Limitações:**
- ❌ **Não serve para convites personalizados**
- ❌ **Não permite HTML customizado completo**
- ❌ **Só funciona para ações de autenticação**
- ❌ **Não pode enviar emails para pessoas não cadastradas**

### **Quando usar:**
- ✅ Reset de senha (já está funcionando no seu sistema)
- ✅ Verificação de email ao cadastrar
- ✅ Notificações de segurança

---

## 📧 Trigger Email Extension (Para convites)

### **O que é:**
Uma **extensão oficial do Firebase** que monitora uma coleção do Firestore e envia emails automaticamente quando documentos são criados.

### **Como funciona:**
```
1. Código cria documento na coleção 'mail'
   ↓
2. Extensão detecta novo documento
   ↓
3. Cloud Function processa e envia email via SMTP
   ↓
4. Email é entregue ao destinatário
```

### **Vantagens:**
- ✅ **HTML totalmente customizado**
- ✅ **Pode enviar para qualquer email** (não precisa estar cadastrado)
- ✅ **Templates personalizados por tipo de email**
- ✅ **Metadados customizados**
- ✅ **Integrado com Firebase**

### **Quando usar:**
- ✅ **Emails de convite** (seu caso)
- ✅ Notificações personalizadas
- ✅ Relatórios por email
- ✅ Qualquer email transacional

---

## 🎯 Para o Seu Caso: Convites

### **Problema:**
Você precisa enviar emails de convite para pessoas que **ainda não estão cadastradas** no sistema. Os templates do Firebase Auth **não fazem isso**.

### **Solução:**
Use a **Trigger Email Extension** que já implementei no código.

### **Como configurar:**

#### **1. Instalar a Extensão**

1. Firebase Console → **Extensions** (ou **Extensões**)
2. Clique em **"Browse all extensions"**
3. Procure **"Trigger Email"**
4. Clique em **"Install"**

#### **2. Configurar durante instalação**

**Coleção do Firestore:**
- Collection path: `mail` (padrão)

**Provedor SMTP:**
Escolha um:

**Opção A: Gmail (mais fácil para começar)**
```
SMTP connection URI: smtps://seu-email@gmail.com:senha-de-app@smtp.gmail.com:465
```

**Como obter senha de app do Gmail:**
1. Google Account → Segurança
2. Ative verificação em duas etapas
3. Vá em "Senhas de app"
4. Crie senha para "Email"
5. Use essa senha no lugar de `senha-de-app`

**Opção B: SendGrid**
```
SMTP connection URI: smtps://apikey:SUA_API_KEY@smtp.sendgrid.net:465
```

**Opção C: Outro provedor SMTP**
- Consulte documentação do seu provedor

**Remetente:**
- From email: `noreply@entomonitec.com.br` (ou seu domínio)
- From name: `EntomoVigilância`

#### **3. Testar**

Após instalar, ao criar um convite:
1. O código cria documento na coleção `mail`
2. A extensão detecta e envia email automaticamente
3. Email chega no destinatário

---

## 📋 Comparação Prática

### **Cenário: Enviar convite para novo usuário**

#### **Com Firebase Auth Templates:**
❌ **NÃO FUNCIONA**
- Usuário precisa estar cadastrado primeiro
- Template é genérico
- Não permite personalização completa

#### **Com Trigger Email Extension:**
✅ **FUNCIONA PERFEITAMENTE**
- Envia para qualquer email
- HTML totalmente customizado
- Pode incluir dados da organização
- Link de convite personalizado

---

## 🔄 Fluxo Completo de Convite

### **1. Criar Convite (Código já faz isso)**
```typescript
// Cria documento na coleção 'mail'
await FirebaseEmailService.sendInviteEmail({
  toEmail: 'novo@usuario.com',
  toName: 'João Silva',
  organizationName: 'Prefeitura de Curitiba',
  inviteUrl: 'https://app.com/complete-signup?token=abc123',
  // ...
});
```

### **2. Extensão Processa**
- Detecta novo documento em `mail`
- Extrai dados do email
- Envia via SMTP configurado

### **3. Usuário Recebe Email**
- Email HTML personalizado
- Botão "Aceitar Convite"
- Link direto para cadastro

### **4. Usuário Completa Cadastro**
- Clica no link
- Preenche dados
- Sistema cria usuário no Firebase Auth

---

## ✅ Resumo

**O que você está vendo (Firebase Auth Templates):**
- ✅ Serve para reset de senha (já funciona)
- ❌ **NÃO serve para convites**

**O que você precisa (Trigger Email Extension):**
- ✅ Serve para convites personalizados
- ✅ Já está implementado no código
- ✅ Só precisa instalar e configurar a extensão

---

## 🚀 Próximos Passos

1. **Instalar Trigger Email Extension** no Firebase Console
2. **Configurar SMTP** (Gmail, SendGrid, etc.)
3. **Testar criando um convite**
4. **Verificar email recebido**

Veja o guia completo em: [FIREBASE_EMAIL_SETUP.md](./FIREBASE_EMAIL_SETUP.md)

---

**Última Atualização**: 02/09/2025  
**Versão**: 1.0

