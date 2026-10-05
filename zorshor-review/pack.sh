#!/bin/sh
# Build both themes and package the client and internal zips.
set -e
cd "$(dirname "$0")"
python3 build.py >/dev/null
rm -rf pack zorshor-for-client.zip zorshor-for-me.zip
mkdir -p pack/client pack/me/site pack/me/framer-handoff/reference pack/me/framer-handoff/assets pack/me/framer-handoff/code-components
cp dist/files/zorshor-premium-client.html "pack/client/zorshor - Premium.html"
cp dist/files/zorshor-draft-client.html "pack/client/zorshor - Draft 1.html"
cp handoff/client-how-to-review.txt "pack/client/How to review.txt"
cp dist/files/zorshor-premium-internal.html pack/me/site/zorshor-premium.html
cp dist/files/zorshor-draft-internal.html pack/me/site/zorshor-draft-1.html
cp dist/files/zorshor-premium-internal.html pack/me/framer-handoff/reference/zorshor-premium.html
cp dist/files/zorshor-draft-internal.html pack/me/framer-handoff/reference/zorshor-draft.html
cp handoff/FRAMER_AGENT_BRIEF.md pack/me/framer-handoff/
cp src/assets/zorshor-logo.svg src/assets/hathi.svg pack/me/framer-handoff/assets/
cp src/assets/chickendinner-sub.ttf pack/me/framer-handoff/assets/chicken-dinner-SUBSET.ttf
cp ../zorshor-premium/framer-handoff/code-components/*.tsx pack/me/framer-handoff/code-components/
cp handoff/me-start-here.txt "pack/me/Start here.txt"
(cd pack/client && zip -qr ../../zorshor-for-client.zip .)
(cd pack/me && zip -qr ../../zorshor-for-me.zip .)
echo "packed zorshor-for-client.zip and zorshor-for-me.zip"
