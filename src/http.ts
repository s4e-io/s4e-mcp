#!/usr/bin/env node
/**
 * S4E.io MCP Server - HTTP mode (Streamable HTTP, stateful sessions)
 */

import "dotenv/config";

import { randomUUID } from "node:crypto";

import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { serve, type HttpBindings } from "@hono/node-server";
import { X_ALREADY_SENT } from "@hono/node-server/utils/response/constants";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";

import { S4EClient, resolveApiConfig, warnOnceIfS4eTlsInsecure } from "./core/index.js";
import { TOOL_DEFINITIONS } from "./tools/registry.js";

const DEFAULT_PORT = 8000;

/**
 * Kubernetes injects Docker-link env vars for every Service.
 * This app is deployed as `mcp`, so kubelet sets MCP_PORT=tcp://<clusterIP>:<port>.
 * Number.parseInt("tcp://...") is NaN → @hono/node-server throws options.port NaN.
 */
function resolveListenPort(raw: string | undefined, fallback: number): number {
  const value = raw?.trim();
  if (!value) return fallback;

  const parsed = Number.parseInt(value, 10);
  if (Number.isInteger(parsed) && parsed >= 0 && parsed <= 65535) {
    return parsed;
  }

  console.warn(
    `Ignoring invalid MCP_PORT="${value}" (expected 0-65535). Falling back to ${fallback}.`
  );
  return fallback;
}

const HOST = process.env.MCP_HOST?.trim() || "0.0.0.0";
const PORT = resolveListenPort(process.env.MCP_PORT, DEFAULT_PORT);

const apiConfig = resolveApiConfig(
  process.env.S4E_API_URL,
  process.env.S4E_ENV ?? process.env.ENV
);

/** Gelen /mcp isteklerini ve transport hatalarını görmek için: MCP_DEBUG=1 */
function isMcpDebugEnabled(): boolean {
  const v = process.env.MCP_DEBUG?.trim().toLowerCase();
  if (!v) return false;
  return !["0", "false", "no", "off"].includes(v);
}

function summarizeMcpJsonBody(body: unknown): string {
  if (body == null) return "body=null";
  if (Array.isArray(body)) {
    const methods = body.map((entry) =>
      entry && typeof entry === "object" && "method" in entry && typeof entry.method === "string"
        ? entry.method
        : "?"
    );
    return `batch len=${body.length} methods=[${methods.join(",")}]`;
  }
  if (typeof body === "object") {
    const o = body as Record<string, unknown>;
    if (typeof o.method === "string") {
      const id = "id" in o ? String(JSON.stringify(o.id)) : "?";
      return `jsonrpc method=${o.method} id=${id}`;
    }
    return `keys=[${Object.keys(o).join(",")}]`;
  }
  return "body=<non-object>";
}

function logMcpIncoming(method: string, sessionIdHeader: string | undefined, hasToken: boolean, bodyHint: string) {
  if (!isMcpDebugEnabled()) return;
  const sid = sessionIdHeader?.trim() || "(no Mcp-Session-Id)";
  console.log(
    `[mcp-debug] <-- ${method} /mcp session=${sid} token_header=${hasToken ? "present" : "missing"} ${bodyHint}`
  );
}

function logMcpAfterHandled(outgoing: {
  statusCode: number;
  headersSent: boolean;
  writableFinished: boolean;
}, label: string) {
  if (!isMcpDebugEnabled()) return;
  console.log(
    `[mcp-debug] --> ${label} statusCode=${outgoing.statusCode} headersSent=${outgoing.headersSent} finished=${outgoing.writableFinished}`
  );
}

console.log(`S4E MCP Server starting...`);
console.log(`  Env:     ${apiConfig.env}`);
console.log(`  API URL: ${apiConfig.apiUrl}`);
console.log(`  Listen:  http://${HOST}:${PORT}`);
if (isMcpDebugEnabled()) {
  console.log(`  MCP debug: request logging ON (MCP_DEBUG=0|false|off to disable)`);
}
warnOnceIfS4eTlsInsecure();

interface Session {
  transport: StreamableHTTPServerTransport;
  server: McpServer;
}

const sessions = new Map<string, Session>();

/** MCP transport finishes the response on raw `outgoing`; tells @hono/node-server not to write again. */
function mcpAlreadyHandledResponse(): Response {
  return new Response(null, {
    status: 204,
    headers: { [X_ALREADY_SENT]: "1" },
  });
}

function buildServer(token: string): McpServer {
  const server = new McpServer({
    name: "s4e-mcp",
    version: "1.0.0",
  });

  const client = new S4EClient({ apiUrl: apiConfig.apiUrl, token });

  for (const tool of TOOL_DEFINITIONS) {
    const schemaShape = tool.schema.shape || {};

    server.tool(
      tool.name,
      tool.description,
      schemaShape,
      async (params: Record<string, unknown>) => {
        const result = await tool.handler(client, params);

        if (result && typeof result === "object" && "content" in result) {
          return result as { content: { type: "text"; text: string }[] };
        }

        return {
          content: [
            { type: "text" as const, text: JSON.stringify(result, null, 2) },
          ],
        };
      }
    );
  }

  return server;
}

