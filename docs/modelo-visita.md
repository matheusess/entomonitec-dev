# Modelo de Visita - Entomonitec

## 📋 Visão Geral

O modelo de visita representa as inspeções realizadas pelos agentes de campo para coleta de dados entomológicos. Existem dois tipos principais: **Visitas de Rotina** e **Visitas LIRAa** (Levantamento Rápido do Índice de Infestação por Aedes aegypti).

## 🗄️ Estrutura no Banco de Dados

### Coleção: `visits`

### Campos Base (Comuns a ambos os tipos)

| Campo | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| `id` | string | ID único da visita | `"visit_abc123"` |
| `type` | string | Tipo da visita | `"routine"` ou `"liraa"` |
| `timestamp` | timestamp | Data/hora da visita | `"2024-01-20T14:30:00Z"` |
| `neighborhood` | string | Bairro da visita | `"Centro"` |
| `agentName` | string | Nome do agente | `"João Silva"` |
| `agentId` | string | ID do agente | `"agent_123"` |
| `userId` | string | ID do usuário (Firebase) | `"user_abc123"` |
| `organizationId` | string | ID da organização | `"org_curitiba"` |
| `observations` | string | Observações da visita | `"Imóvel em bom estado..."` |
| `photos` | string[] | URLs das fotos | `["https://storage.../foto1.jpg"]` |
| `status` | string | Status da visita | `"completed"`, `"refused"`, `"closed"` |
| `syncStatus` | string | Status de sincronização | `"synced"`, `"pending"`, `"error"` |
| `createdAt` | timestamp | Data de criação | `"2024-01-20T14:30:00Z"` |
| `updatedAt` | timestamp | Data da última atualização | `"2024-01-20T14:35:00Z"` |

## 📍 Dados de Localização

### Estrutura: `location`

```json
{
  "location": {
    "latitude": -25.4284,
    "longitude": -49.2733,
    "address": "Rua XV de Novembro, 1000 - Centro",
    "accuracy": 5.0,
    "timestamp": "2024-01-20T14:30:00Z",
    "geocodingData": {
      "street": "Rua XV de Novembro",
      "houseNumber": "1000",
      "neighborhood": "Centro",
      "city": "Curitiba",
      "state": "PR",
      "country": "Brasil",
      "postcode": "80020-010",
      "fullAddress": "Rua XV de Novembro, 1000 - Centro - Curitiba/PR"
    }
  }
}
```

### Campos
- **latitude/longitude**: Coordenadas GPS
- **address**: Endereço digitado pelo agente
- **accuracy**: Precisão do GPS em metros
- **geocodingData**: Dados processados pelo geocoding

## 🏠 Visita de Rotina

### Campos Específicos

| Campo | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| `breedingSites` | object | Locais de criadouro | Ver estrutura abaixo |
| `larvaeFound` | boolean | Larvas encontradas | `true` |
| `pupaeFound` | boolean | Pupas encontradas | `false` |
| `controlMeasures` | string[] | Medidas de controle | `["eliminação", "tratamento"]` |
| `calculatedRiskLevel` | string | Nível de risco calculado | `"medium"` |

### Estrutura: `breedingSites`

```json
{
  "breedingSites": {
    "waterReservoir": true,
    "tires": false,
    "bottles": true,
    "cans": false,
    "buckets": true,
    "plantPots": false,
    "gutters": true,
    "pools": false,
    "wells": false,
    "tanks": false,
    "drains": true,
    "others": "Pneus abandonados no quintal"
  }
}
```

### Tipos de Criadouros
- **waterReservoir**: Reservatórios de água
- **tires**: Pneus
- **bottles**: Garrafas
- **cans**: Latas
- **buckets**: Baldes
- **plantPots**: Vasos de plantas
- **gutters**: Calhas
- **pools**: Piscinas
- **wells**: Poços
- **tanks**: Caixas d'água
- **drains**: Ralos
- **others**: Outros (texto livre)

## 🔬 Visita LIRAa

### Campos Específicos

| Campo | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| `propertyType` | string | Tipo do imóvel | `"residential"` |
| `inspected` | boolean | Imóvel inspecionado | `true` |
| `refused` | boolean | Proprietário recusou | `false` |
| `closed` | boolean | Imóvel fechado | `false` |
| `containers` | object | Contadores de recipientes | Ver estrutura abaixo |
| `positiveContainers` | object | Recipientes positivos | Ver estrutura abaixo |
| `larvaeSpecies` | string[] | Espécies de larvas | `["Aedes aegypti", "Aedes albopictus"]` |
| `treatmentApplied` | boolean | Tratamento aplicado | `true` |
| `eliminationAction` | boolean | Ação de eliminação | `true` |
| `liraaIndex` | number | Índice LIRAa calculado | `2.5` |

