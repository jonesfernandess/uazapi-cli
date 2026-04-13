# uazapi-cli

> **Disclaimer:** This is an **unofficial**, community-built CLI tool. It is **not affiliated with, endorsed by, or associated with UAZAPI** in any way. Use at your own risk.

**[Portugues](README.md) | [Espanol](README.es.md)**

A command-line interface for the [UAZAPI](https://uazapi.com) WhatsApp API. Manage your WhatsApp instance, send messages, handle groups, contacts, webhooks and more — all from the terminal.

## The problem

UAZAPI exposes a powerful REST API with 128+ endpoints for WhatsApp automation. But interacting with it means juggling `curl` commands, remembering endpoint paths, building JSON payloads, and managing authentication headers manually.

**uazapi-cli** wraps the entire UAZAPI surface into a single binary with:

- An **interactive menu** for quick operations (test connection, send a message, list instances)
- A **full CLI** with subcommands for scripting and automation (`uazapi send text --to 5511... --message "hello"`)
- A **setup wizard** that configures your instance URL and token once
- **Self-update** built in — run `uazapi update` anytime

No more copy-pasting tokens into headers or looking up endpoint docs for every request.

![uazapi-cli interactive menu](screenshot.jpeg)

## Install

One command:

```bash
curl -fsSL https://raw.githubusercontent.com/jonesfernandess/uazapi-cli/main/install.sh | bash
```

This checks for Node.js 18+ and npm, clones the repo to `~/.uazapi-cli-app`, builds it, and installs the `uazapi` command globally.

**Requirements:** Node.js 18+, npm, git.

## Quick start

```bash
# 1. Install
curl -fsSL https://raw.githubusercontent.com/jonesfernandess/uazapi-cli/main/install.sh | bash

# 2. Configure — opens the setup wizard
uazapi setup

# 3. Test your connection
uazapi instance status

# 4. Send your first message
uazapi send text --to 5511999999999 --message "Hello from the terminal!"
```

Or just run `uazapi` with no arguments to open the interactive menu.

## Update

Update to the latest version at any time:

```bash
uazapi update
```

`uazapi upgrade` also works. This pulls the latest code from GitHub, reinstalls dependencies, and rebuilds automatically.

## Usage

### Interactive mode

Run `uazapi` with no arguments:

```
  UAZAPI CLI — WhatsApp API from the terminal

  ● What do you want to do?
  ● ⚡ Test connection     (check instance status)
  ○ ☰  List instances      (all API instances)
  ○ ✉  Send message        (quick text send)
  ○ ⚙  Setup wizard
  ○ ✕  Exit
```

### CLI mode

For scripting and automation:

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
| `update` | Update to latest version |

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
| `adminToken` | Admin token (optional, for listing instances and admin operations) |

You can reconfigure anytime with `uazapi setup` or change individual values from the interactive menu.

## AI Skills

Teach your AI agent to use UAZAPI in seconds. Skills contain the complete REST API and CLI reference in LLM-optimized format — loaded automatically when relevant.

### Via uazapi-cli (recommended)

```bash
uazapi install-skills claude    # Claude Code  → ~/.claude/skills/
uazapi install-skills cursor    # Cursor       → ~/.cursor/skills/
uazapi install-skills copilot   # Copilot      → ~/.copilot/skills/
uazapi install-skills cline     # Cline        → ~/.cline/skills/
uazapi install-skills windsurf  # Windsurf     → ~/.codeium/windsurf/skills/
uazapi install-skills codex     # Codex CLI    → ~/.codex/skills/
uazapi install-skills opencode  # OpenCode     → ~/.config/opencode/skills/
uazapi install-skills gemini    # Gemini CLI   → ~/.gemini/skills/
uazapi install-skills hermes    # Hermes       → ~/.hermes/skills/
uazapi install-skills openclaw  # OpenClaw     → ~/.openclaw/skills/
uazapi install-skills all       # All at once
```

Installs **globally** by default (works in any project). Use `--local` to install in the current project instead.

Or use the interactive menu: `uazapi` → **Install AI Skills**

### Without the CLI — via prompt to your AI agent

Paste the prompt for your tool. The agent downloads the files from the repository and installs them in the right place — no `uazapi-cli` needed.

**Claude Code:**
```
Download the two files below and save them to ~/.claude/skills/ keeping the full content (including the YAML frontmatter). Create the directories if they don't exist.

- https://raw.githubusercontent.com/jonesfernandess/uazapi-cli/main/skills/uazapi-api/SKILL.md → ~/.claude/skills/uazapi-api/SKILL.md
- https://raw.githubusercontent.com/jonesfernandess/uazapi-cli/main/skills/uazapi-cli/SKILL.md → ~/.claude/skills/uazapi-cli/SKILL.md
```

**Cursor:**
```
Download the two files below and save them to ~/.cursor/skills/ keeping the full content (including the YAML frontmatter). Create the directories if they don't exist.

- https://raw.githubusercontent.com/jonesfernandess/uazapi-cli/main/skills/uazapi-api/SKILL.md → ~/.cursor/skills/uazapi-api/SKILL.md
- https://raw.githubusercontent.com/jonesfernandess/uazapi-cli/main/skills/uazapi-cli/SKILL.md → ~/.cursor/skills/uazapi-cli/SKILL.md
```

**GitHub Copilot:**
```
Download the two files below and save them to ~/.copilot/skills/ keeping the full content (including the YAML frontmatter). Create the directories if they don't exist.

- https://raw.githubusercontent.com/jonesfernandess/uazapi-cli/main/skills/uazapi-api/SKILL.md → ~/.copilot/skills/uazapi-api/SKILL.md
- https://raw.githubusercontent.com/jonesfernandess/uazapi-cli/main/skills/uazapi-cli/SKILL.md → ~/.copilot/skills/uazapi-cli/SKILL.md
```

**Cline:**
```
Download the two files below and save them to ~/.cline/skills/ keeping the full content (including the YAML frontmatter). Create the directories if they don't exist.

- https://raw.githubusercontent.com/jonesfernandess/uazapi-cli/main/skills/uazapi-api/SKILL.md → ~/.cline/skills/uazapi-api/SKILL.md
- https://raw.githubusercontent.com/jonesfernandess/uazapi-cli/main/skills/uazapi-cli/SKILL.md → ~/.cline/skills/uazapi-cli/SKILL.md
```

**Windsurf:**
```
Download the two files below and save them to ~/.codeium/windsurf/skills/ keeping the full content (including the YAML frontmatter). Create the directories if they don't exist.

- https://raw.githubusercontent.com/jonesfernandess/uazapi-cli/main/skills/uazapi-api/SKILL.md → ~/.codeium/windsurf/skills/uazapi-api/SKILL.md
- https://raw.githubusercontent.com/jonesfernandess/uazapi-cli/main/skills/uazapi-cli/SKILL.md → ~/.codeium/windsurf/skills/uazapi-cli/SKILL.md
```

**Codex CLI:**
```
Download the two files below and save them to ~/.codex/skills/ keeping the full content (including the YAML frontmatter). Create the directories if they don't exist.

- https://raw.githubusercontent.com/jonesfernandess/uazapi-cli/main/skills/uazapi-api/SKILL.md → ~/.codex/skills/uazapi-api/SKILL.md
- https://raw.githubusercontent.com/jonesfernandess/uazapi-cli/main/skills/uazapi-cli/SKILL.md → ~/.codex/skills/uazapi-cli/SKILL.md
```

**OpenCode:**
```
Download the two files below and save them to ~/.config/opencode/skills/ keeping the full content (including the YAML frontmatter). Create the directories if they don't exist.

- https://raw.githubusercontent.com/jonesfernandess/uazapi-cli/main/skills/uazapi-api/SKILL.md → ~/.config/opencode/skills/uazapi-api/SKILL.md
- https://raw.githubusercontent.com/jonesfernandess/uazapi-cli/main/skills/uazapi-cli/SKILL.md → ~/.config/opencode/skills/uazapi-cli/SKILL.md
```

**Gemini CLI:**
```
Download the two files below and save them to ~/.gemini/skills/ keeping the full content (including the YAML frontmatter). Create the directories if they don't exist.

- https://raw.githubusercontent.com/jonesfernandess/uazapi-cli/main/skills/uazapi-api/SKILL.md → ~/.gemini/skills/uazapi-api/SKILL.md
- https://raw.githubusercontent.com/jonesfernandess/uazapi-cli/main/skills/uazapi-cli/SKILL.md → ~/.gemini/skills/uazapi-cli/SKILL.md
```

**Hermes (Nous Research):**
```
Download the two files below and save them to ~/.hermes/skills/ keeping the full content (including the YAML frontmatter). Create the directories if they don't exist.

- https://raw.githubusercontent.com/jonesfernandess/uazapi-cli/main/skills/uazapi-api/SKILL.md → ~/.hermes/skills/uazapi-api/SKILL.md
- https://raw.githubusercontent.com/jonesfernandess/uazapi-cli/main/skills/uazapi-cli/SKILL.md → ~/.hermes/skills/uazapi-cli/SKILL.md
```

**OpenClaw:**
```
Download the two files below and save them to ~/.openclaw/skills/ keeping the full content (including the YAML frontmatter). Create the directories if they don't exist.

- https://raw.githubusercontent.com/jonesfernandess/uazapi-cli/main/skills/uazapi-api/SKILL.md → ~/.openclaw/skills/uazapi-api/SKILL.md
- https://raw.githubusercontent.com/jonesfernandess/uazapi-cli/main/skills/uazapi-cli/SKILL.md → ~/.openclaw/skills/uazapi-cli/SKILL.md
```

## Build from source

```bash
git clone https://github.com/jonesfernandess/uazapi-cli.git
cd uazapi-cli
npm install
npm run build
npm install -g .
```

### Development

```bash
npm run dev      # Run with tsx (no build step)
npm run build    # Compile TypeScript to dist/
npm run lint     # Type-check without emitting
```

## Tech stack

- **TypeScript** + **Commander.js** for the CLI framework
- **@clack/prompts** for the interactive menu
- **chalk** + **gradient-string** + **figlet** for terminal styling

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=jonesfernandess/uazapi-cli&type=Date)](https://star-history.com/#jonesfernandess/uazapi-cli&Date)

## License

MIT
