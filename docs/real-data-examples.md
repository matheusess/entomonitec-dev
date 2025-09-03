# Exemplos de Dados Reais - Sistema EntoMonitec

## 📊 Dados Atuais (Setembro 2025)

### Organização: `7d8aLB5A0UNS2WAX662Z`
- **Total de Visitas**: 10
- **Visitas Rotina**: 6
- **Visitas LIRAa**: 4
- **Agentes**: 2 (Lisiane Poncio, Matheus Emmanuel)

## 🔄 Visitas de Rotina (6 visitas)

### 1. Cidade Industrial de Curitiba - Lisiane Poncio
```typescript
{
  type: "routine",
  neighborhood: "Cidade Industrial de Curitiba",
  agentName: "Lisiane Poncio",
  larvaeFound: true,        // ✅ COM LARVAS
  pupaeFound: false,
  createdAt: "2025-09-02T11:00:20.000Z"
}
```

### 2. Seminário - Matheus Emmanuel
```typescript
{
  type: "routine",
  neighborhood: "Seminário",
  agentName: "Matheus Emmanuel",
  larvaeFound: true,        // ✅ COM LARVAS
  pupaeFound: true,         // ✅ COM PUPAS
  createdAt: "2025-09-01T19:31:16.000Z"
}
```

### 3. Rebouças - Matheus Emmanuel
```typescript
{
  type: "routine",
  neighborhood: "Rebouças",
  agentName: "Matheus Emmanuel",
  larvaeFound: false,       // ❌ SEM LARVAS
  pupaeFound: true,         // ✅ COM PUPAS
  createdAt: "2025-09-01T19:18:04.000Z"
}
```

### 4. Jardim Botânico - Matheus Emmanuel
```typescript
{
  type: "routine",
  neighborhood: "Jardim Botânico",
  agentName: "Matheus Emmanuel",
  larvaeFound: true,        // ✅ COM LARVAS
  pupaeFound: false,
  createdAt: "2025-09-01T19:18:04.000Z"
}
```

### 5. Cajuru - Matheus Emmanuel (1ª visita)
```typescript
{
  type: "routine",
  neighborhood: "Cajuru",
  agentName: "Matheus Emmanuel",
  larvaeFound: true,        // ✅ COM LARVAS
  pupaeFound: true,         // ✅ COM PUPAS
  createdAt: "2025-09-01T19:18:04.000Z"
}
```

### 6. Cajuru - Matheus Emmanuel (2ª visita)
```typescript
{
  type: "routine",
  neighborhood: "Cajuru",
  agentName: "Matheus Emmanuel",
  larvaeFound: true,        // ✅ COM LARVAS
  pupaeFound: false,
  createdAt: "2025-09-01T19:18:04.000Z"
}
```

**📈 Estatísticas Rotina**:
- **Total**: 6 visitas
- **Com larvas**: 5 visitas (83.33%)
- **Com pupas**: 3 visitas (50%)

## 🔬 Visitas LIRAa (4 visitas)

### 1. Cidade Industrial de Curitiba - Lisiane Poncio
```typescript
{
  type: "liraa",
  neighborhood: "Cidade Industrial de Curitiba",
  agentName: "Lisiane Poncio",
  containers: {
    a1: 0, a2: 1, b: 0, c: 0, d1: 0, d2: 0, e: 0
  },
  positiveContainers: {
    a1: 0, a2: 0, b: 0, c: 0, d1: 0, d2: 0, e: 0
  },
  createdAt: "2025-09-02T11:00:20.000Z"
}
```
**Status**: ❌ SEM LARVAS (0 recipientes positivos)

### 2. Cidade Industrial de Curitiba - Lisiane Poncio
```typescript
{
  type: "liraa",
  neighborhood: "Cidade Industrial de Curitiba",
  agentName: "Lisiane Poncio",
  containers: {
    a1: 0, a2: 2, b: 0, c: 0, d1: 0, d2: 0, e: 1
  },
  positiveContainers: {
    a1: 0, a2: 1, b: 0, c: 0, d1: 0, d2: 0, e: 0
  },
  createdAt: "2025-09-02T10:57:45.000Z"
}
```
**Status**: ✅ COM LARVAS (1 recipiente positivo - A2)

