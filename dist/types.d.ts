/**
 * Types for the Cursor Memory Bank MCP Server
 */
export interface MemoryBankFile {
    name: string;
    path: string;
    content: string;
    description: string;
}
export interface MemoryBankStructure {
    projectbrief: MemoryBankFile;
    productContext: MemoryBankFile;
    systemPatterns: MemoryBankFile;
    techContext: MemoryBankFile;
    activeContext: MemoryBankFile;
    progress: MemoryBankFile;
    clinerules?: MemoryBankFile;
}
export interface MemoryBankOptions {
    workspacePath: string;
    memoryBankPath: string;
}
export interface MemoryBankCommand {
    command: string;
    description: string;
    handler: (args: string[]) => Promise<string>;
}
export interface MemoryBankToolDefinition {
    name: string;
    description: string;
    parameters: {
        type: string;
        properties: Record<string, any>;
        required: string[];
    };
}
export interface MemoryBankToolResponse {
    content: string;
    files?: MemoryBankFile[];
}
export declare enum MemoryBankCommandType {
    INITIALIZE = "initialize memory bank",
    UPDATE = "update memory bank",
    FOLLOW = "follow memory bank"
}
export interface ProjectInfo {
    name: string;
    description: string;
    technologies: string[];
    structure: string;
}
/**
 * Interface for global rules
 */
export interface GlobalRules {
    content: string;
    path: string;
}
