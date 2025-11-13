# 🔧 Troubleshooting: Reset de Senha não está funcionando

**Guia para diagnosticar e resolver problemas com reset de senha**

---

## 🔍 Problema: Email de reset não está chegando

### **Checklist de Verificação**

#### ✅ **1. Verificar se o email está cadastrado no Firebase**

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Vá em **Authentication** → **Users**
3. Verifique se o email existe na lista
4. Se não existir, o erro será `auth/user-not-found`

**Solução:** O usuário precisa estar cadastrado no Firebase Authentication antes de solicitar reset.

---

#### ✅ **2. Verificar Domínios Autorizados no Firebase**

**Este é o problema mais comum!**

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Vá em **Authentication** → **Settings** → **Authorized domains**
3. Verifique se seu domínio está na lista

**Domínios que devem estar autorizados:**
- `localhost` (para desenvolvimento)
- `127.0.0.1` (para desenvolvimento)
- Seu domínio de produção (ex: `entomonitec.com.br`)
- Domínio da Vercel (ex: `seu-projeto.vercel.app`)

**Como adicionar:**
1. Clique em **"Add domain"**
2. Digite o domínio (sem `http://` ou `https://`)
3. Clique em **"Add"**

**⚠️ IMPORTANTE:** 
- O Firebase só envia emails se o domínio estiver autorizado
- Domínios locais (`localhost`, `127.0.0.1`) já vêm autorizados por padrão
- Para produção, você DEVE adicionar o domínio manualmente

---

#### ✅ **3. Verificar Console do Navegador**

Abra o console do navegador (F12) e verifique:

**Se aparecer erro:**
```javascript
❌ Erro ao enviar email de recuperação: [objeto de erro]
❌ Código do erro: auth/unauthorized-continue-uri
```

**Significa:** O domínio não está autorizado no Firebase.

**Solução:** Adicione o domínio em **Authentication** → **Settings** → **Authorized domains**

---

#### ✅ **4. Verificar se o email está indo para SPAM**

1. Verifique a pasta de **Spam/Lixo Eletrônico**
2. Procure por emails de `noreply@[seu-projeto].firebaseapp.com`
3. Adicione o remetente aos contatos para evitar spam

---

#### ✅ **5. Verificar Template de Email no Firebase**

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Vá em **Authentication** → **Templates**
3. Clique em **"Password reset"**
4. Verifique se o template está ativo
5. Verifique se há Action URL configurada (pode causar problemas)

**Se Action URL estiver configurada:**
- Certifique-se de que a URL está correta
- Certifique-se de que o domínio está autorizado
- Ou remova a Action URL para usar o padrão do Firebase

---

#### ✅ **6. Verificar Rate Limiting**

O Firebase limita tentativas de reset de senha para prevenir spam.

**Sintomas:**
- Erro: `auth/too-many-requests`
- Mensagem: "Muitas tentativas. Aguarde alguns minutos"

**Solução:**
- Aguarde 15-30 minutos antes de tentar novamente
- Use um email diferente para testar
- Verifique se não há múltiplas tentativas automáticas

---

#### ✅ **7. Verificar Configuração do Firebase**

Verifique se o Firebase está configurado corretamente:

```typescript
// src/lib/firebase.ts
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  // ...
};
```

**Verificar:**
- ✅ Todas as variáveis estão definidas
- ✅ Os valores estão corretos
- ✅ O `authDomain` corresponde ao projeto Firebase correto

---

## 🧪 Teste Passo a Passo

### **Teste 1: Verificar se a função está sendo chamada**

1. Abra o console do navegador (F12)
2. Clique em "Esqueci minha senha"
3. Verifique se aparece:
   ```
   🔄 Iniciando solicitação de reset de senha para: seu@email.com
   ```

**Se não aparecer:** O botão não está chamando a função corretamente.

---

### **Teste 2: Verificar se há erro no console**

Após clicar em "Esqueci minha senha", verifique o console:

**Sucesso esperado:**
```
🔄 Iniciando solicitação de reset de senha para: seu@email.com
✅ Email de reset enviado com sucesso para: seu@email.com
```

**Erro comum:**
```
❌ Erro ao enviar email de recuperação: FirebaseError: ...
❌ Código do erro: auth/unauthorized-continue-uri
```

**Solução:** Adicionar domínio em **Authentication** → **Settings** → **Authorized domains**

---

### **Teste 3: Testar com email válido**

1. Certifique-se de que o email está cadastrado no Firebase
2. Use um email real (não fake)
3. Verifique a caixa de entrada e spam
4. Aguarde até 5 minutos (pode haver delay)

