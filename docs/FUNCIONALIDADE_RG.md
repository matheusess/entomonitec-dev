# 📋 Funcionalidade RG - Registro Geral de Moradores

**Sistema de Pré-cadastro de Moradores por Endereço**

---

## 🎯 Objetivo

A funcionalidade **RG (Registro Geral)** permite que supervisores façam o **pré-cadastro de moradores por endereço** através de upload de arquivo CSV. Quando um agente inicia uma visita e informa o endereço, o sistema **automaticamente identifica e preenche o nome do responsável** cadastrado, agilizando o processo de coleta de dados.

---

## 👥 Usuários

### Quem Pode Usar

- ✅ **Supervisor** - Pode fazer upload do CSV e gerenciar registros
- ✅ **Administrador** - Pode fazer upload do CSV e gerenciar registros
- ✅ **Agente** - Beneficia-se do preenchimento automático (não faz upload)

### Permissões

- **Upload CSV:** Apenas Supervisor e Administrador
- **Visualização:** Todos os usuários da organização
- **Edição/Exclusão:** Apenas Supervisor e Administrador

---

## 📊 Estrutura do Arquivo CSV

### Formato do CSV

O arquivo CSV deve seguir a seguinte estrutura:

```csv
bairro,rua,numero,nome_responsavel
Centro,Rua XV de Novembro,1000,João Silva Santos
Centro,Rua XV de Novembro,1002,Maria Oliveira
Centro,Rua das Flores,500,José Carlos Pereira
Batel,Av. Sete de Setembro,2000,Ana Paula Costa
Batel,Av. Sete de Setembro,2002,Pedro Henrique Lima
```

### Campos Obrigatórios

| Campo | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| `bairro` | string | Nome do bairro | `Centro` |
| `rua` | string | Nome da rua/avenida | `Rua XV de Novembro` |
| `numero` | string | Número do imóvel | `1000` |
| `nome_responsavel` | string | Nome completo do responsável | `João Silva Santos` |

### Campos Opcionais (Futuro)

| Campo | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| `complemento` | string | Complemento do endereço | `Apto 101` |
| `telefone` | string | Telefone de contato | `(41) 99999-9999` |
| `observacoes` | string | Observações adicionais | `Idoso, precisa de ajuda` |

### Regras de Validação

- ✅ **Bairro:** Deve existir na configuração municipal
- ✅ **Rua:** Campo obrigatório, mínimo 3 caracteres
- ✅ **Número:** Campo obrigatório, pode conter letras (ex: "1000A")
- ✅ **Nome do Responsável:** Campo obrigatório, mínimo 3 caracteres
- ✅ **Encoding:** UTF-8 (para caracteres especiais)
- ✅ **Separador:** Vírgula (`,`)
- ✅ **Delimitador de texto:** Aspas duplas (`"`) quando necessário

---

## 🔄 Fluxo de Funcionamento

### 1. Upload do CSV (Supervisor/Admin)

```
┌─────────────────┐
│  Supervisor     │
│  acessa menu    │
│  "Registro RG"  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Seleciona      │
│  arquivo CSV    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Sistema valida │
│  formato e dados│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Processa e     │
│  salva no BD    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Exibe relatório│
│  de importação  │
└─────────────────┘
```

### 2. Uso no Formulário de Visita (Agente)

```
┌─────────────────┐
│  Agente inicia  │
│  nova visita    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Informa        │
│  endereço:      │
│  - Bairro       │
│  - Rua          │
│  - Número       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Sistema busca  │
│  no RG:         │
│  Match por:     │
│  - Bairro       │
│  - Rua          │
│  - Número       │
└────────┬────────┘
         │
         ├─── Encontrou? ───┐
         │                  │
         ▼                  ▼
┌─────────────────┐  ┌─────────────────┐
│  Preenche       │  │  Campo fica     │
│  automaticamente│  │  vazio para     │
│  nome do        │  │  preenchimento  │
│  responsável    │  │  manual         │
└─────────────────┘  └─────────────────┘
```

---

## 🗄️ Estrutura de Dados no Banco

### Coleção: `resident_registry` (RG)

```typescript
interface ResidentRegistry {
  id: string;                    // ID único do registro
  organizationId: string;         // ID da organização (multi-tenant)
  bairro: string;                // Nome do bairro
  rua: string;                   // Nome da rua
  numero: string;                // Número do imóvel
  nomeResponsavel: string;       // Nome do responsável
  complemento?: string;          // Complemento (opcional)
  telefone?: string;             // Telefone (opcional)
  observacoes?: string;          // Observações (opcional)
  uploadedBy: string;            // ID do usuário que fez upload
  uploadedAt: Date;              // Data do upload
  updatedAt: Date;                // Data da última atualização
  isActive: boolean;             // Registro ativo/inativo
}
```

