---
name: uazapi
description: Referência da API REST da UAZAPI. Use quando precisar chamar endpoints diretamente, entender autenticação, fluxo de setup de instância, ou eventos de webhook.
---

# UAZAPI API Reference

## Autenticação

```
token: {token_instancia}        # operações na instância
admintoken: {token_admin}       # operações administrativas
Content-Type: application/json
```

URL base: `https://{subdomain}.uazapi.com`
- `free` — plano gratuito
- `api` — plano pago

## Fluxo de setup (obrigatório)

Nova instância deve seguir esta ordem:

```
POST /instance/create  →  GET /instance/connect (QR)  →  usuário escaneia  →  GET /instance/status  →  pronto
```

## Envio de mensagens

| Endpoint | Body mínimo |
|---|---|
| `POST /send/text` | `{number, text}` |
| `POST /send/media` | `{number, type, file}` |
| `POST /send/location` | `{number, latitude, longitude}` |
| `POST /send/contact` | `{number, contact}` (vCard string) |
| `POST /send/menu` | `{number, msg, button[] ou list[]}` |
| `POST /send/carousel` | `{number, cards[]}` |
| `POST /send/status` | `{type, text}` — posta story |
| `POST /send/pix-button` | `{number, key, amount}` |
| `POST /send/location-button` | `{number}` |
| `POST /send/request-payment` | `{number, amount, description}` |

Parâmetros opcionais comuns: `delay` (ms, exibe "digitando..."), `replyid`, `mentions`, `readchat`, `forward`

Tipos válidos para `/send/media`: `image` · `video` (MP4) · `document` · `audio` · `ptt` (voz) · `ptv` (vídeo-mensagem) · `sticker` · `myaudio`

## Instância

| Endpoint | Método | Body / Query |
|---|---|---|
| `/instance/create` | POST | `{name}` |
| `/instance/connect` | GET | `?name=` → retorna QR base64 |
| `/instance/status` | GET | `?name=` |
| `/instance/disconnect` | POST | `{name}` |
| `/instance/reset` | POST | `{name}` |
| `/instance/all` | GET | — (requer admintoken) |
| `/instance/privacy` | POST | `{name, readreceipts, status, profile, groups, online}` |
| `/instance/presence` | POST | `{name, presence: "available\|unavailable"}` |

## Outros recursos

**Mensagens**: `GET /message/find?search=` · `POST /message/delete {id}` · `POST /message/react {id, reaction}` · `POST /message/edit {id, text}` · `GET /message/download?id=`

**Grupos**: `POST /group/create {name, participants[]}` · `GET /group/list?name=` · `POST /group/join {inviteCode}` · `POST /group/leave {groupJid}` · `POST /group/updateParticipants {groupJid, action: "add|remove", participants[]}`

**Contatos**: `GET /contact/list?name=` · `GET /contact/info?number=` · `POST /contact/update {number, pushname}`

**Chat**: `GET /chat/find?search=` · `POST /chat/archive {id, archive: bool}` · `POST /chat/block {number}` · `POST /chat/mute {id, mute: -1}` · `POST /chat/pin {id, pin: bool}` · `POST /chat/delete {id}`

**Webhook**: `GET /webhook/get?name=` · `POST /webhook/set {url, events[]}` · `GET /webhook/errors`

**Perfil**: `GET /profile?name=` · `POST /profile/name {pushname}` · `POST /profile/image {image}`

**Newsletter**: `GET /newsletter/list?name=` · `POST /newsletter/send {jid, message: {type, content}}` · `POST /newsletter/follow {jid}` · `POST /newsletter/unfollow {jid}`

**Business**: `GET /business/profile` · `POST /business/profile` · `GET /business/catalog` · `POST /business/catalog`

## Formato do número

`{código_país}{DDD}{número}` — sem `+`, espaços ou traços

Brasil: `5511999999999` (55 = país, 11 = DDD, 9 dígitos)

## Eventos de webhook

`message` · `presence` · `group` · `chat` · `instance` · `poll` · `label`

## Códigos HTTP

`200` OK · `400` dados inválidos · `401` token inválido · `404` não encontrado · `429` limite de instâncias atingido · `500` erro interno
