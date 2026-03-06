#!/usr/bin/env bash
set -euo pipefail

export PUPPETEER_LAUNCH_OPTIONS='{"headless":true,"userDataDir":"/tmp/puppeteer-mcp-profile"}'

exec "/Users/edy/项目/杂乱其他/ellie-game-demo/.claude/mcp/puppeteer/node_modules/.bin/mcp-server-puppeteer"
