--
# S4E.io MCP Server

> 🇹🇷 [Türkçe README](./README.tr.md)

[MCP (Model Context Protocol)](https://modelcontextprotocol.io) server for the S4E.io cybersecurity platform. Lets Claude Code, Cursor, and other MCP-compatible clients interact with the S4E.io API using natural language.

Runs over HTTP (Streamable transport). Local usage is via Docker.

```
Claude Code / Cursor                     S4E.io
        │                                   ▲
        │  HTTP (Streamable)                │
        │  S4E-API-Token header             │
        ▼                                   │
  s4e-mcp (Hono)  ─────────────►  S4E API
  /mcp  /health                  resolved S4E_API_URL
```

---

## Tech Stack

| Technology | Description |
|------------|-------------|
| **TypeScript** | ES2022 target, strict mode |
| **Node.js 22** | Runtime |
| **Hono** + `@hono/node-server` | HTTP server framework |
| **@modelcontextprotocol/sdk** | MCP protocol implementation (Streamable HTTP) |
| **Zod v4** | Tool parameter schema validation |
| **dotenv** | Loads `.env` at boot |
| **Docker** | Local run + image build |

---

## 1. Local Setup (Docker)

### Requirements

- Docker Desktop (Mac / Windows) or Docker Engine + Compose v2 (Linux)
- S4E.io API token — [app.s4e.io/api-token](https://app.s4e.io/api-token)

### Steps (Mac / Linux / Windows)

```bash
# 1. Clone the repo
git clone <repo-url> && cd s4e-mcp

# 2. Prepare environment file
cp .env.example .env
# Edit S4E_API_URL and other values as needed

# 3. Start the container
docker compose up --build
```

When the service starts:

```
S4E MCP Server starting...
  Env:     local
  API URL: https://api.s4e.io/api
  Listen:  http://0.0.0.0:8000
Registered 32 tools
MCP endpoint: http://0.0.0.0:8000/mcp
```

> **Note:** Inside the container the server listens on port `8000`. Docker Compose exposes port `8787` on the host by default (configurable via `MCP_PORT`).

Quick health check:

```bash
curl http://localhost:8787/health
# → {"status":"ok","env":"local","apiUrl":"...","tools":32}
```

### Platform Notes

**macOS / Windows (Docker Desktop):** To connect to an S4E API running on the host machine, set `S4E_API_URL=http://host.docker.internal:8000/api` in `.env`.

**Linux:** `docker-compose.yml` includes `extra_hosts: - "host.docker.internal:host-gateway"`; Docker 20.10+ resolves this automatically.

### Where Does the Token Come From?

**The server does not store tokens.** Every MCP request must carry the user's own token in the `S4E-API-Token` header. This allows a single server instance to serve multiple users in parallel.

There is no `S4E_API_TOKEN` in the `.env` file.

---

## 2. Production Deploy

Kubernetes / Helm deployment is not managed in this repo; it lives in a separate IaC repository. This repo is for source code and Docker image builds only.

Example image build:

```bash
docker build -t s4e-mcp:1.0.0 .
```

See the IaC repo for deployment details (Helm chart, ingress, environment values).

---

## 3. Connect an MCP Client

Once the server is running (Docker or remote deploy), connect your client using `Streamable HTTP` transport. The server does not store tokens; each client must send its own `S4E-API-Token` in the request header.

> **Where to get a token:** [https://app.s4e.io/api-token](https://app.s4e.io/api-token) — copy your token and replace `<YOUR_TOKEN>` in the configs below. **Do not commit tokens** to a public repo or shared screen.

Local URL for all clients: **`http://localhost:8787/mcp`** (Docker Compose default host port).

---

### Cursor

`~/.cursor/mcp.json` (global) or `.cursor/mcp.json` (project):

Get your token from [app.s4e.io/api-token](https://app.s4e.io/api-token).

```json
{
  "mcpServers": {
    "s4e": {
      "type": "http",
      "url": "http://localhost:8787/mcp",
      "headers": {
        "S4E-API-Token": "<YOUR_TOKEN>"
      }
    }
  }
}
```

Cursor treats the `type` field as optional (it infers transport from `url`), but including it is recommended for consistency.

---

### Claude Desktop

`~/Library/Application Support/Claude/claude_desktop_config.json` (macOS):

Get your token from [app.s4e.io/api-token](https://app.s4e.io/api-token).

```json
{
  "mcpServers": {
    "s4e": {
      "type": "http",
      "url": "http://localhost:8787/mcp",
      "headers": {
        "S4E-API-Token": "<YOUR_TOKEN>"
      }
    }
  }
}
```

After saving the config, reload Claude Desktop:
- **Quick reload: `Ctrl+R`** — reloads config and restarts MCP servers.
- **Full restart: `Cmd+Q`** to quit completely, then reopen (closing the window is not enough). Use this if `Ctrl+R` doesn't work or the MCP server still doesn't appear.

---

### Claude Code

**Via CLI (fastest):**

```bash
# Local Docker
claude mcp add --transport http s4e http://localhost:8787/mcp \
  --header "S4E-API-Token: <YOUR_TOKEN>"
```

**Via JSON (`~/.claude.json` or `.mcp.json` in the project):**

Get your token from [app.s4e.io/api-token](https://app.s4e.io/api-token).

```json
{
  "mcpServers": {
    "s4e": {
      "type": "http",
      "url": "http://localhost:8787/mcp",
      "headers": {
        "S4E-API-Token": "<YOUR_TOKEN>"
      }
    }
  }
}
```

`"type": "http"` is **required** in Claude Code — transport is not inferred from `url`.

---

### Test

After adding the client, try simple prompts:
- "Verify my S4E.io token"
- "Show my asset list"
- "Start a full scan for example.com"

If the first request doesn't return `/health` 200 + `tools: 32`, see **Troubleshooting** below.

---

### Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `401 token required` | `S4E-API-Token` header not sent | Check that `headers` is set in your config |
| Tool list not loading | Container not running | `docker compose ps` → should be `running`; is `curl http://127.0.0.1:8787/health` returning 200? |
| "Cannot find module dist/stdio.js" | Old stdio config leftover | Remove old `command: node ... stdio.js` entry from `claude_desktop_config.json`, keep only the HTTP entry |
| Changes not visible in Claude Desktop | Config not reloaded | Try **`Ctrl+R`** first, then **`Cmd+Q`** + reopen |
| Not visible in Cursor | Cache | Restart Cursor or Settings → MCP → s4e → Reload |

---

## 4. Development

### Requirements

- Node.js 22+
- npm

### Setup

```bash
npm install
cp .env.example .env
```

### Dev Server (hot reload)

```bash
npm run dev    # tsx watch src/http.ts
```

Loads `.env` automatically. The server restarts on code changes. Default port is `MCP_PORT` in `.env` (e.g. `8787`).

### Build & Production Run

```bash
npm run build      # tsc → dist/
npm start          # node dist/http.js (reads .env)
```

### Type Check

```bash
npm run typecheck  # tsc --noEmit
```

Required in CI. Strict mode is enabled; `any` and implicit `any` are not allowed.

### Docker

```bash
npm run docker:build    # local image build (s4e-mcp:local)
npm run docker:up       # docker compose up --build
npm run docker:down     # docker compose down
```

### Project Structure

```
src/
├── core/                  # API client, config, shared types
│   ├── client.ts          # S4EClient — HTTP client
│   ├── config.ts          # resolveApiConfig (S4E_API_URL required)
│   ├── types.ts           # API response types, ToolResult helpers
│   └── index.ts           # Barrel export
│
├── tools/                 # Domain modules
│   ├── registry.ts        # TOOL_DEFINITIONS — SINGLE SOURCE (32 tools)
│   ├── user/              # Token verify, user info
│   ├── scans/             # Full / light / crawler scan
│   ├── assets/            # Domain, IP, CIDR asset management
│   ├── crawler/           # Crawler settings, URL exclusion
│   ├── reports/           # Vulnerability reporting, export
│   ├── dashboard/         # Security summary, scan history
│   └── help/              # Help system
│
└── http.ts                # Hono + Streamable HTTP MCP transport (SINGLE ENTRY)
```

### Adding a New Tool

All tool definitions live in a single `TOOL_DEFINITIONS` array in `src/tools/registry.ts`. To add a new tool:

1. Write the API function in the domain module (`src/tools/<domain>/`) if needed.
2. Add the tool definition to `registry.ts`:
   ```ts
   {
     name: "my_new_tool",
     description: "Description (visible to the LLM)",
     schema: z.object({
       asset: z.string().describe("Asset name"),
     }),
     handler: async (client, params) => {
       const result = await myApiCall(client, params.asset as string);
       return createToolResult(result);
     },
   }
   ```
3. Run `npm run typecheck`.
4. Restart the server — the new tool is registered automatically.

---

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `S4E_API_URL` | Upstream S4E API URL | **Yes** | — |
| `S4E_ENV` | Environment label (`prod` / `test` / `local`) — logs + `/health` | No | `unknown` |
| `APP_URL` | Web app URL for dashboard links in tool output | No | `https://app.s4e.io` |
| `MCP_HOST` | HTTP server bind address | No | `0.0.0.0` |
| `MCP_PORT` | HTTP server port (`npm run dev` / `node`) | No | `8000` |
| `MCP_DEBUG` | `/mcp` request logging (`1` to enable) | No | off |

> **Docker Compose:** The host port is set by `MCP_PORT` in `.env` (default `8787`). Inside the container the server always listens on port `8000`.

Tokens are **not** stored in env. Every request must include the `S4E-API-Token` header; otherwise `/mcp` returns 401.

---

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/mcp` | MCP Streamable HTTP — endpoint for clients |
| `GET`  | `/health` | Health check — `{ status, env, apiUrl, tools }` |

---

## License

MIT
