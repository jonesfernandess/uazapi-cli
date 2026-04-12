---
name: uazapi-api
description: UAZAPI REST API reference for building WhatsApp integrations and agents. Complete endpoint contracts — method, URL, headers, request body fields (types, required/optional, valid values), and response shapes. Enough to implement in any language or framework.
version: 1.0.0
author: Jones Fernandes
license: MIT
prerequisites:
  env_vars: [UAZAPI_TOKEN, UAZAPI_BASE_URL]
metadata:
  hermes:
    tags: [WhatsApp, UAZAPI, REST, API, Integration, Automation, Agents, Webhook]
---

# UAZAPI REST API — Integration Reference

Complete API contracts for building WhatsApp integrations. Covers authentication, endpoint contracts, request/response shapes, and critical rules.

## Base URL and Authentication

```
Base URL:  https://{subdomain}.uazapi.com
           subdomain = "api" (paid) or "free" (free plan)

All requests require headers:
  token: <instance_token>          ← all instance operations
  Content-Type: application/json

Admin endpoints use instead:
  admintoken: <admin_token>
```

## Discovering Endpoints

Use `uazapi search-docs` for full parameter details on any endpoint:

```bash
uazapi search-docs "webhook"          # keyword search
uazapi search-docs --list             # all available tags and guide sections
uazapi search-docs --section "Sender" # full section with details
uazapi search-docs "group" --pretty   # JSON output with full descriptions
```

---

## ID Formats — CRITICAL

Wrong format causes silent failures. Always use:

| Field | Format | Example |
|-------|--------|---------|
| `number` (send/chat) | digits only, no `+` | `555193667706` |
| `chatid` (individual) | `{number}@s.whatsapp.net` | `555193667706@s.whatsapp.net` |
| `groupJid` / `chatid` (group) | `{id}@g.us` | `120363425061733477@g.us` |
| message `id` (reply, react, delete) | `{owner}:{messageid}` | `554796187355:3EB07EB7F6267D2CE0DD3D` |
| `messageid` | short ID only | `3EB07EB7F6267D2CE0DD3D` |
| `newsletterJid` | `{id}@newsletter` | `120363400000000001@newsletter` |

**Number format:** `{country_code}{area_code}{number}` — no `+`, spaces, or dashes.
Brazil example: `555193667706` = country 55 + area 51 + 9-digit number.

---

## Instance Setup Flow

New instances must follow this order before any send:

```
POST /instance/create  →  POST /instance/connect  →  user scans QR  →  GET /instance/status  →  ready
```

1. `POST /instance/create` **[admintoken]** — creates instance, returns `token` (use as `UAZAPI_TOKEN` for all subsequent calls)
2. `POST /instance/connect` — returns `instance.qrcode` (base64 PNG) for user to scan, or pass `phone` for pairing code
3. `GET /instance/status` — poll until `status.connected == true && status.loggedIn == true`

---

## Sending Messages

### POST /send/text

**Request body:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `number` | string | yes | digits only |
| `text` | string | yes | message content |
| `linkPreview` | boolean | no | auto-generate link preview |
| `replyid` | string | no | full message ID to quote (`owner:messageid`) |
| `mentions` | string | no | comma-separated numbers to mention |
| `delay` | integer | no | ms before sending — shows "typing..." indicator |
| `readchat` | boolean | no | mark chat as read on send |
| `async` | boolean | no | queue asynchronously |

**Response:** `{ response: { status: "success", message: string }, ...message_fields }`

---

### POST /send/media

**Request body:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `number` | string | yes | digits only |
| `type` | enum | yes | `image` · `video` · `document` · `audio` · `ptt` · `ptv` · `sticker` · `myaudio` |
| `file` | string | yes | URL or base64 encoded file |
| `text` | string | no | caption |
| `docName` | string | no | filename override for documents |
| `viewOnce` | boolean | no | disappears after viewed — only for `image`, `video`, `audio` |
| `delay` | integer | no | ms |

**Response:** `{ response: { status, message, fileUrl }, ...message_fields }`

---

### POST /send/location

**Request body:** `number` (str, required), `latitude` (float, required), `longitude` (float, required), `name` (str, optional), `address` (str, optional)

---

### POST /send/contact

**Request body:** `number` (str, required), `fullName` (str, required), `phoneNumber` (str, required), `organization` (str), `email` (str), `url` (str)

---

### POST /send/menu — Interactive messages

