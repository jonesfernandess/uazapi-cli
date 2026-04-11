# Referência UAZAPI - Quick Reference

## Headers
```
token: {token_instancia}
admintoken: {token_admin}  # opcional, para operações admin
Content-Type: application/json
```

## URL Base
```
https://{subdomain}.uazapi.com
```
- `subdomain`: `free` ou `api`

## Quick Commands

### Criar e conectar instância
```bash
# Criar
POST /instance/create → {"name": "minha-instancia"}

# Conectar (obter QR)
GET /instance/connect?name=minha-instancia

# Conectar com QR code
POST /instance/connect → {"name": "minha-instancia", "qrcode": "base64"}
```

### Enviar mensagem mais comum
```bash
POST /send/text
{
  "number": "5511999999999",
  "text": "Olá!",
  "delay": 1000
}
```

### Enviar mídia
```bash
POST /send/media
{
  "number": "5511999999999",
  "type": "image|video|audio|document",
  "file": "https://...",
  "text": "caption"
}
```

### Criar grupo
```bash
POST /group/create
{
  "name": "instancia",
  "groupName": "Nome do Grupo",
  "participants": ["5511999999999"]
}
```

## Estados de Resposta

| Código | Significado |
|--------|-------------|
| 200 | Sucesso |
| 400 | Erro nos dados enviados |
| 401 | Token inválido |
| 404 | Recurso não encontrado |
| 429 | Limite atingido (muitas instâncias) |
| 500 | Erro interno |

## Webhooks - Eventos Disponíveis
- `message` - Nova mensagem
- `presence` - Presença alterada
- `group` - Eventos de grupo
- `chat` - Eventos de chat
- `instance` - Status da instância
- `poll` - Enquetes
- `label` - Etiquetas

## Número de Telefone
- Formato: código país + DDD + número
- Exemplo Brasil: `5511999999999` (55 = Brasil, 11 = DDD São Paulo)
- Sem + no início, sem parênteses, sem traço

## Reações Disponíveis
Emojis: `😀 😍 😢 😡 👏 🙏 ❤️ 🔥 ✅ ❌ 🎉`