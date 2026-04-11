---
name: uazapi
description: "Use para qualquer tarefa com WhatsApp via UAZAPI: enviar mensagem de texto, imagem, vídeo, áudio, documento, localização, contato, botões, menu interativo, PIX, carrossel, story, viewOnce; gerenciar instância, grupos, contatos, chats, webhooks, etiquetas, newsletters, catálogo business, envio em massa. Referência completa de endpoints REST com bodies e exemplos."
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

---

## Formatos de ID — CRÍTICO

Errar o formato causa falha silenciosa. Use a tabela abaixo como referência:

| Campo | Formato | Exemplo |
|-------|---------|---------|
| `number` (envio/chat) | só dígitos, sem `+` | `555193667706` |
| `chatid` (indivíduo) | `{number}@s.whatsapp.net` | `555193667706@s.whatsapp.net` |
| `groupJid` / `chatid` (grupo) | `{id}@g.us` | `120363425061733477@g.us` |
| `id` de mensagem (para pin, react, delete) | `{owner}:{messageid}` | `554796187355:3EB07EB7F6267D2CE0DD3D` |
| `messageid` | só o ID curto | `3EB07EB7F6267D2CE0DD3D` |
| `newsletterJid` | `{id}@newsletter` | `120363400000000001@newsletter` |

> **Regra prática:** campos `number` = dígitos puros. Campos `chatid`, `groupJid`, `newsletterJid` = com sufixo `@`.
> O `id` completo de mensagem vem no campo `id` da resposta (não `messageid`).

---

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
| POST | `/send/menu` | ver exemplos abaixo |
| POST | `/send/carousel` | ver exemplos abaixo |
| POST | `/send/status` | `{type, text?, background_color?, font?, file?}` |
| POST | `/send/pix-button` | `{number, pixType, pixKey, pixName?, replyid?, delay?}` |
| POST | `/send/location-button` | `{number, text, replyid?}` |
| POST | `/send/request-payment` | `{number, amount, title?, text?, footer?, itemName?, invoiceNumber?, pixKey?, pixType?, pixName?, paymentLink?}` |

**Tipos de mídia** (`type` em `/send/media`): `image` · `video` (MP4) · `document` · `audio` · `ptt` (voz) · `ptv` (vídeo-msg) · `sticker` · `myaudio`

**`viewOnce`** — boolean, disponível para tipos `image`, `video` e `audio`. A mídia desaparece após ser visualizada uma vez.

**Parâmetros comuns:**
- `delay` — ms antes de enviar, exibe "digitando..."
- `replyid` — `id` completo da mensagem para citar (`owner:messageid`)
- `mentions` — números separados por vírgula para mencionar
- `readchat` — marca conversa como lida ao enviar
- `async` — envia de forma assíncrona (fila)

### Exemplos: `/send/menu`

**Botões** (`type: "button"`)
```json
{
  "number": "555193667706",
  "type": "button",
  "text": "Escolha uma opção:",
  "choices": [
    {"id": "1", "text": "Opção A"},
    {"id": "2", "text": "Opção B"},
    {"id": "3", "text": "Opção C"}
  ],
  "footerText": "Rodapé opcional"
}
```

**Lista** (`type: "list"`)
```json
{
  "number": "555193667706",
  "type": "list",
  "text": "Selecione um item:",
  "listButton": "Ver opções",
  "choices": [
    {"id": "1", "text": "Item 1", "description": "Descrição opcional"},
    {"id": "2", "text": "Item 2"}
  ]
}
```

**Enquete** (`type: "poll"`)
```json
{
  "number": "555193667706",
  "type": "poll",
  "text": "Qual você prefere?",
  "choices": ["Opção A", "Opção B", "Opção C"]
}
```

### Exemplo: `/send/carousel`

```json
{
  "number": "555193667706",
  "text": "Confira os produtos:",
  "carousel": [
    {
      "img": "https://exemplo.com/produto1.jpg",
      "title": "Produto 1",
      "msg": "Descrição do produto",
      "buttons": [{"id": "btn1", "text": "Comprar"}]
    },
    {
      "img": "https://exemplo.com/produto2.jpg",
      "title": "Produto 2",
      "msg": "Outra descrição",
      "buttons": [{"id": "btn2", "text": "Ver mais"}]
    }
  ]
}
```

---

## Instância

| Método | Endpoint | Body / Obs |
|--------|----------|-----------|
| GET | `/instance/status` | — |
| POST | `/instance/connect` | `{phone?}` — omitir `phone` retorna QR base64; informar número para código de pareamento |
| POST | `/instance/disconnect` | — |
| POST | `/instance/create` | `{name, systemName?, adminField01?, adminField02?}` **[admin]** |
| DELETE | `/instance` | — deleta a instância permanentemente |
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

