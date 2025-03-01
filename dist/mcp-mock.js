"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.MCPServer = exports.MCPTool = void 0;
/**
 * Implementation of the MCP server for Cursor using SSE transport
 */
const http = __importStar(require("http"));
const url = __importStar(require("url"));
class MCPTool {
    constructor(options) {
        this.name = options.name;
        this.description = options.description;
        this.parameters = options.parameters;
        this.handler = options.handler;
    }
    async execute(params) {
        return this.handler(params);
    }
    getName() {
        return this.name;
    }
    getDescription() {
        return this.description;
    }
    getParameters() {
        return this.parameters;
    }
}
exports.MCPTool = MCPTool;
class MCPServer {
    constructor(options) {
        this.tools = new Map();
        this.server = null;
        this.clients = new Map();
        this.clientId = 0;
        this.name = options.name;
        this.description = options.description;
        this.version = options.version;
        this.port = options.port || 3000;
    }
    async start() {
        console.log(`Starting MCP server: ${this.name} v${this.version}`);
        console.log(`Description: ${this.description}`);
        console.log(`Registered tools: ${this.tools.size}`);
        // Log the tools
        this.tools.forEach((tool, name) => {
            console.log(`- ${name}: ${tool.getDescription()}`);
        });
        // Create HTTP server
        this.server = http.createServer(async (req, res) => {
            // Set CORS headers
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
            // Handle preflight requests
            if (req.method === 'OPTIONS') {
                res.writeHead(204);
                res.end();
                return;
            }
            // Parse URL
            const parsedUrl = url.parse(req.url || '', true);
            const path = parsedUrl.pathname || '';
            // Handle SSE endpoint
            if (path === '/sse' && req.method === 'GET') {
                // Set SSE headers
                res.writeHead(200, {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive'
                });
                // Send initial connection message
                const id = (this.clientId++).toString();
                this.clients.set(id, res);
                // Send server info
                this.sendSSEMessage(res, 'server_info', {
                    name: this.name,
                    description: this.description,
                    version: this.version,
                    tools: Array.from(this.tools.keys()).map(name => {
                        const tool = this.tools.get(name);
                        return {
                            name,
                            description: tool.getDescription(),
                            parameters: tool.getParameters()
                        };
                    })
                });
                // Handle client disconnect
                req.on('close', () => {
                    this.clients.delete(id);
                    console.log(`Client ${id} disconnected`);
                });
                return;
            }
            // Handle tool execution
            if (path === '/execute' && req.method === 'POST') {
                let body = '';
                req.on('data', chunk => {
                    body += chunk.toString();
                });
                req.on('end', async () => {
                    try {
                        const { tool, params, id } = JSON.parse(body);
                        if (!tool) {
                            res.writeHead(400, { 'Content-Type': 'application/json' });
                            res.end(JSON.stringify({ error: 'Tool name is required' }));
                            return;
                        }
                        const result = await this.executeTool(tool, params || {});
                        // Send result to all connected clients
                        this.clients.forEach(client => {
                            this.sendSSEMessage(client, 'tool_response', {
                                id,
                                result
                            });
                        });
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true }));
                    }
                    catch (error) {
                        console.error('Error executing tool:', error);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            error: error instanceof Error ? error.message : String(error)
                        }));
                    }
                });
                return;
            }
            // Handle unknown paths
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Not found' }));
        });
        // Start the server
        return new Promise((resolve, reject) => {
            this.server?.listen(this.port, () => {
                console.log(`MCP server listening on port ${this.port}`);
                resolve();
            }).on('error', (err) => {
                console.error(`Error starting MCP server: ${err.message}`);
                reject(err);
            });
        });
    }
    sendSSEMessage(client, event, data) {
        client.write(`event: ${event}\n`);
        client.write(`data: ${JSON.stringify(data)}\n\n`);
    }
    registerTool(tool) {
        this.tools.set(tool.getName(), tool);
    }
    async executeTool(name, params) {
        const tool = this.tools.get(name);
        if (!tool) {
            throw new Error(`Tool not found: ${name}`);
        }
        return tool.execute(params);
    }
}
exports.MCPServer = MCPServer;
