/**
 * MCP Server for Cursor Memory Bank
 */
export declare class MemoryBankMCPServer {
    private server;
    private memoryBankManager;
    private workspacePath;
    constructor(workspacePath: string);
    /**
     * Start the MCP server
     */
    start(): Promise<void>;
    /**
     * Register MCP tools
     */
    private registerTools;
}
