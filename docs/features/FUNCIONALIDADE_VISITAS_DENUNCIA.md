# 🚨 Funcionalidade - Visitas de Denúncia

**Novo Tipo de Visita: Denúncia + Campo de Tubos Coletados**

---

## 🎯 Objetivo

Adicionar um novo tipo de visita chamado **"Denúncia"** ao sistema, que terá os mesmos campos das visitas de rotina, mas com propósito específico para atendimento de denúncias recebidas. Além disso, adicionar o campo **"Quantidade de Tubos Coletados"** em todos os tipos de visita.

---

## 📋 Alterações Propostas

### 1. Novo Tipo de Visita: Denúncia

**Tipos de Visita Atuais:**
- ✅ `routine` - Visita de Rotina
- ✅ `liraa` - Visita LIRAa (Protocolo MS)

**Novo Tipo:**
- 🆕 `denuncia` - Visita de Denúncia

### 2. Campos da Visita de Denúncia

A visita de denúncia terá **exatamente os mesmos campos** da visita de rotina:

- ✅ Bairro
- ✅ Localização (GPS)
- ✅ Endereço completo
- ✅ Observações
- ✅ Fotos (até 10)
- ✅ Criadouros (12 tipos)
- ✅ Larvas encontradas (boolean)
- ✅ Pupas encontradas (boolean)
- ✅ Medidas de controle aplicadas
- ✅ Nível de risco calculado
- ✅ Status da visita

**Diferença:** Apenas o `type` será `"denuncia"` ao invés de `"routine"`

### 3. Campo Novo: Quantidade de Tubos Coletados

**Campo adicionado em TODOS os tipos de visita:**
- 🆕 `tubesCollected` - Quantidade de tubos coletados (número inteiro)

**Características:**
- Tipo: `number` (inteiro)
- Valor padrão: `0`
- Obrigatório: Não (opcional)
- Validação: Número inteiro >= 0
- Máximo sugerido: 100 (pode ser ajustado)

---

## 🗄️ Estrutura de Dados

### Atualização do Tipo de Visita

```typescript
// Tipo de visita atualizado
type VisitType = 'routine' | 'liraa' | 'denuncia';

// Interface base atualizada
interface VisitFormBase {
  id: string;
  type: 'routine' | 'liraa' | 'denuncia';  // 🆕 Adicionado 'denuncia'
  timestamp: Date;
  location: LocationData | null;
  neighborhood: string;
  agentName: string;
  agentId: string;
  userId: string;
  organizationId: string;
  observations: string;
  photos: string[];
  tubesCollected: number;  // 🆕 Novo campo
  status: 'completed' | 'refused' | 'closed';
  syncStatus: 'pending' | 'syncing' | 'synced' | 'error';
  syncError?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Visita de Rotina (sem mudanças, apenas herda tubesCollected)
export interface RoutineVisitForm extends VisitFormBase {
  type: 'routine';
  breedingSites: {
    waterReservoir: boolean;
    tires: boolean;
    bottles: boolean;
    cans: boolean;
    buckets: boolean;
    plantPots: boolean;
    gutters: boolean;
    pools: boolean;
    wells: boolean;
    tanks: boolean;
    drains: boolean;
    others: string;
  };
  larvaeFound: boolean;
  pupaeFound: boolean;
  controlMeasures: string[];
  calculatedRiskLevel?: 'low' | 'medium' | 'high' | 'critical';
  tubesCollected: number;  // 🆕 Novo campo
}

// 🆕 Nova interface: Visita de Denúncia
export interface DenunciaVisitForm extends VisitFormBase {
  type: 'denuncia';
  breedingSites: {
    waterReservoir: boolean;
    tires: boolean;
    bottles: boolean;
    cans: boolean;
    buckets: boolean;
    plantPots: boolean;
    gutters: boolean;
    pools: boolean;
    wells: boolean;
    tanks: boolean;
    drains: boolean;
    others: string;
  };
  larvaeFound: boolean;
  pupaeFound: boolean;
  controlMeasures: string[];
  calculatedRiskLevel?: 'low' | 'medium' | 'high' | 'critical';
  tubesCollected: number;  // 🆕 Novo campo
  // Campos específicos de denúncia (futuro)
  denunciaSource?: string;  // Origem da denúncia (opcional)
  denunciaDate?: Date;      // Data da denúncia (opcional)
}

// Visita LIRAa (atualizada com tubesCollected)
export interface LIRAAVisitForm extends VisitFormBase {
  type: 'liraa';
  propertyType: 'residential' | 'commercial' | 'institutional' | 'vacant';
  inspected: boolean;
  refused: boolean;
  closed: boolean;
  containers: {
    a1: number;
    a2: number;
    b: number;
    c: number;
    d1: number;
    d2: number;
    e: number;
  };
  positiveContainers: {
    a1: number;
    a2: number;
    b: number;
    c: number;
    d1: number;
    d2: number;
    e: number;
  };
  larvaeSpecies: string[];
  treatmentApplied: boolean;
  eliminationAction: boolean;
  liraaIndex?: number;
  tubesCollected: number;  // 🆕 Novo campo
}

// Tipo união atualizado
export type VisitForm = RoutineVisitForm | LIRAAVisitForm | DenunciaVisitForm;
```

