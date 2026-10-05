#!/bin/sh
# Build both themes and package four zips: an internal and a client (commenting) zip per theme.
set -e
cd "$(dirname "$0")"
python3 build.py >/dev/null
rm -rf pack zorshor-for-client.zip zorshor-for-me.zip zorshor-draft-*.zip

# pack_theme <theme key> <display name> <zip slug>
pack_theme() {
  key=$1; name=$2; slug=$3
  c="pack/$slug-client"; m="pack/$slug"
  mkdir -p "$c" "$m/framer-handoff/reference" "$m/framer-handoff/assets" "$m/framer-handoff/code-components"
  cp "dist/files/zorshor-$key-client.html" "$c/zorshor draft - $name (client review).html"
  cp handoff/client-how-to-review.txt "$c/How to review.txt"
  cp "dist/files/zorshor-$key-internal.html" "$m/zorshor draft - $name.html"
  cp "dist/files/zorshor-$key-internal.html" "$m/framer-handoff/reference/zorshor-draft-$key.html"
  cp handoff/FRAMER_AGENT_BRIEF.md "$m/framer-handoff/"
  cp src/assets/zorshor-logo.svg src/assets/hathi.svg "$m/framer-handoff/assets/"
  cp src/assets/chickendinner-sub.ttf "$m/framer-handoff/assets/chicken-dinner-SUBSET.ttf"
  cp ../zorshor-premium/framer-handoff/code-components/*.tsx "$m/framer-handoff/code-components/"
  cp handoff/me-start-here.txt "$m/Start here.txt"
  (cd "$c" && zip -qr "../../$slug-client.zip" .)
  (cd "$m" && zip -qr "../../$slug.zip" .)
}

pack_theme premium "Premium" zorshor-draft-premium
pack_theme draft "Draft 1" zorshor-draft-1
echo "packed:"; ls -1 zorshor-draft-*.zip
