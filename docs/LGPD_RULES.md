# 🔒 Regras LGPD - Sistema Entomonitec

## 📋 **Visão Geral**

Este documento estabelece as **regras práticas de conformidade com a LGPD** que devem ser seguidas durante o desenvolvimento e operação do Sistema Entomonitec.

**Versão**: 1.0  
**Data**: Janeiro 2024  
**Status**: Obrigatório para todo o desenvolvimento

---

## 🎯 **Princípios Fundamentais**

### **1. Finalidade Específica**
✅ **REGRA**: Coletar dados apenas para vigilância sanitária e controle de vetores  
❌ **PROIBIDO**: Usar dados para outros fins não relacionados à saúde pública

### **2. Necessidade**
✅ **REGRA**: Coletar apenas dados essenciais para a atividade  
❌ **PROIBIDO**: Coletar dados desnecessários ou excessivos

### **3. Transparência**
✅ **REGRA**: Informar claramente sobre coleta e uso de dados  
❌ **PROIBIDO**: Coletar dados sem informar o titular

### **4. Segurança**
✅ **REGRA**: Implementar medidas técnicas e administrativas de proteção  
❌ **PROIBIDO**: Armazenar dados sem criptografia adequada

---

## 📊 **Dados que DEVEM ser Coletados**

### **✅ Obrigatórios para Visitas**

#### **Dados do Morador/Responsável**
```typescript
interface ResidentData {
  name: string;              // OBRIGATÓRIO - Nome completo
  phone?: string;            // OPCIONAL - Telefone de contato
  relationship: string;      // OBRIGATÓRIO - Relação com imóvel
  consentGiven: boolean;    // OBRIGATÓRIO - Consentimento explícito
  consentDate: Date;         // OBRIGATÓRIO - Data do consentimento
  consentFormId?: string;    // OPCIONAL - ID do formulário assinado
}
```

#### **Dados da Visita**
- Endereço completo (obrigatório)
- Coordenadas GPS (obrigatório)
- Data/hora da visita (obrigatório)
- Tipo de visita: rotina ou LIRAa (obrigatório)
- Observações técnicas (opcional)
- Fotos do imóvel - **SEM pessoas identificáveis** (opcional)

### **❌ Dados que NÃO DEVEM ser Coletados**

- CPF (não necessário para a finalidade)
- RG (não necessário para a finalidade)
- Email pessoal (não necessário)
- Dados de saúde do morador (não relacionado à atividade)
- Fotos com pessoas identificáveis (viola privacidade)
- Dados de terceiros não relacionados à visita

---

## 🔐 **Regras de Implementação Técnica**

### **1. Coleta de Dados**

#### **✅ OBRIGATÓRIO: Formulário de Consentimento**
```typescript
// TODO: Implementar em todas as visitas
interface VisitForm {
  // ... outros campos
  residentData: ResidentData;  // OBRIGATÓRIO
  consentForm: {
    signed: boolean;
    date: Date;
    version: string;  // Versão do formulário de consentimento
  };
}
```

#### **✅ OBRIGATÓRIO: Validação de Consentimento**
- Verificar se `consentGiven === true` antes de salvar visita
- Registrar data e hora do consentimento
- Armazenar versão do formulário de consentimento usado

#### **✅ OBRIGATÓRIO: Informações ao Titular**
- Exibir política de privacidade antes de coletar dados
- Informar finalidade da coleta
- Informar base legal (interesse público)
- Informar direitos do titular

### **2. Armazenamento de Dados**

#### **✅ OBRIGATÓRIO: Criptografia**
- Dados sensíveis devem ser criptografados em repouso
- Usar criptografia AES-256 para dados pessoais
- Chaves de criptografia devem ser rotacionadas a cada 6 meses

#### **✅ OBRIGATÓRIO: Isolamento**
- Dados isolados por organização (multi-tenancy)
- Usuários só acessam dados da própria organização
- Firebase Rules devem garantir isolamento

#### **✅ OBRIGATÓRIO: Backup Seguro**
- Backups devem ser criptografados
- Retenção de backups conforme política (5 anos para visitas)
- Teste de restauração a cada 3 meses

### **3. Acesso aos Dados**

