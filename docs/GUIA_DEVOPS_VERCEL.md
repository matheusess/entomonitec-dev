# 🚀 Guia Prático: DevOps com Vercel (DEV, HOMOLOG, PROD)

**Guia passo a passo para configurar 3 ambientes separados na Vercel com projetos Firebase isolados**

---

## 📋 Visão Geral

Este guia mostra como configurar:
- ✅ **3 projetos Vercel** (um para cada ambiente)
- ✅ **3 projetos Firebase** (um para cada ambiente)
- ✅ **Deploy automático** por branch
- ✅ **Variáveis de ambiente** isoladas (configuradas no painel Vercel, não em arquivos)
- ✅ **Domínios** separados

### **⚠️ Entendendo Variáveis de Ambiente**

**Você NÃO precisa criar 3 arquivos `.env` diferentes!**

- **Desenvolvimento Local:** Use `.env.local` (um único arquivo, não commitado)
- **Vercel:** Configure variáveis diretamente no painel (uma configuração por projeto)
- **Cada ambiente** (DEV, HOMOLOG, PROD) tem suas próprias variáveis no painel Vercel

---

## 🎯 Estrutura Final

```
┌─────────────────────────────────────────────────────────┐
│                    REPOSITÓRIO GIT                      │
│                  (mesmo código-fonte)                   │
└─────────────────────────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
   ┌────▼────┐     ┌────▼────┐     ┌────▼────┐
   │ develop │     │staging  │     │  main   │
   └────┬────┘     └────┬────┘     └────┬────┘
        │               │               │
   ┌────▼───────────────▼───────────────▼────┐
   │         VERCEL (3 Projetos)              │
   ├──────────────────────────────────────────┤
   │  DEV Project    → dev.entomonitec.com.br │
   │  HOMOLOG Project → homolog.entomonitec...│
   │  PROD Project    → app.entomonitec.com.br│
   └────┬───────────────┬───────────────┬────┘
        │               │               │
   ┌────▼───────────────▼───────────────▼────┐
   │      FIREBASE (3 Projetos Separados)     │
   ├──────────────────────────────────────────┤
   │  entomonitec-dev                         │
   │  entomonitec-homolog                     │
   │  entomonitec-prod                        │
   └──────────────────────────────────────────┘
```

---

## 📝 Passo 1: Criar 3 Projetos Firebase

### **1.1. Criar Projeto DEV**

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em **"Adicionar projeto"**
3. **Nome do projeto:** `entomonitec-dev`
4. **Project ID:** `entomonitec-dev` (ou deixe gerar automaticamente)
5. **Google Analytics:** Desabilitar (ou habilitar se quiser)
6. Clique em **"Criar projeto"**

**Após criar, anote:**
- Project ID: `entomonitec-dev`
- Web App config (será usado nas variáveis de ambiente)

### **1.2. Criar Projeto HOMOLOG**

1. Repita o processo acima
2. **Nome do projeto:** `entomonitec-homolog`
3. **Project ID:** `entomonitec-homolog`

### **1.3. Criar Projeto PROD**

1. Repita o processo acima
2. **Nome do projeto:** `entomonitec-prod`
3. **Project ID:** `entomonitec-prod`

### **1.4. Configurar Firestore em cada projeto**

Para cada projeto (DEV, HOMOLOG, PROD):

1. No Firebase Console, vá em **Firestore Database**
2. Clique em **"Criar banco de dados"**
3. Escolha **"Iniciar em modo de teste"** (para DEV) ou **"Iniciar em modo de produção"** (para HOMOLOG e PROD)
4. Escolha a região (ex: `southamerica-east1` - São Paulo)
5. Clique em **"Ativar"**

### **1.5. Configurar Storage em cada projeto**

Para cada projeto:

1. Vá em **Storage**
2. Clique em **"Começar"**
3. Aceite os termos
4. Escolha a mesma região do Firestore
5. Clique em **"Concluir"**

