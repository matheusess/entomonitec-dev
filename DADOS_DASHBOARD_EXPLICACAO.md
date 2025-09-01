# 📊 Explicação dos Dados do Dashboard

## 🎯 **De Onde Vêm os Dados Atuais**

### **Situação Atual:**
- ✅ **Integração Firebase**: Funcionando
- ⚠️ **Dados Reais**: Ainda não há visitas registradas no Firebase
- 🔄 **Fallback**: Sistema usa dados de demonstração quando não há dados reais

### **Dados Exibidos:**
```
Larvas Positivas: 1 (dados de demonstração)
Áreas Críticas: 1 (dados de demonstração)  
Índice Municipal: 60.0% (dados de demonstração)
Cajuru: 60.00% • 100% (dados de demonstração)
```

## 🔬 **Como os Dados Reais Serão Calculados**

### **1. Larvas Positivas**
```typescript
// Conta visitas LIRAA com recipientes positivos
liraaVisits.forEach(visit => {
  if (visit.positiveContainers) {
    const hasPositiveLarvae = Object.values(positive).some(count => count > 0);
    if (hasPositiveLarvae) larvaePositive++;
  }
});
```

### **2. Classificação por Bairro**
```typescript
// Calcula índice de infestação por bairro
const larvaeIndex = (positiveContainers / totalContainers) * 100;

// Aplica critérios do MS
if (larvaeIndex >= 4) return 'critical';    // CRÍTICO
if (larvaeIndex >= 2) return 'high';        // ALTO  
if (larvaeIndex >= 1) return 'medium';      // MÉDIO
return 'low';                               // BAIXO
```

### **3. Cobertura (60.00% • 100%)**
```typescript
// Primeira %: Cobertura de visitas
coverage = (visitasCompletas / totalVisitas) * 100;

// Segunda %: Qualidade dos dados  
quality = (visitasComDadosCompletos / totalVisitas) * 100;
```

## 📋 **Critérios do Ministério da Saúde**

### **Índice de Infestação Predial (IIP)**
- **🔴 CRÍTICO (≥4%)**: Situação de emergência, ação imediata
- **🟠 ALTO (2-3.9%)**: Situação de alerta, intervenção necessária  
- **🟡 MÉDIO (1-1.9%)**: Situação de atenção, monitoramento
- **🟢 BAIXO (<1%)**: Situação satisfatória, vigilância

### **Cobertura Mínima Recomendada**
- **Meta MS**: 80% de cobertura por bairro
- **Qualidade**: 90% de dados completos

## 🚀 **Para Ver Dados Reais**

### **Opção 1: Registrar Visitas**
1. Ir para `/visits`
2. Registrar visitas LIRAA com dados de recipientes
3. Dashboard atualizará automaticamente

### **Opção 2: Dados de Seed (Desenvolvimento)**
```typescript
// Criar visitas de exemplo no Firebase
const sampleVisits = [
  {
    type: 'liraa',
    neighborhood: 'Cajuru',
    containers: { a1: 10, a2: 5, b: 3 },
    positiveContainers: { a1: 2, a2: 0, b: 1 },
    organizationId: 'frg-001'
  }
];
```

## 🔍 **Status Atual**
- **Firebase**: ✅ Conectado
- **Regras**: ✅ Permissivas (desenvolvimento)
- **Serviço**: ✅ Funcionando
- **Dados**: ⚠️ Usando demonstração (normal sem visitas)

**Quando houver visitas registradas, os dados reais aparecerão automaticamente!** 🎉
