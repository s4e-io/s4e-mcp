# S4E.io MCP Server

> [English README](./README.md)

S4E.io siber guvenlik platformu icin [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server. Claude Code, Cursor ve diger MCP uyumlu istemcilerin S4E.io API'si ile dogal dilde etkilesime girmesini saglar.

HTTP (Streamable) transport uzerinden calisir. Lokal kullanim Docker ile yapilir.

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

| Teknoloji | Aciklama |
|-----------|----------|
| **TypeScript** | ES2022 hedefli, strict mode |
| **Node.js 22** | Runtime |
| **Hono** + `@hono/node-server` | HTTP server framework |
| **@modelcontextprotocol/sdk** | MCP protokol implementasyonu (Streamable HTTP) |
| **Zod v4** | Tool parametre schema validasyonu |
| **dotenv** | `.env` dosyasini boot'ta yukler |
| **Docker** | Lokal calistirma + image build |

---

## 1. Lokal Calistirma (Docker)

### Gereksinimler

- Docker Desktop (Mac / Windows) veya Docker Engine + Compose v2 (Linux)
- S4E.io API token — [app.s4e.io/api-token](https://app.s4e.io/api-token)

### Adimlar (Mac / Linux / Windows ortak)

```bash
# 1. Repoyu klonla
git clone <repo-url> && cd s4e-mcp

# 2. Ortam dosyasini hazirla
cp .env.example .env
# S4E_API_URL ve diger degerleri ihtiyacina gore duzenle

# 3. Container'i ayaga kaldir
docker compose up --build
```

Servis acilinca:

```
S4E MCP Server starting...
  Env:     local
  API URL: https://api.s4e.io/api
  Listen:  http://0.0.0.0:8000
Registered 40 tools
MCP endpoint: http://0.0.0.0:8000/mcp
```

> **Not:** Container icinde server `8000` portunda dinler. Docker Compose host tarafinda varsayilan olarak `8787` portunu acar (`MCP_PORT` ile degistirilebilir).

Hizli saglik kontrolu:

```bash
curl http://localhost:8787/health
# → {"status":"ok","env":"local","apiUrl":"...","tools":40}
```

### Platform Notlari

**macOS / Windows (Docker Desktop):** Host makinede calisan bir S4E API'sine baglanmak icin `.env` icinde `S4E_API_URL=http://host.docker.internal:8000/api` kullanabilirsin.

**Linux:** `docker-compose.yml` icinde `extra_hosts: - "host.docker.internal:host-gateway"` tanimli; Docker 20.10+ bunu otomatik cozer.

### Token Nereden?

**Server token saklamaz.** Her MCP istegi `S4E-API-Token` header'inda kullanicinin kendi token'ini tasimak zorundadir. Boylece tek server instance'i farkli kullanicilarin token'lariyla paralel calisir.

`.env` dosyasinda `S4E_API_TOKEN` yoktur.

---

## 2. Production Deploy

Kubernetes / Helm deploy bu repoda degil; ayri bir IaC reposunda yonetilir. Bu repo yalnizca kaynak kod ve Docker image build icin kullanilir.

Image build ornegi:

```bash
docker build -t s4e-mcp:1.0.0 .
```

Deploy detaylari (Helm chart, ingress, ortam values) icin IaC reposuna bakin.

---

## 3. MCP Istemcisini Bagla

Server (Docker veya uzak deploy) ayakta olduktan sonra istemciyi `Streamable HTTP` transport ile bagla. Server token saklamaz; her istemci kendi `S4E-API-Token`'unu request header'inda gonderir.

> **Token nereden?** [https://app.s4e.io/api-token](https://app.s4e.io/api-token) — token kopyala, asagidaki config'lerde `<YOUR_TOKEN>` yerine yapistir. Token'i public repoya / paylasilan ekrana **commit etme**.

Lokalde tum istemciler icin URL: **`http://localhost:8787/mcp`** (Docker Compose varsayilan host portu).

---

### Cursor

`~/.cursor/mcp.json` (global) veya `.cursor/mcp.json` (proje):

Token'i [app.s4e.io/api-token](https://app.s4e.io/api-token) adresinden al.

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

Cursor `type` field'ini opsiyonel kabul eder (`url` varligindan transport'u cikarir) ama tutarlilik icin yazmak iyi.

---

### Claude Desktop

`~/Library/Application Support/Claude/claude_desktop_config.json` (macOS):

Token'i [app.s4e.io/api-token](https://app.s4e.io/api-token) adresinden al.

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

Config'i kaydettikten sonra Claude Desktop'i yenile:
- **Hizli yol: `Ctrl+R`** — config'i reload eder, MCP sunucularini yeniden baslatir.
- **Tam restart: `Cmd+Q`** ile tamamen kapat + tekrar ac (pencereyi kapatmak yetmez). `Ctrl+R` calismazsa veya MCP sunucusu hala gozukmuyorsa bunu kullan.

---

### Claude Code

**CLI ile (en hizli):**

```bash
# Lokal Docker
claude mcp add --transport http s4e http://localhost:8787/mcp \
  --header "S4E-API-Token: <YOUR_TOKEN>"
```

**JSON ile (`~/.claude.json` veya proje icinde `.mcp.json`):**

Token'i [app.s4e.io/api-token](https://app.s4e.io/api-token) adresinden al.

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

`"type": "http"` Claude Code'da **zorunlu** — `url`'den transport otomatik cikarilmaz.

---

### Test

Istemci eklendikten sonra basit komutlarla dene:
- "S4E.io token'imi dogrula"
- "Asset listemi goster"
- "example.com icin full scan baslat"

Ilk istek `/health` 200 + `tools: 40` dondurmuyorsa **Hata Durumunda** bolumune bak (asagida).

---

### Hata Durumunda

| Belirti | Sebep | Cozum |
|---------|-------|-------|
| `401 token required` | `S4E-API-Token` header gonderilmiyor | Config'de `headers` objesi var mi kontrol et |
| Tool listesi gelmiyor | Container ayakta degil | `docker compose ps` → `running` olmali; `curl http://127.0.0.1:8787/health` 200 mu? |
| "Cannot find module dist/stdio.js" | Eski stdio config kalintisi | `claude_desktop_config.json`'da eski `command: node ... stdio.js` entry'sini sil, sadece HTTP entry kalsin |
| Claude Desktop'ta degisiklikler gorunmuyor | Config reload edilmedi | Once **`Ctrl+R`** (hizli reload), olmazsa **`Cmd+Q`** + tekrar ac |
| Cursor'da gorunmuyor | Cache | Cursor'i restart et veya Settings → MCP → s4e → Reload |

---

## 4. Development

### Gereksinimler

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

`.env` dosyasini otomatik yukler. Kod degisince server otomatik restart olur. Varsayilan port `.env` icindeki `MCP_PORT` (ornek: `8787`).

### Build & Production Run

```bash
npm run build      # tsc → dist/
npm start          # node dist/http.js (.env'i okur)
```

### Type Check

```bash
npm run typecheck  # tsc --noEmit
```

CI'de bu zorunludur. Strict mode acik; `any` ve implicit `any` yasak.

### Docker

```bash
npm run docker:build    # local image build (s4e-mcp:local)
npm run docker:up       # docker compose up --build
npm run docker:down     # docker compose down
```

### Proje Yapisi

```
src/
├── core/                  # API client, config, ortak tipler
│   ├── client.ts          # S4EClient — HTTP istemcisi
│   ├── config.ts          # resolveApiConfig (S4E_API_URL zorunlu)
│   ├── types.ts           # API response tipleri, ToolResult yardimcilari
│   └── index.ts           # Barrel export
│
├── tools/                 # Domain modulleri
│   ├── registry.ts        # TOOL_DEFINITIONS — TEK KAYNAK (40 tool)
│   ├── user/              # Token verify, user info
│   ├── scans/             # Full / light / crawler scan
│   ├── assets/            # Domain, IP, CIDR varlik yonetimi
│   ├── crawler/           # Crawler ayarlari, URL exclusion
│   ├── reports/           # Vulnerability raporlama, export
│   ├── dashboard/         # Security summary, scan history
│   └── help/              # Yardim sistemi
│
└── http.ts                # Hono + Streamable HTTP MCP transport (TEK ENTRY)
```

### Yeni Tool Eklemek

Tum tool tanimlari `src/tools/registry.ts` icindeki tek bir `TOOL_DEFINITIONS` dizisinde. Yeni tool icin:

1. Domain modulunde (`src/tools/<domain>/`) API fonksiyonunu yaz (varsa).
2. `registry.ts`'a tool tanimi ekle:
   ```ts
   {
     name: "my_new_tool",
     description: "Aciklama (LLM gorur)",
     schema: z.object({
       asset: z.string().describe("Asset name"),
     }),
     handler: async (client, params) => {
       const result = await myApiCall(client, params.asset as string);
       return createToolResult(result);
     },
   }
   ```
3. `npm run typecheck` calistir.
4. Restart server — yeni tool otomatik kayit olur.

---

## Environment Degiskenleri

| Degisken | Aciklama | Zorunlu | Varsayilan |
|----------|----------|---------|------------|
| `S4E_API_URL` | Upstream S4E API URL'i | **Evet** | — |
| `S4E_ENV` | Ortam etiketi (`prod` / `test` / `local`) — log + `/health` | Hayir | `unknown` |
| `APP_URL` | Dashboard linkleri icin web uygulamasi URL'i | Hayir | `https://app.s4e.io` |
| `MCP_HOST` | HTTP server bind adresi | Hayir | `0.0.0.0` |
| `MCP_PORT` | HTTP server portu (`npm run dev` / `node` icin) | Hayir | `8000` |
| `MCP_DEBUG` | `/mcp` istek loglama (`1` acik) | Hayir | kapali |

> **Docker Compose:** Host tarafinda acilan port `.env` icindeki `MCP_PORT` ile belirlenir (varsayilan `8787`). Container icinde server her zaman `8000` portunda dinler.

Token env'de **yoktur**. Her istek icin client `S4E-API-Token` header'i gondermek zorundadir; aksi halde `/mcp` 401 doner.

---

## Endpoint'ler

| Method | Path | Aciklama |
|--------|------|----------|
| `POST` | `/mcp` | MCP Streamable HTTP — istemcilerin kullanacagi endpoint |
| `GET`  | `/health` | Saglik kontrolu — `{ status, env, apiUrl, tools }` |

---

## Lisans

MIT
