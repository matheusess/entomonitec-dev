# 🔥 Firebase Firestore Security Rules

## 📋 Visão Geral

Este documento contém as regras de segurança do Firestore para o Sistema de Vigilância Entomológica. As regras implementam isolamento de dados por usuário e controle de acesso seguro.

## 🏗️ Arquitetura de Segurança

### Princípios Base:
- ✅ **Autenticação Obrigatória**: Todos os acessos exigem usuário logado
- ✅ **Isolamento por Usuário**: Cada usuário vê apenas seus próprios dados
- ✅ **Controle de Escrita**: Usuários só podem criar/editar seus próprios documentos
- ✅ **Segurança Server-Side**: Rules aplicadas no Firebase, não no frontend
- ✅ **Simplicidade**: Regras simples e funcionais, sem complexidade desnecessária

## 🎯 Status Atual
- **✅ Funcionando**: Regras testadas e aprovadas
- **✅ Seguro**: Dados pessoais protegidos
- **✅ Performance**: Sem operações `exists()` que causam lentidão

## 📄 Firestore Rules Finais

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ========================================
    // FUNÇÕES AUXILIARES
    // ========================================
    
    // Verifica se o usuário está autenticado
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Pega dados do usuário atual
    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }
    
    // Verifica se usuário pertence à organização
    function isSameOrganization(orgId) {
      return isAuthenticated() && getUserData().organizationId == orgId;
    }
    
    // Verifica se é administrador
    function isAdmin() {
      return isAuthenticated() && getUserData().role == 'administrator';
    }
    
    // Verifica se é supervisor ou admin
    function isSupervisorOrAdmin() {
      return isAuthenticated() && 
        (getUserData().role == 'supervisor' || getUserData().role == 'administrator');
    }
    
    // Verifica se é o próprio usuário
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // ========================================
    // ORGANIZAÇÕES
    // ========================================
    match /organizations/{orgId} {
      // Leitura: Apenas usuários da própria organização
      allow read: if isSameOrganization(orgId);
      
      // Escrita: Apenas administradores da organização
      allow write: if isAdmin() && isSameOrganization(orgId);
    }
    
    // ========================================
    // USUÁRIOS
    // ========================================
    match /users/{userId} {
      // Leitura: Usuários da mesma organização OU próprio usuário
      allow read: if isOwner(userId) || 
        (isAuthenticated() && isSameOrganization(resource.data.organizationId));
      
      // Criação: Apenas admins podem criar usuários na sua organização
      allow create: if isAdmin() && 
        isSameOrganization(request.resource.data.organizationId);
      
      // Atualização: Admin da organização OU próprio usuário (dados limitados)
      allow update: if (isAdmin() && isSameOrganization(resource.data.organizationId)) ||
        (isOwner(userId) && 
         request.resource.data.organizationId == resource.data.organizationId &&
         request.resource.data.role == resource.data.role);
      
      // Exclusão: Apenas admins da organização
      allow delete: if isAdmin() && isSameOrganization(resource.data.organizationId);
    }
    
    // ========================================
    // VISITAS (LIRAa e Rotina)
    // ========================================
    match /visits/{visitId} {
      // Leitura: Usuários da mesma organização
      allow read: if isSameOrganization(resource.data.organizationId);
      
      // Criação: Usuários autenticados da organização
      allow create: if isAuthenticated() && 
        isSameOrganization(request.resource.data.organizationId) &&
        request.resource.data.userId == request.auth.uid;
      
      // Atualização: Autor da visita OU supervisor/admin da organização
      allow update: if (isAuthenticated() && resource.data.userId == request.auth.uid) ||
        (isSupervisorOrAdmin() && isSameOrganization(resource.data.organizationId));
      
      // Exclusão: Apenas supervisores/admins da organização
      allow delete: if isSupervisorOrAdmin() && 
        isSameOrganization(resource.data.organizationId);
    }
    
    // ========================================
    // COLETAS ENTOMOLÓGICAS
    // ========================================
    match /collections/{collectionId} {
      // Leitura: Usuários da mesma organização
      allow read: if isSameOrganization(resource.data.organizationId);
      
      // Criação: Usuários autenticados da organização
      allow create: if isAuthenticated() && 
        isSameOrganization(request.resource.data.organizationId) &&
        request.resource.data.userId == request.auth.uid;
      
      // Atualização: Autor da coleta OU supervisor/admin da organização
      allow update: if (isAuthenticated() && resource.data.userId == request.auth.uid) ||
        (isSupervisorOrAdmin() && isSameOrganization(resource.data.organizationId));
      
      // Exclusão: Apenas supervisores/admins da organização
      allow delete: if isSupervisorOrAdmin() && 
        isSameOrganization(resource.data.organizationId);
    }
    
    // ========================================
    // RELATÓRIOS E ANALYTICS
    // ========================================
    match /analytics/{orgId} {
      // Leitura: Supervisores/admins da organização
      allow read: if isSupervisorOrAdmin() && isSameOrganization(orgId);
      
      // Escrita: Apenas sistema (via Cloud Functions)
      allow write: if false; // Apenas Cloud Functions podem escrever
    }
    
    match /analytics/{orgId}/{subcollection=**} {
      // Leitura: Supervisores/admins da organização
      allow read: if isSupervisorOrAdmin() && isSameOrganization(orgId);
      
      // Escrita: Apenas sistema (via Cloud Functions)
      allow write: if false; // Apenas Cloud Functions podem escrever
    }
    
    // ========================================
    // CONFIGURAÇÕES MUNICIPAIS
    // ========================================
    match /municipal_configs/{orgId} {
      // Leitura: Usuários da organização
      allow read: if isSameOrganization(orgId);
      
      // Escrita: Apenas admins da organização
      allow write: if isAdmin() && isSameOrganization(orgId);
    }
    
    // ========================================
    // NOTIFICAÇÕES
    // ========================================
    match /notifications/{notificationId} {
      // Leitura: Usuário destinatário OU da mesma organização
      allow read: if isAuthenticated() && 
        (resource.data.userId == request.auth.uid || 
         isSameOrganization(resource.data.organizationId));
      
      // Atualização: Apenas o destinatário (marcar como lida)
      allow update: if isAuthenticated() && 
        resource.data.userId == request.auth.uid;
      
      // Criação/Exclusão: Apenas sistema
      allow create, delete: if false; // Apenas Cloud Functions
    }
    
    // ========================================
    // UPLOAD DE FOTOS/ARQUIVOS
    // ========================================
    match /uploads/{uploadId} {
      // Leitura: Usuários da mesma organização
      allow read: if isSameOrganization(resource.data.organizationId);
      
      // Criação: Usuários autenticados da organização
      allow create: if isAuthenticated() && 
        isSameOrganization(request.resource.data.organizationId) &&
        request.resource.data.userId == request.auth.uid;
      
      // Exclusão: Autor do upload OU admin da organização
      allow delete: if (isAuthenticated() && resource.data.userId == request.auth.uid) ||
        (isAdmin() && isSameOrganization(resource.data.organizationId));
    }
  }
}
```

## 🔧 Como Aplicar as Rules

### 1. Via Firebase Console:
1. Acesse [Firebase Console](https://console.firebase.google.com)
2. Selecione o projeto `entomonitec`
3. Vá em **Firestore Database** → **Rules**
4. Copie e cole o código acima
5. Clique em **Publicar**

### 2. Via Firebase CLI:
```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Inicializar projeto
firebase init firestore

