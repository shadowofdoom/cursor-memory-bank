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
export declare class MCPTool {
    private name;
    private description;
    private parameters;
    private handler;
    constructor(options: MCPToolOptions);
    execute(params: any): Promise<any>;
    getName(): string;
    getDescription(): string;
    getParameters(): any;
}
export declare class MCPServer {
    private name;
    private description;
    private version;
    private tools;
    private server;
    private port;
    private clients;
    private clientId;
    constructor(options: MCPServerOptions);
    start(): Promise<void>;
    private sendSSEMessage;
    registerTool(tool: MCPTool): void;
    executeTool(name: string, params: any): Promise<any>;
}
