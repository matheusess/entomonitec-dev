# ✅ Checklist LGPD - Desenvolvimento

## 🎯 **Uso**

Este checklist deve ser usado **antes de cada commit** que envolva coleta, armazenamento ou processamento de dados pessoais.

---

## 📋 **Antes de Implementar Nova Funcionalidade**

### **Coleta de Dados**
- [ ] Verifiquei se os dados são realmente necessários para a finalidade
- [ ] Identifiquei a base legal para coleta (interesse público, consentimento, etc.)
- [ ] Criei formulário de consentimento se necessário
- [ ] Implementei validação de consentimento antes de salvar
- [ ] Adicionei informações ao titular sobre coleta e uso

### **Armazenamento**
- [ ] Dados sensíveis estão criptografados
- [ ] Isolamento por organização está garantido
- [ ] Firebase Rules estão configuradas corretamente
- [ ] Backup seguro está configurado

### **Acesso**
- [ ] Controle de acesso por função está implementado
- [ ] Logs de acesso estão sendo registrados
- [ ] Auditoria de operações está ativa

---

## 🔍 **Code Review - Checklist**

### **Dados Pessoais**
- [ ] Nenhum dado desnecessário está sendo coletado
- [ ] Consentimento está sendo validado antes de salvar
- [ ] Dados estão sendo criptografados adequadamente
- [ ] Isolamento por organização está garantido

### **Segurança**
- [ ] Firebase Rules impedem acesso não autorizado
- [ ] Validações de entrada estão implementadas
- [ ] Dados não estão sendo expostos em logs
- [ ] Erros não expõem informações sensíveis

### **Conformidade**
- [ ] Política de privacidade está sendo exibida quando necessário
- [ ] Direitos do titular estão implementados
- [ ] Retenção de dados está conforme política
- [ ] Eliminação automática está configurada

---

## 🚀 **Antes de Deploy em Produção**

### **Testes**
- [ ] Testei coleta de dados com consentimento
- [ ] Testei validação de consentimento
- [ ] Testei isolamento por organização
- [ ] Testei endpoints de direitos do titular
- [ ] Testei eliminação automática de dados vencidos

### **Documentação**
- [ ] Documentei quais dados são coletados
- [ ] Documentei base legal para coleta
- [ ] Documentei período de retenção
- [ ] Atualizei política de privacidade se necessário

### **Segurança**
- [ ] Revisei Firebase Rules
- [ ] Verifiquei criptografia de dados sensíveis
- [ ] Confirmei backup seguro
- [ ] Testei controle de acesso

---

## 📊 **Checklist por Tipo de Funcionalidade**

### **Formulário de Visita**
- [ ] Formulário de consentimento está incluído
- [ ] Validação de consentimento antes de salvar
- [ ] Apenas dados necessários estão sendo coletados
- [ ] Política de privacidade está acessível
- [ ] Dados do morador estão sendo salvos corretamente

### **API de Dados Pessoais**
- [ ] Endpoint requer autenticação
- [ ] Validação de permissões está implementada
- [ ] Logs de acesso estão sendo registrados
- [ ] Resposta não expõe dados desnecessários
- [ ] Rate limiting está configurado

### **Funcionalidade de Direitos do Titular**
- [ ] Endpoint de consulta implementado
- [ ] Endpoint de correção implementado
- [ ] Endpoint de eliminação implementado
- [ ] Endpoint de portabilidade implementado
- [ ] Processamento em até 15 dias úteis

### **Job de Eliminação Automática**
- [ ] Job está agendado corretamente
- [ ] Elimina dados conforme prazos estabelecidos
- [ ] Notifica DPO antes de eliminar
- [ ] Documenta eliminações realizadas
- [ ] Testei execução do job

---

## 🚨 **Red Flags - Parar e Revisar**

Se encontrar qualquer um destes itens, **PARE** e revise antes de continuar:

- ❌ Coleta de CPF, RG ou outros dados desnecessários
- ❌ Dados sendo salvos sem validação de consentimento
- ❌ Acesso a dados de outras organizações
- ❌ Dados sensíveis sem criptografia
- ❌ Logs expondo dados pessoais
- ❌ Fotos com pessoas identificáveis
- ❌ Compartilhamento de dados com terceiros não autorizados
- ❌ Uso de dados para fins não relacionados à vigilância sanitária

---

## 📝 **Notas de Desenvolvimento**

### **Ao Implementar Nova Coleta de Dados**

1. **Documente**:
   - Quais dados serão coletados
   - Por que são necessários
   - Base legal para coleta
   - Período de retenção

2. **Implemente**:
   - Formulário de consentimento
   - Validação de consentimento
   - Criptografia se necessário
   - Logs de acesso

3. **Teste**:
   - Coleta com consentimento
   - Coleta sem consentimento (deve falhar)
   - Isolamento por organização
   - Direitos do titular

---

## 🔄 **Revisão Periódica**

### **Mensal**
- [ ] Revisar logs de acesso suspeitos
- [ ] Verificar backups estão funcionando
- [ ] Confirmar jobs de eliminação estão executando

### **Trimestral**
- [ ] Auditoria de conformidade
- [ ] Revisão de permissões de usuários
- [ ] Teste de restauração de backup

### **Anual**
- [ ] Revisão completa de conformidade LGPD
- [ ] Atualização de políticas
- [ ] Treinamento da equipe

---

**Versão**: 1.0  
**Data**: Janeiro 2024  
**Referência**: [LGPD_RULES.md](./LGPD_RULES.md)
