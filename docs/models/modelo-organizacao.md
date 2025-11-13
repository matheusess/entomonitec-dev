# Modelo de Organização - Entomonitec

## 📋 Visão Geral

O modelo de organização representa as prefeituras, secretarias de saúde e órgãos municipais que utilizam o sistema Entomonitec. Cada organização possui configurações específicas, usuários e dados isolados.

## 🗄️ Estrutura no Banco de Dados

### Coleção: `organizations`

### Campos Obrigatórios

| Campo | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| `id` | string | ID único da organização | `"org_curitiba_2024"` |
| `name` | string | Nome curto da organização | `"Curitiba"` |
| `fullName` | string | Nome completo | `"Prefeitura Municipal de Curitiba"` |
| `state` | string | Estado (UF) | `"PR"` |
| `city` | string | Cidade | `"Curitiba"` |
| `department` | string | Departamento/Secretaria | `"Secretaria Municipal da Saúde"` |
| `phone` | string | Telefone principal | `"(41) 3350-3000"` |
| `email` | string | Email institucional | `"saude@curitiba.pr.gov.br"` |
| `isActive` | boolean | Status ativo/inativo | `true` |
| `createdAt` | timestamp | Data de criação | `"2024-01-01T00:00:00Z"` |
| `updatedAt` | timestamp | Data da última atualização | `"2024-01-20T14:45:00Z"` |

### Campos Opcionais

| Campo | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| `address` | string | Endereço completo | `"Rua da Cidadania, 1000 - Centro"` |
| `website` | string | Site oficial | `"https://www.curitiba.pr.gov.br"` |
| `createdBy` | string | ID do usuário criador | `"super_admin_001"` |

## 🎨 Configurações de Branding

### Estrutura: `branding`

```json
{
  "branding": {
    "colors": {
      "primary": "#1e40af",
      "secondary": "#3b82f6"
    },
    "headerTitle": "Vigilância Entomológica",
    "systemName": "Entomonitec Curitiba",
    "description": "Sistema de Vigilância Entomológica Municipal"
  }
}
```

### Campos
- **colors.primary**: Cor principal da interface
- **colors.secondary**: Cor secundária da interface
- **headerTitle**: Título exibido no cabeçalho
- **systemName**: Nome do sistema para esta organização
- **description**: Descrição institucional

## 📞 Informações de Contato

### Estrutura: `contact`

```json
{
  "contact": {
    "phone": "(41) 3350-3000",
    "email": "saude@curitiba.pr.gov.br",
    "address": "Rua da Cidadania, 1000 - Centro - Curitiba/PR",
    "website": "https://www.curitiba.pr.gov.br"
  }
}
```

## ⚙️ Funcionalidades Habilitadas

### Estrutura: `features`

```json
{
  "features": {
    "enableLIRAa": true,
    "enableLaboratory": false,
    "enablePredictiveAnalysis": true,
    "customFields": [
      "tipo_imovel",
      "observacoes_especiais"
    ]
  }
}
```

### Funcionalidades Disponíveis
- **enableLIRAa**: Habilitar coleta LIRAa
- **enableLaboratory**: Integração com laboratório
- **enablePredictiveAnalysis**: Análise preditiva
- **customFields**: Campos personalizados

## 🏥 Configurações do Ministério da Saúde

### Estrutura: `healthMinistrySettings`

```json
{
  "healthMinistrySettings": {
    "region": "Região Sul",
    "coordinatorName": "Dr. João Silva",
    "protocolVersion": "v2.1",
    "reportingFrequency": "semanal"
  }
}
```

### Campos
- **region**: Região de saúde
- **coordinatorName**: Nome do coordenador
- **protocolVersion**: Versão do protocolo MS
- **reportingFrequency**: Frequência de relatórios

## 📊 Exemplo de Documento Completo

```json
{
  "id": "org_curitiba_2024",
  "name": "Curitiba",
  "fullName": "Prefeitura Municipal de Curitiba",
  "state": "PR",
  "city": "Curitiba",
  "department": "Secretaria Municipal da Saúde",
  "phone": "(41) 3350-3000",
  "email": "saude@curitiba.pr.gov.br",
  "address": "Rua da Cidadania, 1000 - Centro - Curitiba/PR",
  "website": "https://www.curitiba.pr.gov.br",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-20T14:45:00Z",
  "createdBy": "super_admin_001",
  "branding": {
    "colors": {
      "primary": "#1e40af",
      "secondary": "#3b82f6"
    },
    "headerTitle": "Vigilância Entomológica",
    "systemName": "Entomonitec Curitiba",
    "description": "Sistema de Vigilância Entomológica Municipal"
  },
  "contact": {
    "phone": "(41) 3350-3000",
    "email": "saude@curitiba.pr.gov.br",
    "address": "Rua da Cidadania, 1000 - Centro - Curitiba/PR",
    "website": "https://www.curitiba.pr.gov.br"
  },
  "features": {
    "enableLIRAa": true,
    "enableLaboratory": false,
    "enablePredictiveAnalysis": true,
    "customFields": [
      "tipo_imovel",
      "observacoes_especiais"
    ]
  },
  "healthMinistrySettings": {
    "region": "Região Sul",
    "coordinatorName": "Dr. João Silva",
    "protocolVersion": "v2.1",
    "reportingFrequency": "semanal"
  }
}
```

