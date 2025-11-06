# 📱 Configuração ngrok para Teste no Celular

## 🎯 Problema

Navegadores modernos bloqueiam acesso à câmera e outras APIs sensíveis quando o site é servido via **HTTP** (não HTTPS). Para testar a câmera no celular, é necessário usar **HTTPS**.

## ✅ Solução: ngrok

O **ngrok** cria um túnel HTTPS seguro para seu servidor local, permitindo acesso à câmera no celular.

---

## 🚀 Instalação e Uso

### **1. Instalar ngrok**

#### **Opção A: Via npm (Recomendado)**
```bash
npm install -g ngrok
```

#### **Opção B: Download Direto**
1. Acesse: https://ngrok.com/download
2. Baixe para seu sistema operacional
3. Extraia e adicione ao PATH

### **2. Iniciar o Servidor Next.js**

Em um terminal, inicie o servidor de desenvolvimento:
```bash
npm run dev
```

O servidor estará rodando em `http://localhost:3000`

### **3. Iniciar ngrok**

Em **outro terminal**, execute:
```bash
ngrok http 3000
```

Você verá algo como:
```
Session Status                online
Account                       [seu email]
Version                       3.x.x
Region                        United States (us)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://xxxx-xxxx-xxxx.ngrok-free.app -> http://localhost:3000
```

### **4. Acessar no Celular**

Copie a URL **HTTPS** fornecida pelo ngrok (ex: `https://xxxx-xxxx-xxxx.ngrok-free.app`) e acesse no navegador do celular.

**✅ Agora a câmera funcionará!**

---

## 🔧 Configurações Avançadas

### **URL Fixa (ngrok Pro)**

Se você tem conta ngrok Pro, pode configurar uma URL fixa:

```bash
ngrok http 3000 --domain=seu-dominio.ngrok.app
```

### **Autenticação Básica**

Para proteger o acesso:
```bash
ngrok http 3000 --basic-auth="usuario:senha"
```

### **Inspecionar Tráfego**

Acesse `http://127.0.0.1:4040` no navegador para ver todas as requisições.

---

## ⚠️ Limitações da Versão Gratuita

- URL muda a cada reinício do ngrok
- Limite de conexões simultâneas
- Banner do ngrok pode aparecer (pode ser removido com conta paga)

---

## 🔄 Alternativas ao ngrok

### **1. localtunnel**
```bash
npm install -g localtunnel
lt --port 3000
```

### **2. Cloudflare Tunnel**
```bash
cloudflared tunnel --url http://localhost:3000
```

### **3. Configurar HTTPS Local (Mais Complexo)**

Requer configuração de certificados SSL locais com `mkcert`.

---

## 📝 Checklist

- [ ] ngrok instalado
- [ ] Servidor Next.js rodando (`npm run dev`)
- [ ] ngrok rodando (`ngrok http 3000`)
- [ ] URL HTTPS copiada
- [ ] Acessado no celular via URL HTTPS
- [ ] Permissão de câmera concedida no navegador do celular

---

## 🐛 Troubleshooting

### **Câmera ainda não funciona**
1. Verifique se está usando a URL **HTTPS** (não HTTP)
2. Verifique permissões de câmera no navegador do celular
3. Tente em outro navegador (Chrome, Safari, Firefox)
4. Reinicie o ngrok e o servidor Next.js

### **ngrok não inicia**
1. Verifique se a porta 3000 está livre
2. Verifique se o servidor Next.js está rodando
3. Tente outra porta: `ngrok http 3001` (e ajuste Next.js)

### **URL muda constantemente**
- Use conta ngrok Pro para URL fixa
- Ou use alternativas como localtunnel

---

**Versão**: 1.0  
**Data**: Janeiro 2024