**Request body:**
| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `number` | string | yes | — |
| `type` | enum | yes | `button` · `list` · `poll` · `carousel` |
| `text` | string | yes | main message text |
| `choices` | array | yes | see formats below |
| `footerText` | string | no | footer (button/list) |
| `listButton` | string | no | button label for lists |

`choices` format by type:
- `button` / `list`: `[{ "id": "1", "text": "Label", "description": "optional" }, ...]`
- `poll`: `["Option A", "Option B", "Option C"]`
- `carousel`: same as `POST /send/carousel`

---

### POST /send/carousel

**Request body:** `number` (str), `text` (str), `carousel` (array of `{ img, title, msg, buttons: [{id, text}] }`)

---

### POST /send/pix-button

**Request body:** `number` (str, required), `pixType` (enum: `CPF` · `CNPJ` · `PHONE` · `EMAIL` · `EVP`, case-insensitive, required), `pixKey` (str, required), `pixName` (str, optional)

---

### POST /send/request-payment

**Request body:** `number` (str, required), `amount` (float, required), `title` (str), `text` (str), `footer` (str), `pixKey` (str), `pixType` (str), `paymentLink` (str), `boletoCode` (str)

---

### POST /send/status — Stories

**Request body:** `type` (enum: `text` · `image` · `video` · `audio`, required), `text` (str, required if text), `file` (str, required if image/video/audio), `background_color` (int), `font` (int)

---

### POST /send/location-button

**Request body:** `number` (str, required), `text` (str, required) — sends a button that prompts user to share their location

---

### Common optional fields on all /send/* endpoints

`delay` (int, ms) · `replyid` (str, full message ID) · `mentions` (str, comma-separated) · `readchat` (bool) · `async` (bool) · `track_source` (str) · `track_id` (str)

---

## Instance

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| GET | `/instance/status` | — | `{ instance: {...}, status: { connected: bool, loggedIn: bool, jid } }` |
| POST | `/instance/connect` | `{ phone?: str }` | `{ connected, loggedIn, instance: { qrcode: base64, paircode? } }` |
| POST | `/instance/disconnect` | — | — |
| POST | `/instance/create` | `{ name: str, systemName?, adminField01?, adminField02? }` | `{ token: str, instance: {...} }` **[admin]** |
| DELETE | `/instance` | — | Permanently deletes |
| POST | `/instance/reset` | — | — |
| POST | `/instance/presence` | `{ presence: "available" \| "unavailable" }` | — |
| GET | `/instance/privacy` | — | Privacy settings object |
| POST | `/instance/privacy` | `{ groupadd?, last?, status?, profile?, readreceipts?, online? }` | Values: `all` · `contacts` · `contact_blacklist` · `none` |
| POST | `/instance/updateInstanceName` | `{ name: str }` | — |
| POST | `/instance/updateDelaySettings` | `{ msg_delay_min: int, msg_delay_max: int }` | ms |
| GET | `/instance/proxy` | — | Proxy config |
| POST | `/instance/proxy` | `{ enable: bool, proxy_url?: str }` | — |
| DELETE | `/instance/proxy` | — | — |
| GET | `/instance/wa_messages_limits` | — | `{ can_send_new_messages: bool, new_chat_message_capping: { total_quota }, reachout_timelock: { active } }` |
| GET | `/instance/all` | — | All instances **[admin]** |

`wa_messages_limits` — use before bulk campaigns. `total_quota: -1` = unlimited. `reachout_timelock.active: false` = no block. `provider_code: 463` in errors = hit this limit.

---

## Messages

### POST /message/find

**Request body:** `chatid` (str, filter by chat), `id` (str, specific message), `limit` (int), `offset` (int)

**Response:**
```
{
  messages: [ { id: "owner:messageid", type, body, from, fromMe, timestamp, ... } ],
  returnedMessages: int,
  limit: int,
  offset: int,
  nextOffset: int,
  hasMore: bool
}
```

> The `id` in each message is the full `owner:messageid` — use this for all operations below.

| Method | Endpoint | Body |
|--------|----------|------|
| POST | `/message/delete` | `{ id: str }` — full ID |
| POST | `/message/download` | `{ id: str, return_base64?: bool, generate_mp3?: bool, return_link?: bool, transcribe?: bool, openai_apikey?: str }` |
| POST | `/message/edit` | `{ id: str, text: str }` |
| POST | `/message/react` | `{ number: str, id: str, text: str }` — empty string removes reaction |
| POST | `/message/markread` | `{ id: [str] }` — array of full IDs |
| POST | `/message/presence` | `{ number: str, presence: "composing" \| "recording" \| "paused", delay?: int }` |
| POST | `/message/pin` | `{ id: str, duration: int }` — days: 1, 7, 30; 0 to unpin |
| GET | `/message/async` | — list async queue |
| DELETE | `/message/async` | — clear async queue |

