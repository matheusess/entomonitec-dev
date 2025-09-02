# 🌍 Configuração de APIs de Geocoding

## 📋 Visão Geral

O sistema agora suporta múltiplas APIs de geocoding para melhor localização de bairros e endereços:

1. **Nominatim (OpenStreetMap)** - Padrão, gratuito
2. **MapBox** - Fallback, mais preciso, gratuito até 100k req/mês
3. **Google Maps** - Futuro, máxima precisão (pago)

## 🚀 Configuração

### 1. MapBox (Recomendado)

**Passo 1:** Criar conta em [MapBox](https://account.mapbox.com/)

**Passo 2:** Obter Access Token
- Acesse: https://account.mapbox.com/access-tokens/
- Copie o token público (pk.*)

**Passo 3:** Configurar no ambiente
```bash
# Adicionar ao .env.local
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6ImNsZXhhbXBsZSJ9.yourtokenhere
```

### 2. Google Maps (Opcional - Futuro)

**Passo 1:** Criar projeto no [Google Cloud Console](https://console.cloud.google.com/)

**Passo 2:** Habilitar APIs
- Geocoding API
- Maps JavaScript API

**Passo 3:** Criar chave de API
- Credenciais → Criar credenciais → Chave de API

**Passo 4:** Configurar no ambiente
```bash
# Adicionar ao .env.local
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyYourGoogleMapsKeyHere
```

## 🔄 Como Funciona

### Fluxo de Fallback

1. **Primeira tentativa:** Nominatim (OpenStreetMap)
   - Gratuito
   - Boa para cidades grandes
   - Limitado para cidades pequenas

2. **Segunda tentativa:** MapBox (se configurado)
   - Mais preciso
   - Melhor para cidades pequenas
   - Gratuito até 100k requisições/mês

3. **Terceira tentativa:** Google Maps (futuro)
   - Máxima precisão
   - Pago, mas com créditos gratuitos

### Exemplo de Uso

```typescript
import { geocodingService } from '@/services/geocodingService';

// Buscar coordenadas de um endereço
const coords = await geocodingService.getCoordinatesFromAddress('Vila Nova, Quatro Barras, PR');

// Buscar endereço de coordenadas
const address = await geocodingService.getAddressFromCoordinates(-25.3692, -49.1024);
```

## 📊 Comparação das APIs

| API | Precisão | Custo | Limite | Cidades Pequenas |
|-----|----------|-------|--------|------------------|
| Nominatim | ⭐⭐⭐ | Gratuito | Sem limite | ⭐⭐ |
| MapBox | ⭐⭐⭐⭐ | Gratuito* | 100k/mês | ⭐⭐⭐⭐ |
| Google Maps | ⭐⭐⭐⭐⭐ | Pago | 40k/mês | ⭐⭐⭐⭐⭐ |

*Gratuito até 100.000 requisições por mês

## 🧪 Testando as APIs

Execute o script de teste:

```bash
cd scripts
node test-geocoding-apis.js
```

## 🔧 Solução de Problemas

### MapBox não funciona
- Verificar se o token está correto
- Verificar se a API está habilitada
- Verificar limites de uso

### Nominatim muito lento
- Normal para cidades pequenas
- MapBox é mais rápido como fallback

### Coordenadas incorretas
- Verificar se o endereço está completo
- Incluir cidade e estado
- Testar com diferentes formatos

## 📝 Logs de Debug

O sistema mostra logs detalhados no console:

```
🔍 Buscando coordenadas para: Vila Nova, Quatro Barras, PR
✅ Coordenadas encontradas via Nominatim: -25.3700, -49.1000
```

ou

```
⚠️ Nominatim falhou, tentando MapBox: Error message
✅ Coordenadas encontradas via MapBox: -25.3700, -49.1000
```

## 🎯 Resultado Esperado

Com MapBox configurado, o sistema deve conseguir localizar:
- ✅ Centro de Quatro Barras
- ✅ Vila Nova, Quatro Barras
- ✅ Jardim das Flores, Quatro Barras
- ✅ Bairro Industrial, Quatro Barras
- ✅ E outros bairros específicos

## 🔮 Próximos Passos

1. **Configurar MapBox** para melhor precisão
2. **Implementar Google Maps** para máxima precisão
3. **Adicionar cache inteligente** para reduzir chamadas
4. **Implementar geocoding offline** para casos críticos
