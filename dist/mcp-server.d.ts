/**
 * MCP Server for Cursor Memory Bank
 */
export declare class MemoryBankMCPServer {
    private server;
    private memoryBankManager;
    private workspacePath;
    private memoryBankPath;
    constructor(workspacePath: string, port?: number);
    /**
     * Start the MCP server
     */
    start(): Promise<void>;
    /**
     * Ensure .cursorrules file exists
     */
    private ensureCursorRules;
    /**
     * Ensure global rules exist
     */
    private ensureGlobalRules;
    /**
     * Check if memory-bank directory exists
     */
    private checkMemoryBank;
    /**
     * Register MCP tools
     */
    private registerTools;
}