#### **✅ OBRIGATÓRIO: Controle de Acesso**
- Autenticação obrigatória para todos os acessos
- Permissões baseadas em função (agent, supervisor, administrator)
- Logs de todos os acessos devem ser registrados

#### **✅ OBRIGATÓRIO: Auditoria**
- Registrar todas as operações CRUD em dados pessoais
- Logs devem incluir: usuário, data/hora, ação, dados afetados
- Retenção de logs: 3 anos para acesso, 5 anos para operações

#### **❌ PROIBIDO: Acesso Não Autorizado**
- Usuários não podem acessar dados de outras organizações
- Agentes não podem acessar dados de outros agentes (exceto supervisores)
- Dados não podem ser exportados sem autorização

### **4. Retenção e Eliminação**

#### **✅ OBRIGATÓRIO: Prazos de Retenção**

| Tipo de Dado | Período | Justificativa |
|--------------|---------|---------------|
| Dados de visitas técnicas | 5 anos | Protocolo MS |
| Dados pessoais de moradores | 2 anos após última visita | Follow-up |
| Dados de agentes ativos | Enquanto ativo + 5 anos | Auditoria |
| Logs de acesso | 3 anos | Segurança |
| Logs de operações | 5 anos | Conformidade |

#### **✅ OBRIGATÓRIO: Eliminação Automática**
- Implementar job automático para eliminar dados vencidos
- Notificar DPO antes de eliminar dados
- Documentar todas as eliminações

#### **✅ OBRIGATÓRIO: Direito de Eliminação**
- Implementar endpoint para solicitação de eliminação pelo titular
- Processar solicitações em até 15 dias úteis
- Confirmar eliminação ao titular

---

## 🛡️ **Direitos dos Titulares - Implementação**

### **1. Acesso aos Dados (Art. 9º, I)**

#### **✅ OBRIGATÓRIO: Endpoint de Consulta**
```typescript
// TODO: Implementar
GET /api/resident/data?cpf={cpf}&name={name}
// Retorna dados pessoais do morador
```

#### **✅ OBRIGATÓRIO: Interface de Consulta**
- Página pública para moradores consultarem seus dados
- Autenticação via CPF + nome ou token único
- Exibir todos os dados pessoais armazenados

### **2. Correção de Dados (Art. 9º, II)**

#### **✅ OBRIGATÓRIO: Endpoint de Correção**
```typescript
// TODO: Implementar
PUT /api/resident/data/{id}
// Permite correção de dados pessoais
```

#### **✅ OBRIGATÓRIO: Validação**
- Validar dados antes de atualizar
- Registrar quem fez a correção e quando
- Notificar titular sobre correção

### **3. Eliminação de Dados (Art. 9º, III)**

#### **✅ OBRIGATÓRIO: Endpoint de Eliminação**
```typescript
// TODO: Implementar
DELETE /api/resident/data/{id}
// Elimina dados pessoais (quando legalmente possível)
```

#### **✅ OBRIGATÓRIO: Anonimização**
- Quando eliminação não for possível, anonimizar dados
- Manter dados técnicos da visita sem identificação pessoal
- Documentar anonimização

### **4. Portabilidade (Art. 9º, IV)**

#### **✅ OBRIGATÓRIO: Exportação de Dados**
```typescript
// TODO: Implementar
GET /api/resident/data/export?format=json
// Exporta dados em formato estruturado
```

### **5. Revogação de Consentimento (Art. 9º, VII)**

#### **✅ OBRIGATÓRIO: Endpoint de Revogação**
```typescript
// TODO: Implementar
POST /api/resident/consent/revoke
// Revoga consentimento do titular
```

#### **✅ OBRIGATÓRIO: Processamento**
- Marcar consentimento como revogado
- Não usar dados para novas finalidades após revogação
- Manter histórico de revogação

---

## 📋 **Checklist de Conformidade**

### **✅ Desenvolvimento**

- [ ] Formulário de consentimento implementado
- [ ] Validação de consentimento antes de salvar
- [ ] Política de privacidade exibida antes de coletar dados
- [ ] Dados pessoais criptografados em repouso
- [ ] Isolamento por organização implementado
- [ ] Logs de acesso e operações implementados
- [ ] Endpoints de direitos do titular implementados
- [ ] Job de eliminação automática implementado