## 🏗️ Estrutura de Dados Relacionados

### Usuários
- **Relacionamento**: 1:N (Uma organização tem muitos usuários)
- **Chave**: `organizationId` na coleção `users`
- **Isolamento**: Usuários só veem dados da própria organização

### Visitas
- **Relacionamento**: 1:N (Uma organização tem muitas visitas)
- **Chave**: `organizationId` na coleção `visits`
- **Isolamento**: Visitas isoladas por organização

### Configurações Municipais
- **Relacionamento**: 1:1 (Uma organização tem uma configuração)
- **Chave**: `organizationId` na coleção `municipalConfigs`

## 🔐 Segurança e Isolamento

### Multi-tenancy
- **Isolamento total** de dados entre organizações
- **Regras de segurança** baseadas em `organizationId`
- **Acesso restrito** por organização

### Validações
1. **Nome único** no sistema
2. **Email institucional** válido
3. **Estado/Cidade** válidos
4. **Configurações** consistentes

## 📈 Métricas da Organização

### Dados Calculados
- **Total de usuários**: Contagem de usuários ativos
- **Total de visitas**: Soma de todas as visitas
- **Agentes ativos**: Usuários com role 'agent' ativos
- **Performance média**: Média de qualidade das visitas

### Relatórios Disponíveis
- **Dashboard executivo**: Visão geral da organização
- **Relatório de performance**: Métricas dos agentes
- **Relatório epidemiológico**: Dados de saúde pública
- **Relatório operacional**: Gestão de equipes

## 🛠️ Configurações Técnicas

### Limites por Organização
- **Usuários**: Máximo 1000 usuários
- **Visitas**: Sem limite (apenas por performance)
- **Armazenamento**: 10GB por organização
- **Backup**: Diário automático

### Performance
- **Cache**: Configurações em cache por 1 hora
- **Índices**: `state`, `city`, `isActive`
- **CDN**: Assets estáticos distribuídos

## 🔄 Estados da Organização

### Ativa (`isActive: true`)
- Usuários podem fazer login
- Sistema totalmente funcional
- Dados sincronizados

### Inativa (`isActive: false`)
- Usuários não podem fazer login
- Dados preservados
- Sistema em modo de manutenção

### Suspensa
- Acesso limitado
- Dados preservados
- Aguardando regularização

## 📊 Exemplos de Organizações

### Prefeitura Grande
```json
{
  "name": "São Paulo",
  "fullName": "Prefeitura Municipal de São Paulo",
  "state": "SP",
  "city": "São Paulo",
  "department": "Secretaria Municipal da Saúde",
  "features": {
    "enableLIRAa": true,
    "enableLaboratory": true,
    "enablePredictiveAnalysis": true
  }
}
```

### Prefeitura Pequena
```json
{
  "name": "Piraquara",
  "fullName": "Prefeitura Municipal de Piraquara",
  "state": "PR",
  "city": "Piraquara",
  "department": "Secretaria Municipal da Saúde",
  "features": {
    "enableLIRAa": true,
    "enableLaboratory": false,
    "enablePredictiveAnalysis": false
  }
}
```

## 🔧 APIs Relacionadas

### Endpoints
- `GET /organizations` - Listar organizações
- `POST /organizations` - Criar organização
- `PUT /organizations/:id` - Atualizar organização
- `GET /organizations/:id/stats` - Estatísticas da organização
- `POST /organizations/:id/configure` - Configurar funcionalidades

### Filtros Disponíveis
- `state` - Filtrar por estado
- `isActive` - Filtrar por status
- `features` - Filtrar por funcionalidades
- `createdAfter` - Filtrar por data de criação

## 📝 Notas Técnicas

### Backup e Recuperação
- **Frequência**: Diário automático
- **Retenção**: 1 ano
- **Recuperação**: Até 30 dias atrás

### Migração de Dados
- **Versionamento**: Schema versionado
- **Compatibilidade**: Retrocompatibilidade
- **Rollback**: Possibilidade de reverter

### Monitoramento
- **Logs**: Todas as operações logadas
- **Métricas**: Performance e uso
- **Alertas**: Problemas de sistema