---

### **Teste 4: Verificar logs do Firebase**

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Vá em **Authentication** → **Users**
3. Clique no usuário
4. Verifique a aba **"Security"**
5. Veja se há tentativas de reset registradas

---

## 🔧 Soluções por Tipo de Erro

### **Erro: `auth/user-not-found`**

**Causa:** Email não está cadastrado no Firebase Authentication.

**Solução:**
1. Criar usuário no Firebase Authentication primeiro
2. Ou usar um email que já existe

---

### **Erro: `auth/invalid-email`**

**Causa:** Formato de email inválido.

**Solução:**
- Verificar formato do email (deve ter @ e domínio válido)
- Remover espaços antes/depois do email

---

### **Erro: `auth/too-many-requests`**

**Causa:** Muitas tentativas em pouco tempo.

**Solução:**
- Aguardar 15-30 minutos
- Limpar cache do navegador
- Tentar de outro dispositivo/rede

---

### **Erro: `auth/unauthorized-continue-uri`**

**Causa:** Domínio não está autorizado no Firebase.

**Solução:**
1. Acesse **Authentication** → **Settings** → **Authorized domains**
2. Adicione o domínio completo (ex: `entomonitec.com.br`)
3. Não inclua `http://` ou `https://`
4. Aguarde alguns minutos e tente novamente

---

### **Erro: `auth/invalid-continue-uri`**

**Causa:** URL de redirecionamento inválida.

**Solução:**
- Verificar se a URL está correta no código
- Verificar se a URL usa HTTPS (obrigatório em produção)
- Remover Action URL se não for necessária

---

## 🚀 Solução Rápida (Mais Comum)

**90% dos problemas são causados por domínio não autorizado!**

### **Passos Rápidos:**

1. ✅ Acesse [Firebase Console](https://console.firebase.google.com/)
2. ✅ Vá em **Authentication** → **Settings**
3. ✅ Clique em **"Authorized domains"**
4. ✅ Clique em **"Add domain"**
5. ✅ Digite seu domínio (ex: `entomonitec.com.br`)
6. ✅ Clique em **"Add"**
7. ✅ Aguarde 2-3 minutos
8. ✅ Tente novamente o reset de senha

---

## 📋 Checklist Completo

Antes de reportar o problema, verifique:

- [ ] Email está cadastrado no Firebase Authentication
- [ ] Domínio está autorizado em **Authentication** → **Settings** → **Authorized domains**
- [ ] Console do navegador não mostra erros
- [ ] Email não está na pasta de spam
- [ ] Não excedeu limite de tentativas (aguardar 15-30 min)
- [ ] Template de email está ativo no Firebase
- [ ] Variáveis de ambiente do Firebase estão corretas
- [ ] Está usando HTTPS em produção (obrigatório)

---

## 🔍 Debug Avançado

### **Adicionar mais logs temporariamente**

```typescript
// No handleForgotPassword, adicionar:
console.log('🔍 DEBUG - Email:', email);
console.log('🔍 DEBUG - Auth Domain:', auth.app.options.authDomain);
console.log('🔍 DEBUG - Action URL:', actionCodeSettings.url);
console.log('🔍 DEBUG - Window Origin:', window.location.origin);
```

### **Testar diretamente no Firebase Console**

1. Acesse **Authentication** → **Users**
2. Clique no usuário
3. Clique em **"Reset password"** (no console)
4. Se funcionar pelo console, o problema é no código
5. Se não funcionar pelo console, o problema é na configuração do Firebase

---

## 📞 Se Nada Funcionar

1. **Verificar logs do Firebase:**
   - Firebase Console → **Authentication** → **Users** → **Security**

2. **Verificar se o projeto Firebase está ativo:**
   - Firebase Console → **Project Settings** → **General**

3. **Verificar se há quotas excedidas:**
   - Firebase Console → **Usage and billing**

4. **Contatar suporte Firebase:**
   - Se o problema persistir, pode ser um problema do Firebase

---

## ✅ Verificação Final

Após seguir todos os passos, teste novamente:

1. ✅ Limpar cache do navegador
2. ✅ Fazer logout e login novamente
3. ✅ Tentar reset de senha
4. ✅ Verificar console do navegador
5. ✅ Verificar email (inbox e spam)
6. ✅ Aguardar até 5 minutos

---

**Última Atualização**: 02/09/2025  
**Versão**: 1.0  
**Sistema**: Entomonitec - Vigilância Entomológica

