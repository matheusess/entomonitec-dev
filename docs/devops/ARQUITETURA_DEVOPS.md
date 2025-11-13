# 🚀 Arquitetura DevOps - Sistema EntoMonitec

**Documento Técnico para Orçamento e Proposta Comercial**

---

## 📋 Visão Geral

Este documento descreve a arquitetura DevOps proposta para o Sistema EntoMonitec, incluindo estrutura de ambientes, domínios, infraestrutura e processos de deploy.

---

## 🏗️ Estrutura de Ambientes

### Ambiente de Desenvolvimento (DEV)

**Objetivo:** Ambiente para desenvolvimento e testes locais dos desenvolvedores

**Características:**
- ✅ Acesso restrito (apenas desenvolvedores)
- ✅ Dados de teste/simulação
- ✅ Debug habilitado
- ✅ Logs detalhados
- ✅ Regras de segurança mais permissivas (apenas para desenvolvimento)

**Domínio:**
- **URL:** `dev.entomonitec.com.br` ou `dev-entomonitec.vercel.app`
- **SSL:** Certificado automático (Let's Encrypt/Vercel)
- **DNS:** CNAME apontando para Vercel

**Configurações:**
- Firebase Project: `entomonitec-dev`
- Firestore: Regras de desenvolvimento (mais permissivas)
- Storage: Bucket separado para desenvolvimento
- Email: Conta de teste (Brevo Sandbox)

**Acesso:**
- Desenvolvedores da equipe
- Acesso via VPN (opcional, para maior segurança)

---

### Ambiente de Homologação (HOMOLOG/STAGING)

**Objetivo:** Ambiente para testes finais antes da produção, validação com cliente

**Características:**
- ✅ Dados similares à produção (mas isolados)
- ✅ Configurações idênticas à produção
- ✅ Testes de integração
- ✅ Validação de performance
- ✅ Testes de carga
- ✅ Aprovação do cliente antes de produção

**Domínio:**
- **URL:** `homolog.entomonitec.com.br` ou `staging.entomonitec.com.br`
- **SSL:** Certificado automático (Let's Encrypt/Vercel)
- **DNS:** CNAME apontando para Vercel

**Configurações:**
- Firebase Project: `entomonitec-homolog`
- Firestore: Regras idênticas à produção
- Storage: Bucket separado para homologação
- Email: Conta de teste (Brevo Sandbox ou conta separada)

**Acesso:**
- Desenvolvedores
- Cliente (para validação)
- Testadores QA
- Acesso controlado por autenticação

**Processo:**
1. Deploy automático após merge na branch `staging`
2. Notificação automática para equipe
3. Testes de validação
4. Aprovação do cliente
5. Deploy para produção após aprovação

---

### Ambiente de Produção (PROD)

**Objetivo:** Ambiente final, utilizado pelos clientes finais

**Características:**
- ✅ Dados reais dos clientes
- ✅ Máxima segurança
- ✅ Alta disponibilidade (99.9% SLA)
- ✅ Monitoramento 24/7
- ✅ Backup automático
- ✅ Disaster recovery
- ✅ Logs de auditoria completos

**Domínio:**
- **URL Principal:** `app.entomonitec.com.br` ou `entomonitec.com.br`
- **URL Alternativa:** `www.entomonitec.com.br`
- **SSL:** Certificado automático (Let's Encrypt/Vercel)
- **DNS:** 
  - CNAME principal apontando para Vercel
  - DNS secundário para redundância

**Configurações:**
- Firebase Project: `entomonitec-prod`
- Firestore: Regras de produção (máxima segurança)
- Storage: Bucket de produção com backup automático
- Email: Conta de produção (Brevo Production)

**Acesso:**
- Clientes finais (municípios)
- Administradores do sistema
- Suporte técnico (acesso limitado)

**Monitoramento:**
- Uptime monitoring (Pingdom/UptimeRobot)
- Error tracking (Sentry)
- Performance monitoring (Vercel Analytics)
- Logs centralizados (Firebase Logs)

---

## 🌐 Estrutura de Domínios

### Domínios Propostos

#### Opção 1: Subdomínios (Recomendado)
```
dev.entomonitec.com.br      → Ambiente de Desenvolvimento
homolog.entomonitec.com.br  → Ambiente de Homologação
app.entomonitec.com.br      → Ambiente de Produção
www.entomonitec.com.br      → Redireciona para app.entomonitec.com.br
```

#### Opção 2: Domínios Separados
```
dev-entomonitec.com.br      → Ambiente de Desenvolvimento
homolog-entomonitec.com.br  → Ambiente de Homologação
entomonitec.com.br          → Ambiente de Produção
```

#### Opção 3: Domínios Vercel (Gratuito)
```
dev-entomonitec.vercel.app      → Ambiente de Desenvolvimento
homolog-entomonitec.vercel.app  → Ambiente de Homologação
entomonitec.vercel.app           → Ambiente de Produção
```

**Recomendação:** Opção 1 (subdomínios) - mais profissional e fácil de gerenciar

---

## 🔧 Configuração de DNS

### Registro DNS para Subdomínios

```dns
# Desenvolvimento
dev.entomonitec.com.br.    CNAME   cname.vercel-dns.com.

# Homologação
homolog.entomonitec.com.br. CNAME  cname.vercel-dns.com.

# Produção
app.entomonitec.com.br.     CNAME   cname.vercel-dns.com.
www.entomonitec.com.br.     CNAME   cname.vercel-dns.com.
entomonitec.com.br.         A       [IP do Vercel] (ou CNAME)
```

### SSL/TLS

- **Certificados:** Automáticos via Vercel (Let's Encrypt)
- **Renovação:** Automática
- **Validade:** 90 dias (renovado automaticamente)
- **HTTPS:** Obrigatório em todos os ambientes

---

## 🏢 Infraestrutura Firebase

### Estrutura de Projetos Firebase

#### Projeto DEV
- **Project ID:** `entomonitec-dev`
- **Firestore Database:** `entomonitec-dev-default-rtdb`
- **Storage Bucket:** `entomonitec-dev.appspot.com`
- **Authentication:** Contas de teste
- **Regras:** Desenvolvimento (permissivas)

#### Projeto HOMOLOG
- **Project ID:** `entomonitec-homolog`
- **Firestore Database:** `entomonitec-homolog-default-rtdb`
- **Storage Bucket:** `entomonitec-homolog.appspot.com`
- **Authentication:** Contas de teste/validação
- **Regras:** Idênticas à produção

#### Projeto PROD
- **Project ID:** `entomonitec-prod`
- **Firestore Database:** `entomonitec-prod-default-rtdb`
- **Storage Bucket:** `entomonitec-prod.appspot.com`
- **Authentication:** Contas reais
- **Regras:** Produção (máxima segurança)

### Isolamento de Dados

- ✅ **Totalmente isolados** entre ambientes
- ✅ **Sem compartilhamento** de dados entre DEV/HOMOLOG/PROD
- ✅ **Backup separado** para cada ambiente
- ✅ **Regras de segurança** específicas por ambiente

---

## 📦 Processo de Deploy

### Fluxo de Deploy

```
┌─────────────┐
│   GitHub    │
│  (Código)   │
└──────┬──────┘
       │
       ├─── Push para branch `develop` ───┐
       │                                    │
       ├─── Push para branch `staging` ───┤─── Deploy Automático HOMOLOG
       │                                    │
       └─── Push para branch `main` ───────┘─── Deploy Automático PROD
```

### Branches Git

- **`develop`** → Deploy automático para DEV
- **`staging`** → Deploy automático para HOMOLOG
- **`main`** → Deploy automático para PROD (após aprovação)

### CI/CD Pipeline

#### 1. Desenvolvimento (DEV)
- **Trigger:** Push para branch `develop`
- **Ações:**
  - ✅ Build do projeto
  - ✅ Testes unitários
  - ✅ Lint do código
  - ✅ Deploy automático para Vercel DEV
  - ✅ Notificação no Slack/Email

#### 2. Homologação (HOMOLOG)
- **Trigger:** Push para branch `staging` ou merge de PR
- **Ações:**
  - ✅ Build do projeto
  - ✅ Testes unitários + integração
  - ✅ Lint do código
  - ✅ Deploy automático para Vercel HOMOLOG
  - ✅ Execução de testes E2E
  - ✅ Notificação para equipe e cliente

#### 3. Produção (PROD)
- **Trigger:** Push para branch `main` (após aprovação)
- **Ações:**
  - ✅ Build do projeto (otimizado)
  - ✅ Testes completos (unitários + integração + E2E)
  - ✅ Lint do código
  - ✅ Análise de segurança
  - ✅ Deploy automático para Vercel PROD
  - ✅ Verificação de saúde (health check)
  - ✅ Notificação para equipe
  - ✅ Backup automático antes do deploy

---

## 🔐 Segurança e Variáveis de Ambiente

### Variáveis de Ambiente por Ambiente

#### DEV
```env
NODE_ENV=development
NEXT_PUBLIC_ENV=dev
NEXT_PUBLIC_APP_URL=https://dev.entomonitec.com.br
NEXT_PUBLIC_FIREBASE_PROJECT_ID=entomonitec-dev
# ... outras variáveis de desenvolvimento
```

#### HOMOLOG
```env
NODE_ENV=production
NEXT_PUBLIC_ENV=homolog
NEXT_PUBLIC_APP_URL=https://homolog.entomonitec.com.br
NEXT_PUBLIC_FIREBASE_PROJECT_ID=entomonitec-homolog
# ... outras variáveis de homologação
```

#### PROD
```env
NODE_ENV=production
NEXT_PUBLIC_ENV=production
NEXT_PUBLIC_APP_URL=https://app.entomonitec.com.br
NEXT_PUBLIC_FIREBASE_PROJECT_ID=entomonitec-prod
# ... outras variáveis de produção
```

### Gerenciamento de Secrets

- ✅ **Vercel Environment Variables:** Configuradas por ambiente
- ✅ **Firebase Config:** Separado por projeto
- ✅ **Brevo API Keys:** Separadas por ambiente
- ✅ **Rotação de chaves:** A cada 90 dias (produção)

---

## 📊 Monitoramento e Observabilidade

### Métricas por Ambiente

#### DEV
- Logs detalhados
- Debug habilitado
- Performance básica

#### HOMOLOG
- Logs completos
- Performance monitoring
- Error tracking
- Testes de carga

#### PROD
- ✅ **Uptime Monitoring:** 99.9% SLA
- ✅ **Error Tracking:** Sentry integrado
- ✅ **Performance:** Vercel Analytics
- ✅ **Logs:** Centralizados no Firebase
- ✅ **Alertas:** Email/Slack em caso de problemas
- ✅ **Dashboard:** Métricas em tempo real

### Alertas Configurados

- ⚠️ **Downtime:** Alerta imediato
- ⚠️ **Erros críticos:** Alerta em 5 minutos
- ⚠️ **Performance degradada:** Alerta em 15 minutos
- ⚠️ **Uso de recursos:** Alerta em 80% de capacidade

---

## 💾 Backup e Disaster Recovery

### Estratégia de Backup

#### DEV
- Backup manual (quando necessário)
- Retenção: 7 dias

#### HOMOLOG
- Backup diário automático
- Retenção: 30 dias

#### PROD
- ✅ **Backup automático diário** (Firestore)
- ✅ **Backup de fotos** (Storage) - diário
- ✅ **Backup de configurações** - semanal
- ✅ **Retenção:** 90 dias
- ✅ **Backup off-site:** Sim (Google Cloud Storage)
- ✅ **Teste de restore:** Mensal

### Disaster Recovery

- ✅ **RTO (Recovery Time Objective):** 4 horas
- ✅ **RPO (Recovery Point Objective):** 24 horas
- ✅ **Plano documentado:** Procedimentos de recuperação
- ✅ **Testes regulares:** Trimestral

---

## 💰 Custos Estimados de Infraestrutura

### Por Ambiente

#### DEV
- **Vercel:** Gratuito (Hobby) ou R$ 20/mês (Pro)
- **Firebase:** R$ 0-50/mês (uso baixo)
- **Brevo:** Gratuito (sandbox)
- **Total:** R$ 0-70/mês

#### HOMOLOG
- **Vercel:** R$ 20/mês (Pro)
- **Firebase:** R$ 50-150/mês (uso moderado)
- **Brevo:** R$ 0-50/mês (teste)
- **Total:** R$ 70-220/mês

#### PROD
- **Vercel:** R$ 20-100/mês (Pro/Enterprise)
- **Firebase:** R$ 200-800/mês (conforme uso)
- **Brevo:** R$ 0-150/mês (conforme volume)
- **Domínio:** R$ 30-50/ano
- **SSL:** Gratuito (Let's Encrypt)
- **Monitoramento:** R$ 0-100/mês
- **Total:** R$ 250-1.150/mês

### Total Estimado (3 Ambientes)
- **Mínimo:** R$ 320/mês
- **Médio:** R$ 500-800/mês
- **Máximo:** R$ 1.440/mês

*Valores variam conforme volume de uso e tráfego*

---

## 📋 Checklist de Implementação

### Fase 1: Configuração Inicial
- [ ] Criar projetos Firebase (DEV, HOMOLOG, PROD)
- [ ] Configurar domínios DNS
- [ ] Configurar SSL/TLS
- [ ] Configurar variáveis de ambiente no Vercel
- [ ] Configurar contas Brevo por ambiente

### Fase 2: CI/CD
- [ ] Configurar GitHub Actions
- [ ] Configurar deploy automático DEV
- [ ] Configurar deploy automático HOMOLOG
- [ ] Configurar deploy automático PROD
- [ ] Configurar notificações

### Fase 3: Monitoramento
- [ ] Configurar uptime monitoring
- [ ] Configurar error tracking (Sentry)
- [ ] Configurar performance monitoring
- [ ] Configurar alertas
- [ ] Configurar dashboard

### Fase 4: Backup e Segurança
- [ ] Configurar backup automático
- [ ] Configurar disaster recovery
- [ ] Configurar rotação de chaves
- [ ] Configurar auditoria de logs
- [ ] Testar procedimentos de recuperação

---

## 🎯 Benefícios da Arquitetura Proposta

### Para o Cliente
- ✅ **Ambiente de teste** antes de produção
- ✅ **Validação** de funcionalidades
- ✅ **Segurança** garantida
- ✅ **Alta disponibilidade** (99.9% SLA)
- ✅ **Backup automático** de dados
- ✅ **Monitoramento 24/7**

### Para a Equipe
- ✅ **Desenvolvimento isolado** (sem afetar produção)
- ✅ **Deploy automatizado** (menos erros)
- ✅ **Testes antes de produção**
- ✅ **Rollback rápido** em caso de problemas
- ✅ **Monitoramento proativo**

---

## 📞 Suporte e Manutenção

### Suporte por Ambiente

#### DEV
- Suporte durante horário comercial
- Resposta em até 24h

#### HOMOLOG
- Suporte durante horário comercial
- Resposta em até 12h

#### PROD
- ✅ **Suporte 24/7** (crítico)
- ✅ **Resposta em até 4h** (horário comercial)
- ✅ **Resposta em até 1h** (emergências)
- ✅ **SLA garantido:** 99.9% uptime

---

## 📝 Documentação Adicional

- [Configuração Firebase](./firebase-setup.md)
- [Regras de Segurança](./firebase-rules.md)
- [Arquitetura de Segurança](./security-architecture.md)
- [Guia de Deploy](./Manual%20de%20Instalação%20e%20Deploy%20-%20Sistema%20de%20Vigilância%20Entomológica.md)

---

## ✅ Conclusão

Esta arquitetura DevOps garante:

1. ✅ **Isolamento completo** entre ambientes
2. ✅ **Segurança máxima** em produção
3. ✅ **Deploy automatizado** e confiável
4. ✅ **Monitoramento proativo** de problemas
5. ✅ **Backup e recuperação** de dados
6. ✅ **Escalabilidade** para crescimento futuro
7. ✅ **Conformidade** com melhores práticas

**A arquitetura está pronta para suportar o crescimento do sistema e garantir alta disponibilidade e segurança para os clientes.**

---

**Documento gerado em:** [DATA]  
**Versão:** 1.0  
**Sistema:** EntoMonitec - Vigilância Entomológica v2.0  
**Status:** ✅ Proposta Técnica para Orçamento

---

*Este documento é confidencial e destinado exclusivamente para proposta comercial.*