---

## Groups

### GET /group/list

**Response:** `{ groups: [{ id: "...@g.us", name, subject, participants?: [...] }] }`

### POST /group/list

**Body:** `{ getParticipants: true }` — includes full participant list in response

| Method | Endpoint | Body |
|--------|----------|------|
| POST | `/group/info` | `{ groupJid: str, getParticipants?: bool }` |
| POST | `/group/create` | `{ name: str, participants: [str] }` — participants: digits only, no `@`; **Response:** `{ groupJid: str }` |
| POST | `/group/join` | `{ inviteCode: str }` — code or full link |
| POST | `/group/leave` | `{ groupJid: str }` |
| POST | `/group/inviteInfo` | `{ inviteCode: str }` — group info without joining |
| POST | `/group/resetInviteCode` | `{ groupJid: str }` |
| POST | `/group/updateName` | `{ groupJid: str, name: str }` |
| POST | `/group/updateDescription` | `{ groupJid: str, description: str }` |
| POST | `/group/updateImage` | `{ groupJid: str, image: str }` — URL or base64 |
| POST | `/group/updateParticipants` | `{ groupJid: str, action: "add" \| "remove" \| "promote" \| "demote", participants: [str] }` |
| POST | `/group/updateAnnounce` | `{ groupJid: str, announce: bool }` — `true` = admins-only send |
| POST | `/group/updateLocked` | `{ groupJid: str, locked: bool }` — `true` = admins-only edit info |

---

## Contacts

| Method | Endpoint | Body | Notes |
|--------|----------|------|-------|
| GET | `/contacts` | — | All contacts |
| POST | `/contacts/list` | `{ limit?, offset?, name?, wa_chatid? }` | Paginated |
| POST | `/contact/add` | `{ numbers: [str] }` | Digits only |
| POST | `/contact/remove` | `{ numbers: [str] }` | Digits only |

---

## Chat

| Method | Endpoint | Body |
|--------|----------|------|
| POST | `/chat/find` | `{ limit?, offset?, sort?, wa_chatid?, name?, wa_isGroup?: bool, wa_archived?: bool, wa_isPinned?: bool, wa_isBlocked?: bool, wa_label?, lead_status? }` |
| POST | `/chat/details` | `{ number: str, preview?: bool }` — **Response:** includes `wa_chatid` in JID format |
| POST | `/chat/check` | `{ numbers: [str] }` — verify which have WhatsApp; **Response:** `[{ number, exists: bool }]` |
| POST | `/chat/archive` | `{ number: str, archive: bool }` |
| POST | `/chat/block` | `{ number: str, block: bool }` |
| GET | `/chat/blocklist` | — |
| POST | `/chat/delete` | `{ number: str, deleteChatDB?: bool, deleteMessagesDB?: bool, deleteChatWhatsApp?: bool, clearChatWhatsApp?: bool }` |
| POST | `/chat/mute` | `{ number: str, muteEndTime: int }` — `0` = unmute, `-1` = forever |
| POST | `/chat/pin` | `{ number: str, pin: bool }` |
| POST | `/chat/read` | `{ number: str, read: bool }` |
| POST | `/chat/labels` | `{ number: str, labelids?: [str], add_labelid?: str, remove_labelid?: str }` |
| POST | `/chat/editLead` | `{ id: str, lead_name?, lead_email?, lead_status?, lead_notes?, lead_tags? }` |

---

## Webhook

### POST /webhook — Configure

**Request body:**
| Field | Type | Required |
|-------|------|----------|
| `url` | string | yes |
| `events` | string[] | yes |
| `enabled` | boolean | no |
| `addUrlEvents` | boolean | no |
| `addUrlTypesMessages` | boolean | no |
| `excludeMessages` | boolean | no |

Available events: `messages` · `connection` · `presence` · `group` · `chat` · `poll` · `label`

| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `/webhook` | Current config |
| POST | `/webhook` | Set/update config |
| GET | `/webhook/errors` | Delivery errors |
| GET | `/globalwebhook` | **[admin]** |
| POST | `/globalwebhook` | `{ url, events[], enabled? }` **[admin]** |
| GET | `/globalwebhook/errors` | **[admin]** |

