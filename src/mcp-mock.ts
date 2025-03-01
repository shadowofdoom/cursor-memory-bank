/**
 * Implementation of the MCP server for Cursor using SSE transport
 */
import * as http from 'http';
import * as url from 'url';

export interface MCPServerOptions {
  name: string;
  description: string;
  version: string;
  port?: number;
}

export interface MCPToolOptions {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required: string[];
  };
  handler: (params: any) => Promise<any>;
}

export class MCPTool {
  private name: string;
  private description: string;
  private parameters: any;
  private handler: (params: any) => Promise<any>;

  constructor(options: MCPToolOptions) {
    this.name = options.name;
    this.description = options.description;
    this.parameters = options.parameters;
    this.handler = options.handler;
  }

  public async execute(params: any): Promise<any> {
    return this.handler(params);
  }

  public getName(): string {
    return this.name;
  }

  public getDescription(): string {
    return this.description;
  }

  public getParameters(): any {
    return this.parameters;
  }
}

export class MCPServer {
  private name: string;
  private description: string;
  private version: string;
  private tools: Map<string, MCPTool> = new Map();
  private server: http.Server | null = null;
  private port: number;
  private clients: Map<string, http.ServerResponse> = new Map();
  private clientId: number = 0;

  constructor(options: MCPServerOptions) {
    this.name = options.name;
    this.description = options.description;
    this.version = options.version;
    this.port = options.port || 3000;
  }

  public async start(): Promise<void> {
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
            const tool = this.tools.get(name)!;
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
          } catch (error) {
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

  private sendSSEMessage(client: http.ServerResponse, event: string, data: any): void {
    client.write(`event: ${event}\n`);
    client.write(`data: ${JSON.stringify(data)}\n\n`);
  }

  public registerTool(tool: MCPTool): void {
    this.tools.set(tool.getName(), tool);
  }

  public async executeTool(name: string, params: any): Promise<any> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Tool not found: ${name}`);
    }
    
    return tool.execute(params);
  }
} 