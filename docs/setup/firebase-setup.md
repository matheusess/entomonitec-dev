# 🚀 Firebase Setup - Guia Rápido

## 📋 Checklist de Configuração

### ✅ 1. Configurar .env.local

Crie o arquivo `.env.local` na raiz do projeto com:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyA_iPKPLQrycz34XrxgyM2DIO0cDzym5Mc
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=entomonitec.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=entomonitec
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=entomonitec.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=128431137436
NEXT_PUBLIC_FIREBASE_APP_ID=1:128431137436:web:7e558e3960ba2bc4454359

# App Configuration
NEXT_PUBLIC_APP_NAME="Sistema de Vigilância Entomológica"
NEXT_PUBLIC_APP_VERSION="2.0.0"
```

### ✅ 2. Instalar Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

### ✅ 3. Configurar Firestore Rules

1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Selecione projeto `entomonitec`
3. Vá em **Firestore Database** → **Rules**
4. Copie o conteúdo de `docs/firebase-rules.md`
5. Cole e publique

### ✅ 4. Criar Dados Iniciais

Execute os scripts para criar:
- Organizações de exemplo
- Usuários admin iniciais
- Dados de demonstração

### ✅ 5. Configurar Authentication

No Firebase Console:
1. **Authentication** → **Sign-in method**
2. Habilitar **Email/Password**
3. Configurar domínios autorizados

## 🔥 Status Atual

- ✅ Firebase SDK instalado
- ✅ Configuração criada (`src/lib/firebase.ts`)
- ✅ Rules documentadas
- 🔲 .env.local (você precisa criar)
- 🔲 Rules aplicadas no Console
- 🔲 Authentication configurado
- 🔲 Dados iniciais criados

## 🚨 Próximos Passos

1. **Criar `.env.local`** com as credenciais acima
2. **Aplicar Firestore Rules** no Console
3. **Testar conexão** - rodar `npm run dev`
4. **Migrar AuthContext** para usar Firebase Auth
5. **Criar dados de seed** para desenvolvimento

## 📞 Se der erro...

### Erro: "Firebase not configured"
- Verifique se `.env.local` existe e está correto
- Restart do servidor (`npm run dev`)

### Erro: "Permission denied"
- Verifique se as Firestore Rules foram aplicadas
- Confira se usuário está autenticado

### Erro: "Project not found"
- Confirme se `projectId` no `.env.local` está correto
- Verifique se tem acesso ao projeto no Console

---

**🎯 Quando tudo estiver configurado, teremos Firebase totalmente integrado!**

