---
name: uazapi
description: Referência completa da API REST da UAZAPI. Use quando precisar chamar endpoints diretamente, entender autenticação, fluxo de setup, bodies de requisição, ou para construir agentes/integrações n8n e Python.
---

# UAZAPI API Reference

## Autenticação

```
token: {token_instancia}        # todas as operações de instância
admintoken: {token_admin}       # operações administrativas (marcadas com [admin])
Content-Type: application/json
```

URL base: `https://{subdomain}.uazapi.com`
- `free` — plano gratuito
- `api` — plano pago

## Fluxo de setup (obrigatório)

Nova instância deve seguir esta ordem antes de qualquer envio:

```
POST /instance/create  →  POST /instance/connect  →  usuário escaneia QR  →  GET /instance/status  →  pronto
```

---

## Envio de mensagens

| Método | Endpoint | Body |
|--------|----------|------|
| POST | `/send/text` | `{number, text, linkPreview?, replyid?, mentions?, delay?, async?, readchat?}` |
| POST | `/send/media` | `{number, type, file, text?, docName?, thumbnail?, mimetype?, replyid?, delay?, async?, viewOnce?}` |
| POST | `/send/location` | `{number, latitude, longitude, name?, address?, replyid?, delay?}` |
| POST | `/send/contact` | `{number, fullName, phoneNumber, organization?, email?, url?, replyid?}` |
| POST | `/send/menu` | `{number, type, text, choices[], footerText?, listButton?, replyid?, delay?}` |
| POST | `/send/carousel` | `{number, text, carousel[], replyid?, delay?}` |
| POST | `/send/status` | `{type, text?, background_color?, font?, file?}` |
| POST | `/send/pix-button` | `{number, pixType, pixKey, pixName?, replyid?, delay?}` |
| POST | `/send/location-button` | `{number, text, replyid?}` |
| POST | `/send/request-payment` | `{number, amount, title?, text?, footer?, itemName?, invoiceNumber?, pixKey?, pixType?, pixName?, paymentLink?}` |

**Tipos de mídia** (`type` em `/send/media`): `image` · `video` (MP4) · `document` · `audio` · `ptt` (voz) · `ptv` (vídeo-msg) · `sticker` · `myaudio`

**Tipos de menu** (`type` em `/send/menu`): `button` · `list` · `poll` · `carousel`

**`viewOnce`** — disponível em `/send/media` para tipos `image`, `video` e `audio`. A mídia some após ser visualizada uma vez pelo destinatário.

**Parâmetros comuns de envio:**
- `delay` — ms antes de enviar, exibe "digitando..."
- `replyid` — ID da mensagem para responder
- `mentions` — números separados por vírgula para mencionar
- `readchat` — marca conversa como lida ao enviar
- `async` — envia de forma assíncrona (fila)

---

## Instância

| Método | Endpoint | Body / Obs |
|--------|----------|-----------|
| GET | `/instance/status` | — |
| POST | `/instance/connect` | `{phone?}` — omitir `phone` retorna QR base64; informar para código de pareamento |
| POST | `/instance/disconnect` | — |
| POST | `/instance/create` | `{name, systemName?, adminField01?, adminField02?}` **[admin]** |
| DELETE | `/instance` | — deleta a instância |
| POST | `/instance/reset` | — |
| POST | `/instance/presence` | `{presence: "available" \| "unavailable"}` |
| GET | `/instance/privacy` | — |
| POST | `/instance/privacy` | `{groupadd?, last?, status?, profile?, readreceipts?, online?}` — valores: `all`, `contacts`, `contact_blacklist`, `none` |
| POST | `/instance/updateInstanceName` | `{name}` |
| POST | `/instance/updateDelaySettings` | `{msg_delay_min, msg_delay_max}` — ms |
| GET | `/instance/proxy` | — |
| POST | `/instance/proxy` | `{enable: bool, proxy_url?}` |
| DELETE | `/instance/proxy` | — |
| GET | `/instance/wa_messages_limits` | — verifica limitações ativas de envio no número conectado |
| GET | `/instance/all` | — **[admin]** |

