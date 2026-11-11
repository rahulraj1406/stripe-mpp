#!/bin/sh
# Usage: scripts/smoke.sh [base-url]   (default http://localhost:3100)
U=${1:-http://localhost:3100}
set -e
echo "home:      $(curl -s -o /dev/null -w '%{http_code}' $U/)  (want 200)"
echo "preflight: $(curl -s -o /dev/null -w '%{http_code}' "$U/api/preflight?url=https://example.com")  (want 402)"
echo "safe-read: $(curl -s -o /dev/null -w '%{http_code}' "$U/api/safe-read?url=https://example.com")  (want 402)"
npx -y mppx validate "$U" 2>&1 | grep -E '"(passed|failed)"'
