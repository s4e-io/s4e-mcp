#!/usr/bin/env bash
# Builds the s4e-mcp Docker image.
#   REGISTRY=registry.example.com/team ./build.sh   # additionally tags <registry>/s4e-mcp
#   DOCKER="sudo docker" ./build.sh                 # if docker needs sudo on your host
set -euo pipefail

version="0.0.1"
DOCKER="${DOCKER:-docker}"

tags=(-t "s4e-mcp:latest" -t "s4e-mcp:${version}")
if [ -n "${REGISTRY:-}" ]; then
  tags+=(-t "${REGISTRY%/}/s4e-mcp")
fi

${DOCKER} buildx build \
  --no-cache \
  --platform linux/amd64 \
  -f Dockerfile \
  "${tags[@]}" .
