#!/bin/bash
# Dev container setup script for floimg-studio
# This runs automatically after the container is created (postCreateCommand)

set -e  # Exit on error

echo "Starting floimg-studio dev container setup..."

# Verify .env file exists
ROOT_ENV="/workspaces/floimg-studio/.env"
if [ ! -f "$ROOT_ENV" ]; then
  echo "No .env file found, copying from .env.example..."
  cp /workspaces/floimg-studio/.env.example "$ROOT_ENV"
  echo "Created $ROOT_ENV from .env.example"
fi

# Source env for IS_SANDBOX
set -a
source "$ROOT_ENV" || {
  echo "FATAL: Failed to source $ROOT_ENV"
  exit 1
}
set +a

# Add environment variables and aliases to /etc/bash.bashrc (system-wide)
SYSTEM_BASHRC="/etc/bash.bashrc"

# Add environment variables (idempotent)
if ! grep -Fq "source /workspaces/floimg-studio/.env" "$SYSTEM_BASHRC" 2>/dev/null; then
  echo "set -a; source /workspaces/floimg-studio/.env 2>/dev/null; set +a" >> "$SYSTEM_BASHRC"
  echo "Added environment variables to $SYSTEM_BASHRC"
fi

# Add Claude Code aliases (idempotent)
if ! grep -Fq 'alias cc="claude"' "$SYSTEM_BASHRC" 2>/dev/null; then
  echo 'alias cc="claude"' >> "$SYSTEM_BASHRC"
  echo "Claude Code alias 'cc' enabled"
fi

# ccdsp: Only enable in sandboxed environments
if [ "$IS_SANDBOX" = "1" ]; then
  if ! grep -Fq 'alias ccdsp="claude --dangerously-skip-permissions"' "$SYSTEM_BASHRC" 2>/dev/null; then
    echo 'alias ccdsp="claude --dangerously-skip-permissions"' >> "$SYSTEM_BASHRC"
    echo "Claude Code alias 'ccdsp' enabled (sandbox mode)"
  fi
else
  echo "Skipping 'ccdsp' alias (set IS_SANDBOX=1 in .env to enable)"
fi

# Install pnpm dependencies
echo "Installing pnpm dependencies..."
pnpm install

# Start Chromium with remote debugging for Chrome DevTools MCP
echo "Starting Chromium with remote debugging on port 9222..."
if command -v chromium &> /dev/null; then
  # Kill any existing Chromium processes
  pkill -f "chromium.*remote-debugging-port" 2>/dev/null || true

  # Start Chromium in headless mode with remote debugging
  chromium \
    --headless=new \
    --disable-gpu \
    --no-sandbox \
    --disable-dev-shm-usage \
    --remote-debugging-port=9222 \
    --remote-debugging-address=0.0.0.0 \
    http://localhost:5173 &

  echo "Chromium started with remote debugging on port 9222"
else
  echo "WARNING: Chromium not found. Chrome DevTools MCP will not work."
  echo "Rebuild the container to install Chromium."
fi

echo ""
echo "=================================================="
echo "floimg-studio dev container setup complete!"
echo "=================================================="
echo ""
echo "Available commands:"
echo "  cc       - Run Claude Code with permission prompts"
if [ "$IS_SANDBOX" = "1" ]; then
  echo "  ccdsp    - Run Claude Code without permission prompts (sandbox only)"
fi
echo "  pnpm dev - Start both frontend (5173) and backend (3001)"
echo ""
echo "Aliases are available in all new terminal sessions."
