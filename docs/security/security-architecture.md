# 🔒 Arquitetura de Segurança - Sistema EntomonitEc

## 🎯 **Princípios de Segurança**

### **1. Super Admin (EntomonitEc Staff)**
- ✅ **Acesso**: Pessoal da EntomonitEc apenas
- ✅ **Criação**: Adicionados manualmente no banco de dados
- ✅ **Domínio**: Emails `@entomonitec.com` / `@entomonitec.com.br`
- ✅ **Privilégios**: Visualização global para suporte técnico
- ✅ **Responsabilidade**: Gerenciar organizações e dar suporte

### **2. Isolamento Total por Organização**
- 🔐 **Princípio**: Cada organização (município) é completamente isolada
- 🔐 **Dados**: Zero visibilidade entre organizações diferentes
- 🔐 **Usuários**: Só veem dados da própria organização
- 🔐 **Firebase Rules**: Aplicadas server-side para garantir isolamento

### **3. Hierarquia de Usuários por Organização**

```
📊 ORGANIZAÇÃO (Ex: Fazenda Rio Grande - PR)
├── 👨‍💼 Administrator (1 por org)
│   ├── ✅ Gerencia todos os usuários da organização
│   ├── ✅ Cria Supervisores e Agentes
│   ├── ✅ Acesso total aos dados da organização
│   └── ❌ NÃO vê outras organizações
│
├── 👨‍🔧 Supervisor (N por org)
│   ├── ✅ Supervisiona agentes
│   ├── ✅ Pode criar novos agentes
│   ├── ✅ Acesso a relatórios da organização
│   └── ❌ NÃO vê outras organizações
│
└── 👨‍🚀 Agent (N por org)
    ├── ✅ Executa visitas de campo
    ├── ✅ Registra coletas e dados
    ├── ✅ Acesso limitado aos próprios dados
    └── ❌ NÃO vê outras organizações
```

## 🛡️ **Implementação de Segurança**

### **Firebase Firestore Rules**
```javascript
// Usuários só veem da própria organização
match /users/{userId} {
  allow read: if isSameOrganization(resource.data.organizationId);
}

// Visitas isoladas por organização
match /visits/{visitId} {
  allow read: if isSameOrganization(resource.data.organizationId);
}

// Super admins têm acesso global (apenas EntomonitEc)
allow read, write: if isSuperAdmin();
```

### **Validações Frontend**
```typescript
// Verificar se usuário pertence à organização
const canAccess = user.organizationId === targetOrganizationId;

// Super Admin pode acessar qualquer organização
const isSuperAdmin = user.email.endsWith('@entomonitec.com');

// Isolamento automático nas queries
const query = where('organizationId', '==', user.organizationId);
```

## 🔧 **Controles Implementados**

### **1. UserService**
- ✅ **listUsersByOrganization()**: Lista apenas usuários da organização
- ✅ **createUser()**: Cria usuários vinculados à organização
- ✅ **updateUser()**: Atualiza apenas da mesma organização
- ❌ **listAllUsers()**: Apenas para Super Admin

### **2. UserManagementModal**
- ✅ **Usuário Normal**: Só vê usuários da própria organização
- ✅ **Super Admin**: Pode especificar organização ou ver todas
- ✅ **Validação**: Impede criação em organizações diferentes
- ✅ **Interface**: Mostra claramente o isolamento

### **3. SuperAdminPanel**
- ✅ **Organizações**: Super Admin vê todas, usuários normais não acessam
- ✅ **Usuários por Org**: Cada organização tem seu botão de gerenciar
- ✅ **Controle de Acesso**: Baseado em permissões e organizationId

## 🔐 **Autenticação e Reset de Senha**

### **Sistema de Autenticação**
- ✅ **Firebase Authentication**: Email/senha
- ✅ **Persistência**: Sessão mantida entre recarregamentos
- ✅ **HTTPS obrigatório**: Comunicação criptografada
- ✅ **Tokens JWT**: Gerenciados automaticamente pelo Firebase

### **Reset de Senha**
- ✅ **Implementação**: Via Firebase Auth (`sendPasswordResetEmail`)
- ✅ **Segurança**: Token único, expiração de 1 hora
- ✅ **Rate limiting**: Prevenção de spam automática
- ✅ **Logs**: Todas as tentativas são registradas

### **Fluxo de Reset**
1. Usuário solicita reset na tela de login
2. Sistema valida email e envia via Firebase Auth
3. Usuário recebe email com link de reset
4. Link redireciona para página do Firebase
5. Usuário define nova senha
6. Senha atualizada no Firebase Auth

### **Tratamento de Erros**
- `auth/user-not-found`: Email não encontrado
- `auth/invalid-email`: Formato de email inválido
- `auth/too-many-requests`: Muitas tentativas (rate limiting)

**Documentação completa**: [Autenticação e Reset de Senha](./AUTENTICACAO_RESET_SENHA.md)

## ⚠️ **Pontos Críticos de Segurança**

### **1. Super Admin Creation**
```bash
# Super Admins devem ser criados manualmente no Firebase Console
# NUNCA criar via interface do sistema

# 1. Firebase Authentication
Email: admin@entomonitec.com
Password: [senha segura]

# 2. Firestore Document (users/[uid])
{
  "email": "admin@entomonitec.com",
  "name": "Admin EntomonitEc",
  "role": "super_admin",
  "organizationId": "",  // VAZIO para Super Admin
  "permissions": ["*"],
  "isActive": true
}
```

### **2. Organization Isolation**
- ✅ **organizationId** é a chave de isolamento
- ✅ Todo documento deve ter organizationId (exceto Super Admin)
- ✅ Queries sempre filtram por organizationId
- ✅ Frontend valida antes de enviar para backend

### **3. Permission System**
```typescript
// Permissões por Role
administrator: [
  'users:read', 'users:create', 'users:update', 'users:delete',
  'visits:*', 'collections:*', 'reports:*', 'settings:*'
]

supervisor: [
  'users:read', 'users:create', 'users:update',
  'visits:*', 'collections:*', 'reports:read'
]

agent: [
  'visits:read', 'visits:create', 'visits:update',
  'collections:read', 'collections:create'
]
```

## 🚨 **Checklist de Segurança**

### **Antes do Deploy**
- [ ] Firestore Rules aplicadas
- [ ] Super Admins criados manualmente
- [ ] Testes de isolamento entre organizações
- [ ] Validação de permissões por role
- [ ] Logs de auditoria habilitados

### **Monitoramento Contínuo**
- [ ] Logs de acesso por organização
- [ ] Alertas para tentativas de acesso cross-org
- [ ] Auditoria de criação de usuários
- [ ] Verificação periódica de permissões

## 📞 **Suporte e Manutenção**

**Para adicionar Super Admin:**
1. Criar usuário no Firebase Authentication
2. Adicionar documento no Firestore users/[uid]
3. Usar domínio @entomonitec.com
4. Definir organizationId como string vazia
5. Permissões: ["*"]

**Para depuração:**
- Verificar organizationId em todos os documentos
- Validar Firebase Rules no console
- Testar isolamento com usuários de organizações diferentes
- Monitorar logs de acesso e queries

---

**📅 Documento atualizado**: ${new Date().toISOString()}
**👨‍💻 Responsável**: Sistema EntomonitEc
**🔐 Classificação**: Confidencial - Apenas equipe técnica
