# 🏢 Guia do Sistema Multi-Tenant

## 📋 **Visão Geral**

O sistema implementa uma arquitetura **multi-tenant** completa onde:

- **Super Admins** (`@entomonitec.com`) podem criar e gerenciar organizações
- **Cada Organização** (município) tem usuários isolados
- **Dados são completamente separados** por organização
- **Super Admins podem "se passar"** por qualquer organização para suporte

---

## 🎯 **Fluxo de Uso Completo**

### **1. Super Admin Cria Organização**

```
1. Login com email @entomonitec.com
2. Acessa /super-admin
3. Preenche formulário de nova organização:
   - Nome: "Fazenda Rio Grande"
   - Estado: "PR"
   - Administrador: admin@frg.gov.br
4. Sistema cria:
   - Organização no Firestore
   - Usuário admin com credenciais temporárias
   - Envia email para redefinir senha
```

### **2. Admin da Organização Gerencia Usuários**

```
1. Admin recebe email e define senha
2. Login no sistema
3. Acessa "Configurações" > "Usuários"
4. Cria agentes de campo:
   - Nome: "João Silva"
   - Email: "joao@frg.gov.br"
   - Tipo: "agent"
5. Usuário recebe email de ativação
```

### **3. Agente Usa o Sistema**

```
1. Agente define senha e faz login
2. Vê apenas dados da sua organização
3. Registra visitas e coletas
4. Dados ficam isolados por organizationId
```

### **4. Super Admin Dá Suporte**

```
1. Login como super admin
2. Header mostra "Trocar Organização"
3. Seleciona organização para visualizar
4. Sistema muda para perspectiva desta organização
5. Pode dar suporte como se fosse usuário local
```

---

## 🔐 **Estrutura de Segurança**

### **Firestore Rules - Isolamento Automático**

```javascript
// Usuários só veem da própria organização
match /users/{userId} {
  allow read: if isSameOrganization(resource.data.organizationId);
}

// Visitas isoladas por organização
match /visits/{visitId} {
  allow read: if isSameOrganization(resource.data.organizationId);
}

// Super admins têm acesso global
allow read, write: if isSuperAdmin();
```

### **Níveis de Acesso**

```typescript
super_admin: ['*']              // Acesso total
administrator: [
  'users:read', 'users:create', 'users:update', 'users:delete',
  'visits:read', 'visits:create', 'visits:update', 'visits:delete',
  'settings:read', 'settings:update'
]
supervisor: [
  'users:read', 'users:create', 'users:update',
  'visits:read', 'visits:create', 'visits:update',
  'reports:read', 'reports:create'
]
agent: [
  'visits:read', 'visits:create', 'visits:update',
  'collections:read', 'collections:create'
]
```

---

## 📊 **Estrutura de Dados Firebase**

### **Collections**

```
📁 organizations/
   📄 fazenda-rio-grande-pr/
      name: "Fazenda Rio Grande"
      state: "PR"
      branding: { colors: {...}, logo: "..." }
      neighborhoods: ["Centro", "Jardim Europa"]
      features: { enableLIRAa: true }
      isActive: true

📁 users/
   📄 user123/
      organizationId: "fazenda-rio-grande-pr"  🔥 CHAVE ISOLAMENTO
      email: "joao@frg.gov.br"
      role: "agent"
      permissions: ["visits:create"]

📁 visits/
   📄 visit456/
      organizationId: "fazenda-rio-grande-pr"  🔥 ISOLAMENTO AUTOMÁTICO
      userId: "user123"
      location: { lat: -25.123, lng: -49.456 }
      timestamp: "2024-01-15T10:30:00Z"
```

---

## 🚀 **Como Aplicar no Projeto**

### **1. Deploy das Regras Firestore**

```bash
# Copiar regras para o projeto Firebase
cp docs/firestore-rules.js firestore.rules

# Deploy via Firebase CLI
firebase deploy --only firestore:rules
```

### **2. Criar Super Admin**

```bash
# No Firebase Console > Authentication
# Criar usuário: admin@entomonitec.com

# No Firestore > users/[uid]
{
  "organizationId": "",
  "email": "admin@entomonitec.com",
  "name": "Super Administrador",
  "role": "super_admin",
  "permissions": ["*"],
  "isActive": true,
  "authProvider": "email"
}
```

### **3. Configurar DNS/Subdomínio (Opcional)**

```bash
# Para usar subdomínios por organização
frg.entomonitec.com  -> organizationId: "fazenda-rio-grande-pr"
cwb.entomonitec.com  -> organizationId: "curitiba-pr"

# Configurar no Next.js middleware
// middleware.ts
const subdomain = req.nextUrl.hostname.split('.')[0];
const orgId = getOrgBySubdomain(subdomain);
```

---

## 🎨 **Personalização por Organização**

### **Branding Dinâmico**

```typescript
// Cada organização tem sua identidade visual
const orgConfig = {
  "fazenda-rio-grande-pr": {
    colors: { primary: "#0B4B3C", secondary: "#1E7A5F" },
    logo: "gs://bucket/logos/frg.png",
    headerTitle: "Vigilância Entomológica FRG"
  },
  "curitiba-pr": {
    colors: { primary: "#1a5490", secondary: "#2563eb" },
    logo: "gs://bucket/logos/cwb.png", 
    headerTitle: "EntomoVigilância Curitiba"
  }
}

// CSS aplicado dinamicamente
document.documentElement.style.setProperty(
  '--primary-color', 
  orgConfig.colors.primary
);
```

---

## 🔧 **Troubleshooting**

### **Problema: Usuário não consegue ver dados**

```
✅ Verificar se user.organizationId está preenchido
✅ Verificar se dados têm organizationId correto
✅ Verificar regras Firestore
```

### **Problema: Super admin não consegue trocar organização**

```
✅ Verificar se email termina com @entomonitec.com
✅ Verificar se role === 'super_admin'
✅ Verificar se availableOrganizations está carregado
```

### **Problema: Organização não aparece**

```
✅ Verificar se isActive: true
✅ Verificar se está na collection 'organizations'
✅ Verificar se usuário tem permissão de leitura
```

---

## 🎯 **Exemplo de Implementação**

Criando uma nova organização via código:

```typescript
const newOrg = await OrganizationService.createOrganization({
  name: "São José dos Pinhais",
  fullName: "Prefeitura de São José dos Pinhais", 
  state: "PR",
  department: "Secretaria de Saúde",
  neighborhoods: ["Centro", "Borda do Campo"],
  contact: {
    phone: "(41) 3381-3000",
    email: "saude@sjp.pr.gov.br"
  },
  adminUser: {
    name: "Dr. Maria Silva",
    email: "maria@sjp.pr.gov.br"
  }
}, "super-admin-user-id");

// Resultado:
// ✅ Organização "sao-jose-dos-pinhais-pr" criada
// ✅ Admin maria@sjp.pr.gov.br criado
// ✅ Email de ativação enviado
// ✅ Dados isolados e seguros
```

---

## 🏆 **Vantagens Desta Arquitetura**

✅ **Isolamento Total**: Impossível vazamento entre organizações  
✅ **Escalável**: Suporta milhares de municípios  
✅ **Personalizável**: Cada organização tem sua identidade  
✅ **Seguro**: Rules Firebase garantem segurança server-side  
✅ **Gerenciável**: Interface intuitiva para criar/gerenciar  
✅ **Flexível**: Fácil adicionar novos campos/features  
✅ **Suportável**: Super admin pode dar suporte como usuário local  

**Este sistema replica perfeitamente a estrutura do backend Python original, mas com todas as vantagens do Firebase! 🔥**

