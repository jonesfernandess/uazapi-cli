---
name: uazapi
description: Envia mensagens, gerencia instâncias, grupos, contatos e webhooks do WhatsApp via UAZAPI. Use para automação de WhatsApp com envio de texto, mídia, áudio, vídeo, localização, botões interativos, PIX, grupos e mais.
---

# UAZAPI Skill

Esta skill fornece instruções para usar a API da UAZAPI (https://uazapi.com) para automação de WhatsApp.

## Autenticação

- **Token de instância**: Header `token` com o token da sua instância
- **Token admin**: Header `admintoken` para operações administrativas
- **URL base**: `https://{subdomain}.uazapi.com` (subdomain: `free` ou `api`)

## Endpoints Principais

### Enviar Mensagens

| Endpoint | Descrição | Corpo (JSON) |
|----------|-----------|--------------|
| `POST /send/text` | Enviar texto | `{"number": "5511999999999", "text": "Olá!"}` |
| `POST /send/media` | Enviar mídia (imagem, vídeo, áudio, documento) | `{"number": "5511999999999", "type": "video", "file": "URL", "text": "legenda"}` |
| `POST /send/contact` | Enviar contato vCard | `{"number": "5511999999999", "contact": "vCard string"}` |
| `POST /send/location` | Enviar localização | `{"number": "5511999999999", "latitude": -23.55, "longitude": -46.63, "title": "Local"}` |
| `POST /send/menu` | Menu interativo (botões/lista) | `{"number": "5511999999999", "title": "Título", "button": [...], "list": [...], "msg": "Texto"}` |
| `POST /send/carousel` | Carrossel de mídia | `{"number": "5511999999999", "cards": [{"img": "url", "title": "t", "msg": "m", "buttons": [...]}]}` |
| `POST /send/status` | Postar story/status | `{"type": "text\|image\|video\|audio", "text": "msg", "background_color": 1, "font": 0}` |
| `POST /send/pix-button` | Botão de pagamento PIX | `{"number": "5511999999999", "key": "chave-pix", "amount": 49.90, "msg": "desc"}` |
| `POST /send/location-button` | Solicitar localização | `{"number": "5511999999999"}` |
| `POST /send/request-payment` | Solicitar pagamento | `{"number": "5511999999999", "amount": 100, "description": "desc"}` |

### Tipos de Mídia (para `/send/media`)

| type | Descrição |
|------|------------|
| `image` | Imagem (JPG preferencialmente) |
| `video` | Vídeo (apenas MP4) |
| `document` | Documento (PDF, DOCX, XLSX, etc) |
| `audio` | Áudio (MP3 ou OGG) |
| `ptt` | Mensagem de voz (Push-to-Talk) |
| `myaudio` | Áudio alternativo |
| `ptv` | Mensagem de vídeo |
| `sticker` | Figurinha |

### Parâmetros Comuns de Envio

| Parâmetro | Tipo | Descrição |
|-----------|------|------------|
| `number` | string | Número com código país (ex: 5511999999999) |
| `text` | string | Texto/caption da mensagem |
| `delay` | integer | Atraso em ms antes do envio (mostra "Digitando...") |
| `replyid` | string | ID da mensagem para responder |
| `mentions` | string | Números para mencionar (separados por vírgula) |
| `readchat` | boolean | Marcar conversa como lida |
| `forward` | boolean | Marcar como encaminhadas |

### Gerenciar Instância

| Endpoint | Descrição | Corpo |
|----------|-----------|-------|
| `POST /instance/create` | Criar instância | `{"name": "minha-instancia"}` |
| `GET /instance/connect` | Obter QR code | Query: `name=instancia` |
| `POST /instance/connect` | Conectar instância | `{"name": "instancia", "qrcode": "base64"}` |
| `POST /instance/disconnect` | Desconectar | `{"name": "instancia"}` |
| `GET /instance/status` | Ver status | Query: `name=instancia` |
| `POST /instance/reset` | Resetar instância | `{"name": "instancia"}` |
| `POST /instance/privacy` | Atualizar privacidade | `{"name": "instancia", "readreceipts": "all", "status": "all", ...}` |
| `POST /instance/presence` | Atualizar presença | `{"name": "instancia", "presence": "available"}` |
| `GET /instance/all` | Listar todas instâncias | - |

### Mensagens

| Endpoint | Descrição | Corpo |
|----------|-----------|-------|
| `GET /message/find` | Buscar mensagens | Query: `name=instancia&search=termo` |
| `POST /message/delete` | Deletar mensagem | `{"name": "instancia", "id": "messageId"}` |
| `POST /message/react` | Reagir à mensagem | `{"name": "instancia", "id": "msgId", "reaction": "😊"}` |
| `POST /message/edit` | Editar mensagem | `{"name": "instancia", "id": "msgId", "text": "novo texto"}` |
| `POST /message/markread` | Marcar como lido | `{"name": "instancia", "id": "msgId"}` |
| `GET /message/download` | Baixar mídia | Query: `id=messageId` |

### Grupos

| Endpoint | Descrição | Corpo |
|----------|-----------|-------|
| `POST /group/create` | Criar grupo | `{"name": "Grupo", "participants": ["5511999999999"]}` |
| `POST /group/join` | Entrar via invite code | `{"inviteCode": "código"}` |
| `POST /group/leave` | Sair do grupo | `{"name": "instancia", "groupJid": "jid@g.us"}` |
| `GET /group/list` | Listar grupos | Query: `name=instancia` |
| `GET /group/info` | Info do grupo | Query: `name=instancia&groupJid=jid@g.us` |
| `POST /group/updateParticipants` | Adicionar/remover membros | `{"name": "instancia", "groupJid": "jid@g.us", "action": "add\|remove", "participants": [...]}` |
| `POST /group/updateName` | Renomear grupo | `{"name": "instancia", "groupJid": "jid@g.us", "subject": "Novo Nome"}` |
| `POST /group/updateDescription` | Atualizar descrição | `{"name": "instancia", "groupJid": "jid@g.us", "description": "desc"}` |
| `POST /group/updateImage` | Atualizar foto | `{"name": "instancia", "groupJid": "jid@g.us", "image": "url"}` |

### Contatos

| Endpoint | Descrição | Corpo |
|----------|-----------|-------|
| `GET /contact/list` | Listar contatos | Query: `name=instancia` |
| `GET /contact/info` | Info do contato | Query: `name=instancia&number=5511999999999` |
| `POST /contact/update` | Atualizar contato | `{"name": "instancia", "number": "...", "pushname": "nome"}` |

### Webhooks

| Endpoint | Descrição | Corpo |
|----------|-----------|-------|
| `GET /webhook/set` | Ver webhook | Query: `name=instancia` |
| `POST /webhook/set` | Configurar webhook | `{"name": "instancia", "url": "https://...", "events": ["message", "presence"]}` |

### Perfil

| Endpoint | Descrição | Corpo |
|----------|-----------|-------|
| `POST /profile/name` | Alterar nome | `{"name": "instancia", "pushname": "Novo Nome"}` |
| `POST /profile/image` | Alterar foto | `{"name": "instancia", "image": "url"}` |
| `GET /profile` | Ver perfil | Query: `name=instancia` |

### Newsletter/Canais

| Endpoint | Descrição | Corpo |
|----------|-----------|-------|
| `GET /newsletter/list` | Listar canais | Query: `name=instancia` |
| `GET /newsletter/info` | Info do canal | Query: `name=instancia&jid=id@newsletter` |
| `POST /newsletter/follow` | Seguir canal | `{"name": "instancia", "jid": "id@newsletter"}` |
| `POST /newsletter/unfollow` | Deixar canal | `{"name": "instancia", "jid": "id@newsletter"}` |
| `POST /newsletter/send` | Enviar para canal | `{"name": "instancia", "jid": "id@newsletter", "message": {"type": "text", "content": "msg"}}` |

### Chat

| Endpoint | Descrição | Corpo |
|----------|-----------|-------|
| `GET /chat/list` | Listar conversas | Query: `name=instancia` |
| `GET /chat/find` | Buscar chat | Query: `name=instancia&search=termo` |
| `POST /chat/archive` | Arquivar chat | `{"name": "instancia", "id": "chatId", "archive": true}` |
| `POST /chat/mute` | Silenciar chat | `{"name": "instancia", "id": "chatId", "mute": -1}` |
| `POST /chat/pin` | Fixar chat | `{"name": "instancia", "id": "chatId", "pin": true}` |
| `POST /chat/delete` | Deletar chat | `{"name": "instancia", "id": "chatId"}` |
| `POST /chat/block` | Bloquear contato | `{"name": "instancia", "number": "5511999999999"}` |

### Business/Catálogo

| Endpoint | Descrição |
|----------|-----------|
| `GET /business/profile` | Ver perfil business |
| `POST /business/profile` | Atualizar perfil |
| `GET /business/catalog` | Listar catálogo |
| `POST /business/catalog` | Criar produto no catálogo |

## Exemplos de Uso

### Enviar vídeo com legenda
```bash
curl -X POST https://api.uazapi.com/send/media \
  -H "Content-Type: application/json" \
  -H "token: SEU_TOKEN" \
  -d '{"number": "5511999999999", "type": "video", "file": "https://exemplo.com/video.mp4", "text": "Assista agora!"}'
```

### Criar grupo com participantes
```bash
curl -X POST https://api.uazapi.com/group/create \
  -H "Content-Type: application/json" \
  -H "token: SEU_TOKEN" \
  -d '{"name": "minha-instancia", "groupName": "Minha Equipe", "participants": ["5511999999999", "5511888888888"]}'
```

### Enviar mensagem com delay e marcar como lida
```bash
curl -X POST https://api.uazapi.com/send/text \
  -H "Content-Type: application/json" \
  -H "token: SEU_TOKEN" \
  -d '{"number": "5511999999999", "text": "Olá!", "delay": 2000, "readchat": true}'
```

## CLI (uazapi-cli)

Para usar via CLI (se instalado):
```bash
uazapi send media --number 5511999999999 --type video --file https://exemplo.com/video.mp4 --caption "Assista"
```