#!/bin/sh
set -eu
cd "$(dirname "$0")"
if command -v node >/dev/null 2>&1; then
  exec node server.mjs
fi
runtime_node="$HOME/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node"
if [ -x "$runtime_node" ]; then
  exec "$runtime_node" server.mjs
fi
printf '%s\n' 'Install Node.js 24+ and run npm run dev.'
exit 1
