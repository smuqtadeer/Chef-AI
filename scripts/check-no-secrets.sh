#!/usr/bin/env bash
# Run before git push to block accidental secret commits.
set -euo pipefail

BLOCKED=0

for pattern in '\.env$' 'appsettings\.Development\.json' 'secrets\.json'; do
  if git diff --cached --name-only | grep -E "$pattern" >/dev/null 2>&1; then
    echo "BLOCKED: attempting to commit a secrets file matching /$pattern/"
    BLOCKED=1
  fi
done

if git diff --cached | grep -E 'sk-or-v1-[A-Za-z0-9_-]{10,}|sk-ant-api[0-9]-[A-Za-z0-9_-]{20,}' >/dev/null 2>&1; then
  echo "BLOCKED: staged diff appears to contain a real API key"
  BLOCKED=1
fi

# Block real keys in any tracked file (including *.example.json)
if git diff --cached -- '*.json' '*.js' '*.jsx' '*.ts' '*.tsx' '*.md' '*.cs' | grep -E 'sk-or-v1-[A-Za-z0-9_-]{10,}|sk-ant-api[0-9]-[A-Za-z0-9_-]{20,}' >/dev/null 2>&1; then
  echo "BLOCKED: real API key pattern found in staged source files"
  BLOCKED=1
fi

if [ "$BLOCKED" -eq 1 ]; then
  echo "Unstage secrets with: git restore --staged <file>"
  exit 1
fi

echo "OK: no secrets detected in staged changes"
