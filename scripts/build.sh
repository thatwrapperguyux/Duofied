#!/usr/bin/env bash
# Prepare the reference assets during a host's build step. Works with uv when the
# build image has it, and falls back to a virtualenv built with the system Python.
set -euo pipefail

if command -v uv >/dev/null 2>&1; then
  echo "Preparing assets with uv..."
  uv run --no-project --python 3.12 --with-requirements requirements-assets.txt \
    python scripts/prepare-assets.py
else
  echo "Preparing assets with a virtualenv..."
  python3 -m venv .venv
  .venv/bin/python -m pip install --quiet --upgrade pip
  .venv/bin/python -m pip install --quiet -r requirements-assets.txt
  .venv/bin/python scripts/prepare-assets.py
fi
