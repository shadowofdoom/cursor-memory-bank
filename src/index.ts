#!/usr/bin/env node

import * as path from 'path';
import { MemoryBankMCPServer } from './mcp-server';

/**
 * Main entry point for the Cursor Memory Bank MCP Server
 */
async function main() {
  try {
    // Get workspace path (current directory)
    const workspacePath = process.cwd();
    
    console.log(`Starting Memory Bank MCP Server for workspace: ${workspacePath}`);
    
    // Create and start MCP server
    const server = new MemoryBankMCPServer(workspacePath);
    await server.start();
    
    // Handle process termination
    process.on('SIGINT', () => {
      console.log('Shutting down Memory Bank MCP Server...');
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      console.log('Shutting down Memory Bank MCP Server...');
      process.exit(0);
    });
  } catch (error) {
    console.error('Error starting Memory Bank MCP Server:', error);
    process.exit(1);
  }
}

// Run the main function
main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
}); 