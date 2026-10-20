#!/usr/bin/env bash
# Builds the browse-only GitHub Pages preview into ./out.
# DELETES the server-only routes from the working tree first, so it only runs in CI
# (or a throwaway copy): `CI=1 BASE_PATH=/pocket-card scripts/build-preview.sh`.
set -euo pipefail
[ -n "${CI:-}" ] || { echo "Refusing to run outside CI: this script deletes source files." >&2; exit 1; }

# Pages serves files only: no API, sign-in, proxy, or per-request pages.
rm -rf app/api app/auth proxy.ts \
  "app/[lang]/admin" "app/[lang]/checkout" \
  "app/[lang]/(site)/account" "app/[lang]/(site)/order" "app/[lang]/(site)/[...rest]"

NEXT_PUBLIC_PREVIEW=1 NEXT_PUBLIC_BASE_PATH="${BASE_PATH:-}" npx next build

# No proxy to pick a language, so the root page does it in the browser.
cat > out/index.html <<HTML
<!doctype html><meta charset="utf-8"><title>Loading…</title>
<script>
  var saved = (document.cookie.match(/(?:^|; )lang=([^;]+)/) || [])[1];
  var lang = saved || (/^zh/i.test(navigator.language) ? 'zh-hk' : 'en');
  location.replace('${BASE_PATH:-}/' + lang + '/');
</script>
<noscript><a href="${BASE_PATH:-}/en/">English</a> · <a href="${BASE_PATH:-}/zh-hk/">中文</a></noscript>
HTML
touch out/.nojekyll # serve _next/ as-is
