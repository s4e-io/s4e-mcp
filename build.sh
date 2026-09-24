version="0.0.1"
# s4e-common branch: "testing" veya "production" olarak ayarlayın
common_branch="development"

sudo docker buildx build \
  --no-cache \
  --platform linux/amd64 \
  -f Dockerfile \
  -t s4e-mcp:latest \
  -t s4e-mcp:${version} \
  -t harbor.s4e.link/s4e/s4e-mcp .