### Índices do Firestore

Para otimizar as buscas, serão criados índices compostos:

```javascript
// Índice para busca por endereço
{
  fields: [
    { fieldPath: 'organizationId', order: 'ASCENDING' },
    { fieldPath: 'bairro', order: 'ASCENDING' },
    { fieldPath: 'rua', order: 'ASCENDING' },
    { fieldPath: 'numero', order: 'ASCENDING' }
  ]
}
```

---

## 🔍 Algoritmo de Match (Correspondência)

### Critérios de Match

O sistema faz a correspondência usando os seguintes critérios (em ordem de prioridade):

1. **Match Exato (100%)**
   - Bairro: Exato (case-insensitive)
   - Rua: Exato (case-insensitive, normalizado)
   - Número: Exato (case-insensitive)

2. **Match Parcial (80%)**
   - Bairro: Exato
   - Rua: Similar (normalizado, remove acentos)
   - Número: Exato

3. **Match Flexível (60%)**
   - Bairro: Exato
   - Rua: Contém parte do nome
   - Número: Exato

### Normalização de Dados

Antes de fazer o match, o sistema normaliza os dados:

```javascript
// Normalização de rua
"Rua XV de Novembro" → "rua xv de novembro" (lowercase)
"Av. Sete de Setembro" → "av sete de setembro" (remove pontos)
"R. das Flores" → "r das flores" (abreviações)

// Normalização de número
"1000" → "1000"
"1000A" → "1000a"
"1000-A" → "1000a"
```

### Exemplo de Match

**Dados no CSV:**
```csv
Centro,Rua XV de Novembro,1000,João Silva Santos
```

**Agente informa no formulário:**
- Bairro: `Centro`
- Rua: `Rua XV de Novembro`
- Número: `1000`

**Resultado:** ✅ Match encontrado → Nome preenchido: `João Silva Santos`

**Agente informa no formulário:**
- Bairro: `Centro`
- Rua: `R. XV de Novembro` (abreviação)
- Número: `1000`

**Resultado:** ✅ Match encontrado (normalização) → Nome preenchido: `João Silva Santos`

---

## 📱 Interface do Usuário

### Tela de Upload (Supervisor/Admin)

**Localização:** Menu "Registro RG" ou "Cadastro de Moradores"

**Elementos:**
- ✅ Botão "Upload CSV"
- ✅ Área de drag-and-drop
- ✅ Preview do arquivo selecionado
- ✅ Botão "Importar"
- ✅ Indicador de progresso
- ✅ Relatório de importação (sucessos/erros)

### Tela de Listagem

**Elementos:**
- ✅ Tabela com registros importados
- ✅ Filtros: Bairro, Rua, Nome
- ✅ Busca por texto
- ✅ Paginação
- ✅ Botão "Exportar CSV"
- ✅ Botão "Editar" (por registro)
- ✅ Botão "Excluir" (por registro)

### Integração no Formulário de Visita

**Localização:** Formulário de criação de visita

**Comportamento:**
1. Agente preenche: Bairro → Rua → Número
2. Sistema busca automaticamente no RG
3. Se encontrar match:
   - ✅ Campo "Nome do Responsável" é preenchido automaticamente
   - ✅ Ícone de confirmação (✓) aparece ao lado
   - ✅ Mensagem: "Morador encontrado no registro"
4. Se não encontrar:
   - ⚠️ Campo fica vazio
   - ⚠️ Agente preenche manualmente
   - ⚠️ Opção de salvar no RG após a visita

---

## 🔐 Regras de Segurança

### Firebase Rules

```javascript
// Regras para coleção resident_registry
match /resident_registry/{registryId} {
  // Leitura: Apenas usuários da organização
  allow read: if request.auth != null 
    && resource.data.organizationId == get(/databases/$(database)/documents/users/$(request.auth.uid)).data.organizationId;
  
  // Criação: Apenas Supervisor e Admin
  allow create: if request.auth != null 
    && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['supervisor', 'administrator']
    && request.resource.data.organizationId == get(/databases/$(database)/documents/users/$(request.auth.uid)).data.organizationId;
  
  // Atualização: Apenas Supervisor e Admin
  allow update: if request.auth != null 
    && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['supervisor', 'administrator']
    && resource.data.organizationId == get(/databases/$(database)/documents/users/$(request.auth.uid)).data.organizationId;
  
  // Exclusão: Apenas Supervisor e Admin
  allow delete: if request.auth != null 
    && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['supervisor', 'administrator']
    && resource.data.organizationId == get(/databases/$(database)/documents/users/$(request.auth.uid)).data.organizationId;
}
```

### Validações