### **✅ Segurança**

- [ ] Firebase Rules configuradas corretamente
- [ ] Controle de acesso por função implementado
- [ ] Criptografia de dados sensíveis ativa
- [ ] Backup seguro e criptografado
- [ ] Monitoramento de acessos não autorizados
- [ ] Teste de segurança realizado

### **✅ Documentação**

- [ ] Política de privacidade publicada
- [ ] Termos de uso publicados
- [ ] Formulário de consentimento disponível
- [ ] Política de retenção documentada
- [ ] Contato do DPO divulgado
- [ ] Procedimentos de direitos do titular documentados

### **✅ Operacional**

- [ ] DPO nomeado e contato divulgado
- [ ] Equipe treinada sobre LGPD
- [ ] Processo de resposta a solicitações estabelecido
- [ ] Auditoria regular agendada
- [ ] Plano de resposta a incidentes criado

---

## 🚨 **Regras Críticas - NUNCA Violar**

### **❌ PROIBIÇÕES ABSOLUTAS**

1. **NUNCA** coletar dados sem consentimento explícito
2. **NUNCA** compartilhar dados com terceiros não autorizados
3. **NUNCA** usar dados para fins não relacionados à vigilância sanitária
4. **NUNCA** armazenar dados sem criptografia adequada
5. **NUNCA** permitir acesso a dados de outras organizações
6. **NUNCA** ignorar solicitações de direitos do titular
7. **NUNCA** coletar dados desnecessários (CPF, RG, etc.)
8. **NUNCA** fotografar pessoas identificáveis
9. **NUNCA** eliminar dados antes do prazo de retenção
10. **NUNCA** processar dados sem base legal válida

---

## 📞 **Contatos e Responsabilidades**

### **Encarregado de Dados (DPO)**
- **Responsabilidade**: Supervisão da conformidade LGPD
- **Contato**: dpo@[municipio].gov.br
- **Funções**: 
  - Aprovar mudanças que afetem dados pessoais
  - Responder a solicitações de titulares
  - Realizar auditorias de conformidade
  - Treinar equipe sobre LGPD

### **Equipe de Desenvolvimento**
- **Responsabilidade**: Implementar regras técnicas
- **Funções**:
  - Seguir todas as regras deste documento
  - Implementar funcionalidades de direitos do titular
  - Garantir segurança dos dados
  - Documentar implementações

### **Equipe Operacional**
- **Responsabilidade**: Operar sistema em conformidade
- **Funções**:
  - Treinar agentes sobre coleta adequada
  - Monitorar uso do sistema
  - Responder a incidentes
  - Processar solicitações de titulares

---

## 🔄 **Revisão e Atualização**

### **Revisão Periódica**
- **Frequência**: Anual ou quando houver mudanças na legislação
- **Responsável**: DPO + Equipe Jurídica
- **Processo**: 
  1. Revisar todas as regras
  2. Verificar conformidade com legislação atual
  3. Atualizar documentação
  4. Comunicar mudanças à equipe

### **Versão Atual**
- **Versão**: 1.0
- **Data**: Janeiro 2024
- **Próxima Revisão**: Janeiro 2025

---

## 📚 **Referências**

- [LGPD_RESUMO.md](./LGPD_RESUMO.md) - Resumo completo da LGPD
- [POLITICA_PRIVACIDADE.md](./POLITICA_PRIVACIDADE.md) - Política de privacidade
- [TERMOS_USO.md](./TERMOS_USO.md) - Termos de uso
- [POLITICA_RETENCAO_DADOS.md](./POLITICA_RETENCAO_DADOS.md) - Política de retenção
- [FORMULARIO_CONSENTIMENTO.md](./FORMULARIO_CONSENTIMENTO.md) - Formulário de consentimento

---

**⚠️ IMPORTANTE**: Este documento estabelece regras obrigatórias. Qualquer violação deve ser reportada imediatamente ao DPO e pode resultar em consequências legais e operacionais.

**✅ CONFORMIDADE**: Todas as funcionalidades do sistema devem estar em conformidade com este documento antes de serem colocadas em produção.
