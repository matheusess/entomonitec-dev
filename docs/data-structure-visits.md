# Estrutura de Dados - Visitas

## 📋 Visão Geral

Este documento explica como os dados das visitas são estruturados e salvos no sistema, diferenciando entre visitas de **Rotina** e **LIRAa**.

## 🔄 Tipos de Visita

### 1. **Visita de Rotina** (`type: "routine"`)

**Propósito**: Inspeção geral de propriedades para controle de vetores.

**Campos Principais**:
```typescript
{
  type: "routine",
  larvaeFound: boolean,        // true/false - Tem larvas ou não?
  pupaeFound: boolean,         // true/false - Tem pupas ou não?
  breedingSites: {             // Locais de criadouro encontrados
    waterReservoir: boolean,
    tires: boolean,
    bottles: boolean,
    cans: boolean,
    buckets: boolean,
    plantPots: boolean,
    gutters: boolean,
    pools: boolean,
    wells: boolean,
    tanks: boolean,
    drains: boolean,
    others: string
  },
  controlMeasures: string[]    // Medidas de controle aplicadas
}
```

**Como Determinar se Tem Larvas**:
```typescript
const hasLarvae = visit.larvaeFound === true;
```

### 2. **Visita LIRAa** (`type: "liraa"`)

**Propósito**: Levantamento Rápido de Índices para Aedes aegypti (conforme protocolo MS).

**Campos Principais**:
```typescript
{
  type: "liraa",
  containers: {                // TOTAL de recipientes encontrados por categoria
    a1: number,  // Reservatórios de água
    a2: number,  // Depósitos móveis
    b: number,   // Depósitos fixos
    c: number,   // Passíveis de remoção
    d1: number,  // Pneus
    d2: number,  // Lixo
    e: number    // Naturais
  },
  positiveContainers: {        // Recipientes POSITIVOS (com larvas) por categoria
    a1: number,  // Quantos dos reservatórios tinham larvas
    a2: number,  // Quantos dos depósitos móveis tinham larvas
    b: number,   // Quantos dos depósitos fixos tinham larvas
    c: number,   // Quantos dos passíveis de remoção tinham larvas
    d1: number,  // Quantos dos pneus tinham larvas
    d2: number,  // Quantos dos lixos tinham larvas
    e: number    // Quantos dos naturais tinham larvas
  },
  larvaeSpecies: string[],     // Espécies de larvas encontradas
  treatmentApplied: boolean,   // Tratamento foi aplicado?
  eliminationAction: boolean   // Ação de eliminação foi realizada?
}
```

**Como Determinar se Tem Larvas**:
```typescript
const hasLarvae = Object.values(visit.positiveContainers).some(count => count > 0);
```

## 📊 Exemplos Práticos

### Exemplo 1: Visita de Rotina
```typescript
{
  type: "routine",
  neighborhood: "Centro",
  larvaeFound: true,           // ✅ TEM larvas
  pupaeFound: false,           // ❌ NÃO tem pupas
  breedingSites: {
    waterReservoir: true,      // Encontrou reservatório
    tires: false,
    bottles: true,             // Encontrou garrafas
    // ... outros campos
  }
}
```

### Exemplo 2: Visita LIRAa
```typescript
{
  type: "liraa",
  neighborhood: "Batel",
  containers: {
    a1: 4,  // Encontrou 4 reservatórios de água
    a2: 3,  // Encontrou 3 depósitos móveis
    b: 3,   // Encontrou 3 depósitos fixos
    c: 3,   // Encontrou 3 passíveis de remoção
    d1: 5,  // Encontrou 5 pneus
    d2: 3,  // Encontrou 3 lixos
    e: 0    // Não encontrou naturais
  },
  positiveContainers: {
    a1: 2,  // 2 dos 4 reservatórios tinham larvas
    a2: 3,  // 3 dos 3 depósitos móveis tinham larvas (todos!)
    b: 3,   // 3 dos 3 depósitos fixos tinham larvas (todos!)
    c: 2,   // 2 dos 3 passíveis de remoção tinham larvas
    d1: 2,  // 2 dos 5 pneus tinham larvas
    d2: 2,  // 2 dos 3 lixos tinham larvas
    e: 0    // Nenhum natural tinha larvas
  }
}
```

**Interpretação**: Esta visita LIRAa é considerada **"com larvas"** porque tem `positiveContainers > 0` em várias categorias.

## 🧮 Cálculos e Métricas

### Índice Municipal (LIRAa)
```typescript
// Contar visitas LIRAa com larvas
const liraaWithLarvae = liraaVisits.filter(visit => {
  const positive = visit.positiveContainers || {};
  return Object.values(positive).some(count => count > 0);
});

// Calcular percentual
const index = (liraaWithLarvae.length / liraaVisits.length) * 100;
```

### Total de Recipientes
```typescript
// Somar todos os recipientes encontrados
const totalContainers = Object.values(visit.containers).reduce((sum, count) => sum + count, 0);

// Somar todos os recipientes positivos
const totalPositive = Object.values(visit.positiveContainers).reduce((sum, count) => sum + count, 0);
```

## 🔍 Diferenças Importantes

| Aspecto | Rotina | LIRAa |
|---------|--------|-------|
| **Campo de Larvas** | `larvaeFound: boolean` | `positiveContainers: object` |
| **Granularidade** | Simples (tem/não tem) | Detalhada (quantos recipientes) |
| **Categorização** | Por tipo de criadouro | Por categoria de recipiente |
| **Uso** | Controle geral | Índices entomológicos |
| **Protocolo** | Interno | MS (Ministério da Saúde) |

## 📈 Casos de Uso

### 1. **Dashboard - Índice Municipal**
- **Fonte**: Apenas visitas LIRAa
- **Cálculo**: `(visitas com larvas / total visitas LIRAa) × 100`
- **Filtro**: `where('type', '==', 'liraa')`

### 2. **Relatórios de Controle**
- **Fonte**: Visitas de rotina
- **Foco**: Medidas de controle aplicadas
- **Filtro**: `where('type', '==', 'routine')`

### 3. **Análise por Categoria**
- **Fonte**: Visitas LIRAa
- **Foco**: `positiveContainers` por categoria
- **Uso**: Identificar tipos de recipientes mais problemáticos

## ⚠️ Pontos de Atenção

1. **NÃO confundir**: `positiveContainers` não é quantidade de larvas, é quantidade de **recipientes** com larvas
2. **Filtros**: Sempre filtrar por `type` antes de calcular métricas
3. **Validação**: Verificar se `containers` e `positiveContainers` existem antes de processar
4. **Índice Municipal**: Usar apenas visitas LIRAa, nunca rotina

## 🛠️ Scripts de Verificação

### Script para Analisar Dados
```bash
npx tsx scripts/analyze-larvae-data.ts [organizationId]
```

### Script para Consultar Visitas
```bash
npx tsx scripts/check-visits-admin.ts [organizationId]
```

## 📚 Referências

- **Protocolo LIRAa**: Ministério da Saúde
- **Categorias de Recipientes**: A1, A2, B, C, D1, D2, E
- **Índices Entomológicos**: Breteau, Predial, etc.

---

**Última Atualização**: 02/09/2025  
**Versão**: 1.0  
**Autor**: Sistema EntoMonitec


