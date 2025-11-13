# 📚 Documentação do Sistema Entomonitec

Documentação completa do sistema de Vigilância Entomológica.

---

## 🚀 Início Rápido

### **Para Começar a Trabalhar**
1. [Fluxo de Trabalho](./devops/FLUXO_TRABALHO.md) ⭐ **LEIA PRIMEIRO**
2. [Setup do Firebase](./setup/firebase-setup.md)
3. [Configuração de Email (Resend)](./email/RESEND_EMAIL_SETUP.md)

---

## 📁 Estrutura da Documentação

### 🚀 **Setup e Configuração**
- [Setup Inicial do Firebase](./setup/firebase-setup.md)
- [Configuração de Usuários Firebase](./setup/firebase-users-setup.md)

### 📧 **Email**
- [Configuração do Resend](./email/RESEND_EMAIL_SETUP.md) ⭐ **Atual**
- [Configuração do Brevo](./email/BREVO_EMAIL_SETUP.md) (Legado - Referência)
- [Template Reset de Senha](./email/FIREBASE_RESET_SENHA_TEMPLATE.md)

### 🔥 **Firebase**
- [Regras do Firestore](./firebase/firebase-rules.md)
- [Multi-tenancy](./firebase/multi-tenant-guide.md)
- [Regras JS](./firebase/firestore-rules.js)

### 🚢 **DevOps**
- [Fluxo de Trabalho](./devops/FLUXO_TRABALHO.md) ⭐ **Guia Principal**
- [Guia DevOps Vercel](./devops/GUIA_DEVOPS_VERCEL.md)
- [Arquitetura DevOps](./devops/ARQUITETURA_DEVOPS.md)
- [Setup Ngrok](./devops/NGROK_SETUP.md)

### 🔒 **LGPD e Segurança**
- [Regras LGPD](./lgpd/LGPD_RULES.md) ⚠️ **Obrigatório**
- [Checklist LGPD](./lgpd/LGPD_CHECKLIST.md)
- [Resumo LGPD](./lgpd/LGPD_RESUMO.md)
- [Política de Privacidade](./lgpd/POLITICA_PRIVACIDADE.md)
- [Política de Retenção de Dados](./lgpd/POLITICA_RETENCAO_DADOS.md)
- [Termos de Uso](./lgpd/TERMOS_USO.md)
- [Formulário de Consentimento](./lgpd/FORMULARIO_CONSENTIMENTO.md)
- [Arquitetura de Segurança](./security/security-architecture.md)

### 📊 **Modelos de Dados**
- [Modelo de Visita](./models/modelo-visita.md)
- [Modelo de Usuário](./models/modelo-usuario.md)
- [Modelo de Organização](./models/modelo-organizacao.md)
- [Estrutura de Dados - Visitas](./models/data-structure-visits.md)
- [Exemplos de Dados Reais](./models/real-data-examples.md)
- [Métricas Operacionais](./models/metricas-operacionais.md)

### ⚙️ **Funcionalidades**
- [Visitas e Denúncias](./features/FUNCIONALIDADE_VISITAS_DENUNCIA.md)
- [Funcionalidade RG](./features/FUNCIONALIDADE_RG.md)
- [Geocoding APIs](./features/GEOCODING_APIS.md)

### 🔧 **Troubleshooting**
- [Reset de Senha - Troubleshooting](./troubleshooting/TROUBLESHOOTING_RESET_SENHA.md)
- [Reset de Senha - Checklist](./troubleshooting/CHECKLIST_RESET_SENHA.md)

---

## 🎯 Guias por Perfil

### **Para Desenvolvedores**
1. [Fluxo de Trabalho](./devops/FLUXO_TRABALHO.md) - Como trabalhar no dia a dia
2. [Modelos de Dados](./models/) - Estrutura de dados
3. [Arquitetura de Segurança](./security/security-architecture.md) - Segurança
4. [Regras LGPD](./lgpd/LGPD_RULES.md) - Conformidade

### **Para DevOps**
1. [Fluxo de Trabalho](./devops/FLUXO_TRABALHO.md) - Fluxo de deploy
2. [Guia DevOps Vercel](./devops/GUIA_DEVOPS_VERCEL.md) - Configuração completa
3. [Arquitetura DevOps](./devops/ARQUITETURA_DEVOPS.md) - Visão geral

### **Para Configuração Inicial**
1. [Setup do Firebase](./setup/firebase-setup.md)
2. [Configuração de Email](./email/RESEND_EMAIL_SETUP.md)
3. [Guia DevOps](./devops/GUIA_DEVOPS_VERCEL.md)

---

## 📝 Convenções

- **⭐ Atual** = Documentação atual e em uso
- **(Legado)** = Documentação antiga, mantida para referência
- Arquivos em português para facilitar a equipe brasileira

---

## 🔄 Fluxo de Trabalho Resumido

```
LOCAL → DEV → HOMOLOG → PROD
```

1. **Local**: Trabalhe na branch `dev`
2. **DEV**: Push para `dev` → Deploy automático
3. **HOMOLOG**: Merge `dev` → `staging` → Deploy automático
4. **PROD**: Merge `staging` → `main` → Deploy automático

📖 [Ver guia completo](./devops/FLUXO_TRABALHO.md)

---

**Última Atualização**: 02/09/2025  
**Versão**: 3.0 (Reorganizado)  
**Sistema**: Entomonitec - Vigilância Entomológica
