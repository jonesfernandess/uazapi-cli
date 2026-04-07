#!/usr/bin/env bash
set -e

# ── Colors ──
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
DIM='\033[2m'
BOLD='\033[1m'
RESET='\033[0m'

REPO="https://github.com/jonesfernandess/uazapi-cli.git"
INSTALL_DIR="$HOME/.uazapi-cli-app"

echo ""
echo -e "${CYAN}${BOLD}  UAZAPI CLI Installer${RESET}"
echo -e "${DIM}  ─────────────────────────────────────${RESET}"
echo ""

# ── Check Node.js ──
if ! command -v node &>/dev/null; then
  echo -e "${RED}  ✗ Node.js not found. Install Node.js 18+ first.${RESET}"
  echo -e "${DIM}    https://nodejs.org${RESET}"
  exit 1
fi

NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo -e "${RED}  ✗ Node.js 18+ required (found v${NODE_VERSION}).${RESET}"
  exit 1
fi
echo -e "${GREEN}  ✓${RESET} Node.js $(node -v)"

# ── Check npm ──
if ! command -v npm &>/dev/null; then
  echo -e "${RED}  ✗ npm not found.${RESET}"
  exit 1
fi
echo -e "${GREEN}  ✓${RESET} npm $(npm -v)"

# ── Clone or update ──
echo ""
if [ -d "$INSTALL_DIR" ]; then
  echo -e "${BLUE}  ●${RESET} Updating existing installation..."
  cd "$INSTALL_DIR"
  git fetch origin main --quiet
  git reset --hard origin/main --quiet
else
  echo -e "${BLUE}  ●${RESET} Cloning uazapi-cli..."
  git clone --quiet "$REPO" "$INSTALL_DIR"
  cd "$INSTALL_DIR"
fi

# ── Install deps ──
echo -e "${BLUE}  ●${RESET} Installing dependencies..."
npm install --silent 2>/dev/null

# ── Build ──
echo -e "${BLUE}  ●${RESET} Building..."
npm run build --silent 2>/dev/null

# ── Global install ──
echo -e "${BLUE}  ●${RESET} Installing globally..."
npm install -g . --silent 2>/dev/null

# ── Done ──
echo ""
echo -e "${DIM}  ─────────────────────────────────────${RESET}"
echo -e "${GREEN}${BOLD}  ✓ uazapi-cli installed!${RESET}"
echo ""
echo -e "  Run ${CYAN}uazapi${RESET} to open the interactive menu"
echo -e "  Run ${CYAN}uazapi setup${RESET} to configure your instance"
echo -e "  Run ${CYAN}uazapi --help${RESET} to see all commands"
echo ""
echo -e "${DIM}  Installed to: ${INSTALL_DIR}${RESET}"
echo -e "${DIM}  Update anytime: uazapi update${RESET}"
echo ""
