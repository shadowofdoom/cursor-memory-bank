import { MemoryBankFile, MemoryBankOptions, MemoryBankStructure, ProjectInfo, GlobalRules } from './types';
/**
 * Manages the Memory Bank files and operations
 */
export declare class MemoryBankManager {
    private workspacePath;
    private memoryBankPath;
    private structure;
    private globalRulesPath;
    private isClinemoryBank;
    constructor(options: MemoryBankOptions);
    /**
     * Check if this is a Cline memory bank
     */
    detectClinemoryBank(): Promise<boolean>;
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
    /**
     * Create global rules directory and default rule file
     */
    initializeGlobalRules(): Promise<GlobalRules>;
    /**
     * Read global rules
     */
    readGlobalRules(): Promise<GlobalRules | null>;
    /**
     * Update global rules
     */
    updateGlobalRules(content: string): Promise<GlobalRules>;
    /**
     * Generate default global rule content
     */
    private generateDefaultGlobalRule;
}