**`/instance/wa_messages_limits`** — útil antes de campanhas ou para diagnosticar erros de envio. Retorna limitações como `new_chat_message_capping` (limite de novas conversas), `reachout_timelock` (bloqueio temporário de alcance) e situações associadas ao `provider_code: 463`.

---

## Mensagens

| Método | Endpoint | Body |
|--------|----------|------|
| POST | `/message/find` | `{chatid?, id?, track_source?, track_id?, limit?, offset?}` |
| POST | `/message/delete` | `{id}` |
| POST | `/message/download` | `{id, return_base64?, generate_mp3?, return_link?, transcribe?, openai_apikey?, download_quoted?}` |
| POST | `/message/edit` | `{id, text}` |
| POST | `/message/react` | `{number, id, text}` — `text` é o emoji; vazio remove a reação |
| POST | `/message/markread` | `{id}` — array de IDs |
| POST | `/message/presence` | `{number, presence, delay?}` — `presence`: `composing`, `recording`, `paused` |
| GET | `/message/async` | — lista fila assíncrona |
| DELETE | `/message/async` | — limpa fila assíncrona |
| POST | `/message/pin` | `{id, duration}` — `duration` em dias: `1`, `7` ou `30`; use `0` para desafixar |

---

## Grupos

| Método | Endpoint | Body |
|--------|----------|------|
| GET | `/group/list` | — |
| POST | `/group/list` | `{getParticipants: true}` — inclui lista de membros |
| POST | `/group/info` | `{groupJid, getParticipants?}` |
| POST | `/group/create` | `{name, participants[]}` |
| POST | `/group/join` | `{inviteCode}` — código ou link completo |
| POST | `/group/leave` | `{groupJid}` |
| POST | `/group/inviteInfo` | `{inviteCode}` — info do link sem entrar |
| POST | `/group/resetInviteCode` | `{groupJid}` |
| POST | `/group/updateName` | `{groupJid, name}` |
| POST | `/group/updateDescription` | `{groupJid, description}` |
| POST | `/group/updateImage` | `{groupJid, image}` — URL ou base64 |
| POST | `/group/updateParticipants` | `{groupJid, action, participants[]}` — `action`: `add`, `remove`, `promote`, `demote` |
| POST | `/group/updateAnnounce` | `{groupJid, announce: bool}` — `true` = só admins enviam |
| POST | `/group/updateLocked` | `{groupJid, locked: bool}` — `true` = só admins editam info |

---

## Contatos

| Método | Endpoint | Body |
|--------|----------|------|
| GET | `/contacts` | — lista todos |
| POST | `/contacts/list` | `{limit?, offset?, name?, wa_chatid?}` — filtros |
| POST | `/contact/add` | `{numbers[]}` |
| POST | `/contact/remove` | `{numbers[]}` |

---

## Chat

| Método | Endpoint | Body |
|--------|----------|------|
| POST | `/chat/find` | `{limit?, offset?, sort?, wa_chatid?, name?, wa_isGroup?, wa_archived?, wa_isPinned?, wa_isBlocked?, wa_label?, lead_status?}` |
| POST | `/chat/details` | `{number, preview?}` |
| POST | `/chat/archive` | `{number, archive: bool}` |
| POST | `/chat/block` | `{number, block: bool}` |
| GET | `/chat/blocklist` | — |
| POST | `/chat/delete` | `{number, deleteChatDB?, deleteMessagesDB?, deleteChatWhatsApp?, clearChatWhatsApp?}` |
| POST | `/chat/mute` | `{number, muteEndTime}` — `0` = desmutar, `-1` = sempre |
| POST | `/chat/pin` | `{number, pin: bool}` |
| POST | `/chat/read` | `{number, read: bool}` |
| POST | `/chat/labels` | `{number, labelids?[], add_labelid?, remove_labelid?}` |
| POST | `/chat/check` | `{numbers[]}` — verifica quais números estão no WhatsApp |
| POST | `/chat/editLead` | `{id, lead_name?, lead_email?, lead_status?, lead_notes?, lead_tags?}` |

