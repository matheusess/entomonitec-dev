# 🔐 Autenticação e Reset de Senha - Sistema Entomonitec

## 📋 Visão Geral

O sistema utiliza **Firebase Authentication** para gerenciar autenticação de usuários e reset de senha. Todos os usuários são autenticados via email/senha e podem solicitar reset de senha através da interface do sistema.

---

## 🔑 Sistema de Autenticação

### **Provedor de Autenticação**
- **Firebase Authentication** (Email/Password)
- **Persistência**: Sessão mantida entre recarregamentos
- **Segurança**: HTTPS obrigatório, tokens JWT gerenciados pelo Firebase

### **Fluxo de Login**

1. Usuário acessa `/login`
2. Preenche email e senha
3. Sistema valida credenciais via Firebase Auth
4. Se válido, carrega dados do usuário do Firestore
5. Redireciona para dashboard baseado no role

### **Componentes Principais**

#### **Login.tsx**
```typescript
// src/components/pages/Login.tsx
- Tela de login com validação
- Botão "Esqueci minha senha"
- Tratamento de erros específicos
- Feedback visual com toast notifications
```

#### **AuthContext.tsx**
```typescript
// src/components/AuthContext.tsx
- Gerenciamento de estado de autenticação
- Carregamento de dados do usuário do Firestore
- Verificação de permissões
- Redirecionamento baseado em role
```

---

## 🔄 Reset de Senha

### **Como Funciona**

O sistema utiliza o serviço nativo do Firebase Auth para reset de senha:

1. **Usuário solicita reset**: Clica em "Esqueci minha senha" na tela de login
2. **Sistema envia email**: Firebase Auth envia email com link de reset
3. **Usuário recebe email**: Email contém link para redefinir senha
4. **Redefinição**: Usuário define nova senha na página do Firebase
5. **Login**: Usuário pode fazer login com a nova senha

### **Implementação**

#### **1. Na Tela de Login**

```typescript
// src/components/pages/Login.tsx

const handleForgotPassword = async () => {
  if (!email) {
    setError('Digite seu e-mail antes de solicitar a recuperação de senha.');
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    
    toast({
      variant: 'success',
      title: '📧 E-mail enviado!',
      description: `Instruções para redefinir sua senha foram enviadas para ${email}`,
      duration: 6000,
    });
    
  } catch (error: any) {
    // Tratamento de erros específicos
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = 'E-mail não encontrado. Verifique o endereço informado.';
        break;
      case 'auth/invalid-email':
        errorMessage = 'E-mail inválido. Verifique o formato do e-mail.';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.';
        break;
    }
  }
};
```

#### **2. No UserService**

```typescript
// src/services/userService.ts

/**
 * Envia email para redefinir senha
 */
static async sendPasswordReset(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email);
    logger.log('✅ Email de redefinição enviado para:', email);
  } catch (error) {
    logger.error('❌ Erro ao enviar email de redefinição:', error);
    throw new Error('Falha ao enviar email de redefinição');
  }
}
```

#### **3. No Modal de Gerenciamento de Usuários**

Administradores podem solicitar reset de senha para outros usuários:

```typescript
// src/components/modals/UserManagementModal.tsx

await UserService.sendPasswordReset(email);
```

---

## 📧 Email de Reset

### **Configuração do Firebase**

O email de reset é enviado automaticamente pelo Firebase Auth. Para personalizar:

1. **Firebase Console** → Authentication → Templates
2. **Email de redefinição de senha**
3. Personalizar assunto e corpo do email
4. Configurar URL de redirecionamento (Action URL)

### **Template Padrão**

O Firebase envia email com:
- **Assunto**: "Redefina sua senha"
- **Link**: URL temporária com token de reset
- **Expiração**: 1 hora (configurável)
- **Segurança**: Token único e não reutilizável

### **Action URL (Opcional)**

Para redirecionar para página customizada após reset:

```
https://seu-dominio.com/reset-password?mode=resetPassword&oobCode=CODE&apiKey=API_KEY
```

---

## 🛡️ Segurança

### **Medidas Implementadas**

1. ✅ **Validação de email**: Verifica formato antes de enviar
2. ✅ **Rate limiting**: Firebase limita tentativas (previne spam)
3. ✅ **Token único**: Cada link de reset é único e não reutilizável
4. ✅ **Expiração**: Links expiram após 1 hora
5. ✅ **HTTPS obrigatório**: Comunicação criptografada
6. ✅ **Logs de auditoria**: Todas as tentativas são logadas

### **Tratamento de Erros**

