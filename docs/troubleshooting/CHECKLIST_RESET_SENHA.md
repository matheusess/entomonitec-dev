# ✅ Checklist: Email de Reset de Senha não chegou

Use este checklist para diagnosticar por que o email de reset não está chegando.

---

## 🔍 Verificações Rápidas

### **1. Verificar Console do Navegador (F12)**

Abra o console e procure por:

- ✅ **Sucesso:** `✅ Email de reset enviado com sucesso para: email@exemplo.com`
- ❌ **Erro:** Qualquer mensagem de erro (copie o código do erro)

**Erros comuns:**
- `auth/user-not-found` → Email não cadastrado no Firebase
- `auth/unauthorized-continue-uri` → Domínio não autorizado
- `auth/invalid-email` → Formato de email inválido

---

### **2. Verificar se Email está Cadastrado**

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Vá em **Authentication** → **Users**
3. Procure pelo email que você usou
4. Se não encontrar, o erro será `auth/user-not-found`

**Solução:** O usuário precisa estar cadastrado primeiro.

---

### **3. Verificar Domínios Autorizados (MAIS COMUM)**

**Este é o problema mais comum!**

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Vá em **Authentication** → **Settings** → **Authorized domains**
3. Verifique se seu domínio está na lista

**Para desenvolvimento local:**
- `localhost` (já vem por padrão)
- `127.0.0.1` (já vem por padrão)

**Para produção:**
- Seu domínio (ex: `entomonitec.com.br`)
- Domínio da Vercel (ex: `seu-projeto.vercel.app`)

**Como adicionar:**
1. Clique em **"Add domain"**
2. Digite o domínio (sem `http://` ou `https://`)
3. Clique em **"Add"**

**⚠️ IMPORTANTE:** 
- O Firebase **NÃO envia emails** se o domínio não estiver autorizado
- Você verá o erro `auth/unauthorized-continue-uri` no console

---

### **4. Verificar Pasta de SPAM**

1. Abra sua caixa de entrada
2. Verifique a pasta de **Spam/Lixo Eletrônico**
3. Procure por emails de `noreply@entomonitec.firebaseapp.com` ou similar

**Dica:** Adicione o remetente aos contatos para evitar ir para spam.

---

### **5. Verificar Configuração do Template (Opcional)**

O template bonito é opcional. O Firebase envia emails mesmo sem configurar.

Mas se quiser o template bonito:

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Vá em **Authentication** → **Templates**
3. Clique em **"Password reset"**
4. Verifique se está configurado (ou configure usando `docs/FIREBASE_RESET_SENHA_TEMPLATE.md`)

**Nota:** O template não afeta o envio, apenas a aparência do email.

---

### **6. Verificar Rate Limiting**

O Firebase limita tentativas de reset:

- Muitas tentativas em pouco tempo → Erro `auth/too-many-requests`
- Aguarde alguns minutos antes de tentar novamente

---

## 🧪 Teste Rápido

1. Abra o console do navegador (F12)
2. Vá na tela de login
3. Digite um email válido (que você sabe que está cadastrado)
4. Clique em "Esqueci minha senha"
5. Observe o console:
   - ✅ Se aparecer `✅ Email de reset enviado` → Email foi enviado
   - ❌ Se aparecer erro → Copie o código do erro e veja a solução acima

---

## 📊 Fluxo de Diagnóstico

```
Você solicitou reset?
  ↓
Console mostra erro?
  ├─ SIM → Veja código do erro acima
  └─ NÃO → Email foi enviado
      ↓
Email chegou?
  ├─ SIM → ✅ Tudo funcionando!
  └─ NÃO → Verifique:
      ├─ Pasta de SPAM
      ├─ Domínio autorizado no Firebase
      ├─ Email está cadastrado
      └─ Rate limiting (muitas tentativas)
```

---

## 🔧 Soluções por Erro

| Código do Erro | Solução |
|----------------|---------|
| `auth/user-not-found` | Email não está cadastrado no Firebase |
| `auth/unauthorized-continue-uri` | Adicionar domínio em **Authentication** → **Settings** → **Authorized domains** |
| `auth/invalid-email` | Verificar formato do email |
| `auth/too-many-requests` | Aguardar alguns minutos |
| `auth/invalid-continue-uri` | Verificar URL de redirecionamento no código |

---

## 💡 Dicas

1. **Sempre verifique o console primeiro** - Ele mostra exatamente o que está acontecendo
2. **Domínio autorizado é o problema mais comum** - Sempre verifique isso primeiro
3. **Emails podem demorar alguns minutos** - Aguarde 2-3 minutos antes de considerar que não chegou
4. **SPAM é comum** - Sempre verifique a pasta de spam
5. **Use email de teste** - Teste com um email que você tem acesso direto

---

## 📞 Se nada funcionar

1. Verifique os logs do Firebase Console:
   - **Authentication** → **Users** → Clique no usuário → Veja histórico
2. Verifique se o projeto Firebase está ativo
3. Verifique se há limites de quota atingidos
4. Entre em contato com suporte do Firebase se necessário

---

**Última Atualização**: 02/09/2025  
**Versão**: 1.0  
**Sistema**: Entomonitec - Vigilância Entomológica