**`/instance/wa_messages_limits`** — use antes de campanhas ou para diagnosticar erros. Retorna:
- `can_send_new_messages` — boolean geral
- `new_chat_message_capping` — cota de novas conversas (`total_quota: -1` = ilimitado)
- `reachout_timelock` — bloqueio temporário de alcance (`active: false` = sem bloqueio)
- Situações associadas ao erro `provider_code: 463`

---

## Mensagens

| Método | Endpoint | Body |
|--------|----------|------|
| POST | `/message/find` | `{chatid?, id?, track_source?, track_id?, limit?, offset?}` |
| POST | `/message/delete` | `{id}` — `id` completo (`owner:messageid`) |
| POST | `/message/download` | `{id, return_base64?, generate_mp3?, return_link?, transcribe?, openai_apikey?, download_quoted?}` |
| POST | `/message/edit` | `{id, text}` |
| POST | `/message/react` | `{number, id, text}` — `text` é o emoji; string vazia remove a reação |
| POST | `/message/markread` | `{id: []}` — array de IDs completos |
| POST | `/message/presence` | `{number, presence, delay?}` — `presence`: `composing`, `recording`, `paused` |
| POST | `/message/pin` | `{id, duration}` — `duration` em dias: `1`, `7` ou `30`; use `0` para desafixar |
| GET | `/message/async` | — lista fila assíncrona |
| DELETE | `/message/async` | — limpa fila assíncrona |

> Em `/message/find`, o campo `id` da resposta é o ID completo (`owner:messageid`) — use este para `delete`, `react`, `pin`, `edit`.

---

## Grupos

| Método | Endpoint | Body |
|--------|----------|------|
| GET | `/group/list` | — |
| POST | `/group/list` | `{getParticipants: true}` — inclui lista de membros |
| POST | `/group/info` | `{groupJid, getParticipants?}` |
| POST | `/group/create` | `{name, participants[]}` — `participants`: array de números (dígitos, sem `@`) |
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
| POST | `/contacts/list` | `{limit?, offset?, name?, wa_chatid?}` — `wa_chatid` usa formato JID (`@s.whatsapp.net`) |
| POST | `/contact/add` | `{numbers[]}` — array de dígitos puros |
| POST | `/contact/remove` | `{numbers[]}` — array de dígitos puros |

---

## Chat

| Método | Endpoint | Body |
|--------|----------|------|
| POST | `/chat/find` | `{limit?, offset?, sort?, wa_chatid?, name?, wa_isGroup?, wa_archived?, wa_isPinned?, wa_isBlocked?, wa_label?, lead_status?}` |
| POST | `/chat/details` | `{number, preview?}` — `number` em dígitos; retorna `wa_chatid` no formato JID |
| POST | `/chat/archive` | `{number, archive: bool}` |
| POST | `/chat/block` | `{number, block: bool}` |
| GET | `/chat/blocklist` | — |
| POST | `/chat/delete` | `{number, deleteChatDB?, deleteMessagesDB?, deleteChatWhatsApp?, clearChatWhatsApp?}` |
| POST | `/chat/mute` | `{number, muteEndTime}` — `0` = desmutar, `-1` = sempre |
| POST | `/chat/pin` | `{number, pin: bool}` |
| POST | `/chat/read` | `{number, read: bool}` |
| POST | `/chat/labels` | `{number, labelids?[], add_labelid?, remove_labelid?}` |
| POST | `/chat/check` | `{numbers[]}` — dígitos puros; verifica quais estão no WhatsApp |
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
| POST | `/sender/simple` | `{numbers[], message{}, name?}` — ver exemplo abaixo |
| POST | `/sender/advanced` | `{...}` — configuração completa de campanha (múltiplos tipos de mensagem, delays, agendamento) |
| POST | `/sender/listmessages` | `{id, limit?, offset?}` — mensagens de um job |
| GET | `/sender/listfolders` | — lista jobs/pastas |
| DELETE | `/sender/clearall` | — remove todos os jobs |
| POST | `/sender/cleardone` | — remove apenas jobs concluídos |

### Exemplo: `/sender/simple`

O campo `message` segue a mesma estrutura dos endpoints `/send/*`:

```json
{
  "numbers": ["555193667706", "5511999999999"],
  "name": "Campanha Maio",
  "message": {
    "type": "text",
    "text": "Olá! Esta é uma mensagem em massa."
  }
}
```

Para mídia em massa:
```json
{
  "numbers": ["555193667706"],
  "message": {
    "type": "image",
    "file": "https://exemplo.com/imagem.jpg",
    "text": "Legenda da imagem"
  }
}
```

---

## Labels (Etiquetas)

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

Brasil: `555193667706` (55 = país · 51 = DDD · 9 dígitos)

## Códigos HTTP

`200` OK · `400` dados inválidos · `401` token inválido · `404` não encontrado · `429` limite de instâncias atingido · `500` erro interno