- ✅ **Isolamento multi-tenant:** Cada organização vê apenas seus registros
- ✅ **Validação de bairro:** Bairro deve existir na configuração municipal
- ✅ **Validação de formato:** CSV deve seguir estrutura correta
- ✅ **Limite de tamanho:** Arquivo máximo de 10MB
- ✅ **Limite de registros:** Máximo de 50.000 registros por upload

---

## 📊 Relatório de Importação

Após o upload, o sistema exibe um relatório:

### Exemplo de Relatório

```
✅ Importação Concluída

Total de linhas processadas: 1.250
✅ Registros importados com sucesso: 1.200
⚠️ Registros com avisos: 30
❌ Registros com erros: 20

Detalhes dos Erros:
- Linha 45: Bairro "Centro Novo" não encontrado na configuração
- Linha 120: Rua vazia
- Linha 250: Nome do responsável muito curto

Ações:
- [ ] Baixar relatório completo (CSV)
- [ ] Corrigir erros e reimportar
- [ ] Visualizar registros importados
```

---

## 🔄 Atualização e Manutenção

### Atualização de Registros

- ✅ **Edição individual:** Supervisor/Admin pode editar qualquer registro
- ✅ **Reimportação:** Pode fazer novo upload (atualiza registros existentes)
- ✅ **Merge:** Se mesmo endereço, atualiza nome do responsável
- ✅ **Histórico:** Mantém log de alterações

### Exclusão de Registros

- ✅ **Exclusão individual:** Por registro
- ✅ **Exclusão em lote:** Por bairro ou critério
- ✅ **Soft delete:** Marca como inativo (não exclui fisicamente)
- ✅ **Auditoria:** Registra quem excluiu e quando

---

## 📈 Métricas e Estatísticas

### Dashboard de RG

- ✅ Total de registros cadastrados
- ✅ Registros por bairro
- ✅ Taxa de match (quantos endereços têm morador cadastrado)
- ✅ Última atualização
- ✅ Registros mais utilizados

---

## 🎯 Benefícios

### Para o Supervisor
- ✅ Cadastro em massa de moradores
- ✅ Economia de tempo
- ✅ Dados organizados e centralizados
- ✅ Facilita planejamento de visitas

### Para o Agente
- ✅ Preenchimento automático do nome
- ✅ Menos digitação
- ✅ Menos erros de digitação
- ✅ Visitas mais rápidas

### Para a Organização
- ✅ Dados padronizados
- ✅ Melhor rastreabilidade
- ✅ Histórico de moradores
- ✅ Facilita relatórios

---

## 🔮 Melhorias Futuras

### Fase 2
- [ ] Upload de fotos dos moradores
- [ ] Histórico de visitas por morador
- [ ] Notificações para moradores
- [ ] Integração com sistemas externos

### Fase 3
- [ ] Validação de CPF (opcional)
- [ ] Geolocalização automática por endereço
- [ ] Sugestão de endereços similares
- [ ] Machine Learning para melhorar match

---

## 📝 Exemplo de Uso Completo

### 1. Supervisor faz upload do CSV

**Arquivo CSV:**
```csv
bairro,rua,numero,nome_responsavel
Centro,Rua XV de Novembro,1000,João Silva Santos
Centro,Rua XV de Novembro,1002,Maria Oliveira
Batel,Av. Sete de Setembro,2000,Ana Paula Costa
```

**Resultado:** 3 registros importados com sucesso

### 2. Agente inicia visita

**Agente preenche no formulário:**
- Bairro: `Centro`
- Rua: `Rua XV de Novembro`
- Número: `1000`

**Sistema automaticamente:**
- ✅ Busca no RG
- ✅ Encontra match
- ✅ Preenche: `João Silva Santos`

**Agente:**
- ✅ Confirma ou edita se necessário
- ✅ Continua preenchendo a visita
- ✅ Salva a visita

---

## ✅ Checklist de Implementação

### Backend
- [ ] Criar coleção `resident_registry` no Firestore
- [ ] Criar índices compostos para busca
- [ ] Implementar serviço de upload CSV
- [ ] Implementar algoritmo de match
- [ ] Implementar normalização de dados
- [ ] Criar regras de segurança Firebase

### Frontend
- [ ] Criar tela de upload CSV
- [ ] Criar tela de listagem de registros
- [ ] Integrar busca no formulário de visita
- [ ] Criar componente de preview de match
- [ ] Criar relatório de importação
- [ ] Adicionar validações de formulário

### Testes
- [ ] Testar upload de CSV válido
- [ ] Testar upload de CSV inválido
- [ ] Testar match exato
- [ ] Testar match parcial
- [ ] Testar normalização de dados
- [ ] Testar isolamento multi-tenant

---

**Documento criado em:** [DATA]  
**Versão:** 1.0  
**Status:** 📋 Documentação - Aguardando Implementação

---

*Esta funcionalidade está planejada e documentada. A implementação seguirá este documento como referência.*

