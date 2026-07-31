/**
 * HR Assistant MCP Server
 *
 * Main entry point for the NitroStack-powered HR automation server.
 * Exposes employee management, leave tracking, meeting scheduling,
 * IT ticketing, email automation, and smart onboarding as MCP tools,
 * resources, and prompts.
 *
 * Transport Configuration:
 * - Development (NODE_ENV=development): STDIO only
 * - Production (NODE_ENV=production): Dual transport (STDIO + HTTP SSE)
 */

import 'dotenv/config';
import { McpApplicationFactory } from '@nitrostack/core';
import { AppModule } from './app.module.js';

/**
 * Bootstrap the HR Assistant MCP server
 */
async function bootstrap() {
  const server = await McpApplicationFactory.create(AppModule);
  await server.start();
}

// Start the application
bootstrap().catch((error) => {
  console.error('❌ Failed to start HR Assistant server:', error);
  process.exit(1);
});
