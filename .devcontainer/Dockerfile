FROM node:22-bookworm

# Install system dependencies including Chromium for DevTools MCP
RUN apt-get update && apt-get install -y \
    git \
    curl \
    vim \
    chromium \
    chromium-sandbox \
    fonts-liberation \
    libnss3 \
    libatk-bridge2.0-0 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    libpango-1.0-0 \
    libcairo2 \
    && rm -rf /var/lib/apt/lists/*

# Set Chromium environment variables
ENV CHROME_BIN=/usr/bin/chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Install pnpm and Claude Code CLI globally
RUN npm install -g pnpm @anthropic-ai/claude-code

# Set up workspace
WORKDIR /workspace
