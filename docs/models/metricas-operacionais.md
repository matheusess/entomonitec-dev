# Métricas Operacionais - Entomonitec

Este documento explica como são calculadas as métricas de performance no Painel Operacional.

## 📊 Qualidade Média

### O que é?
A **Qualidade Média** é um score de 0-10 que avalia a completude e efetividade das visitas dos agentes.

### Como é calculada?

#### Score Base
- **5 pontos** - Todo agente começa com 5 pontos por visita

#### Critérios de Conclusão (+2 pontos)
- ✅ **Visita completada** (`status === 'completed'`)

#### Critérios de Documentação (+1 ponto cada)
- ✅ **Observações detalhadas** (mais de 10 caracteres)
- ✅ **Fotos anexadas** (pelo menos 1 foto)

#### Critérios Específicos por Tipo de Visita (+0.5 pontos cada)

**Para Visitas de Rotina:**
- ✅ **Dados de larvas** preenchidos (`larvaeFound` definido)
- ✅ **Medidas de controle** aplicadas (`controlMeasures` preenchido)

**Para Visitas LIRAa:**
- ✅ **Containers inspecionados** (pelo menos 1 container)
- ✅ **Espécies de larvas** identificadas (`larvaeSpecies` preenchido)

### Exemplos de Scores

| Critério | Pontos | Visita Excelente | Visita Boa | Visita Regular | Visita Ruim |
|----------|--------|------------------|------------|----------------|-------------|
| Base | 5 | ✅ | ✅ | ✅ | ✅ |
| Completada | +2 | ✅ | ✅ | ✅ | ❌ |
| Observações | +1 | ✅ | ✅ | ❌ | ❌ |
| Fotos | +1 | ✅ | ✅ | ❌ | ❌ |
| Dados Larvas | +0.5 | ✅ | ❌ | ❌ | ❌ |
| Medidas Controle | +0.5 | ✅ | ❌ | ❌ | ❌ |
| **TOTAL** | **10** | **10/10** | **8/10** | **6/10** | **5/10** |

### Interpretação

- **9-10**: Excelente - Visitas completas e bem documentadas
- **7-8**: Boa - Maioria dos critérios atendidos
- **5-6**: Regular - Critérios básicos atendidos
- **0-4**: Ruim - Necessita melhoria

## 📈 Taxa de Conclusão

### O que é?
Percentual de visitas que foram completadas vs total de visitas iniciadas.

### Cálculo
```
Taxa de Conclusão = (Visitas Completadas / Total de Visitas) × 100
```

### Interpretação
- **95-100%**: Excelente
- **80-94%**: Boa
- **60-79%**: Regular
- **0-59%**: Ruim

## 🎯 Média de Visitas por Dia

### O que é?
Número médio de visitas realizadas por dia no período selecionado.

### Cálculo
```
Média por Dia = Total de Visitas / Dias no Período
```

### Períodos
- **Semana**: 7 dias
- **Mês**: 30 dias
- **Trimestre**: 90 dias

## 🏆 Conquistas

### Meta de Conclusão
- Taxa de conclusão ≥ 95%

### Qualidade Excelente
- Score de qualidade ≥ 9.0

### Alta Produtividade
- Total de visitas ≥ 50

### Super Produtividade
- Total de visitas ≥ 100

### Performance Completa
- Taxa de conclusão ≥ 90% E Score de qualidade ≥ 8.0

## 👥 Status dos Agentes

### Ativo
- Última atividade ≤ 7 dias

### Inativo
- Última atividade entre 8-30 dias

### Licença
- Última atividade > 30 dias OU não faz mais parte da organização

## 🔄 Filtros Disponíveis

### Período
- **Última semana**: Dados dos últimos 7 dias
- **Último mês**: Dados dos últimos 30 dias
- **Último trimestre**: Dados dos últimos 90 dias

### Equipe
- **Todas as equipes**: Mostra todos os agentes
- **Equipe específica**: Filtra por equipe baseada nos bairros atribuídos

### Busca
- **Nome do agente**: Busca por nome (case-insensitive)

## 📊 Agrupamento por Equipe

### Como funciona?
As equipes são determinadas automaticamente baseadas nos bairros atribuídos aos agentes:

```typescript
const teamMapping = {
  'Centro': 'Equipe Centro',
  'Centro Cívico': 'Equipe Centro',
  'Batel': 'Equipe Sul',
  'Bigorrilho': 'Equipe Sul',
  'Campo Comprido': 'Equipe Sul',
  'Cajuru': 'Equipe Norte',
  'Boa Vista': 'Equipe Norte',
  'Abranches': 'Equipe Leste',
  'Bacacheri': 'Equipe Leste'
};
```

### Lógica de Agrupamento
1. Verifica os bairros atribuídos ao agente
2. Mapeia cada bairro para uma equipe
3. Seleciona a equipe com mais bairros
4. Se não houver mapeamento, usa "Equipe Geral"

## 🚨 Agentes Inativos na Organização

### O que são?
Agentes que fizeram visitas no passado mas não estão mais ativos na organização atual.

### Como são identificados?
- Têm visitas no sistema
- Não estão na lista de usuários ativos da organização
- Aparecem com tag laranja "Não faz mais parte da organização"

### Por que são mostrados?
- Para manter histórico completo de performance
- Para análise de dados históricos
- Para auditoria e relatórios

## 🔧 Configurações

### Metas por Role
- **Agente**: 35 visitas/semana, 140/mês
- **Supervisor**: 20 visitas/semana, 80/mês
- **Administrador**: 10 visitas/semana, 40/mês

### Limites de Consulta
- **Visitas por agente**: 500 visitas
- **Visitas por organização**: 1000 visitas
- **Período de tendências**: 7 dias

## 📝 Notas Técnicas

### Performance
- Dados são calculados em tempo real
- Consultas otimizadas para Firebase
- Cache implementado para melhor performance

### Segurança
- Dados filtrados por organização
- Apenas usuários autorizados podem acessar
- Logs de auditoria implementados

### Atualizações
- Dados atualizados automaticamente
- Filtros aplicados em tempo real
- Estados de loading e erro implementados