**Incoming webhook event payload:**
```
{
  event: string,        // e.g. "messages"
  instance: string,     // instance name
  data: {
    id: string,         // full message ID (owner:messageid)
    from: string,       // sender chatid (number@s.whatsapp.net)
    body: string,       // text content
    type: string,       // message type
    timestamp: int,
    fromMe: bool,
    isGroup: bool,
    ...
  }
}
```

---

## Bulk Sending (Sender)

### POST /sender/simple

**Request body:**
| Field | Type | Required |
|-------|------|----------|
| `numbers` | string[] | yes |
| `message` | object | yes — same structure as `/send/*` body |
| `name` | string | no — job name |

**Response:** `{ id: str }` — job ID for tracking

The `message` object uses `type` as the discriminator: `"text"`, `"image"`, `"video"`, etc., with the same fields as the corresponding `/send/*` endpoint.

| Method | Endpoint | Body |
|--------|----------|------|
| POST | `/sender/advanced` | Full campaign config — use `uazapi search-docs "sender advanced"` for spec |
| POST | `/sender/listmessages` | `{ id: str, limit?: int, offset?: int }` |
| GET | `/sender/listfolders` | — list jobs |
| DELETE | `/sender/clearall` | — remove all jobs |
| POST | `/sender/cleardone` | — remove completed jobs |

---

## Newsletter (Channels)

| Method | Endpoint | Body |
|--------|----------|------|
| GET | `/newsletter/list` | — |
| POST | `/newsletter/info` | `{ newsletterJid: str }` |
| POST | `/newsletter/create` | `{ name: str, description?: str }` — **Response:** `{ newsletterJid: str }` |
| POST | `/newsletter/delete` | `{ newsletterJid: str }` |
| POST | `/newsletter/follow` | `{ newsletterJid: str }` |
| POST | `/newsletter/unfollow` | `{ newsletterJid: str }` |
| POST | `/newsletter/mute` | `{ newsletterJid: str }` |
| POST | `/newsletter/unmute` | `{ newsletterJid: str }` |
| POST | `/newsletter/messages` | `{ newsletterJid: str, count?: int }` |
| POST | `/newsletter/search` | `{ query: str }` |
| POST | `/newsletter/name` | `{ newsletterJid: str, name: str }` |
| POST | `/newsletter/description` | `{ newsletterJid: str, description: str }` |
| POST | `/newsletter/picture` | `{ newsletterJid: str, image: str }` |

---

## Business / Catalog

| Method | Endpoint | Body |
|--------|----------|------|
| POST | `/business/get/profile` | `{ number?: str }` — omit for own profile |
| POST | `/business/update/profile` | `{ description?, address?, email?, website?, category? }` |
| GET | `/business/get/categories` | — list available categories |
| POST | `/business/catalog/list` | `{ number?: str, limit?: int, offset?: int }` |
| POST | `/business/catalog/info` | `{ productId: str, number?: str }` |
| POST | `/business/catalog/hide` | `{ productIds: [str] }` |
| POST | `/business/catalog/show` | `{ productIds: [str] }` |
| POST | `/business/catalog/delete` | `{ productIds: [str] }` |

---

## Profile

| Method | Endpoint | Body |
|--------|----------|------|
| POST | `/profile/image` | `{ image: str }` — URL or base64 |
| POST | `/profile/name` | `{ name: str }` |

---

## Labels

| Method | Endpoint | Body |
|--------|----------|------|
| GET | `/labels` | — |
| POST | `/label/edit` | `{ name: str, color?: int, id?: str }` — omit `id` to create; include to update |

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| `200` | Success |
| `400` | Invalid request body |
| `401` | Invalid or missing token |
| `404` | Resource not found |
| `429` | Instance limit reached |
| `500` | Internal server error |

---

## Important Notes

- `number` fields: **digits only** — never `+`, spaces, or dashes
- The `id` field in message responses is the **full** `owner:messageid` format — required for reply (`replyid`), react, delete, edit, pin
- `delay` (ms) on send endpoints simulates typing — improves deliverability and naturalness
- `async: true` queues the send — check queue with `GET /message/async`
- Before bulk campaigns: check `/instance/wa_messages_limits` — `provider_code: 463` = WhatsApp-level cap hit
- `/sender/advanced` supports full campaign config (per-message delays, variables, scheduling) — run `uazapi search-docs "sender advanced" --pretty` for the complete spec
- Audio transcription: `POST /message/download` with `transcribe: true` requires `openai_apikey`