---

## Webhook

| Método | Endpoint | Body / Obs |
|--------|----------|-----------|
| GET | `/webhook` | — config atual |
| POST | `/webhook` | `{url, events[], enabled?, addUrlEvents?, addUrlTypesMessages?, excludeMessages?}` |
| GET | `/webhook/errors` | — |
| GET | `/globalwebhook` | — **[admin]** |
| POST | `/globalwebhook` | `{url, events[], enabled?}` **[admin]** |
| GET | `/globalwebhook/errors` | — **[admin]** |

**Eventos disponíveis:** `messages` · `connection` · `presence` · `group` · `chat` · `poll` · `label`

---

## Perfil

| Método | Endpoint | Body |
|--------|----------|------|
| POST | `/profile/image` | `{image}` — URL ou base64 |
| POST | `/profile/name` | `{name}` |

---

## Newsletter (Canais)

| Método | Endpoint | Body |
|--------|----------|------|
| GET | `/newsletter/list` | — |
| POST | `/newsletter/info` | `{newsletterJid}` |
| POST | `/newsletter/create` | `{name, description?}` |
| POST | `/newsletter/delete` | `{newsletterJid}` |
| POST | `/newsletter/follow` | `{newsletterJid}` |
| POST | `/newsletter/unfollow` | `{newsletterJid}` |
| POST | `/newsletter/mute` | `{newsletterJid}` |
| POST | `/newsletter/unmute` | `{newsletterJid}` |
| POST | `/newsletter/messages` | `{newsletterJid, count?}` |
| POST | `/newsletter/search` | `{query}` |
| POST | `/newsletter/name` | `{newsletterJid, name}` |
| POST | `/newsletter/description` | `{newsletterJid, description}` |
| POST | `/newsletter/picture` | `{newsletterJid, image}` |

---

## Business / Catálogo

| Método | Endpoint | Body |
|--------|----------|------|
| POST | `/business/get/profile` | `{number?}` — omitir retorna o próprio perfil |
| POST | `/business/update/profile` | `{description?, address?, email?, website?, category?}` |
| GET | `/business/get/categories` | — lista categorias disponíveis |
| POST | `/business/catalog/list` | `{number?, limit?, offset?}` |
| POST | `/business/catalog/info` | `{productId, number?}` |
| POST | `/business/catalog/hide` | `{productIds[]}` |
| POST | `/business/catalog/show` | `{productIds[]}` |
| POST | `/business/catalog/delete` | `{productIds[]}` |

---

## Sender (Envio em Massa)

| Método | Endpoint | Body |
|--------|----------|------|
| POST | `/sender/simple` | `{numbers[], message{}, name?}` — `message` é o objeto de mensagem padrão |
| POST | `/sender/advanced` | `{...config completo}` — configuração avançada de campanha |
| POST | `/sender/listmessages` | `{id, limit?, offset?}` — mensagens de um job |
| GET | `/sender/listfolders` | — lista jobs/pastas |
| DELETE | `/sender/clearall` | — remove todos os jobs |
| POST | `/sender/cleardone` | — remove apenas jobs concluídos |

---

## Labels

| Método | Endpoint | Body |
|--------|----------|------|
| GET | `/labels` | — lista todas as etiquetas |
| POST | `/label/edit` | `{name, color?, id?}` — omitir `id` cria nova; informar `id` edita existente |

---

## Admin

| Método | Endpoint | Obs |
|--------|----------|-----|
| POST | `/admin/restart` | Reinicia o servidor UAZAPI **[admin]** |

---

## Formato do número

`{código_país}{DDD}{número}` — sem `+`, espaços ou traços

Brasil: `5511999999999` (55 = país · 11 = DDD · 9 dígitos)

## Códigos HTTP

`200` OK · `400` dados inválidos · `401` token inválido · `404` não encontrado · `429` limite de instâncias atingido · `500` erro interno