### Estrutura no Firestore

**Coleção:** `visits`

**Documento de exemplo - Visita de Denúncia:**

```json
{
  "id": "visit_denuncia_001",
  "type": "denuncia",
  "timestamp": "2024-01-20T14:30:00Z",
  "location": {
    "latitude": -25.4284,
    "longitude": -49.2733,
    "address": "Rua XV de Novembro, 1000 - Centro",
    "accuracy": 5.0
  },
  "neighborhood": "Centro",
  "agentName": "João Silva",
  "agentId": "agent_123",
  "userId": "user_abc123",
  "organizationId": "org_curitiba",
  "observations": "Denúncia recebida via telefone. Imóvel com acúmulo de água.",
  "photos": [
    "https://storage.../foto1.jpg"
  ],
  "tubesCollected": 3,
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
    "others": ""
  },
  "larvaeFound": true,
  "pupaeFound": false,
  "controlMeasures": ["eliminação", "tratamento", "orientação"],
  "calculatedRiskLevel": "high",
  "status": "completed",
  "syncStatus": "synced",
  "createdAt": "2024-01-20T14:30:00Z",
  "updatedAt": "2024-01-20T14:35:00Z"
}
```

---

## 📝 Alterações de Labels (3 Campos)

### Campos com Labels Alteradas

**A definir quais campos terão labels alteradas. Exemplos possíveis:**

1. **Campo 1:** `neighborhood` 
   - Label atual: "Bairro"
   - Label nova: [A DEFINIR]

2. **Campo 2:** `observations`
   - Label atual: "Observações"
   - Label nova: [A DEFINIR]

3. **Campo 3:** `controlMeasures`
   - Label atual: "Medidas de Controle"
   - Label nova: [A DEFINIR]

*Nota: As labels específicas devem ser definidas pelo cliente/usuário.*

---

## 🎨 Interface do Usuário

### Seleção de Tipo de Visita

**Localização:** Formulário de criação de visita

**Opções:**
- 🔵 **Visita de Rotina** - Controle geral de vetores
- 🟢 **Visita LIRAa** - Levantamento Rápido (Protocolo MS)
- 🟠 **Visita de Denúncia** - Atendimento de denúncia recebida 🆕

### Formulário de Visita de Denúncia

**Seção: Informações Básicas**
- Tipo de visita: **Denúncia** (selecionado)
- Data/Hora da visita
- Bairro
- Endereço completo
- Localização GPS

