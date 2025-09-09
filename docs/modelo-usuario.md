# Modelo de Usuário - Entomonitec

## 📋 Visão Geral

O modelo de usuário representa os agentes, supervisores e administradores que utilizam o sistema Entomonitec. Cada usuário pertence a uma organização e possui permissões específicas baseadas em seu role.

## 🗄️ Estrutura no Banco de Dados

### Coleção: `users`

### Campos Obrigatórios

| Campo | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| `id` | string | ID único do usuário (Firebase UID) | `"abc123def456"` |
| `name` | string | Nome completo do usuário | `"João Silva Santos"` |
| `email` | string | Email único do usuário | `"joao.silva@prefeitura.gov.br"` |
| `role` | string | Função do usuário | `"agent"`, `"supervisor"`, `"administrator"`, `"super_admin"` |
| `organizationId` | string | ID da organização | `"org_curitiba_2024"` |
| `permissions` | string[] | Lista de permissões | `["read_visits", "create_visits"]` |
| `isActive` | boolean | Status ativo/inativo | `true` |
| `createdAt` | timestamp | Data de criação | `2024-01-15T10:30:00Z` |
| `updatedAt` | timestamp | Data da última atualização | `2024-01-20T14:45:00Z` |

### Campos Opcionais

| Campo | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| `assignedNeighborhoods` | string[] | Bairros atribuídos ao agente | `["Centro", "Batel", "Bigorrilho"]` |
| `mustChangePassword` | boolean | Força troca de senha | `false` |
| `lastLoginAt` | timestamp | Último login | `2024-01-20T09:15:00Z` |

## 🎭 Roles (Funções)

### Agent (Agente de Campo)
- **Descrição**: Agente que realiza visitas de campo
- **Permissões**: Criar visitas, visualizar próprias visitas
- **Bairros**: Atribuídos pelo supervisor

### Supervisor
- **Descrição**: Gerencia equipe de agentes
- **Permissões**: Visualizar todas as visitas da organização, gerenciar agentes
- **Bairros**: Pode ter bairros atribuídos

### Administrator (Coordenador)
- **Descrição**: Administra a organização
- **Permissões**: Acesso total à organização, gerenciar usuários
- **Bairros**: Não tem bairros específicos

### Super Admin
- **Descrição**: Administrador do sistema
- **Permissões**: Acesso a todas as organizações
- **Bairros**: Não aplicável

## 📊 Exemplo de Documento no Firebase

```json
{
  "id": "abc123def456",
  "name": "Maria Santos Oliveira",
  "email": "maria.santos@prefeitura.gov.br",
  "role": "agent",
  "organizationId": "org_curitiba_2024",
  "assignedNeighborhoods": [
    "Centro",
    "Centro Cívico",
    "Batel"
  ],
  "permissions": [
    "read_visits",
    "create_visits",
    "update_own_visits"
  ],
  "isActive": true,
  "mustChangePassword": false,
  "lastLoginAt": "2024-01-20T09:15:00Z",
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-20T14:45:00Z"
}
```

## 🔐 Sistema de Permissões

### Permissões por Role

#### Agent
```json
[
  "read_own_visits",
  "create_visits",
  "update_own_visits",
  "upload_photos"
]
```

#### Supervisor
```json
[
  "read_organization_visits",
  "read_agent_performance",
  "manage_agents",
  "view_dashboard",
  "export_reports"
]
```

#### Administrator
```json
[
  "manage_organization",
  "manage_users",
  "view_analytics",
  "configure_system",
  "access_operational_panel"
]
```

#### Super Admin
```json
[
  "manage_all_organizations",
  "system_administration",
  "global_analytics",
  "user_management"
]
```

## 🏢 Relacionamento com Organização

### Chave Estrangeira
- `organizationId` → Referência para coleção `organizations`

### Regras de Negócio
1. **Um usuário pertence a apenas uma organização**
2. **Usuários inativos não podem fazer login**
3. **Agentes devem ter bairros atribuídos**
4. **Supervisores podem gerenciar múltiplos bairros**

## 📍 Bairros Atribuídos

### Estrutura
```json
{
  "assignedNeighborhoods": [
    "Centro",
    "Centro Cívico", 
    "Batel",
    "Bigorrilho",
    "Campo Comprido"
  ]
}
```

### Regras
- **Agentes**: Devem ter pelo menos 1 bairro
- **Supervisores**: Podem ter múltiplos bairros
- **Administradores**: Podem não ter bairros específicos
- **Bairros**: Devem existir na configuração municipal

## 🔄 Estados do Usuário

### Ativo (`isActive: true`)
- Pode fazer login
- Pode realizar operações
- Aparece nas listagens

### Inativo (`isActive: false`)
- Não pode fazer login
- Dados preservados para histórico
- Não aparece nas listagens ativas

## 📈 Métricas de Usuário

### Campos Calculados
- **Última atividade**: Baseada na última visita
- **Total de visitas**: Contagem de visitas realizadas
- **Performance**: Score baseado na qualidade das visitas
- **Status operacional**: Ativo/Inativo/Licença

## 🛡️ Segurança

### Validações
1. **Email único** por organização
2. **Role válido** (enum restrito)
3. **OrganizationId** deve existir
4. **Bairros** devem ser válidos para a cidade

### Auditoria
- **Criado por**: Quem criou o usuário
- **Última modificação**: Timestamp da última alteração
- **Log de atividades**: Rastreamento de ações

## 🔧 APIs Relacionadas

### Endpoints
- `GET /users` - Listar usuários da organização
- `POST /users` - Criar novo usuário
- `PUT /users/:id` - Atualizar usuário
- `DELETE /users/:id` - Desativar usuário
- `GET /users/:id/performance` - Métricas de performance

### Filtros Disponíveis
- `role` - Filtrar por função
- `isActive` - Filtrar por status
- `neighborhood` - Filtrar por bairro
- `createdAfter` - Filtrar por data de criação

## 📝 Notas Técnicas

### Performance
- **Índices**: `organizationId`, `role`, `isActive`
- **Cache**: Dados de usuário em cache por 5 minutos
- **Paginação**: Limite de 100 usuários por página

### Backup
- **Frequência**: Diário
- **Retenção**: 1 ano
- **Criptografia**: Dados sensíveis criptografados

### Migração
- **Versionamento**: Schema versionado
- **Compatibilidade**: Retrocompatibilidade mantida
- **Rollback**: Possibilidade de reverter alterações
