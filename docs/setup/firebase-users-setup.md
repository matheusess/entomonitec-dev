# 👥 SETUP USUÁRIOS FIREBASE

## 🔥 Authentication + Firestore

### **PASSO 1: Usuários no Firebase Authentication**
Você já criou, mas para referência:

```
✅ admin@entomonitec.com (UID gerado automaticamente)
✅ superadmin@entomonitec.com (UID gerado automaticamente)
```

### **PASSO 2: Coleção "users" no Firestore**

Para cada usuário do Authentication, criar documento com **MESMO UID**:

#### **🔐 Super Admin Principal**
```
Collection: users
Document ID: [UID do Authentication] (ex: abc123xyz789)

Dados do documento:
{
  "organizationId": "",
  "email": "admin@entomonitec.com",
  "name": "Super Administrador",
  "role": "super_admin",
  "isActive": true,
  "permissions": ["*"],
  "authProvider": "email",
  "createdAt": "2024-01-15T10:00:00Z",
  "createdBy": "system",
  "mustChangePassword": false
}
```

#### **🔐 Super Admin Secundário**
```
Collection: users
Document ID: [UID do Authentication] (ex: def456uvw123)

Dados do documento:
{
  "organizationId": "",
  "email": "superadmin@entomonitec.com",
  "name": "Super Admin Backup",
  "role": "super_admin", 
  "isActive": true,
  "permissions": ["*"],
  "authProvider": "email",
  "createdAt": "2024-01-15T10:00:00Z",
  "createdBy": "system",
  "mustChangePassword": false
}
```

## 🏢 ORGANIZAÇÕES DE EXEMPLO

### **PASSO 3: Coleção "organizations"**

#### **Fazenda Rio Grande**
```
Collection: organizations
Document ID: fazenda-rio-grande-pr

Dados:
{
  "id": "fazenda-rio-grande-pr",
  "name": "Fazenda Rio Grande",
  "fullName": "Prefeitura Municipal de Fazenda Rio Grande",
  "state": "PR",
  "department": "Secretaria Municipal de Saúde",
  "branding": {
    "colors": {
      "primary": "#0B4B3C",
      "secondary": "#1E7A5F",
      "accent": "#F4B942"
    },
    "headerTitle": "Vigilância Entomológica FRG",
    "systemName": "EntomoVigilância Fazenda Rio Grande",
    "description": "Sistema de monitoramento vetorial"
  },
  "neighborhoods": [
    "Eucaliptos",
    "Gralha Azul", 
    "Nações",
    "Santa Terezinha",
    "Iguaçu",
    "Centro"
  ],
  "contact": {
    "phone": "(41) 3629-8000",
    "email": "saude@fazendariogrande.pr.gov.br"
  },
  "features": {
    "enableLIRAa": true,
    "enableLaboratory": false,
    "enablePredictiveAnalysis": false,
    "customFields": ["Tipo de Imóvel"]
  },
  "isActive": true,
  "createdAt": "2024-01-15T10:00:00Z",
  "createdBy": "UID_DO_SUPER_ADMIN"
}
```

#### **Curitiba**
```
Collection: organizations  
Document ID: curitiba-pr

Dados:
{
  "id": "curitiba-pr",
  "name": "Curitiba",
  "fullName": "Prefeitura Municipal de Curitiba",
  "state": "PR", 
  "department": "Secretaria Municipal da Saúde",
  "branding": {
    "colors": {
      "primary": "#1a5490",
      "secondary": "#2563eb",
      "accent": "#f59e0b"
    },
    "headerTitle": "EntomoVigilância Curitiba",
    "systemName": "Sistema de Vigilância Entomológica de Curitiba",
    "description": "Controle vetorial da capital"
  },
  "neighborhoods": [
    "Centro",
    "Batel",
    "Água Verde",
    "Cabral",
    "Rebouças"
  ],
  "contact": {
    "phone": "(41) 3350-9000",
    "email": "saude@curitiba.pr.gov.br"
  },
  "features": {
    "enableLIRAa": true,
    "enableLaboratory": true,
    "enablePredictiveAnalysis": true,
    "customFields": ["Zona Sanitária"]
  },
  "isActive": true,
  "createdAt": "2024-01-15T10:00:00Z",
  "createdBy": "UID_DO_SUPER_ADMIN"
}
```

## 🎯 COMO ENCONTRAR O UID

### **No Firebase Console:**

1. **Authentication** → **Users**
2. Clique no usuário
3. Copie o **User UID** (ex: `Ky8QYJ4mM5f8h3N2p1R6s9T7`)
4. Use este UID como **Document ID** na coleção `users`

## ✅ VALIDAÇÃO

Após criar tudo, teste:

1. **Login no sistema com `admin@entomonitec.com`**
2. **Deve mostrar "Super Admin" no header**
3. **Deve conseguir acessar `/super-admin`**
4. **Deve ver as organizações criadas**
5. **Deve conseguir trocar visualização**

## 🔧 TROUBLESHOOTING

### **Se não funcionar:**

```javascript
// Verificar no Console do navegador
console.log('User:', user);
console.log('Organizations:', availableOrganizations);
```

### **Se erro "Document not found":**
- ✅ Verificar se UID no Firestore = UID no Authentication  
- ✅ Verificar se campo email está correto
- ✅ Verificar se role = "super_admin"

### **Se não conseguir criar organizações:**
- ✅ Verificar se permissions = ["*"]
- ✅ Verificar se isSuperAdmin = true
- ✅ Verificar se email termina com @entomonitec.com

