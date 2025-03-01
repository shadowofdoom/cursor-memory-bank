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
exports.MemoryBankMCPServer = void 0;
const path = __importStar(require("path"));
const mcp_mock_1 = require("./mcp-mock");
const memory_bank_manager_1 = require("./memory-bank-manager");
const types_1 = require("./types");
/**
 * MCP Server for Cursor Memory Bank
 */
class MemoryBankMCPServer {
    constructor(workspacePath) {
        this.workspacePath = workspacePath;
        this.memoryBankManager = new memory_bank_manager_1.MemoryBankManager({
            workspacePath,
            memoryBankPath: path.join(workspacePath, 'memory-bank')
        });
        this.server = new mcp_mock_1.MCPServer({
            name: 'cursor-memory-bank',
            description: 'Memory Bank MCP Server for Cursor',
            version: '1.0.0'
        });
        this.registerTools();
    }
    /**
     * Start the MCP server
     */
    async start() {
        await this.server.start();
        console.log('Memory Bank MCP Server started');
    }
    /**
     * Register MCP tools
     */
    registerTools() {
        // Initialize Memory Bank tool
        this.server.registerTool(new mcp_mock_1.MCPTool({
            name: 'initialize_memory_bank',
            description: 'Initialize the Memory Bank structure for a project',
            parameters: {
                type: 'object',
                properties: {
                    project_name: {
                        type: 'string',
                        description: 'Name of the project'
                    },
                    project_description: {
                        type: 'string',
                        description: 'Description of the project'
                    },
                    technologies: {
                        type: 'array',
                        items: {
                            type: 'string'
                        },
                        description: 'List of technologies used in the project'
                    }
                },
                required: ['project_name', 'project_description']
            },
            handler: async (params) => {
                try {
                    const projectInfo = {
                        name: params.project_name,
                        description: params.project_description,
                        technologies: params.technologies || [],
                        structure: ''
                    };
                    const structure = await this.memoryBankManager.initialize(projectInfo);
                    return {
                        result: {
                            message: 'Memory Bank initialized successfully',
                            files: Object.values(structure)
                        }
                    };
                }
                catch (error) {
                    console.error('Error initializing memory bank:', error);
                    return {
                        error: {
                            message: `Failed to initialize memory bank: ${error instanceof Error ? error.message : String(error)}`
                        }
                    };
                }
            }
        }));
        // Read Memory Bank tool
        this.server.registerTool(new mcp_mock_1.MCPTool({
            name: 'read_memory_bank',
            description: 'Read all Memory Bank files',
            parameters: {
                type: 'object',
                properties: {},
                required: []
            },
            handler: async () => {
                try {
                    const structure = await this.memoryBankManager.readAll();
                    if (!structure) {
                        return {
                            result: {
                                message: 'Memory Bank not found or empty',
                                files: []
                            }
                        };
                    }
                    return {
                        result: {
                            message: 'Memory Bank read successfully',
                            files: Object.values(structure)
                        }
                    };
                }
                catch (error) {
                    console.error('Error reading memory bank:', error);
                    return {
                        error: {
                            message: `Failed to read memory bank: ${error instanceof Error ? error.message : String(error)}`
                        }
                    };
                }
            }
        }));
        // Update Memory Bank File tool
        this.server.registerTool(new mcp_mock_1.MCPTool({
            name: 'update_memory_bank_file',
            description: 'Update a specific Memory Bank file',
            parameters: {
                type: 'object',
                properties: {
                    file_name: {
                        type: 'string',
                        description: 'Name of the file to update (e.g., projectbrief, productContext, etc.)'
                    },
                    content: {
                        type: 'string',
                        description: 'New content for the file'
                    }
                },
                required: ['file_name', 'content']
            },
            handler: async (params) => {
                try {
                    const fileName = params.file_name;
                    const content = params.content;
                    const file = await this.memoryBankManager.updateFile(fileName, content);
                    return {
                        result: {
                            message: `File ${fileName} updated successfully`,
                            file
                        }
                    };
                }
                catch (error) {
                    console.error('Error updating memory bank file:', error);
                    return {
                        error: {
                            message: `Failed to update memory bank file: ${error instanceof Error ? error.message : String(error)}`
                        }
                    };
                }
            }
        }));
        // Process Memory Bank Command tool
        this.server.registerTool(new mcp_mock_1.MCPTool({
            name: 'process_memory_bank_command',
            description: 'Process a Memory Bank command',
            parameters: {
                type: 'object',
                properties: {
                    command: {
                        type: 'string',
                        description: 'Memory Bank command to process'
                    },
                    args: {
                        type: 'array',
                        items: {
                            type: 'string'
                        },
                        description: 'Arguments for the command'
                    }
                },
                required: ['command']
            },
            handler: async (params) => {
                try {
                    const command = params.command;
                    const args = params.args || [];
                    // Process command
                    if (command.toLowerCase() === types_1.MemoryBankCommandType.INITIALIZE) {
                        // Initialize memory bank
                        if (args.length < 2) {
                            return {
                                error: {
                                    message: 'Missing required arguments: project_name and project_description'
                                }
                            };
                        }
                        const projectInfo = {
                            name: args[0],
                            description: args[1],
                            technologies: args.slice(2),
                            structure: ''
                        };
                        const structure = await this.memoryBankManager.initialize(projectInfo);
                        return {
                            result: {
                                message: 'Memory Bank initialized successfully',
                                files: Object.values(structure)
                            }
                        };
                    }
                    else if (command.toLowerCase() === types_1.MemoryBankCommandType.UPDATE) {
                        // Update memory bank
                        const structure = await this.memoryBankManager.readAll();
                        if (!structure) {
                            return {
                                error: {
                                    message: 'Memory Bank not found or empty'
                                }
                            };
                        }
                        return {
                            result: {
                                message: 'Memory Bank files ready for update',
                                files: Object.values(structure)
                            }
                        };
                    }
                    else if (command.toLowerCase() === types_1.MemoryBankCommandType.FOLLOW) {
                        // Follow memory bank
                        const structure = await this.memoryBankManager.readAll();
                        if (!structure) {
                            return {
                                error: {
                                    message: 'Memory Bank not found or empty'
                                }
                            };
                        }
                        return {
                            result: {
                                message: 'Memory Bank files loaded',
                                files: Object.values(structure)
                            }
                        };
                    }
                    else {
                        return {
                            error: {
                                message: `Unknown command: ${command}`
                            }
                        };
                    }
                }
                catch (error) {
                    console.error('Error processing memory bank command:', error);
                    return {
                        error: {
                            message: `Failed to process memory bank command: ${error instanceof Error ? error.message : String(error)}`
                        }
                    };
                }
            }
        }));
    }
}
exports.MemoryBankMCPServer = MemoryBankMCPServer;