### **1.6. Configurar Authentication em cada projeto**

Para cada projeto:

1. Vá em **Authentication**
2. Clique em **"Começar"**
3. Habilite **"Email/Password"**
4. Clique em **"Salvar"**

### **1.7. Obter Configurações de cada projeto**

Para cada projeto, você precisa obter as configurações:

1. Vá em **Project Settings** (ícone de engrenagem)
2. Role até **"Seus apps"**
3. Clique no ícone **`</>`** (Web)
4. Se não tiver app web, clique em **"Adicionar app"** → **Web**
5. Anote as configurações:

```javascript
// Exemplo de configuração (NÃO usar essas chaves reais)
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "entomonitec-dev.firebaseapp.com",
  projectId: "entomonitec-dev",
  storageBucket: "entomonitec-dev.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdefghijklmnop"
};
```

**Repita para os 3 projetos e guarde essas informações!**

---

## 📝 Passo 2: Criar 3 Projetos na Vercel

### **2.1. Criar Projeto DEV na Vercel**

1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Clique em **"Add New..."** → **"Project"**
3. Importe seu repositório GitHub/GitLab/Bitbucket
4. **Project Name:** `entomonitec-dev`
5. **Framework Preset:** Next.js (deve detectar automaticamente)
6. **Root Directory:** `./` (ou deixe padrão)
7. **Build Command:** `npm run build` (ou deixe padrão)
8. **Output Directory:** `.next` (ou deixe padrão)

**NÃO faça deploy ainda!** Primeiro vamos configurar as variáveis de ambiente.

### **2.2. Criar Projeto HOMOLOG na Vercel**

1. Repita o processo acima
2. **Project Name:** `entomonitec-homolog`
3. Use o **mesmo repositório** (importar novamente)

### **2.3. Criar Projeto PROD na Vercel**

1. Repita o processo acima
2. **Project Name:** `entomonitec-prod`
3. Use o **mesmo repositório** (importar novamente)

---

## 📝 Passo 3: Configurar Variáveis de Ambiente

### **⚠️ IMPORTANTE: Como Funcionam as Variáveis de Ambiente**

**Você NÃO vai criar 3 arquivos `.env` diferentes!**

- **Local (desenvolvimento):** Você usa `.env.local` (um único arquivo, não commitado no Git)
- **Vercel:** As variáveis são configuradas **diretamente no painel da Vercel**, não em arquivos
- **Cada projeto Vercel** (DEV, HOMOLOG, PROD) tem suas próprias variáveis configuradas no painel

**Resumo:**
- ✅ **1 arquivo `.env.local`** para desenvolvimento local
- ✅ **3 configurações no painel Vercel** (uma para cada projeto)
- ❌ **NÃO precisa** de 3 arquivos `.env` diferentes

---

### **3.1. Variáveis de Ambiente DEV**

No projeto **entomonitec-dev** na Vercel:

1. Vá em **Settings** → **Environment Variables**
2. Clique em **"Add New"**
3. Adicione cada variável uma por uma (ou cole todas de uma vez se a Vercel permitir)
4. Para cada variável, selecione os ambientes: **Development**, **Preview** e **Production**
5. Clique em **"Save"**

```env
# Ambiente
NODE_ENV=development
NEXT_PUBLIC_ENV=dev
NEXT_PUBLIC_APP_URL=https://dev.entomonitec.com.br

# Firebase DEV
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy... (do projeto entomonitec-dev)
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=entomonitec-dev.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=entomonitec-dev
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=entomonitec-dev.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdefghijklmnop

# Brevo (Email) - DEV
NEXT_PUBLIC_BREVO_API_KEY=xxxxxxxxxxxxxxxx (chave de teste)
NEXT_PUBLIC_BREVO_SENDER_EMAIL=noreply-dev@entomonitec.com.br
NEXT_PUBLIC_BREVO_SENDER_NAME=Entomonitec DEV
```

