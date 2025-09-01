# 🔥 Como Aplicar Regras Temporárias Online

## ❌ **Problema Atual**
- **Local**: Funciona (regras permissivas)
- **Online**: Não funciona (regras de produção)
- **Histórico**: Não carrega online

## ✅ **Solução Rápida**

### 1. **Acesse o Firebase Console**
🔗 https://console.firebase.google.com/project/entomonitec/firestore/rules

### 2. **Cole as Regras Temporárias**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // REGRAS TEMPORÁRIAS PARA DESENVOLVIMENTO
    // ⚠️ NUNCA USAR EM PRODUÇÃO REAL!
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### 3. **Clique "Publicar"**
- Aguarde alguns segundos
- Teste o site online
- Histórico deve aparecer

## 🔄 **Para Restaurar Depois**
Quando terminar os testes, restaure as regras originais:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ========================================
    // FUNÇÕES AUXILIARES
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
    
    // ========================================
    // VISITAS (LIRAa e Rotina)
    // ========================================
    match /visits/{visitId} {
      allow read, write: if isAuthenticated();
    }
    
    // ... resto das regras originais
  }
}
```

## 🎯 **Resultado Esperado**
- ✅ Histórico carrega online
- ✅ Dashboard funciona
- ✅ Dados reais aparecem
- ✅ Sistema funcional em produção

## ⚠️ **IMPORTANTE**
- Essas regras são **INSEGURAS**
- Apenas para **DESENVOLVIMENTO**
- **NUNCA** deixar em produção real
- Restaurar regras originais quando terminar