### Estrutura: `containers` e `positiveContainers`

```json
{
  "containers": {
    "a1": 5,  // Reservatórios de água
    "a2": 3,  // Depósitos móveis
    "b": 2,   // Depósitos fixos
    "c": 8,   // Passíveis de remoção
    "d1": 1,  // Pneus
    "d2": 4,  // Lixo
    "e": 0    // Naturais
  },
  "positiveContainers": {
    "a1": 1,  // Reservatórios positivos
    "a2": 0,  // Depósitos móveis positivos
    "b": 0,   // Depósitos fixos positivos
    "c": 2,   // Passíveis de remoção positivos
    "d1": 0,  // Pneus positivos
    "d2": 1,  // Lixo positivo
    "e": 0    // Naturais positivos
  }
}
```

### Classificação de Recipientes (Protocolo MS)
- **A1**: Reservatórios de água (caixas d'água, cisternas)
- **A2**: Depósitos móveis (vasos, pratos)
- **B**: Depósitos fixos (piscinas, fontes)
- **C**: Passíveis de remoção (garrafas, latas)
- **D1**: Pneus
- **D2**: Lixo
- **E**: Naturais (bromélias, ocos de árvores)

## 📊 Exemplo de Visita de Rotina

```json
{
  "id": "visit_routine_001",
  "type": "routine",
  "timestamp": "2024-01-20T14:30:00Z",
  "location": {
    "latitude": -25.4284,
    "longitude": -49.2733,
    "address": "Rua XV de Novembro, 1000 - Centro",
    "accuracy": 5.0,
    "timestamp": "2024-01-20T14:30:00Z",
    "geocodingData": {
      "street": "Rua XV de Novembro",
      "houseNumber": "1000",
      "neighborhood": "Centro",
      "city": "Curitiba",
      "state": "PR",
      "country": "Brasil",
      "postcode": "80020-010",
      "fullAddress": "Rua XV de Novembro, 1000 - Centro - Curitiba/PR"
    }
  },
  "neighborhood": "Centro",
  "agentName": "João Silva",
  "agentId": "agent_123",
  "userId": "user_abc123",
  "organizationId": "org_curitiba",
  "observations": "Imóvel residencial em bom estado de conservação. Proprietário colaborativo.",
  "photos": [
    "https://storage.googleapis.com/entomonitec-photos/visit_001_1.jpg",
    "https://storage.googleapis.com/entomonitec-photos/visit_001_2.jpg"
  ],
  "status": "completed",
  "syncStatus": "synced",
  "createdAt": "2024-01-20T14:30:00Z",
  "updatedAt": "2024-01-20T14:35:00Z",
  "breedingSites": {
    "waterReservoir": true,
    "tires": false,
    "bottles": true,
    "cans": false,
    "buckets": true,
    "plantPots": false,
    "gutters": true,
    "pools": false,
    "wells": false,
    "tanks": false,
    "drains": true,
    "others": "Pneus abandonados no quintal"
  },
  "larvaeFound": true,
  "pupaeFound": false,
  "controlMeasures": ["eliminação", "tratamento", "orientação"],
  "calculatedRiskLevel": "medium"
}
```

## 📊 Exemplo de Visita LIRAa

```json
{
  "id": "visit_liraa_001",
  "type": "liraa",
  "timestamp": "2024-01-20T14:30:00Z",
  "location": {
    "latitude": -25.4284,
    "longitude": -49.2733,
    "address": "Rua XV de Novembro, 1000 - Centro",
    "accuracy": 5.0,
    "timestamp": "2024-01-20T14:30:00Z"
  },
  "neighborhood": "Centro",
  "agentName": "Maria Santos",
  "agentId": "agent_456",
  "userId": "user_def456",
  "organizationId": "org_curitiba",
  "observations": "Imóvel residencial. Proprietário presente e colaborativo.",
  "photos": [
    "https://storage.googleapis.com/entomonitec-photos/liraa_001_1.jpg"
  ],
  "status": "completed",
  "syncStatus": "synced",
  "createdAt": "2024-01-20T14:30:00Z",
  "updatedAt": "2024-01-20T14:35:00Z",
  "propertyType": "residential",
  "inspected": true,
  "refused": false,
  "closed": false,
  "containers": {
    "a1": 2,
    "a2": 5,
    "b": 1,
    "c": 8,
    "d1": 0,
    "d2": 3,
    "e": 0
  },
  "positiveContainers": {
    "a1": 0,
    "a2": 1,
    "b": 0,
    "c": 2,
    "d1": 0,
    "d2": 0,
    "e": 0
  },
  "larvaeSpecies": ["Aedes aegypti"],
  "treatmentApplied": true,
  "eliminationAction": true,
  "liraaIndex": 2.5
}
```

## 🔄 Estados da Visita

### Status da Visita

| Status | Descrição | Ação Permitida |
|--------|-----------|----------------|
| `completed` | Visita finalizada com sucesso | Visualizar, editar observações |
| `refused` | Proprietário recusou a visita | Visualizar, reagendar |
| `closed` | Imóvel fechado/desocupado | Visualizar, reagendar |

### Status de Sincronização

| Status | Descrição | Ação |
|--------|-----------|------|
| `pending` | Aguardando sincronização | Tentar novamente |
| `syncing` | Sincronizando | Aguardar |
| `synced` | Sincronizado com sucesso | Nenhuma |
| `error` | Erro na sincronização | Verificar logs |

## 📈 Cálculos Automáticos

### Nível de Risco (Visita de Rotina)
```javascript
function calculateRiskLevel(breedingSites, larvaeFound, pupaeFound) {
  let riskScore = 0;
  
  // Contar criadouros
  const breedingCount = Object.values(breedingSites).filter(Boolean).length;
  
  // Pontuação base
  if (breedingCount >= 5) riskScore += 3;
  else if (breedingCount >= 3) riskScore += 2;
  else if (breedingCount >= 1) riskScore += 1;
  
  // Larvas encontradas
  if (larvaeFound) riskScore += 2;
  if (pupaeFound) riskScore += 1;
  
  // Classificação
  if (riskScore >= 5) return 'critical';
  if (riskScore >= 3) return 'high';
  if (riskScore >= 1) return 'medium';
  return 'low';
}
```

### Índice LIRAa
```javascript
function calculateLIRAaIndex(containers, positiveContainers) {
  const totalContainers = Object.values(containers).reduce((a, b) => a + b, 0);
  const totalPositive = Object.values(positiveContainers).reduce((a, b) => a + b, 0);
  
  if (totalContainers === 0) return 0;
  
  return (totalPositive / totalContainers) * 100;
}
```

## 🔐 Segurança e Validações

### Validações Obrigatórias
1. **Localização**: Coordenadas GPS válidas
2. **Agente**: Deve existir e estar ativo
3. **Organização**: Deve existir e estar ativa
4. **Bairro**: Deve ser válido para a cidade
5. **Fotos**: Máximo 10 fotos por visita

### Regras de Negócio
1. **Visitas LIRAa**: Apenas em imóveis residenciais
2. **Status**: Apenas transições válidas
3. **Sincronização**: Tentativas limitadas
4. **Fotos**: Apenas formatos permitidos (JPG, PNG)

## 📊 Relacionamentos

### Com Usuário
- **Relacionamento**: N:1 (Muitas visitas para um agente)
- **Chave**: `agentId` → `users.id`
- **Isolamento**: Agente só vê próprias visitas

### Com Organização
- **Relacionamento**: N:1 (Muitas visitas para uma organização)
- **Chave**: `organizationId` → `organizations.id`
- **Isolamento**: Visitas isoladas por organização

### Com Fotos
- **Relacionamento**: 1:N (Uma visita tem muitas fotos)
- **Armazenamento**: Firebase Storage
- **URLs**: Geradas automaticamente

## 🔧 APIs Relacionadas

### Endpoints
- `GET /visits` - Listar visitas
- `POST /visits/routine` - Criar visita de rotina
- `POST /visits/liraa` - Criar visita LIRAa
- `PUT /visits/:id` - Atualizar visita
- `GET /visits/:id/photos` - Baixar fotos
- `POST /visits/:id/sync` - Forçar sincronização

### Filtros Disponíveis
- `type` - Filtrar por tipo (routine/liraa)
- `agentId` - Filtrar por agente
- `neighborhood` - Filtrar por bairro
- `status` - Filtrar por status
- `dateRange` - Filtrar por período
- `hasLarvae` - Filtrar por presença de larvas

## 📝 Notas Técnicas

### Performance
- **Índices**: `organizationId`, `agentId`, `neighborhood`, `createdAt`
- **Cache**: Dados recentes em cache por 1 hora
- **Paginação**: Limite de 100 visitas por página

### Backup
- **Frequência**: A cada 6 horas
- **Retenção**: 2 anos
- **Criptografia**: Dados sensíveis criptografados

### Auditoria
- **Logs**: Todas as operações logadas
- **Rastreamento**: Mudanças de status
- **Compliance**: Conformidade com LGPD