### **3.2. Variáveis de Ambiente HOMOLOG**

No projeto **entomonitec-homolog** na Vercel:

1. Vá em **Settings** → **Environment Variables**
2. Adicione as mesmas variáveis, mas com valores do projeto HOMOLOG:

```env
# Ambiente
NODE_ENV=production
NEXT_PUBLIC_ENV=homolog
NEXT_PUBLIC_APP_URL=https://homolog.entomonitec.com.br

# Firebase HOMOLOG
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy... (do projeto entomonitec-homolog)
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=entomonitec-homolog.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=entomonitec-homolog
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=entomonitec-homolog.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=987654321098
NEXT_PUBLIC_FIREBASE_APP_ID=1:987654321098:web:zyxwvutsrqponmlk

# Brevo (Email) - HOMOLOG
NEXT_PUBLIC_BREVO_API_KEY=yyyyyyyyyyyyyyyy (chave de teste ou produção)
NEXT_PUBLIC_BREVO_SENDER_EMAIL=noreply-homolog@entomonitec.com.br
NEXT_PUBLIC_BREVO_SENDER_NAME=Entomonitec HOMOLOG
```

### **3.3. Variáveis de Ambiente PROD**

No projeto **entomonitec-prod** na Vercel:

1. Vá em **Settings** → **Environment Variables**
2. Adicione as mesmas variáveis, mas com valores do projeto PROD:

```env
# Ambiente
NODE_ENV=production
NEXT_PUBLIC_ENV=production
NEXT_PUBLIC_APP_URL=https://app.entomonitec.com.br

# Firebase PROD
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy... (do projeto entomonitec-prod)
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=entomonitec-prod.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=entomonitec-prod
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=entomonitec-prod.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=555555555555
NEXT_PUBLIC_FIREBASE_APP_ID=1:555555555555:web:mnopqrstuvwxyzab

# Brevo (Email) - PROD
NEXT_PUBLIC_BREVO_API_KEY=zzzzzzzzzzzzzzzz (chave de produção)
NEXT_PUBLIC_BREVO_SENDER_EMAIL=noreply@entomonitec.com.br
NEXT_PUBLIC_BREVO_SENDER_NAME=Entomonitec
```

---

## 📝 Passo 4: Configurar Deploy por Branch

### **4.1. Configurar Branch para DEV**

No projeto **entomonitec-dev**:

1. Vá em **Settings** → **Git**
2. Em **Production Branch**, selecione: **`develop`**
3. Em **Preview Branches**, deixe: **`*`** (todas)
4. Salve

**Resultado:** Qualquer push para `develop` faz deploy automático em DEV

### **4.2. Configurar Branch para HOMOLOG**

No projeto **entomonitec-homolog**:

1. Vá em **Settings** → **Git**
2. Em **Production Branch**, selecione: **`staging`**
3. Em **Preview Branches**, deixe: **`*`** (todas)
4. Salve

**Resultado:** Qualquer push para `staging` faz deploy automático em HOMOLOG

### **4.3. Configurar Branch para PROD**

No projeto **entomonitec-prod**:

1. Vá em **Settings** → **Git**
2. Em **Production Branch**, selecione: **`main`** (ou `master`)
3. Em **Preview Branches**, deixe: **`*`** (todas)
4. Salve

**Resultado:** Qualquer push para `main` faz deploy automático em PROD

---

## 📝 Passo 5: Configurar Domínios

### **5.1. Adicionar Domínio DEV**

No projeto **entomonitec-dev**:

1. Vá em **Settings** → **Domains**
2. Clique em **"Add"**
3. Digite: `dev.entomonitec.com.br`
4. Clique em **"Add"**
5. Vercel mostrará instruções de DNS
6. Configure no seu provedor de DNS:

```
Tipo: CNAME
Nome: dev
Valor: cname.vercel-dns.com
```

### **5.2. Adicionar Domínio HOMOLOG**