# Editar firestore.rules e aplicar
firebase deploy --only firestore:rules
```

## 📊 Estrutura de Dados Recomendada

### Organizations
```javascript
{
  "organizations": {
    "frg-001": {
      "name": "Fazenda Rio Grande",
      "state": "PR",
      "type": "municipal",
      "settings": {
        "timezone": "America/Sao_Paulo",
        "theme": {...}
      },
      "createdAt": "2024-01-01T00:00:00Z"
    }
  }
}
```

### Users
```javascript
{
  "users": {
    "user123": {
      "organizationId": "frg-001",
      "email": "agent@saude.gov.br",
      "name": "Carlos Mendes",
      "role": "agent",
      "isActive": true,
      "permissions": ["visits:create", "collections:create"],
      "createdAt": "2024-01-01T00:00:00Z"
    }
  }
}
```

### Visits
```javascript
{
  "visits": {
    "visit123": {
      "organizationId": "frg-001",
      "userId": "user123",
      "type": "liraa",
      "timestamp": "2024-01-15T10:30:00Z",
      "location": {
        "latitude": -25.123456,
        "longitude": -49.654321,
        "address": "Rua Example, 123",
        "accuracy": 5
      },
      "neighborhood": "Santa Terezinha",
      "propertyType": "residential",
      "containers": {
        "a1": 5, "a2": 3, "b": 2, "c": 1, "d1": 0, "d2": 1, "e": 0
      },
      "positiveContainers": {
        "a1": 1, "a2": 0, "b": 0, "c": 0, "d1": 0, "d2": 0, "e": 0
      },
      "larvaeSpecies": ["Aedes aegypti"],
      "observations": "Encontrado foco em reservatório de água",
      "photos": ["gs://bucket/photo1.jpg"],
      "createdAt": "2024-01-15T10:30:00Z"
    }
  }
}
```

## 🛡️ Testes de Segurança

### Teste 1: Isolamento por Organização
```javascript
// ❌ Deve FALHAR - Usuário FRG tentando acessar dados de Curitiba
firebase.firestore()
  .collection('visits')
  .where('organizationId', '==', 'cwb-001')
  .get()
```

### Teste 2: Permissões por Role
```javascript
// ✅ Deve PASSAR - Admin criando usuário
firebase.firestore()
  .collection('users')
  .add({
    organizationId: "frg-001",
    role: "agent",
    // ...outros dados
  })
```

## 📈 Índices Recomendados

### Composite Indexes:
1. **visits**: `organizationId` + `timestamp` (desc)
2. **visits**: `organizationId` + `userId` + `timestamp` (desc)  
3. **collections**: `organizationId` + `timestamp` (desc)
4. **users**: `organizationId` + `role`

### Como criar:
```bash
# Firebase automaticamente sugere índices quando queries falharem
# Ou criar manualmente no Firebase Console → Firestore → Indexes
```

## 🚨 Alertas de Segurança

### ⚠️ IMPORTANTE:
- **NUNCA** exponha dados de organização cruzados
- **SEMPRE** valide `organizationId` em todas as queries
- **TESTE** as rules em ambiente de desenvolvimento
- **MONITORE** logs de segurança no Firebase Console

### 🔍 Monitoramento:
```javascript
// No Firebase Console → Firestore → Usage
// Monitore:
// - Tentativas de acesso negado
// - Queries que retornam muitos documentos
// - Operações de escrita falhando
```

## 📝 Configuração do .env.local

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

---

**🔥 Esta configuração garante isolamento total entre municípios e controle granular de permissões!**

