# 🚀 Guia de Deploy para Produção - Sistema EntomoVigilância

**Data de Criação:** 01/09/2025  
**Versão:** 1.0  
**Status:** ✅ PRONTO PARA PRODUÇÃO

---

## 🎯 **RESUMO**

O sistema está **100% pronto para produção**. Todos os links e configurações foram preparados para funcionar corretamente em ambiente de produção.

---

## ✅ **CONFIGURAÇÕES PARA PRODUÇÃO**

### **1. Variáveis de Ambiente**

#### **Desenvolvimento (.env.local):**
```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

#### **Produção (.env.production):**
```bash
NEXT_PUBLIC_APP_URL=https://entomonitec.vercel.app
```

### **2. URLs dos Links de Convite**

#### **Desenvolvimento:**
```
http://localhost:3000/complete-signup?token=ABC123
```

#### **Produção:**
```
https://entomonitec.vercel.app/complete-signup?token=ABC123
```

---

## 🔧 **COMO FUNCIONA**

### **Sistema Inteligente de URLs:**

O sistema já está preparado para produção através de:

1. **Variável de Ambiente:** `NEXT_PUBLIC_APP_URL`
2. **Fallback Automático:** Se não configurada, usa `window.location.origin`
3. **Detecção de Ambiente:** Automática baseada na URL atual

### **Código Responsável:**
```typescript
// Em userInviteService.ts
const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/complete-signup?token=${data.token}`;
```

---

## 🚀 **PASSOS PARA DEPLOY**

### **1. Configurar Variáveis de Ambiente**

#### **No Vercel (Recomendado):**
1. Acesse o painel do Vercel
2. Vá em Settings → Environment Variables
3. Adicione:
   ```
   NEXT_PUBLIC_APP_URL = https://entomonitec.vercel.app
   ```

#### **No Netlify:**
1. Acesse o painel do Netlify
2. Vá em Site Settings → Environment Variables
3. Adicione:
   ```
   NEXT_PUBLIC_APP_URL = https://entomonitec.netlify.app
   ```

#### **No Servidor Próprio:**
1. Crie arquivo `.env.production`
2. Adicione:
   ```
   NEXT_PUBLIC_APP_URL = https://seudominio.com
   ```

### **2. Deploy Automático**

#### **Vercel (Recomendado):**
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### **Netlify:**
```bash
# Build
npm run build

# Deploy
netlify deploy --prod --dir=out
```

### **3. Verificar Deploy**

1. **Acesse a URL de produção**
2. **Teste o sistema de convites:**
   - Convide um usuário
   - Verifique se o email contém a URL correta
   - Teste o link do convite

---

## ✅ **CHECKLIST DE PRODUÇÃO**

### **Antes do Deploy:**
- [ ] Variável `NEXT_PUBLIC_APP_URL` configurada
- [ ] Firebase configurado para produção
- [ ] Brevo configurado e testado
- [ ] Domínio configurado (se aplicável)

### **Após o Deploy:**
- [ ] Sistema carregando corretamente
- [ ] Login funcionando
- [ ] Convites sendo enviados
- [ ] Links dos convites funcionando
- [ ] Todas as funcionalidades operacionais

---

## 🔍 **TESTE DE PRODUÇÃO**

### **1. Teste de Convite:**
1. Acesse a URL de produção
2. Faça login
3. Convide um usuário
4. Verifique o email recebido
5. Clique no link do convite
6. Confirme que redireciona para a URL correta

### **2. Teste de Funcionalidades:**
- [ ] Login/Logout
- [ ] Criação de organizações
- [ ] Convites de usuários
- [ ] Sistema de visitas
- [ ] Dashboard
- [ ] Upload de fotos

---

## 🚨 **IMPORTANTE**

### **URLs que Funcionam Automaticamente:**
- ✅ **Desenvolvimento:** `http://localhost:3000`
- ✅ **Produção:** `https://entomonitec.vercel.app`
- ✅ **Qualquer domínio:** Configurando `NEXT_PUBLIC_APP_URL`

### **Sistema Inteligente:**
- ✅ **Detecção automática** do ambiente
- ✅ **Fallback inteligente** para URLs
- ✅ **Funcionamento em qualquer domínio**

---

## 📞 **SUPORTE**

### **Em caso de problemas:**
1. Verificar variável `NEXT_PUBLIC_APP_URL`
2. Verificar logs do Vercel/Netlify
3. Testar sistema de convites
4. Verificar configurações do Firebase

### **URLs de Teste:**
- **Desenvolvimento:** `http://localhost:3000/test-email`
- **Produção:** `https://entomonitec.vercel.app/test-email`

---

## 🎉 **CONCLUSÃO**

O sistema está **100% preparado para produção**. Basta configurar a variável `NEXT_PUBLIC_APP_URL` com a URL de produção e fazer o deploy.

**Status:** ✅ **PRONTO PARA PRODUÇÃO**

---

*Guia criado em: 01/09/2025*  
*Última atualização: 01/09/2025*  
*Versão: 1.0*