No projeto **entomonitec-homolog**:

1. Repita o processo acima
2. Domínio: `homolog.entomonitec.com.br`
3. DNS:

```
Tipo: CNAME
Nome: homolog
Valor: cname.vercel-dns.com
```

### **5.3. Adicionar Domínio PROD**

No projeto **entomonitec-prod**:

1. Repita o processo acima
2. Domínio: `app.entomonitec.com.br`
3. DNS:

```
Tipo: CNAME
Nome: app
Valor: cname.vercel-dns.com
```

**Opcional:** Adicionar também `www.entomonitec.com.br` e configurar redirecionamento

---

## 📝 Passo 6: Atualizar Código para Suportar Múltiplos Ambientes

### **6.1. Atualizar `src/lib/firebase.ts`**

O arquivo já deve estar usando variáveis de ambiente. Verifique se está assim:

```typescript
// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Configuração dinâmica baseada em variáveis de ambiente
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Inicializar Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

### **6.2. Criar arquivo `.env.example` (Template para Desenvolvimento Local)**

Este arquivo é apenas um **template/exemplo** para ajudar outros desenvolvedores. Ele fica no Git.

```env
# .env.example
# Copie este arquivo para .env.local e preencha com os valores do seu ambiente local
# IMPORTANTE: Use os valores do projeto Firebase DEV para desenvolvimento local

# Ambiente
NODE_ENV=development
NEXT_PUBLIC_ENV=dev
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Firebase (use os valores do projeto entomonitec-dev)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Brevo (Email)
NEXT_PUBLIC_BREVO_API_KEY=
NEXT_PUBLIC_BREVO_SENDER_EMAIL=
NEXT_PUBLIC_BREVO_SENDER_NAME=
```

### **6.3. Criar `.env.local` (Apenas para Desenvolvimento Local)**

**Este arquivo NÃO vai para o Git!** É apenas para você rodar localmente.

#### **Opção 1: Sempre usar DEV (Recomendado)**

**Para desenvolvimento normal, sempre use DEV:**

1. Copie `.env.example` para `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Preencha `.env.local` com os valores do projeto Firebase **DEV**:
   ```env
   # .env.local (NÃO commitar no Git!)
   # Sempre aponta para DEV quando roda localmente
   NEXT_PUBLIC_ENV=dev
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   
   NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy... (do projeto entomonitec-dev)
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=entomonitec-dev.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=entomonitec-dev
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=entomonitec-dev.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdefghijklmnop
   ```

**Vantagem:** Simples, sempre usa DEV para desenvolvimento

#### **Opção 2: Múltiplos arquivos (Para testar diferentes ambientes)**

Se você quiser testar HOMOLOG ou PROD localmente, pode criar arquivos diferentes:

```bash
# Para DEV (padrão)
.env.local              → Valores do DEV

# Para HOMOLOG (quando precisar testar)
.env.local.homolog      → Valores do HOMOLOG

# Para PROD (quando precisar testar)
.env.local.prod         → Valores do PROD
```

**Como usar:**
```bash
# Rodar com DEV (padrão)
npm run dev

# Rodar com HOMOLOG (copiar arquivo)
cp .env.local.homolog .env.local
npm run dev

# Rodar com PROD (copiar arquivo)
cp .env.local.prod .env.local
npm run dev
```

**⚠️ Recomendação:** Use sempre DEV localmente. Só mude se precisar testar algo específico de outro ambiente.

### **6.4. Verificar `.gitignore`**

Certifique-se de que `.env.local` está no `.gitignore`:

```
.env.local
.env*.local
```

**Resumo:**
- ✅ **`.env.example`** → Template no Git (sem valores reais)
- ✅ **`.env.local`** → Seu arquivo local (NÃO vai para o Git)
  - **Padrão:** Sempre use valores do DEV para desenvolvimento
  - **Opcional:** Pode criar variações para testar outros ambientes
