#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mcp_server_1 = require("./mcp-server");
/**
 * Parse command line arguments
 */
function parseArgs() {
    const args = process.argv.slice(2);
    const options = {};
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--port' && i + 1 < args.length) {
            const port = parseInt(args[i + 1], 10);
            if (!isNaN(port)) {
                options.port = port;
            }
            i++; // Skip the next argument
        }
        else if (args[i].startsWith('--transport=')) {
            options.transport = args[i].split('=')[1];
        }
    }
    return options;
}
/**
 * Main entry point for the Cursor Memory Bank MCP Server
 */
async function main() {
    try {
        // Parse command line arguments
        const options = parseArgs();
        // Get workspace path (current directory)
        const workspacePath = process.cwd();
        console.log(`Starting Memory Bank MCP Server for workspace: ${workspacePath}`);
        if (options.port) {
            console.log(`Using port: ${options.port}`);
        }
        if (options.transport) {
            console.log(`Using transport: ${options.transport}`);
        }
        else {
            console.log(`Using default transport: sse`);
            options.transport = 'sse';
        }
        // Create and start MCP server
        const server = new mcp_server_1.MemoryBankMCPServer(workspacePath, options.port);
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
    }
    catch (error) {
        console.error('Error starting Memory Bank MCP Server:', error);
        process.exit(1);
    }
}
// Run the main function
main().catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
});
