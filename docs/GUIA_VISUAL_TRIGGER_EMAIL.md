# 📧 Guia Visual: Configurar Trigger Email Extension

Guia passo a passo com instruções detalhadas para instalar e configurar a extensão Trigger Email do Firebase para enviar emails de convite.

---

## 🎯 Objetivo

Configurar o envio automático de emails de convite usando a extensão oficial do Firebase, sem depender de serviços externos como Brevo.

---

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter:

- ✅ Acesso ao Firebase Console do seu projeto
- ✅ Permissões de administrador no projeto
- ✅ Uma conta de email para usar como remetente (Gmail, SendGrid, etc.)

---

## 🚀 Passo 1: Acessar Firebase Console

1. Acesse [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Selecione seu projeto (ex: `dev-entomonitec` ou `entomonitec`)
3. No menu lateral esquerdo, procure por **"Extensions"** ou **"Extensões"**

   **Onde encontrar:**
   - Geralmente está abaixo de "Functions" (Funções)
   - Ou no menu "Build" (Construir)

---

## 🔍 Passo 2: Procurar Trigger Email

1. Na página de Extensions, clique em **"Browse all extensions"** ou **"Explorar todas as extensões"**
2. Na barra de busca, digite: **"Trigger Email"**
3. Você verá a extensão oficial: **"Trigger Email"** (por Firebase)
4. Clique na extensão para ver detalhes

   **Descrição esperada:**
   - "Sends emails based on Firestore document writes"
   - "Envia emails baseado em escritas de documentos do Firestore"

---

## 📥 Passo 3: Instalar a Extensão

1. Clique no botão **"Install"** ou **"Instalar"**
2. Se solicitado, aceite os termos de uso
3. Aguarde alguns segundos enquanto o Firebase prepara a instalação

---

## ⚙️ Passo 4: Configurar a Extensão

Durante a instalação, você verá um formulário de configuração. Preencha os campos:

### **4.1. Informações Básicas**

#### **Collection path (Caminho da coleção)**
```
mail
```
- ✅ Deixe como está (padrão)
- Esta é a coleção que o código já está usando

#### **Location (Localização)**
```
us-central1
```
- ✅ Deixe como está (padrão)
- Ou escolha a região mais próxima do Brasil: `southamerica-east1` (São Paulo)

---

### **4.2. Configuração SMTP (IMPORTANTE)**

Aqui você precisa escolher um provedor de email. Vou mostrar as opções mais comuns:

#### **Opção A: Gmail (Recomendado para começar)**

**Vantagens:**
- ✅ Gratuito
- ✅ Fácil de configurar
- ✅ Bom para testes

**Configuração:**

1. **SMTP connection URI:**
   ```
   smtps://seu-email@gmail.com:senha-de-app@smtp.gmail.com:465
   ```

2. **Como obter a senha de app do Gmail:**

   **Passo 1:** Acesse [Google Account](https://myaccount.google.com/)
   
   **Passo 2:** Vá em **Segurança** (Security)
   
   **Passo 3:** Ative **Verificação em duas etapas** (se ainda não tiver)
   
   **Passo 4:** Depois de ativar, volte para Segurança
   
   **Passo 5:** Procure por **"Senhas de app"** (App passwords)
   
   **Passo 6:** Clique em **"Selecionar app"** → Escolha **"Email"**
   
   **Passo 7:** Clique em **"Selecionar dispositivo"** → Escolha **"Outro"** → Digite "Firebase"
   
   **Passo 8:** Clique em **"Gerar"**
   
   **Passo 9:** Copie a senha gerada (16 caracteres, sem espaços)
   
   **Passo 10:** Use no formato:
   ```
   smtps://seu-email@gmail.com:SENHA_GERADA_AQUI@smtp.gmail.com:465
   ```
   
   **Exemplo:**
   ```
   smtps://entomonitec@gmail.com:abcd efgh ijkl mnop@smtp.gmail.com:465
   ```
   (Remova os espaços da senha: `abcdefghijklmnop`)

---

#### **Opção B: SendGrid (Recomendado para produção)**

**Vantagens:**
- ✅ Mais profissional
- ✅ Melhor deliverability
- ✅ Estatísticas detalhadas
- ✅ Plano gratuito: 100 emails/dia

**Configuração:**

1. **Criar conta no SendGrid:**
   - Acesse [https://sendgrid.com/](https://sendgrid.com/)
   - Crie uma conta gratuita
   - Verifique seu email

2. **Criar API Key:**
   - SendGrid Dashboard → **Settings** → **API Keys**
   - Clique em **"Create API Key"**
   - Nome: "Firebase Trigger Email"
   - Permissões: **"Full Access"** (ou apenas "Mail Send")
   - Clique em **"Create & View"**
   - **COPIE A API KEY** (só aparece uma vez!)

3. **SMTP connection URI:**
   ```
   smtps://apikey:SUA_API_KEY_AQUI@smtp.sendgrid.net:465
   ```
   
   **Exemplo:**
   ```
   smtps://apikey:SG.abc123xyz456@smtp.sendgrid.net:465
   ```

---

#### **Opção C: Mailgun (Alternativa)**

**Configuração:**

1. Crie conta em [Mailgun](https://www.mailgun.com/)
2. Obtenha credenciais SMTP
3. Use no formato:
   ```
   smtps://postmaster@seu-dominio.mailgun.org:senha@smtp.mailgun.org:465
   ```

---

### **4.3. Configuração do Remetente**

#### **Default from email (Email remetente padrão)**
```
noreply@entomonitec.com.br
```
- Use um email válido do seu domínio
- Ou use o mesmo email do Gmail se estiver usando Gmail

#### **Default from name (Nome remetente padrão)**
```
EntomoVigilância
```
- Nome que aparecerá como remetente

#### **Default reply-to email (Email de resposta)**
```
suporte@entomonitec.com.br
```
- (Opcional) Email para onde respostas serão enviadas
- Pode deixar vazio

---

### **4.4. Configurações Avançadas (Opcional)**

#### **Maximum emails per day (Máximo de emails por dia)**
```
1000
```
- Limite de segurança
- Ajuste conforme necessário

#### **Maximum emails per second (Máximo de emails por segundo)**
```
10
```
- Taxa de envio
- Deixe padrão se não souber

---

## ✅ Passo 5: Finalizar Instalação

1. Revise todas as configurações
2. Verifique especialmente a **SMTP connection URI**
3. Clique em **"Install"** ou **"Instalar"**
4. Aguarde a instalação (pode levar 2-5 minutos)

   **O que acontece:**
   - Firebase cria uma Cloud Function
   - Configura triggers do Firestore
   - Testa a conexão SMTP

---

## 🧪 Passo 6: Testar a Configuração

### **Teste Manual no Firestore:**

1. Firebase Console → **Firestore Database**
2. Clique em **"Start collection"** ou use a coleção `mail`
3. Crie um documento com ID automático
4. Adicione os seguintes campos:

   ```json
   {
     "to": "seu-email-pessoal@exemplo.com",
     "message": {
       "subject": "Teste de Email - Firebase",
       "html": "<h1>Teste</h1><p>Este é um email de teste do Firebase Trigger Email.</p>",
       "text": "Teste\n\nEste é um email de teste do Firebase Trigger Email."
     }
   }
   ```

5. Salve o documento
6. Aguarde 10-30 segundos
7. Verifique sua caixa de entrada (e spam)
8. Você deve receber o email!

### **Teste via Código (Criar Convite):**

1. Acesse o sistema
2. Vá em **Usuários** → **Criar Convite**
3. Preencha os dados:
   - Nome: "Teste"
   - Email: seu email pessoal
   - Cargo: Agente
4. Clique em **"Enviar Convite"**
5. Verifique o console do navegador (F12) para logs
6. Verifique sua caixa de entrada

---

## 🔍 Passo 7: Verificar Logs e Status

### **Verificar se a extensão está funcionando:**

1. Firebase Console → **Functions** (Funções)
2. Procure por função com nome: **"ext-firestore-send-email-..."**
3. Clique na função
4. Vá em **"Logs"** para ver execuções
5. Você verá logs quando emails forem enviados

### **Verificar erros:**

Se o email não chegar:

1. Verifique os logs da função
2. Verifique se o documento foi criado na coleção `mail`
3. Verifique se a SMTP connection URI está correta
4. Verifique se o email não foi para SPAM

---

## 🐛 Troubleshooting

### **Problema: Email não está sendo enviado**

**Soluções:**

1. ✅ Verifique se a extensão está instalada e ativa
2. ✅ Verifique os logs da Cloud Function
3. ✅ Verifique se o documento foi criado na coleção `mail`
4. ✅ Verifique a SMTP connection URI (formato correto)
5. ✅ Teste a conexão SMTP manualmente

### **Problema: Erro de autenticação SMTP**

**Gmail:**
- ✅ Certifique-se de usar **senha de app**, não a senha normal
- ✅ Verifique se verificação em duas etapas está ativa
- ✅ Gere uma nova senha de app se necessário

**SendGrid:**
- ✅ Verifique se a API Key está correta
- ✅ Verifique se tem permissão "Mail Send"
- ✅ Tente criar uma nova API Key

### **Problema: Emails indo para SPAM**

**Soluções:**

1. Configure SPF no DNS do seu domínio
2. Configure DKIM (se suportado)
3. Use um domínio verificado
4. Evite palavras-chave de spam no conteúdo
5. Peça para adicionar remetente aos contatos

---

## 📊 Estrutura do Documento na Coleção `mail`

O código já cria documentos no formato correto. Exemplo:

```json
{
  "to": "usuario@exemplo.com",
  "message": {
    "subject": "Convite para Prefeitura de Curitiba - Sistema EntomoVigilância",
    "html": "<html>...conteúdo HTML...</html>",
    "text": "Versão texto do email..."
  },
  "metadata": {
    "type": "invite",
    "organizationName": "Prefeitura de Curitiba",
    "role": "agent",
    "invitedByName": "Admin",
    "expiresAt": "2025-09-09T00:00:00.000Z"
  },
  "createdAt": "2025-09-02T10:30:00.000Z"
}
```

---

## ✅ Checklist Final

Antes de considerar configurado:

- [ ] Extensão Trigger Email instalada
- [ ] SMTP connection URI configurada corretamente
- [ ] Email remetente configurado
- [ ] Teste manual no Firestore funcionou
- [ ] Teste via código (criar convite) funcionou
- [ ] Email chegou na caixa de entrada (não spam)
- [ ] Logs da função mostram sucesso

---

## 🎯 Próximos Passos

Após configurar:

1. ✅ Teste criando alguns convites
2. ✅ Monitore os logs da função
3. ✅ Ajuste templates HTML se necessário (em `firebaseEmailService.ts`)
4. ✅ Configure domínio customizado (opcional)
5. ✅ Configure SPF/DKIM para melhor deliverability (opcional)

---

## 📚 Referências

- [Firebase Extensions - Trigger Email](https://firebase.google.com/docs/extensions/official/firestore-send-email)
- [Gmail - Senhas de app](https://support.google.com/accounts/answer/185833)
- [SendGrid - SMTP](https://docs.sendgrid.com/for-developers/sending-email/getting-started-smtp)
- [Documentação do Projeto](./README.md)

---

## 💡 Dicas

1. **Para desenvolvimento:** Use Gmail (mais fácil)
2. **Para produção:** Use SendGrid ou Mailgun (mais profissional)
3. **Teste sempre** antes de usar em produção
4. **Monitore os logs** regularmente
5. **Configure limites** de envio para evitar abuso

---

**Última Atualização**: 02/09/2025  
**Versão**: 1.0  
**Sistema**: Entomonitec - Vigilância Entomológica

---

## 🆘 Precisa de Ajuda?

Se tiver problemas:

1. Verifique os logs da Cloud Function
2. Teste a conexão SMTP manualmente
3. Consulte a documentação oficial do Firebase
4. Verifique se todos os campos estão preenchidos corretamente

---

**Boa sorte com a configuração! 🚀**

