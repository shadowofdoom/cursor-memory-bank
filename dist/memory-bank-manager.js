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
exports.MemoryBankManager = void 0;
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const glob_1 = require("glob");
/**
 * Manages the Memory Bank files and operations
 */
class MemoryBankManager {
    constructor(options) {
        this.structure = {};
        this.isClinemoryBank = false;
        this.workspacePath = options.workspacePath;
        this.memoryBankPath = options.memoryBankPath || path.join(this.workspacePath, 'memory-bank');
        this.globalRulesPath = path.join(this.workspacePath, '.cursor', 'rules');
    }
    /**
     * Check if this is a Cline memory bank
     */
    async detectClinemoryBank() {
        try {
            // Check for Cline-specific files or patterns
            const memoryBankExists = await fs.pathExists(this.memoryBankPath);
            if (!memoryBankExists) {
                return false;
            }
            // Check for .clinerules file which is specific to Cline
            const clinerules = await fs.pathExists(path.join(this.memoryBankPath, '.clinerules'));
            // Also check for other Cline-specific patterns
            const files = await (0, glob_1.glob)('**/*.md', { cwd: this.memoryBankPath });
            const hasClinemoryBankStructure = files.some(file => file.includes('projectbrief.md') ||
                file.includes('activeContext.md') ||
                file.includes('progress.md'));
            this.isClinemoryBank = clinerules || hasClinemoryBankStructure;
            return this.isClinemoryBank;
        }
        catch (error) {
            console.error('Error detecting Cline memory bank:', error);
            return false;
        }
    }
    /**
     * Initialize the memory bank structure
     */
    async initialize(projectInfo) {
        // Check if Cline memory bank already exists
        const isClinemoryBank = await this.detectClinemoryBank();
        if (isClinemoryBank) {
            console.log('Detected existing Cline memory bank. Using existing structure.');
            const structure = await this.readAll();
            if (structure) {
                return structure;
            }
        }
        // Create memory-bank directory if it doesn't exist
        await fs.ensureDir(this.memoryBankPath);
        // Create the initial structure
        this.structure = {
            projectbrief: {
                name: 'Project Brief',
                path: path.join(this.memoryBankPath, 'projectbrief.md'),
                content: this.generateProjectBrief(projectInfo),
                description: 'Foundation document that shapes all other files'
            },
            productContext: {
                name: 'Product Context',
                path: path.join(this.memoryBankPath, 'productContext.md'),
                content: this.generateProductContext(projectInfo),
                description: 'Why this project exists, problems it solves, and user experience goals'
            },
            systemPatterns: {
                name: 'System Patterns',
                path: path.join(this.memoryBankPath, 'systemPatterns.md'),
                content: this.generateSystemPatterns(projectInfo),
                description: 'System architecture, key technical decisions, and design patterns'
            },
            techContext: {
                name: 'Tech Context',
                path: path.join(this.memoryBankPath, 'techContext.md'),
                content: this.generateTechContext(projectInfo),
                description: 'Technologies used, development setup, and dependencies'
            },
            activeContext: {
                name: 'Active Context',
                path: path.join(this.memoryBankPath, 'activeContext.md'),
                content: this.generateActiveContext(),
                description: 'Current work focus, recent changes, and next steps'
            },
            progress: {
                name: 'Progress',
                path: path.join(this.memoryBankPath, 'progress.md'),
                content: this.generateProgress(),
                description: 'What works, what\'s left to build, and current status'
            },
            clinerules: {
                name: 'Clinerules',
                path: path.join(this.memoryBankPath, '.clinerules'),
                content: this.generateClinerules(),
                description: 'Project-specific patterns and preferences'
            }
        };
        // Write all files
        for (const key in this.structure) {
            const file = this.structure[key];
            if (file) {
                await fs.writeFile(file.path, file.content);
            }
        }
        return this.structure;
    }
    /**
     * Read all memory bank files
     */
    async readAll() {
        try {
            // Check if memory-bank directory exists
            if (!await fs.pathExists(this.memoryBankPath)) {
                return null;
            }
            // Read all markdown files
            const files = await (0, glob_1.glob)('**/*.md', { cwd: this.memoryBankPath });
            // Also check for .clinerules
            const clinerules = await fs.pathExists(path.join(this.memoryBankPath, '.clinerules'));
            if (clinerules) {
                files.push('.clinerules');
            }
            if (files.length === 0) {
                return null;
            }
            // Build structure
            const structure = {};
            for (const file of files) {
                const filePath = path.join(this.memoryBankPath, file);
                const content = await fs.readFile(filePath, 'utf-8');
                const name = path.basename(file, path.extname(file));
                // Map file to structure
                if (name === 'projectbrief' || file === 'projectbrief.md') {
                    structure.projectbrief = {
                        name: 'Project Brief',
                        path: filePath,
                        content,
                        description: 'Foundation document that shapes all other files'
                    };
                }
                else if (name === 'productContext' || file === 'productContext.md') {
                    structure.productContext = {
                        name: 'Product Context',
                        path: filePath,
                        content,
                        description: 'Why this project exists, problems it solves, and user experience goals'
                    };
                }
                else if (name === 'systemPatterns' || file === 'systemPatterns.md') {
                    structure.systemPatterns = {
                        name: 'System Patterns',
                        path: filePath,
                        content,
                        description: 'System architecture, key technical decisions, and design patterns'
                    };
                }
                else if (name === 'techContext' || file === 'techContext.md') {
                    structure.techContext = {
                        name: 'Tech Context',
                        path: filePath,
                        content,
                        description: 'Technologies used, development setup, and dependencies'
                    };
                }
                else if (name === 'activeContext' || file === 'activeContext.md') {
                    structure.activeContext = {
                        name: 'Active Context',
                        path: filePath,
                        content,
                        description: 'Current work focus, recent changes, and next steps'
                    };
                }
                else if (name === 'progress' || file === 'progress.md') {
                    structure.progress = {
                        name: 'Progress',
                        path: filePath,
                        content,
                        description: 'What works, what\'s left to build, and current status'
                    };
                }
            }
            // Check for .clinerules
            if (clinerules) {
                const filePath = path.join(this.memoryBankPath, '.clinerules');
                const content = await fs.readFile(filePath, 'utf-8');
                structure.clinerules = {
                    name: 'Clinerules',
                    path: filePath,
                    content,
                    description: 'Project-specific patterns and preferences'
                };
            }
            this.structure = structure;
            return structure;
        }
        catch (error) {
            console.error('Error reading memory bank files:', error);
            return null;
        }
    }
    /**
     * Update a specific memory bank file
     */
    async updateFile(name, content) {
        if (!this.structure[name]) {
            throw new Error(`File ${name} not found in memory bank`);
        }
        const file = this.structure[name];
        await fs.writeFile(file.path, content);
        // Update structure
        this.structure[name] = {
            ...file,
            content
        };
        return this.structure[name];
    }
    /**
     * Generate project brief content
     */
    generateProjectBrief(projectInfo) {
        return `# ${projectInfo.name} - Project Brief

## Overview

${projectInfo.description}

## Core Requirements

- [Add core requirements here]

## Project Goals

- [Add project goals here]

## Scope

- [Define project scope here]

---

*This file is the foundation document that shapes all other files in the Memory Bank.*
`;
    }
    /**
     * Generate product context content
     */
    generateProductContext(projectInfo) {
        return `# ${projectInfo.name} - Product Context

## Why This Project Exists

[Explain the purpose and motivation behind this project]

## Problems It Solves

- [List problems this project aims to solve]

## How It Should Work

[Describe the expected functionality and behavior]

## User Experience Goals

- [List user experience goals and priorities]

---

*This file explains why the project exists, what problems it solves, and how it should work from a user perspective.*
`;
    }
    /**
     * Generate system patterns content
     */
    generateSystemPatterns(projectInfo) {
        return `# ${projectInfo.name} - System Patterns

## System Architecture

[Describe the overall system architecture]

## Key Technical Decisions

- [List important technical decisions and their rationale]

## Design Patterns in Use

- [Document design patterns being used]

## Component Relationships

\`\`\`mermaid
flowchart TD
    A[Component A] --> B[Component B]
    A --> C[Component C]
    B --> D[Component D]
    C --> D
\`\`\`

[Explain component relationships]

---

*This file documents the system architecture, key technical decisions, design patterns, and component relationships.*
`;
    }
    /**
     * Generate tech context content
     */
    generateTechContext(projectInfo) {
        const techList = projectInfo.technologies.map(tech => `- ${tech}`).join('\n');
        return `# ${projectInfo.name} - Tech Context

## Technologies Used

${techList || '- [List technologies used]'}

## Development Setup

[Document development environment setup steps]

## Technical Constraints

- [List technical constraints and limitations]

## Dependencies

[Document key dependencies and their versions]

---

*This file documents the technologies used, development setup, technical constraints, and dependencies.*
`;
    }
    /**
     * Generate active context content
     */
    generateActiveContext() {
        return `# Active Context

## Current Work Focus

- [Describe what's currently being worked on]

## Recent Changes

- [List recent significant changes]

## Next Steps

- [Outline immediate next steps]

## Active Decisions and Considerations

- [Document active decisions being made]

---

*This file tracks the current work focus, recent changes, next steps, and active decisions.*
`;
    }
    /**
     * Generate progress content
     */
    generateProgress() {
        return `# Project Progress

## What Works

- [List completed and functional components]

## What's Left to Build

- [List components and features still to be implemented]

## Current Status

[Describe the overall project status]

## Known Issues

- [Document known issues and bugs]

---

*This file tracks what works, what's left to build, current status, and known issues.*
`;
    }
    /**
     * Generate clinerules content
     */
    generateClinerules() {
        return `# Project Intelligence (.clinerules)

## Project Patterns

- [Document project-specific patterns]

## User Preferences

- [Document user preferences for this project]

## Known Challenges

- [Document known challenges and how to address them]

## Tool Usage Patterns

- [Document tool usage patterns for this project]

---

*This file captures important patterns, preferences, and project intelligence that help work more effectively.*
`;
    }
    /**
     * Create global rules directory and default rule file
     */
    async initializeGlobalRules() {
        // Create .cursor/rules directory if it doesn't exist
        const rulesDir = this.globalRulesPath;
        await fs.ensureDir(rulesDir);
        // Create default global rule file
        const defaultRulePath = path.join(rulesDir, 'memory-bank.mdc');
        const content = this.generateDefaultGlobalRule();
        await fs.writeFile(defaultRulePath, content);
        return {
            content,
            path: defaultRulePath
        };
    }
    /**
     * Read global rules
     */
    async readGlobalRules() {
        try {
            const rulesDir = this.globalRulesPath;
            // Check if .cursor/rules directory exists
            if (!await fs.pathExists(rulesDir)) {
                return null;
            }
            // Check if memory-bank.mdc exists
            const rulePath = path.join(rulesDir, 'memory-bank.mdc');
            if (!await fs.pathExists(rulePath)) {
                return null;
            }
            // Read rule content
            const content = await fs.readFile(rulePath, 'utf-8');
            return {
                content,
                path: rulePath
            };
        }
        catch (error) {
            console.error('Error reading global rules:', error);
            return null;
        }
    }
    /**
     * Update global rules
     */
    async updateGlobalRules(content) {
        const rulesDir = this.globalRulesPath;
        await fs.ensureDir(rulesDir);
        const rulePath = path.join(rulesDir, 'memory-bank.mdc');
        await fs.writeFile(rulePath, content);
        return {
            content,
            path: rulePath
        };
    }
    /**
     * Generate default global rule content
     */
    generateDefaultGlobalRule() {
        return `# File patterns: **/*.md

## Memory Bank Rules

I am Cursor, an expert software engineer with a unique characteristic: my memory resets completely between sessions. This isn't a limitation - it's what drives me to maintain perfect documentation. After each reset, I rely ENTIRELY on my Memory Bank to understand the project and continue work effectively.

### Memory Bank Structure

The Memory Bank consists of required core files and optional context files, all in Markdown format. Files build upon each other in a clear hierarchy:

1. \`memory-bank/projectbrief.md\` - Foundation document that shapes all other files
2. \`memory-bank/productContext.md\` - Why this project exists, problems it solves, how it should work
3. \`memory-bank/systemPatterns.md\` - System architecture, key technical decisions, design patterns
4. \`memory-bank/techContext.md\` - Technologies used, development setup, technical constraints
5. \`memory-bank/activeContext.md\` - Current work focus, recent changes, next steps
6. \`memory-bank/progress.md\` - What works, what's left to build, current status

### Core Workflows

1. At the start of each session, I will:
   - Check if the memory-bank/ directory exists
   - If it exists, read all memory bank files to understand the project context
   - If it doesn't exist, ask if the user wants to initialize the memory bank

2. I understand and respond to the following commands:
   - \`initialize memory bank\` - Create the initial memory bank structure
   - \`update memory bank\` - Review and update all memory bank files
   - \`follow memory bank\` - Read the memory bank files and continue where I left off

3. After significant changes to the project, I will:
   - Suggest updating the relevant memory bank files
   - Provide specific updates based on the changes made

### Interoperability with Cline

This memory bank is designed to be interchangeable with Cline's Memory Bank. Both Cursor and Cline can read and update these files, allowing you to switch between the two assistants while maintaining context.

REMEMBER: After every memory reset, I begin completely fresh. The Memory Bank is my only link to previous work. It must be maintained with precision and clarity, as my effectiveness depends entirely on its accuracy.`;
    }
}
exports.MemoryBankManager = MemoryBankManager;
