#!/usr/bin/env bash
set -euo pipefail

# Simple deployment script for LiveIndus
# Usage: ./deploy.sh <ssh_host> [branch] [ssh_key]
# Example: ./deploy.sh root@139.59.87.174 main ~/.ssh/do_139.59.87.174

SSH_HOST="${1:-}"
BRANCH="${2:-main}"
SSH_KEY="${3:-$HOME/.ssh/do_139.59.87.174}"
REMOTE_PATH="/root/LiveIndus"
SERVICE_NAME="liveindus.service"

if [[ -z "$SSH_HOST" ]]; then
  echo "Usage: $0 <ssh_host> [branch] [ssh_key]" >&2
  exit 1
fi

SSH_OPTS=(-i "$SSH_KEY" -o StrictHostKeyChecking=accept-new)

echo ">>> Deploying branch '$BRANCH' to $SSH_HOST"
echo ">>> Using key: $SSH_KEY"
echo ">>> Remote path: $REMOTE_PATH"

# Ensure the repo exists and is up to date, install prod deps, restart service
ssh "${SSH_OPTS[@]}" "$SSH_HOST" bash -c "'
  set -euo pipefail
  if [[ ! -d \"$REMOTE_PATH/.git\" ]]; then
    echo \"Repo not found at $REMOTE_PATH\" >&2
    exit 1
  fi
  cd \"$REMOTE_PATH\"
  git fetch origin
  git checkout \"$BRANCH\"
  git pull origin \"$BRANCH\"
  npm ci --omit=dev
  systemctl restart \"$SERVICE_NAME\"
  systemctl status --no-pager \"$SERVICE_NAME\"
'"

echo ">>> Deploy complete"

