# Documentação - Sistema EntoMonitec

## 📚 Documentos Disponíveis

### 🏗️ Arquitetura e Configuração
- [**Firebase Setup**](./firebase-setup.md) - Configuração do Firebase
- [**Firebase Rules**](./firebase-rules.md) - Regras de segurança do Firestore
- [**Multi-tenant Guide**](./multi-tenant-guide.md) - Guia de multi-tenancy
- [**Security Architecture**](./security-architecture.md) - Arquitetura de segurança

### 📊 Estrutura de Dados
- [**Data Structure - Visits**](./data-structure-visits.md) - Como os dados de visitas são estruturados
- [**Real Data Examples**](./real-data-examples.md) - Exemplos com dados reais do sistema

### 👥 Usuários e Organizações
- [**Firebase Users Setup**](./firebase-users-setup.md) - Configuração de usuários
- [**Agents Guide**](./AGENTS.md) - Guia para agentes

### 🚀 Operacionalização
- [**Guia de Atualização v2.0**](./Guia%20de%20Atualização%20do%20Sistema%20-%20Vigilância%20Entomológica%20v2.0.md)
- [**Guia de Operacionalização MVP**](./Guia%20de%20Operacionalização%20do%20Sistema%20de%20Vigilância%20Entomológica%20para%20MVP.md)
- [**Guia de Operacionalização e Licenciamento**](./Guia%20de%20Operacionalização%20e%20Licenciamento%20do%20Sistema%20de%20Vigilância%20Entomológica.md)
- [**Guia Simplificado para Teste de Conceito**](./Guia%20Simplificado%20para%20Teste%20de%20Conceito%20do%20Sistema%20de%20Vigilância%20Entomológica.md)
- [**Manual de Instalação e Deploy**](./Manual%20de%20Instalação%20e%20Deploy%20-%20Sistema%20de%20Vigilância%20Entomológica.md)

### 📋 Planos e Propostas
- [**Sistema MVP**](./Sistema%20de%20Vigilância%20Entomológica%20-%20MVP.md)
- [**Plataforma SaaS Expandida**](./Sistema%20de%20Vigilância%20Entomológica%20-%20Plataforma%20SaaS%20Expandida.md)
- [**Proposta de Arquitetura SaaS**](./Proposta%20de%20Arquitetura%20do%20Sistema%20SaaS%20de%20Vigilância%20Entomológica.md)
- [**Proposta de Arquitetura de Dados**](./Proposta%20de%20Arquitetura%20de%20Dados%20para%20a%20Plataforma%20SaaS%20de%20Vigilância%20Entomológica.md)
- [**Wireframes e Mockups**](./Wireframes%20e%20Mockups%20para%20a%20Plataforma%20SaaS%20de%20Vigilância%20Entomológica.md)

### 📈 Relatórios e Melhorias
- [**Análise Detalhada da Plataforma SaaS**](./Análise%20Detalhada%20da%20Plataforma%20SaaS%20para%20Vigilância%20Entomológica.md)
- [**Plano de Melhorias**](./Plano%20de%20Melhorias%20do%20Sistema%20de%20Vigilância%20Entomológica.md)
- [**Relatório de Melhorias Implementadas**](./Relatório%20de%20Melhorias%20Implementadas%20-%20Sistema%20de%20Vigilância%20Entomológica.md)

### 🏢 Sistema Municipal
- [**Sistema Municipal**](./MUNICIPAL_SYSTEM.md) - Documentação específica para municípios

### 📝 Outros
- [**TODO**](./todo.md) - Lista de tarefas pendentes

## 🔧 Scripts de Verificação

### Consulta de Dados
```bash
# Analisar estrutura de dados de larvas
npx tsx scripts/analyze-larvae-data.ts [organizationId]

# Consultar visitas com Admin SDK
npx tsx scripts/check-visits-admin.ts [organizationId]

# Teste rápido com dados simulados
node scripts/simple-check.js
```

### Regras do Firebase
```bash
# Aplicar regras de desenvolvimento
./scripts/apply-dev-rules.sh

# Restaurar regras de produção
./scripts/restore-prod-rules.sh
```

## 📊 Estrutura de Dados - Resumo

### Visitas de Rotina
- **Campo**: `larvaeFound: boolean`
- **Uso**: Controle geral de vetores
- **Granularidade**: Simples (tem/não tem)

### Visitas LIRAa
- **Campos**: `containers` + `positiveContainers`
- **Uso**: Índices entomológicos (protocolo MS)
- **Granularidade**: Detalhada por categoria de recipiente

### Categorias de Recipientes (LIRAa)
- **A1**: Reservatórios de água
- **A2**: Depósitos móveis
- **B**: Depósitos fixos
- **C**: Passíveis de remoção
- **D1**: Pneus
- **D2**: Lixo
- **E**: Naturais

## 🎯 Métricas Principais

### Índice Municipal
- **Fonte**: Apenas visitas LIRAa
- **Cálculo**: `(visitas com larvas / total visitas LIRAa) × 100`
- **Filtro**: `where('type', '==', 'liraa')`

### Qualidade Amostral
- **Cobertura LIRAa**: Percentual de visitas LIRAa concluídas
- **Agentes Ativos**: Agentes únicos nos últimos 30 dias

---

**Última Atualização**: 02/09/2025  
**Versão**: 2.0  
**Sistema**: EntoMonitec - Vigilância Entomológica


