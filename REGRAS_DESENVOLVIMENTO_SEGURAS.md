# 🛡️ Regras de Desenvolvimento Mais Seguras

## 🎯 **Objetivo**
Criar regras que funcionem para desenvolvimento mas sejam mais seguras que `if true`.

## ✅ **Regras Recomendadas para Desenvolvimento**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ========================================
    // FUNÇÕES AUXILIARES SIMPLIFICADAS
    // ========================================
    
    // Verifica se o usuário está autenticado
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // ========================================
    // ORGANIZAÇÕES - Acesso liberado para desenvolvimento
    // ========================================
    match /organizations/{orgId} {
      allow read, write: if true; // Temporário para desenvolvimento
    }
    
    // ========================================
    // USUÁRIOS - Apenas usuários autenticados
    // ========================================
    match /users/{userId} {
      // Leitura: qualquer usuário autenticado pode ler qualquer usuário
      allow read: if isAuthenticated();
      
      // Escrita: qualquer usuário autenticado (para desenvolvimento)
      allow write: if isAuthenticated();
    }
    
    // ========================================
    // VISITAS - Liberado para desenvolvimento
    // ========================================
    match /visits/{visitId} {
      // Permitir leitura e escrita para usuários autenticados
      allow read, write: if isAuthenticated();
    }
    
    // ========================================
    // COLETAS - Liberado para desenvolvimento  
    // ========================================
    match /collections/{collectionId} {
      allow read, write: if isAuthenticated();
    }
    
    // ========================================
    // CONVITES E CONFIGURAÇÕES - Liberado temporariamente
    // ========================================
    match /user_invites/{inviteId} {
      allow read, write: if true; // Para permitir aceite de convites sem auth
    }
    
    match /allowed_emails/{emailId} {
      allow read, write: if isAuthenticated();
    }
    
    match /municipal_configs/{orgId} {
      allow read, write: if isAuthenticated();
    }
    
    // ========================================
    // OUTROS DOCUMENTOS - Requer autenticação
    // ========================================
    match /{document=**} {
      allow read, write: if isAuthenticated();
    }
  }
}
```

## 🔄 **Evolução para Produção**

Quando estiver pronto para produção, substitua por regras mais restritivas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ========================================
    // FUNÇÕES AUXILIARES COMPLETAS
    // ========================================
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function getUserData() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }
    
    function isSuperAdmin() {
      return isAuthenticated() && getUserData().role == 'super_admin';
    }
    
    function isSameOrganization(orgId) {
      return isAuthenticated() && 
        (isSuperAdmin() || getUserData().organizationId == orgId);
    }
    
    function isAdmin() {
      return isAuthenticated() && 
        (getUserData().role == 'administrator' || isSuperAdmin());
    }
    
    // ========================================
    // ORGANIZAÇÕES - Apenas Super Admin
    // ========================================
    match /organizations/{orgId} {
      allow read: if isSuperAdmin() || isSameOrganization(orgId);
      allow create: if isSuperAdmin();
      allow update: if isSuperAdmin() || (isAdmin() && isSameOrganization(orgId));
      allow delete: if isSuperAdmin();
    }
    
    // ========================================
    // USUÁRIOS - Isolamento por organização
    // ========================================
    match /users/{userId} {
      allow read: if isSuperAdmin() || 
        (isAuthenticated() && 
         exists(/databases/$(database)/documents/users/$(userId)) &&
         isSameOrganization(get(/databases/$(database)/documents/users/$(userId)).data.organizationId));
      
      allow create: if isSuperAdmin() || 
        (isAuthenticated() && 
         isSameOrganization(request.resource.data.organizationId));
      
      allow update: if isSuperAdmin() ||
        (isAuthenticated() && 
         exists(/databases/$(database)/documents/users/$(userId)) &&
         isSameOrganization(get(/databases/$(database)/documents/users/$(userId)).data.organizationId));
      
      allow delete: if isSuperAdmin();
    }
    
    // ========================================
    // VISITAS - Isolamento por organização
    // ========================================
    match /visits/{visitId} {
      allow read: if isAuthenticated() && isSameOrganization(resource.data.organizationId);
      
      allow create: if isAuthenticated() && 
        isSameOrganization(request.resource.data.organizationId) &&
        request.resource.data.userId == request.auth.uid;
      
      allow update: if isAuthenticated() && 
        (resource.data.userId == request.auth.uid || 
         (isAdmin() && isSameOrganization(resource.data.organizationId)));
      
      allow delete: if isAdmin() && isSameOrganization(resource.data.organizationId);
    }
    
    // ... outras regras similares
  }
}
```

## 🚀 **Recomendação Atual**

**Para desenvolvimento imediato**: Use a primeira versão (mais permissiva mas requer autenticação)

**Benefícios:**
- ✅ Funciona para desenvolvimento
- ✅ Mais segura que `if true` 
- ✅ Requer pelo menos autenticação
- ✅ Facilita transição para produção

**Quando aplicar:**
- Agora para desenvolvimento
- Evoluir gradualmente para a versão de produção
