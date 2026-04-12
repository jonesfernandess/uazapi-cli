---
name: uazapi-cli
description: Use the uazapi-cli to operate WhatsApp via UAZAPI from the terminal. Send messages, manage instances, groups, contacts, webhooks, and bulk sending using simple CLI commands. Includes search-docs for endpoint discovery.
version: 1.0.0
author: Jones Fernandes
license: MIT
prerequisites:
  commands: [uazapi]
metadata:
  hermes:
    tags: [WhatsApp, UAZAPI, CLI, Messaging, Automation, Terminal]
---

# uazapi-cli — WhatsApp from the Terminal

Operate the UAZAPI WhatsApp API using the `uazapi` CLI. No curl, no JSON payloads — just commands.

## Setup

```bash
# 1. Install
curl -fsSL https://raw.githubusercontent.com/jonesfernandess/uazapi-cli/main/install.sh | bash

# 2. Configure (runs interactive wizard — saves baseUrl + token)
uazapi setup

# 3. Verify connection
uazapi instance status
```

Config is saved to `~/.uazapi-cli/config.json`. To reconfigure at any time:
```bash
uazapi setup
```

## Discovering endpoints and full API details

When you need parameter details, optional fields, or to discover what's available:

```bash
# Search by keyword — returns matching endpoints + guide sections
uazapi search-docs "webhook"
uazapi search-docs "pix"
uazapi search-docs "send image"

# See all available tags and guide sections
uazapi search-docs --list

# Get a full guide section by name
uazapi search-docs --section "Formatos de ID"
uazapi search-docs --section "Sender"

# Machine-readable JSON output
uazapi search-docs "group" --pretty
```

## Sending Messages

### Text
```bash
uazapi send text --number 555193667706 --text "Hello from the terminal"

# With typing indicator (2s delay) and reply
uazapi send text --number 555193667706 --text "Got it" --delay 2000 --reply-id "554796187355:3EB07EB7F6267D2CE0DD3D"
```

### Media (image, video, audio, document, sticker)
```bash
# Image
uazapi send media --number 555193667706 --type image --file "https://example.com/photo.jpg" --caption "Caption here"

# Audio voice message
uazapi send media --number 555193667706 --type ptt --file "https://example.com/audio.ogg"

# Document
uazapi send media --number 555193667706 --type document --file "https://example.com/file.pdf" --doc-name "report.pdf"

# View-once image (disappears after viewed)
uazapi send media --number 555193667706 --type image --file "https://example.com/photo.jpg" --view-once
```

### Location
```bash
uazapi send location --number 555193667706 --latitude -23.5505 --longitude -46.6333 --name "São Paulo"
```

### Interactive menu (buttons, list, poll)
```bash
uazapi send menu --number 555193667706 --type button --text "Choose:" \
  --choices '[{"id":"1","text":"Option A"},{"id":"2","text":"Option B"}]'

uazapi send menu --number 555193667706 --type list --text "Select:" \
  --list-button "View options" \
  --choices '[{"id":"1","text":"Item 1"},{"id":"2","text":"Item 2"}]'

uazapi send menu --number 555193667706 --type poll --text "Which?" \
  --choices '["Option A","Option B","Option C"]'
```

### PIX payment button
```bash
uazapi send pix-button --number 555193667706 --pix-type CPF --pix-key "123.456.789-00"
```

### Story (WhatsApp Status)
```bash
uazapi send status --type text --text "News!" --background-color 0
uazapi send status --type image --file "https://example.com/banner.jpg"
```

## Instance Management

```bash
uazapi instance status          # Check connection state
uazapi instance connect         # Get QR code (base64)
uazapi instance connect --phone 555193667706  # Pairing code instead of QR
uazapi instance disconnect
uazapi instance reset
uazapi instance presence available     # Set online presence
uazapi instance presence unavailable
uazapi instance wa-limits       # Check send limits before campaigns
uazapi instance all             # List all instances [admin]
```

## Messages

```bash
uazapi message find --chatid "555193667706@s.whatsapp.net" --limit 20
uazapi message delete --id "554796187355:3EB07EB7F6267D2CE0DD3D"
uazapi message react --number 555193667706 --id "554796187355:3EB07..." --text "👍"
uazapi message edit --id "554796187355:3EB07..." --text "corrected text"
uazapi message download --id "554796187355:3EB07..."
```

## Groups

```bash
uazapi group list
uazapi group create --name "Team" --participants "555193667706,5511999999999"
uazapi group info --group-jid "120363425061733477@g.us"
uazapi group join --invite-code "AbCdEfGhIjKl"
uazapi group leave --group-jid "120363425061733477@g.us"
uazapi group update-name --group-jid "120363425061733477@g.us" --name "New Name"
uazapi group update-participants --group-jid "120363425061733477@g.us" \
  --action add --participants "555193667706"
```

## Chats

```bash
uazapi chat find --limit 20
uazapi chat details --number 555193667706
uazapi chat archive --number 555193667706 --archive true
uazapi chat block --number 555193667706 --block true
uazapi chat mute --number 555193667706 --mute-end-time -1   # -1 = always
uazapi chat check --numbers "555193667706,5511999999999"    # verify WhatsApp accounts
```

## Contacts

```bash
uazapi contact list
uazapi contact add --numbers "555193667706,5511999999999"
uazapi contact remove --numbers "555193667706"
```

## Webhooks

```bash
uazapi webhook get
uazapi webhook set --url "https://your-server.com/webhook" \
  --events "messages,connection"
uazapi webhook errors
```

## Bulk Sending (Sender)

```bash
uazapi sender simple \
  --numbers "555193667706,5511999999999" \
  --message '{"type":"text","text":"Hello everyone!"}'

uazapi sender list-folders
uazapi sender clear-done
```

## Labels

```bash
uazapi label list
uazapi label edit --name "Hot lead" --color 1
```

## Profile

```bash
uazapi profile name --name "My Business"
uazapi profile image --image "https://example.com/logo.jpg"
```

## Important Notes

- **Number format**: digits only, no `+`, spaces, or dashes — `555193667706` not `+55 (51) 9366-7706`
- **`--number` vs `--chatid`**: most send commands take `--number` (digits only); some find/filter commands take `--chatid` (`number@s.whatsapp.net` or `id@g.us`)
- **Message IDs for reply/react/delete**: use the full `owner:messageid` format from `message find` output
- **First-time setup order**: `instance create` → `instance connect` → scan QR → verify with `instance status`

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| `401 Unauthorized` | Wrong token | Run `uazapi setup` and re-enter token |
| Message not delivered, no error | Wrong number format | Use digits only — no `+`, spaces, dashes |
| `429 Too Many Requests` | Instance limit reached | Check plan limits or wait |
| QR code expired | Took too long to scan | Run `uazapi instance connect` again |
| `provider_code: 463` | Send limit active | Run `uazapi instance wa-limits` to diagnose |
