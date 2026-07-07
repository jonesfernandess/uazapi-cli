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
uazapi send location --number 555193667706 --lat -23.5505 --lon -46.6333 --name "São Paulo"
```

### Interactive menu (buttons, list, poll)

`choices` for **button** and **list** are arrays of strings — NOT objects.

```bash
# Button (no media)
uazapi send menu --number 555193667706 --type button --text "How can we help?" \
  --choices '["Tech Support|suporte","Place Order|pedido","Our Site|https://exemplo.com"]' \
  --footer "Choose an option"

# Button with image
uazapi send menu --number 555193667706 --type button --text "Choose a product:" \
  --choices '["Product A|prod_a","Product B|prod_b"]' \
  --image-button "https://example.com/product.jpg"

# List (sections use [Title] syntax)
uazapi send menu --number 555193667706 --type list --text "Our catalog:" \
  --list-button "View options" \
  --choices '["[Electronics]","Smartphones|phones|Latest releases","Notebooks|notes|2024 models","[Accessories]","Headphones|fones|Bluetooth & wired"]'

# Poll
uazapi send menu --number 555193667706 --type poll --text "Which time do you prefer?" \
  --choices '["Morning (8am-12pm)","Afternoon (1pm-5pm)","Evening (6pm-10pm)"]'
```

**button choices formats:**
- `"Label|id"` — reply button with custom ID
- `"Label"` — reply button (ID equals label)
- `"Label|copy:CODE"` — copy-to-clipboard button
- `"Label|call:+5511999999999"` — call button
- `"Label|https://example.com"` — URL button

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
uazapi message download --id "554796187355:3EB07..." --mp3   # explicit MP3 for web <audio> playback of voice notes
# NOTE: the file content comes back in a `base64Data` field, not `base64`
```

## Groups

```bash
uazapi group list
uazapi group create --name "Team" --participants '["555193667706","5511999999999"]'
uazapi group info --id "120363425061733477@g.us"
uazapi group join --code "AbCdEfGhIjKl"
uazapi group leave --id "120363425061733477@g.us"
uazapi group update-name --id "120363425061733477@g.us" --name "New Name"
uazapi group update-participants --id "120363425061733477@g.us" \
  --action add --participants '["555193667706"]'
```

`--participants` takes a JSON array (quoted numbers), not a bare comma-separated
string — `parseJsonArg` runs `JSON.parse` on it, so `--participants
"555193667706,5511999999999"` fails to parse. Group/invite flags are `--id`
(not `--group-jid`) and `--code` (not `--invite-code`) — see `group --help` or
`src/commands/group.ts` for the full flag list per subcommand.

`group info` calls `/group/info` under the hood — see `uazapi-api`'s Groups
section for the real response shape (`OwnerJID` is a LID, not a phone; use
`OwnerPN` for the group creator's actual number) and the `groupjid`/`invitecode`
lowercase body-field gotcha.

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

To test a local dev handler, point `--url` at a tunnel (`ngrok http 3000`, cloudflared, etc.) instead of localhost — Uazapi is a remote service and can't reach your machine directly. Only the webhook endpoint needs the tunnel; keep browsing/logging into your own app at `localhost` (auth callbacks, CSRF/origin checks, and cookies are usually scoped to `localhost` and will fail on the tunnel's domain). Remember to point `--url` back at production when done testing.

If you don't have a second recipient handy to test how a button/list tap arrives on your webhook: two of your own instances can message each other — `UAZAPI_TOKEN=<other-instance-token> uazapi send menu --number <first-instance-owner-number> ...` sends across accounts using the CLI's normal config for the recipient's number, then `uazapi message find --chat-id "<owner>@s.whatsapp.net"` (on whichever instance received the tap) reads back the normalized reply payload without needing the webhook delivery itself. Tapping a button in a "Message Yourself" self-chat does NOT produce a reply — confirmed no message arrives back at all in that case; you need two distinct instances/numbers.

See `uazapi-api`'s "Button/list quick-reply tap" note (under Webhook) for the confirmed inbound payload shape (`buttonOrListid`/`vote`, and the bare-vs-composite `quoted` id gotcha) before writing a handler for it.

See `uazapi-api`'s "Important Notes" for the real (flat, non-`{event,data}`) webhook payload shape and the `fromMe` sender-vs-chatid gotcha before writing a handler.

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