### 3. Batel - Matheus Emmanuel
```typescript
{
  type: "liraa",
  neighborhood: "Batel",
  agentName: "Matheus Emmanuel",
  containers: {
    a1: 4, a2: 3, b: 3, c: 3, d1: 5, d2: 3, e: 0
  },
  positiveContainers: {
    a1: 2, a2: 3, b: 3, c: 2, d1: 2, d2: 2, e: 0
  },
  createdAt: "2025-09-01T19:34:06.000Z"
}
```
**Status**: ✅ COM LARVAS (14 recipientes positivos)

**Detalhamento**:
- **A1**: 4 reservatórios encontrados, 2 com larvas
- **A2**: 3 depósitos móveis encontrados, 3 com larvas (todos!)
- **B**: 3 depósitos fixos encontrados, 3 com larvas (todos!)
- **C**: 3 passíveis de remoção encontrados, 2 com larvas
- **D1**: 5 pneus encontrados, 2 com larvas
- **D2**: 3 lixos encontrados, 2 com larvas
- **E**: 0 naturais encontrados, 0 com larvas

### 4. Campo Comprido - Matheus Emmanuel
```typescript
{
  type: "liraa",
  neighborhood: "Campo Comprido",
  agentName: "Matheus Emmanuel",
  containers: {
    a1: 1, a2: 2, b: 1, c: 1, d1: 1, d2: 0, e: 3
  },
  positiveContainers: {
    a1: 1, a2: 1, b: 1, c: 1, d1: 1, d2: 0, e: 1
  },
  createdAt: "2025-09-01T19:34:06.000Z"
}
```
**Status**: ✅ COM LARVAS (6 recipientes positivos)

**Detalhamento**:
- **A1**: 1 reservatório encontrado, 1 com larvas (100%)
- **A2**: 2 depósitos móveis encontrados, 1 com larvas
- **B**: 1 depósito fixo encontrado, 1 com larvas (100%)
- **C**: 1 passível de remoção encontrado, 1 com larvas (100%)
- **D1**: 1 pneu encontrado, 1 com larvas (100%)
- **D2**: 0 lixos encontrados, 0 com larvas
- **E**: 3 naturais encontrados, 1 com larvas

## 📊 Estatísticas LIRAa

- **Total**: 4 visitas
- **Com larvas**: 3 visitas (75%)
- **Total recipientes**: 34
- **Total positivos**: 21
- **Índice Municipal**: 75% (3/4)

## 🎯 Resumo para Dashboard

### Qualidade Amostral
- **Visitas**: 4 (apenas LIRAa)
- **Agentes**: 2 (Lisiane Poncio, Matheus Emmanuel)
- **Cobertura LIRAa**: 100%
- **Qualidade Amostral**: 100%

### Índice Médio Municipal
- **Cálculo**: (3 visitas com larvas / 4 visitas LIRAa) × 100 = 75%
- **Status**: Alto risco (acima de 4%)

## 🔍 Análise por Categoria de Recipiente

| Categoria | Total Encontrado | Total Positivo | % Positivo |
|-----------|------------------|----------------|------------|
| A1 (Reservatórios) | 5 | 3 | 60% |
| A2 (Depósitos Móveis) | 6 | 5 | 83% |
| B (Depósitos Fixos) | 4 | 4 | 100% |
| C (Passíveis Remoção) | 4 | 3 | 75% |
| D1 (Pneus) | 6 | 3 | 50% |
| D2 (Lixo) | 3 | 2 | 67% |
| E (Naturais) | 4 | 1 | 25% |

## 🚨 Pontos de Atenção

1. **Batel**: Área com maior concentração de recipientes positivos (14/21)
2. **Depósitos Fixos (B)**: 100% de positividade - categoria mais crítica
3. **Depósitos Móveis (A2)**: 83% de positividade - segunda mais crítica
4. **Índice Municipal**: 75% indica situação de alto risco

---

**Última Atualização**: 02/09/2025  
**Fonte**: Firebase - Collection `visits`  
**Organização**: 7d8aLB5A0UNS2WAX662Z