| Erro | Código | Mensagem ao Usuário |
|------|--------|---------------------|
| Usuário não encontrado | `auth/user-not-found` | "E-mail não encontrado. Verifique o endereço informado." |
| Email inválido | `auth/invalid-email` | "E-mail inválido. Verifique o formato do e-mail." |
| Muitas tentativas | `auth/too-many-requests` | "Muitas tentativas. Aguarde alguns minutos antes de tentar novamente." |
| Erro genérico | Outros | "Erro ao enviar e-mail de recuperação. Tente novamente." |

---

## 🔧 Configuração

### **Variáveis de Ambiente**

Não são necessárias variáveis específicas para reset de senha. O Firebase Auth é configurado via:

```typescript
// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  // ... outras configurações
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

### **Firebase Console**

1. **Authentication** → **Settings** → **Authorized domains**
   - Adicionar domínios permitidos
   - HTTPS obrigatório

2. **Authentication** → **Templates**
   - Personalizar email de reset
   - Configurar Action URL (opcional)

---

## 📱 Fluxo Completo

### **1. Solicitação de Reset**

```
Usuário → Tela de Login → Clica "Esqueci minha senha"
  ↓
Sistema valida email
  ↓
Chama sendPasswordResetEmail(auth, email)
  ↓
Firebase envia email
  ↓
Toast de sucesso exibido
```

### **2. Redefinição de Senha**

```
Usuário recebe email
  ↓
Clica no link de reset
  ↓
Redirecionado para página do Firebase
  ↓
Define nova senha
  ↓
Senha atualizada no Firebase Auth
  ↓
Pode fazer login com nova senha
```

---

## 🧪 Testes

### **Cenários de Teste**

1. ✅ **Reset com email válido**: Deve enviar email com sucesso
2. ✅ **Reset com email inválido**: Deve mostrar erro apropriado
3. ✅ **Reset com email não cadastrado**: Deve mostrar "E-mail não encontrado"
4. ✅ **Múltiplas tentativas**: Deve respeitar rate limiting
5. ✅ **Reset por administrador**: Deve funcionar para outros usuários

### **Como Testar**

```bash
# 1. Acessar tela de login
# 2. Preencher email válido
# 3. Clicar em "Esqueci minha senha"
# 4. Verificar toast de sucesso
# 5. Verificar email recebido
# 6. Clicar no link e redefinir senha
# 7. Fazer login com nova senha
```

---

## 🔄 Integração com Outros Sistemas

### **UserService**

O método `sendPasswordReset` está disponível para uso em outros componentes:

```typescript
import { UserService } from '@/services/userService';

// Solicitar reset para um usuário
await UserService.sendPasswordReset('usuario@email.com');
```

### **UserManagementModal**

Administradores podem solicitar reset para usuários da organização:

```typescript
// No modal de gerenciamento de usuários
const handleResetPassword = async (email: string) => {
  try {
    await UserService.sendPasswordReset(email);
    toast({ title: 'Email de reset enviado!' });
  } catch (error) {
    toast({ title: 'Erro ao enviar email', variant: 'destructive' });
  }
};
```

---

## 📊 Logs e Auditoria

### **Logs Gerados**

- ✅ **Sucesso**: `✅ Email de redefinição enviado para: {email}`
- ❌ **Erro**: `❌ Erro ao enviar email de redefinição: {error}`
- 📝 **Tentativas**: Todas as tentativas são logadas

### **Monitoramento**

- Verificar logs no console do navegador (desenvolvimento)
- Verificar logs do Firebase (produção)
- Monitorar rate limiting no Firebase Console

---

## 🚀 Melhorias Futuras (Opcional)

### **Personalização do Email**

1. Criar template HTML customizado
2. Configurar Action URL para página própria
3. Adicionar branding da organização

### **Página Customizada de Reset**

```typescript
// Criar página: /reset-password
// Usar confirmPasswordReset do Firebase Auth
import { confirmPasswordReset } from 'firebase/auth';

const handleReset = async (oobCode: string, newPassword: string) => {
  await confirmPasswordReset(auth, oobCode, newPassword);
};
```

### **Notificações Adicionais**

- Email de confirmação após reset bem-sucedido
- Notificação para administrador quando usuário solicita reset
- Histórico de resets de senha

---

## 📚 Referências

- [Firebase Auth - Password Reset](https://firebase.google.com/docs/auth/web/manage-users#send_a_password_reset_email)
- [Firebase Auth - Email Templates](https://firebase.google.com/docs/auth/custom-email-handler)
- [Documentação do Projeto](./README.md)

---

**Última Atualização**: 02/09/2025  
**Versão**: 1.0  
**Sistema**: Entomonitec - Vigilância Entomológica