**Seção: Criadouros e Larvas**
- Criadouros encontrados (12 tipos)
- Larvas encontradas (sim/não)
- Pupas encontradas (sim/não)
- **Quantidade de Tubos Coletados:** [Campo numérico] 🆕

**Seção: Medidas e Observações**
- Medidas de controle aplicadas
- Observações
- Fotos (até 10)

**Seção: Resumo**
- Nível de risco calculado
- Status da visita

### Campo: Quantidade de Tubos Coletados

**Localização:** Seção "Criadouros e Larvas" (todos os tipos de visita)

**Características:**
- **Tipo:** Input numérico
- **Label:** "Quantidade de Tubos Coletados"
- **Placeholder:** "0"
- **Valor padrão:** 0
- **Validação:**
  - Apenas números inteiros
  - Valor mínimo: 0
  - Valor máximo: 100 (sugerido)
- **Obrigatório:** Não (opcional)
- **Visibilidade:** Sempre visível em todos os tipos de visita

**Exemplo Visual:**
```
┌─────────────────────────────────────┐
│ Quantidade de Tubos Coletados       │
│ [  0  ]                              │
│ ℹ️ Informe a quantidade de tubos     │
│    coletados durante a visita        │
└─────────────────────────────────────┘
```

---

## 🔄 Fluxo de Funcionamento

### Criar Visita de Denúncia

```
┌─────────────────┐
│  Agente acessa  │
│  "Nova Visita"  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Seleciona tipo: │
│  - Rotina        │
│  - LIRAa         │
│  - Denúncia 🆕   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Preenche       │
│  formulário     │
│  (igual rotina)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Informa        │
│  tubos coletados│
│  (opcional) 🆕   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Salva visita   │
│  type: "denuncia"│
└─────────────────┘
```

---

## 📊 Dashboard e Relatórios

### Filtros Atualizados

**Filtro por Tipo de Visita:**
- ✅ Rotina
- ✅ LIRAa
- 🆕 Denúncia

### Métricas Atualizadas

**Dashboard Principal:**
- Total de visitas (incluindo denúncias)
- Visitas por tipo (Rotina / LIRAa / Denúncia)
- Visitas de denúncia no período
- Taxa de atendimento de denúncias

**Métricas de Tubos Coletados:**
- Total de tubos coletados (período)
- Média de tubos por visita
- Visitas com tubos coletados
- Distribuição por tipo de visita

### Gráficos

- Gráfico de visitas por tipo (incluindo denúncia)
- Gráfico de tubos coletados ao longo do tempo
- Comparativo: Rotina vs LIRAa vs Denúncia

---

## 🔍 Buscas e Filtros

### Filtros Disponíveis

**Por Tipo:**
- `type == 'routine'`
- `type == 'liraa'`
- `type == 'denuncia'` 🆕

**Por Tubos Coletados:**
- `tubesCollected > 0` - Visitas com tubos coletados
- `tubesCollected == 0` - Visitas sem tubos coletados
- `tubesCollected >= X` - Mínimo de tubos

**Combinações:**
- Denúncias com larvas encontradas
- Denúncias com tubos coletados
- Denúncias por bairro

---

## 🔐 Regras de Segurança

### Firebase Rules

As regras do Firestore devem ser atualizadas para aceitar o novo tipo:

```javascript
// Validação de tipo de visita
function isValidVisitType(type) {
  return type in ['routine', 'liraa', 'denuncia'];
}

// Validação de tubesCollected
function isValidTubesCollected(tubes) {
  return typeof tubes === 'number' 
    && tubes >= 0 
    && tubes <= 100
    && Number.isInteger(tubes);
}

// Regra de criação/atualização
match /visits/{visitId} {
  allow create, update: if request.auth != null
    && isValidVisitType(request.resource.data.type)
    && isValidTubesCollected(request.resource.data.tubesCollected);
}
```

---

## 📈 Migração de Dados

### Atualização de Visitas Existentes

