#!/usr/bin/env bash
# Post a development event to the AI Town office so the agents react to it.
#
#   scripts/dev-event.sh build_failure "tsc failed in convex/agent" [source]
#
# Types with special reactions: git_commit, build_failure, build_success,
# lint_error, test_failure, error_spike, deployment_success, deployment_failure.
# Reads VITE_CONVEX_SITE_URL and DEV_EVENT_TOKEN from .env.local next to this repo
# (override either with environment variables).
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "usage: $0 <type> [message] [source]" >&2
  exit 1
fi

ENV_FILE="$(cd "$(dirname "$0")/.." && pwd)/.env.local"
read_env() { grep -E "^$1=" "$ENV_FILE" 2>/dev/null | tail -1 | cut -d= -f2-; }
SITE_URL="${VITE_CONVEX_SITE_URL:-$(read_env VITE_CONVEX_SITE_URL)}"
TOKEN="${DEV_EVENT_TOKEN:-$(read_env DEV_EVENT_TOKEN)}"
if [ -z "$SITE_URL" ] || [ -z "$TOKEN" ]; then
  echo "VITE_CONVEX_SITE_URL and DEV_EVENT_TOKEN must be set (in $ENV_FILE or the environment)" >&2
  exit 1
fi

BODY=$(python3 -c 'import json,sys; print(json.dumps({"type": sys.argv[1], "message": sys.argv[2], "source": sys.argv[3]}))' \
  "$1" "${2:-}" "${3:-$(basename "$PWD")}")
curl -sS --fail-with-body -X POST "$SITE_URL/dev-event" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "$BODY"
echo