- ✅ **Vercel** → Variáveis configuradas no painel (não são arquivos)
  - Cada projeto (DEV, HOMOLOG, PROD) tem suas próprias variáveis

### **📌 Qual Ambiente Usar Localmente?**

**Resposta curta: SEMPRE DEV**

**Por quê?**
- ✅ DEV é seguro para testar (não afeta dados reais)
- ✅ Você pode criar/deletar dados sem preocupação
- ✅ Mais rápido para desenvolvimento
- ✅ Não precisa se preocupar com custos

**Quando mudar para outro ambiente?**
- ⚠️ **HOMOLOG:** Só se precisar testar algo específico que só existe em HOMOLOG
- ⚠️ **PROD:** **NUNCA** use PROD localmente! Muito perigoso (pode afetar dados reais)

**Como saber qual ambiente está rodando?**
- Verifique a variável `NEXT_PUBLIC_ENV` no código
- Ou adicione um indicador visual no app (ex: banner "DEV" no topo)

---

## 📝 Passo 7: Configurar Firestore Rules por Ambiente

### **7.1. Regras DEV (Permissivas para desenvolvimento)**

No projeto **entomonitec-dev**:

1. Vá em **Firestore Database** → **Rules**
2. Use regras mais permissivas para desenvolvimento:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Regras permissivas para DEV (NUNCA usar em PROD!)
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### **7.2. Regras HOMOLOG (Idênticas à produção)**

No projeto **entomonitec-homolog`:

1. Use as mesmas regras de produção (copie do projeto PROD)

### **7.3. Regras PROD (Máxima segurança)**

No projeto **entomonitec-prod**:

1. Use as regras de produção completas (do arquivo `firestore.rules` do projeto)

---

## 📝 Passo 8: Estrutura de Branches Git

### **8.1. Criar Branches**

```bash
# Branch de desenvolvimento
git checkout -b develop
git push -u origin develop

# Branch de homologação
git checkout -b staging
git push -u origin staging

# Branch de produção (já existe como main)
git checkout main
```

### **8.2. Fluxo de Trabalho**

```
┌─────────────────────────────────────────┐
│  Desenvolvimento Local                  │
│  (feature branches)                     │
└──────────────┬──────────────────────────┘
               │
               │ Merge
               ▼
        ┌──────────────┐
        │   develop    │ → Deploy automático DEV
        └──────┬───────┘
               │
               │ Merge após testes
               ▼
        ┌──────────────┐
        │   staging    │ → Deploy automático HOMOLOG
        └──────┬───────┘
               │
               │ Merge após aprovação
               ▼
        ┌──────────────┐
        │    main      │ → Deploy automático PROD
        └──────────────┘
```

---

## 📝 Passo 9: Testar o Deploy

### **9.1. Testar DEV**

```bash
# Fazer alteração no código
echo "// Test DEV" >> src/app/page.tsx

# Commit e push para develop
git checkout develop
git add .
git commit -m "test: deploy DEV"
git push origin develop
```

**Verificar:**
- ✅ Deploy iniciado automaticamente na Vercel
- ✅ URL: `dev.entomonitec.com.br` (ou `entomonitec-dev.vercel.app`)
- ✅ Firebase conectado ao projeto `entomonitec-dev`

### **9.2. Testar HOMOLOG**

```bash
# Merge develop para staging
git checkout staging
git merge develop
git push origin staging
```

**Verificar:**
- ✅ Deploy iniciado automaticamente na Vercel
- ✅ URL: `homolog.entomonitec.com.br`
- ✅ Firebase conectado ao projeto `entomonitec-homolog`

### **9.3. Testar PROD**

```bash
# Merge staging para main (após aprovação)
git checkout main
git merge staging
git push origin main
```

**Verificar:**
- ✅ Deploy iniciado automaticamente na Vercel
- ✅ URL: `app.entomonitec.com.br`
- ✅ Firebase conectado ao projeto `entomonitec-prod`

---

## 📝 Passo 10: Configurar Notificações (Opcional)

### **10.1. Notificações no Slack**

1. No projeto Vercel, vá em **Settings** → **Integrations**
2. Adicione integração com Slack
3. Configure canais para cada ambiente:
   - `#dev-deploys` para DEV
   - `#homolog-deploys` para HOMOLOG
   - `#prod-deploys` para PROD

