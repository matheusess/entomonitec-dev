# 🔄 Fluxo de Trabalho - Desenvolvimento e Deploy

Guia prático do dia a dia: como trabalhar localmente e fazer deploy nos ambientes.

---

## 📋 Visão Geral

```
LOCAL → DEV → HOMOLOG → PROD
```

- **LOCAL**: Você trabalha aqui
- **DEV**: Testes rápidos e desenvolvimento
- **HOMOLOG**: Testes finais antes de produção
- **PROD**: Ambiente de produção (clientes reais)

---

## 🚀 Fluxo Completo

### **1. Trabalhar Localmente**

```bash
# Sempre trabalhe na branch dev
git checkout dev

# Faça suas alterações
# ... código ...

# Commit e push
git add .
git commit -m "feat: descrição da alteração"
git push origin dev
```

**O que acontece:**
- ✅ Deploy automático em **DEV** na Vercel
- ✅ URL: `dev.entomonitec.com.br` (ou `.vercel.app`)
- ✅ Firebase: projeto `dev-entomonitec`

---

### **2. Enviar para HOMOLOG**

```bash
# Mudar para branch staging
git checkout staging

# Fazer merge do dev
git merge dev

# Push para staging
git push origin staging
```

**O que acontece:**
- ✅ Deploy automático em **HOMOLOG** na Vercel
- ✅ URL: `homolog.entomonitec.com.br`
- ✅ Firebase: projeto `homolog-entomonitec`
- ⚠️ **Aprovação manual** (se configurado na Vercel)

**Quando fazer:**
- Quando quiser testar em ambiente mais próximo de produção
- Antes de enviar para produção
- Para cliente testar

---

### **3. Enviar para PROD**

```bash
# Mudar para branch main
git checkout main

# Fazer merge do staging
git merge staging

# Push para main
git push origin main
```

**O que acontece:**
- ✅ Deploy automático em **PROD** na Vercel
- ✅ URL: `app.entomonitec.com.br` (ou domínio de produção)
- ✅ Firebase: projeto `prod-entomonitec`
- ⚠️ **Aprovação manual** (se configurado na Vercel)

**Quando fazer:**
- Após testes em HOMOLOG
- Após aprovação do cliente
- Quando estiver pronto para produção

---

## 📁 Estrutura de Branches

| Branch | Ambiente | Deploy | Firebase | URL |
|--------|----------|--------|----------|-----|
| `dev` | DEV | Automático | `dev-entomonitec` | `dev.entomonitec.com.br` |
| `staging` | HOMOLOG | Automático* | `homolog-entomonitec` | `homolog.entomonitec.com.br` |
| `main` | PROD | Automático* | `prod-entomonitec` | `app.entomonitec.com.br` |

*Pode requerer aprovação manual na Vercel

---

## ⚙️ Configuração Local

### **Variáveis de Ambiente**

Você precisa de **apenas 1 arquivo** `.env.local`:

```env
# Sempre aponta para DEV no desenvolvimento local
NEXT_PUBLIC_FIREBASE_PROJECT_ID=dev-entomonitec
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=dev-entomonitec.firebaseapp.com
# ... outras variáveis do DEV ...
```

**Importante:**
- ✅ `.env.local` aponta para **DEV** (não commitado no Git)
- ✅ Vercel tem variáveis próprias para cada projeto (configuradas no painel)
- ❌ **NÃO** precisa de 3 arquivos `.env` diferentes

---

## 🔄 Comandos Úteis

### **Verificar branch atual**
```bash
git branch
```

### **Ver status das alterações**
```bash
git status
```

### **Ver histórico de commits**
```bash
git log --oneline
```

### **Desfazer alterações locais (cuidado!)**
```bash
git checkout .
```

### **Atualizar branch local**
```bash
git pull origin dev
```

---

## ⚠️ Boas Práticas

### ✅ **FAZER:**
- Sempre trabalhar na branch `dev` localmente
- Fazer commits pequenos e frequentes
- Testar em DEV antes de enviar para HOMOLOG
- Testar em HOMOLOG antes de enviar para PROD
- Usar mensagens de commit descritivas

### ❌ **NÃO FAZER:**
- Trabalhar diretamente em `main` ou `staging`
- Fazer merge de `dev` direto para `main` (pular HOMOLOG)
- Commitar arquivos `.env.local` ou `.env`
- Fazer deploy manual sem testar antes

---

## 🐛 Troubleshooting

### **Deploy não iniciou automaticamente**
1. Verifique se fez push para a branch correta
2. Verifique configuração na Vercel (Settings → Git)
3. Verifique se há erros no build

### **Erro de variáveis de ambiente**
1. Verifique se configurou no painel da Vercel
2. Verifique se selecionou os ambientes corretos (Development, Preview, Production)
3. Verifique se os valores estão corretos

### **Firebase conectado ao projeto errado**
1. Verifique variáveis de ambiente no projeto Vercel
2. Verifique `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
3. Verifique se está no projeto Firebase correto

---

## 📚 Documentação Relacionada

- [Guia DevOps Completo](./devops/GUIA_DEVOPS_VERCEL.md) - Configuração detalhada
- [Arquitetura DevOps](./devops/ARQUITETURA_DEVOPS.md) - Visão geral da arquitetura

---

**Última Atualização**: 02/09/2025  
**Versão**: 1.0  
**Sistema**: Entomonitec - Vigilância Entomológica

