#!/bin/sh
# Runs Vitest inside a pinned Playwright image so screenshots match locally and in CI.
# Keep the tag in sync with the playwright devDependency.
set -e
IMAGE=mcr.microsoft.com/playwright:v1.65.1-noble

# Mounted at the same path so pnpm's absolute symlinks resolve inside the container.
exec docker run --rm --init --ipc=host \
  --user "$(id -u):$(id -g)" -e HOME=/tmp -e CI \
  -v "$PWD:$PWD" -w "$PWD" \
  "$IMAGE" node node_modules/vitest/vitest.mjs run "$@"
