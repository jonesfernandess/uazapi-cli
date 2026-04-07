# uazapi-cli

> **Disclaimer:** This is an **unofficial**, community-built CLI tool. It is **not affiliated with, endorsed by, or associated with UAZAPI** in any way. Use at your own risk.

A command-line interface for the [UAZAPI](https://uazapi.com) WhatsApp API. Manage your WhatsApp instance, send messages, handle groups, contacts, webhooks and more — all from the terminal.

## The problem

UAZAPI exposes a powerful REST API with 128+ endpoints for WhatsApp automation. But interacting with it means juggling `curl` commands, remembering endpoint paths, building JSON payloads, and managing authentication headers manually.

**uazapi-cli** wraps the entire UAZAPI surface into a single binary with:

- An **interactive menu** for quick operations (test connection, send a message, configure tokens)
- A **full CLI** with subcommands for scripting and automation (`uazapi send text --to 5511... --message "hello"`)
- A **setup wizard** that configures your instance URL and token once

No more copy-pasting tokens into headers or looking up endpoint docs for every request.

## Install

```bash
# Clone and install globally
git clone https://github.com/jonesfernandess/uazapi-cli.git
cd uazapi-cli
npm install
npm run build
npm link
```

After linking, `uazapi` is available anywhere in your terminal.

## Quick start

```bash
# First run — opens interactive menu with setup wizard
uazapi

# Or configure directly
uazapi setup

# Test your connection
uazapi instance status

# Send a message
uazapi send text --to 5511999999999 --message "Hello from the terminal"
```

## Usage

Running `uazapi` with no arguments opens the interactive menu:

```
  UAZAPI CLI — WhatsApp API from the terminal

  ● What do you want to do?
  ● ⚡ Test connection
  ○ ✉  Send message
  ○ ⚙  Setup wizard
  ○ ✕  Exit
```

For scripting and automation, use the full CLI:

```
uazapi [command] [subcommand] [options]
```

### Commands

| Command | Description |
|---------|-------------|
| `instance` | Manage WhatsApp instance (connect, disconnect, status, reset) |
| `send` | Send messages (text, media, location, contact, carousel, poll, PIX button) |
| `message` | Manage messages (find, delete, download, edit, react) |
| `chat` | Manage chats (find, archive, block, delete, mute, pin) |
| `group` | Manage WhatsApp groups |
| `contact` | Manage contacts |
| `webhook` | Manage webhooks |
| `newsletter` | Manage WhatsApp Channels/Newsletters |
| `business` | Business profile and catalog |
| `sender` | Mass messaging |
| `admin` | Admin operations (requires admin token) |
| `label` | Manage labels |
| `profile` | Manage WhatsApp profile |
| `setup` | Interactive setup wizard |
| `menu` | Open interactive menu |

### Examples

```bash
# Check instance status
uazapi instance status

# Send a text message
uazapi send text --to 5511999999999 --message "Hello!"

# Send an image
uazapi send media --to 5511999999999 --type image --file https://example.com/photo.jpg

# Send a PIX payment button
uazapi send pix-button --to 5511999999999 --key "your-pix-key" --amount 49.90

# Post a WhatsApp Story
uazapi send status --type text --message "New update!"

# Manage webhooks
uazapi webhook set --url https://your-server.com/webhook

# List all groups
uazapi group list

# Get help for any command
uazapi send --help
uazapi instance connect --help
```

## Configuration

On first run, the setup wizard creates `~/.uazapi-cli/config.json`:

```json
{
  "baseUrl": "https://your-instance.uazapi.com",
  "token": "your-instance-token",
  "adminToken": ""
}
```

| Field | Description |
|-------|-------------|
| `baseUrl` | Your UAZAPI instance URL |
| `token` | Instance authentication token |
| `adminToken` | Admin token (optional, for instance management) |

## Development

```bash
npm install
npm run dev      # Run with tsx (no build needed)
npm run build    # Compile TypeScript
npm run lint     # Type-check without emitting
```

## Tech stack

- **TypeScript** + **Commander.js** for the CLI framework
- **@clack/prompts** for the interactive menu
- **chalk** + **gradient-string** + **figlet** for terminal styling

## License

MIT