### **10.2. Notificações por Email**

1. Vá em **Settings** → **Notifications**
2. Configure emails para:
   - Deploy bem-sucedido
   - Deploy com erro
   - Deploy cancelado

---

## ✅ Checklist Final

### **Firebase**
- [ ] 3 projetos Firebase criados (DEV, HOMOLOG, PROD)
- [ ] Firestore configurado em cada projeto
- [ ] Storage configurado em cada projeto
- [ ] Authentication configurado em cada projeto
- [ ] Regras de segurança configuradas
- [ ] Configurações de cada projeto anotadas

### **Vercel**
- [ ] 3 projetos Vercel criados
- [ ] Variáveis de ambiente configuradas em cada projeto
- [ ] Branches configuradas (develop → DEV, staging → HOMOLOG, main → PROD)
- [ ] Domínios configurados
- [ ] DNS configurado no provedor

### **Código**
- [ ] `firebase.ts` atualizado para usar variáveis de ambiente
- [ ] `.env.example` criado (template)
- [ ] `.env.local` criado localmente (com valores do DEV, NÃO commitado)
- [ ] `.gitignore` atualizado (deve ignorar `.env.local`)
- [ ] Branches criadas (develop, staging, main)

### **Testes**
- [ ] Deploy DEV testado
- [ ] Deploy HOMOLOG testado
- [ ] Deploy PROD testado
- [ ] Firebase conectado corretamente em cada ambiente
- [ ] Domínios funcionando

---

## 🔒 Segurança

### **Boas Práticas**

1. ✅ **Nunca commitar** variáveis de ambiente no Git
2. ✅ **Rotacionar chaves** a cada 90 dias (produção)
3. ✅ **Usar regras restritivas** em produção
4. ✅ **Monitorar logs** de cada ambiente
5. ✅ **Backup automático** do Firestore (produção)
6. ✅ **Acesso limitado** aos projetos Firebase (apenas pessoas autorizadas)

### **Permissões**

- **DEV:** Acesso para desenvolvedores
- **HOMOLOG:** Acesso para desenvolvedores + cliente (validação)
- **PROD:** Acesso restrito (apenas administradores)

---

## 📊 Monitoramento

### **Vercel Analytics**

1. Habilite **Vercel Analytics** em cada projeto
2. Configure alertas para:
   - Erros de build
   - Deploy falhado
   - Performance degradada

### **Firebase Monitoring**

1. Habilite **Firebase Performance Monitoring** em cada projeto
2. Configure alertas para:
   - Erros no Firestore
   - Erros no Storage
   - Erros de autenticação

---

## 🐛 Troubleshooting

### **Problema: Deploy não inicia automaticamente**

**Solução:**
1. Verificar se a branch está configurada corretamente
2. Verificar se há erros no build
3. Verificar logs na Vercel

### **Problema: Firebase não conecta**

**Solução:**
1. Verificar se todas as variáveis de ambiente estão configuradas
2. Verificar se os valores estão corretos
3. Verificar se o projeto Firebase existe

### **Problema: Domínio não funciona**

**Solução:**
1. Verificar configuração DNS no provedor
2. Aguardar propagação DNS (pode levar até 48h)
3. Verificar certificado SSL na Vercel

---

## 📚 Referências

- [Vercel Documentation](https://vercel.com/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Documentação do Projeto](./README.md)

---

**Última Atualização**: 02/09/2025  
**Versão**: 1.0  
**Sistema**: Entomonitec - Vigilância Entomológica

