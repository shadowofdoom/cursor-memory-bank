import { MemoryBankFile, MemoryBankOptions, MemoryBankStructure, ProjectInfo } from './types';
/**
 * Manages the Memory Bank files and operations
 */
export declare class MemoryBankManager {
    private workspacePath;
    private memoryBankPath;
    private structure;
    constructor(options: MemoryBankOptions);
    /**
     * Initialize the memory bank structure
     */
    initialize(projectInfo: ProjectInfo): Promise<MemoryBankStructure>;
    /**
     * Read all memory bank files
     */
    readAll(): Promise<MemoryBankStructure | null>;
    /**
     * Update a specific memory bank file
     */
    updateFile(name: keyof MemoryBankStructure, content: string): Promise<MemoryBankFile>;
    /**
     * Generate project brief content
     */
    private generateProjectBrief;
    /**
     * Generate product context content
     */
    private generateProductContext;
    /**
     * Generate system patterns content
     */
    private generateSystemPatterns;
    /**
     * Generate tech context content
     */
    private generateTechContext;
    /**
     * Generate active context content
     */
    private generateActiveContext;
    /**
     * Generate progress content
     */
    private generateProgress;
    /**
     * Generate clinerules content
     */
    private generateClinerules;
}
