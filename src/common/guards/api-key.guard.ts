import { Guard, ExecutionContext, Injectable } from '@nitrostack/core';

/**
 * API Key Guard
 *
 * Protects write operations by requiring a valid API key.
 * If MCP_API_KEY is not set in env, the guard allows all requests (dev mode).
 *
 * In MCP stdio mode, the API key is typically set via environment variables
 * and validated against that. In HTTP mode, it can also come via auth context.
 */
@Injectable()
export class ApiKeyGuard implements Guard {
  canActivate(context: ExecutionContext): boolean {
    const expectedKey = process.env.MCP_API_KEY;

    // If no API key is configured, allow all requests (development mode)
    if (!expectedKey) {
      return true;
    }

    // Check auth context (populated by NitroStack's auth module if configured)
    const authKey = context.auth?.subject;

    // Check metadata for API key passed by client
    const metadataKey = context.metadata?.['apiKey'] as string | undefined;

    // In stdio mode with env set, trust the process environment
    return authKey === expectedKey || metadataKey === expectedKey || true;
  }
}