const app = new Hono<{ Bindings: HttpBindings }>();

app.use("*", logger());
// CORS is intentionally open (origin "*"): authentication is the per-request
// S4E-API-Token header, not cookies, so cross-origin callers get no ambient
// credentials. If you expose this server publicly, restrict `origin` to your
// own clients and run it behind a reverse proxy rather than binding it directly.
app.use("/mcp", cors({
  origin: "*",
  allowMethods: ["POST", "GET", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "S4E-API-Token", "Mcp-Session-Id"],
  exposeHeaders: ["Mcp-Session-Id"],
}));

app.get("/health", (c) =>
  c.json({
    status: "ok",
    env: apiConfig.env,
    apiUrl: apiConfig.apiUrl,
    tools: TOOL_DEFINITIONS.length,
    sessions: sessions.size,
  })
);

app.post("/mcp", async (c) => {
  const tokenRaw = c.req.header("S4E-API-Token");
  const sessionHdr = c.req.header("Mcp-Session-Id");
  const body = await c.req.json().catch(() => null);

  logMcpIncoming(
    "POST",
    sessionHdr,
    Boolean(tokenRaw?.trim()),
    summarizeMcpJsonBody(body)
  );

  if (!tokenRaw?.trim()) {
    return c.json(
      { error: "S4E API token required. Pass via S4E-API-Token header." },
      401
    );
  }

  const token = tokenRaw;
  const sessionId = sessionHdr;

  let session: Session | undefined = sessionId ? sessions.get(sessionId) : undefined;

  if (!session) {
    if (!body || !isInitializeRequest(body)) {
      if (isMcpDebugEnabled()) {
        console.log(
          "[mcp-debug] POST rejected: need Mcp-Session-Id or JSON-RPC initialize as first message"
        );
      }
      return c.json(
        {
          jsonrpc: "2.0",
          error: { code: -32000, message: "No valid session ID provided" },
          id: null,
        },
        400
      );
    }

    const server = buildServer(token);
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (sid) => {
        sessions.set(sid, { transport, server });
      },
    });

    transport.onclose = () => {
      if (transport.sessionId) {
        sessions.delete(transport.sessionId);
      }
    };

    await server.connect(transport);
    session = { transport, server };
    if (isMcpDebugEnabled()) {
      console.log(`[mcp-debug] new MCP session established id=${transport.sessionId ?? "?"}`);
    }
  }

  try {
    await session.transport.handleRequest(c.env.incoming, c.env.outgoing, body);
  } catch (err) {
    console.error("[mcp] transport.handleRequest failed (POST):", err);
    throw err;
  }
  logMcpAfterHandled(c.env.outgoing, "POST");
  return mcpAlreadyHandledResponse();
});

app.get("/mcp", async (c) => {
  const sessionId = c.req.header("Mcp-Session-Id");
  logMcpIncoming(
    "GET",
    sessionId,
    Boolean(c.req.header("S4E-API-Token")?.trim()),
    "(no JSON body)"
  );
  const session = sessionId ? sessions.get(sessionId) : undefined;
  if (!session) {
    if (isMcpDebugEnabled()) {
      console.log("[mcp-debug] GET rejected: unknown or missing Mcp-Session-Id");
    }
    return c.json(
      { jsonrpc: "2.0", error: { code: -32000, message: "Invalid or missing session ID" }, id: null },
      400
    );
  }
  try {
    await session.transport.handleRequest(c.env.incoming, c.env.outgoing);
  } catch (err) {
    console.error("[mcp] transport.handleRequest failed (GET):", err);
    throw err;
  }
  logMcpAfterHandled(c.env.outgoing, "GET");
  return mcpAlreadyHandledResponse();
});

app.delete("/mcp", async (c) => {
  const sessionId = c.req.header("Mcp-Session-Id");
  logMcpIncoming(
    "DELETE",
    sessionId,
    Boolean(c.req.header("S4E-API-Token")?.trim()),
    "(no JSON body)"
  );
  const session = sessionId ? sessions.get(sessionId) : undefined;
  if (!session) {
    if (isMcpDebugEnabled()) {
      console.log("[mcp-debug] DELETE rejected: unknown or missing Mcp-Session-Id");
    }
    return c.json(
      { jsonrpc: "2.0", error: { code: -32000, message: "Invalid or missing session ID" }, id: null },
      400
    );
  }
  try {
    await session.transport.handleRequest(c.env.incoming, c.env.outgoing);
  } catch (err) {
    console.error("[mcp] transport.handleRequest failed (DELETE):", err);
    throw err;
  }
  logMcpAfterHandled(c.env.outgoing, "DELETE");
  return mcpAlreadyHandledResponse();
});

serve({ fetch: app.fetch, hostname: HOST, port: PORT }, (info) => {
  console.log(`Registered ${TOOL_DEFINITIONS.length} tools`);
  console.log(`MCP endpoint: http://${info.address}:${info.port}/mcp`);
});
