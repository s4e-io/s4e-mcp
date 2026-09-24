/**
 * S4E.io API Response Types
 */

// Raw API response format from S4E.io
export interface S4ERawApiResponse<T = unknown> {
  code: number;
  error: boolean;
  message: string;
  value?: T;
  event?: Record<string, unknown>;
}

// Normalized response format for MCP
export interface S4EApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// MCP Tool result format
export interface ToolResult {
  [key: string]: unknown;
  content: Array<{
    type: "text";
    text: string;
  }>;
}

export function createToolResult(data: unknown): ToolResult {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}

export function createErrorResult(error: string): ToolResult {
  return createToolResult({ success: false, error });
}
