# 🔐 Template HTML para Reset de Senha - Firebase Auth

Este documento contém o template HTML bonito para configurar no Firebase Console.

---

## 📋 Como Configurar

### **1. Acessar Firebase Console**

1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Selecione seu projeto
3. Vá em **Authentication** → **Templates**
4. Clique em **"Password reset"** (ou "Redefinir senha")

### **2. Configurar Template**

1. **Assunto do email:**
   ```
   Redefinir Senha - EntomoVigilância
   ```

2. **Corpo do email (HTML):**
   Copie e cole o HTML abaixo

3. **Variáveis disponíveis:**
   - `%LINK%` - Link de reset de senha
   - `%EMAIL%` - Email do usuário
   - `%APP_NAME%` - Nome da aplicação (configurado no Firebase)

---

## 🎨 Template HTML

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Redefinir Senha - EntomoVigilância</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">EntomoVigilância</h1>
    <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Sistema de Vigilância Entomológica</p>
  </div>
  
  <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
    <h2 style="color: #10b981; margin-top: 0;">🔐 Redefinir Senha</h2>
    
    <p>Olá!</p>
    
    <p>Recebemos uma solicitação para redefinir a senha da sua conta <strong>%EMAIL%</strong> no sistema EntomoVigilância.</p>
    
    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0; color: #374151;">
        <strong>📧 Conta:</strong> %EMAIL%
      </p>
    </div>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="%LINK%" style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        🔑 Redefinir Senha
      </a>
    </div>
    
    <div style="background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0; color: #92400e;">
        ⚠️ <strong>Importante:</strong> Este link expira em <strong>1 hora</strong>. Se você não solicitou esta redefinição, pode ignorar este email com segurança.
      </p>
    </div>
    
    <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
      Se você não conseguir clicar no botão, copie e cole este link no seu navegador:<br>
      <a href="%LINK%" style="color: #10b981; word-break: break-all;">%LINK%</a>
    </p>
    
    <div style="background: #eff6ff; border: 1px solid #3b82f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 0; color: #1e40af; font-size: 14px;">
        💡 <strong>Dica de Segurança:</strong> Nunca compartilhe este link com outras pessoas. Nossa equipe nunca solicitará sua senha por email.
      </p>
    </div>
  </div>
  
  <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
    <p>Este é um email automático do sistema EntomoVigilância. Não responda a este email.</p>
    <p style="margin-top: 10px;">
      Se você não solicitou esta redefinição, sua conta está segura e nenhuma ação é necessária.
    </p>
  </div>
</body>
</html>
```

---

## 📝 Versão Texto Simples (Opcional)

Se quiser configurar também a versão texto simples (para clientes de email que não suportam HTML):

```
Redefinir Senha - EntomoVigilância

Olá!

Recebemos uma solicitação para redefinir a senha da sua conta %EMAIL% no sistema EntomoVigilância.

Link para redefinir senha: %LINK%

IMPORTANTE: Este link expira em 1 hora. Se você não solicitou esta redefinição, pode ignorar este email com segurança.

Dica de Segurança: Nunca compartilhe este link com outras pessoas. Nossa equipe nunca solicitará sua senha por email.

---
Este é um email automático do sistema EntomoVigilância. Não responda a este email.
Se você não solicitou esta redefinição, sua conta está segura e nenhuma ação é necessária.
```

---

## ✅ Checklist de Configuração

- [ ] Acessou Firebase Console → Authentication → Templates
- [ ] Selecionou "Password reset"
- [ ] Configurou o assunto: `Redefinir Senha - EntomoVigilância`
- [ ] Colou o HTML acima no campo "Email body"
- [ ] Substituiu `%LINK%` e `%EMAIL%` (Firebase faz isso automaticamente)
- [ ] Configurou Action URL (opcional): `https://entomonitec.com.br/login?resetPassword=true`
- [ ] Salvou as alterações
- [ ] Testou enviando um reset de senha

---

## 🧪 Testar

1. Acesse a tela de login
2. Clique em "Esqueci minha senha"
3. Digite um email válido
4. Verifique o email recebido
5. O email deve ter o design bonito configurado

---

## 📸 Preview

O template inclui:

- ✅ **Header:** Gradiente verde com logo "EntomoVigilância"
- ✅ **Título:** "🔐 Redefinir Senha"
- ✅ **Mensagem:** Explicação clara
- ✅ **Botão:** Botão verde destacado "🔑 Redefinir Senha"
- ✅ **Avisos:** Link expira em 1 hora
- ✅ **Dica de Segurança:** Não compartilhar o link
- ✅ **Link alternativo:** Caso o botão não funcione
- ✅ **Footer:** Informações sobre email automático

---

## 🔄 Diferença: Reset vs Convite

| Tipo | Método | Template |
|------|--------|----------|
| **Reset de Senha** | Firebase Auth (`sendPasswordResetEmail`) | Configurado no Firebase Console |
| **Convite de Usuário** | Resend (API externa) | Template em código (`emailTemplates.ts`) |

---

## 📚 Referências

- [Firebase Auth - Email Templates](https://firebase.google.com/docs/auth/custom-email-handler)
- [Firebase Console - Authentication Templates](https://console.firebase.google.com/project/_/authentication/emails)

---

**Última Atualização**: 02/09/2025  
**Versão**: 1.0  
**Sistema**: Entomonitec - Vigilância Entomológica