**Script de Migração:**

```javascript
// Adicionar campo tubesCollected = 0 para visitas existentes
async function migrateExistingVisits() {
  const visits = await db.collection('visits').get();
  
  const batch = db.batch();
  visits.forEach(doc => {
    if (!doc.data().tubesCollected) {
      batch.update(doc.ref, {
        tubesCollected: 0,
        updatedAt: FieldValue.serverTimestamp()
      });
    }
  });
  
  await batch.commit();
}
```

---

## ✅ Checklist de Implementação

### Backend
- [ ] Atualizar tipo `VisitType` para incluir `'denuncia'`
- [ ] Criar interface `DenunciaVisitForm`
- [ ] Adicionar campo `tubesCollected` em todas as interfaces
- [ ] Atualizar validações do Firestore
- [ ] Criar script de migração para visitas existentes
- [ ] Atualizar serviços de criação de visita

### Frontend
- [ ] Adicionar opção "Denúncia" no seletor de tipo
- [ ] Criar formulário de denúncia (reutilizar de rotina)
- [ ] Adicionar campo "Quantidade de Tubos Coletados"
- [ ] Atualizar labels dos 3 campos (conforme definição)
- [ ] Atualizar validações do formulário
- [ ] Atualizar preview/modal de visita

### Dashboard
- [ ] Adicionar filtro "Denúncia" nos gráficos
- [ ] Adicionar métricas de tubos coletados
- [ ] Atualizar cards de estatísticas
- [ ] Criar gráfico de denúncias

### Testes
- [ ] Testar criação de visita de denúncia
- [ ] Testar campo de tubos coletados
- [ ] Testar validações
- [ ] Testar filtros e buscas
- [ ] Testar migração de dados

---

## 🎯 Benefícios

### Para o Agente
- ✅ Tipo específico para denúncias
- ✅ Registro de tubos coletados
- ✅ Melhor organização das visitas

### Para a Organização
- ✅ Separação clara entre tipos de visita
- ✅ Métricas específicas de denúncias
- ✅ Rastreamento de tubos coletados
- ✅ Relatórios mais detalhados

### Para Análise
- ✅ Comparativo entre tipos de visita
- ✅ Eficácia no atendimento de denúncias
- ✅ Análise de coleta de amostras (tubos)

---

## 🔮 Melhorias Futuras

### Fase 2
- [ ] Campo "Origem da Denúncia" (telefone, email, app, etc.)
- [ ] Campo "Data da Denúncia" (quando foi recebida)
- [ ] Campo "Prazo de Atendimento"
- [ ] Notificações para denúncias pendentes

### Fase 3
- [ ] Integração com sistema de recebimento de denúncias
- [ ] Dashboard específico de denúncias
- [ ] Relatório de eficácia no atendimento
- [ ] Alertas para denúncias não atendidas

---

## 📝 Exemplo de Uso

### Cenário: Atendimento de Denúncia

1. **Organização recebe denúncia:**
   - Telefone: "Rua X, número Y tem acúmulo de água"

2. **Supervisor cria visita de denúncia:**
   - Tipo: **Denúncia**
   - Endereço: Rua X, número Y
   - Atribui para agente

3. **Agente realiza visita:**
   - Preenche formulário (igual rotina)
   - Informa criadouros encontrados
   - Coleta 3 tubos com larvas
   - Informa: **Quantidade de Tubos Coletados: 3**

4. **Sistema registra:**
   - Visita tipo "denuncia"
   - Tubos coletados: 3
   - Dados completos da visita

5. **Dashboard mostra:**
   - Denúncia atendida
   - 3 tubos coletados
   - Larvas encontradas
   - Medidas aplicadas

---

**Documento criado em:** [DATA]  
**Versão:** 1.0  
**Status:** 📋 Documentação - Aguardando Implementação

---

*Esta funcionalidade está planejada e documentada. A implementação seguirá este documento como referência.*

