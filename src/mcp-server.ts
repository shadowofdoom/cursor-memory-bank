import * as path from 'path';
import * as fs from 'fs-extra';
import { MCPServer, MCPTool } from './mcp-mock';
import { MemoryBankManager } from './memory-bank-manager';
import { MemoryBankCommandType, ProjectInfo, MemoryBankStructure } from './types';

/**
 * MCP Server for Cursor Memory Bank
 */
export class MemoryBankMCPServer {
  private server: MCPServer;
  private memoryBankManager: MemoryBankManager;
  private workspacePath: string;
  private memoryBankPath: string;

  constructor(workspacePath: string, port?: number) {
    this.workspacePath = workspacePath;
    this.memoryBankPath = path.join(workspacePath, 'memory-bank');
    this.memoryBankManager = new MemoryBankManager({
      workspacePath,
      memoryBankPath: this.memoryBankPath
    });

    this.server = new MCPServer({
      name: 'cursor-memory-bank',
      description: 'Memory Bank MCP Server for Cursor',
      version: '1.0.0',
      port: port
    });

    this.registerTools();
  }

  /**
   * Start the MCP server
   */
  public async start(): Promise<void> {
    await this.server.start();
    console.log('Memory Bank MCP Server started');
    
    // Check if .cursorrules file exists, if not, create it
    await this.ensureCursorRules();
    
    // Check if global rules exist, if not, create them
    await this.ensureGlobalRules();
    
    // Check if memory-bank directory exists
    await this.checkMemoryBank();
  }

  /**
   * Ensure .cursorrules file exists
   */
  private async ensureCursorRules(): Promise<void> {
    const cursorRulesPath = path.join(this.workspacePath, '.cursorrules');
    
    if (!await fs.pathExists(cursorRulesPath)) {
      console.log('Creating .cursorrules file...');
      
      // Copy .cursorrules file from our package
      const sourcePath = path.join(__dirname, '../.cursorrules');
      
      if (await fs.pathExists(sourcePath)) {
        await fs.copy(sourcePath, cursorRulesPath);
        console.log('.cursorrules file created successfully');
      } else {
        console.log('Source .cursorrules file not found, skipping');
      }
    }
  }

  /**
   * Ensure global rules exist
   */
  private async ensureGlobalRules(): Promise<void> {
    const globalRules = await this.memoryBankManager.readGlobalRules();
    
    if (!globalRules) {
      console.log('Creating global rules...');
      
      try {
        const rules = await this.memoryBankManager.initializeGlobalRules();
        console.log(`Global rules created successfully at ${rules.path}`);
      } catch (error) {
        console.error('Error creating global rules:', error);
      }
    } else {
      console.log(`Global rules found at ${globalRules.path}`);
    }
  }

  /**
   * Check if memory-bank directory exists
   */
  private async checkMemoryBank(): Promise<void> {
    if (!await fs.pathExists(this.memoryBankPath)) {
      console.log('Memory Bank directory not found');
      console.log('Use "initialize memory bank" command to create it');
    } else {
      console.log('Memory Bank directory found');
      
      // Check if this is a Cline memory bank
      const isClinemoryBank = await this.memoryBankManager.detectClinemoryBank();
      if (isClinemoryBank) {
        console.log('Detected Cline Memory Bank. Compatible with Cursor Memory Bank.');
      }
      
      const structure = await this.memoryBankManager.readAll();
      
      if (structure) {
        console.log('Memory Bank files found:');
        Object.keys(structure).forEach(key => {
          console.log(`- ${key}`);
        });
      } else {
        console.log('No Memory Bank files found');
      }
    }
  }

  /**
   * Register MCP tools
   */
  private registerTools(): void {
    // Initialize Memory Bank tool
    this.server.registerTool(
      new MCPTool({
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
        handler: async (params: any) => {
          try {
            const projectInfo: ProjectInfo = {
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
          } catch (error) {
            console.error('Error initializing memory bank:', error);
            return {
              error: {
                message: `Failed to initialize memory bank: ${error instanceof Error ? error.message : String(error)}`
              }
            };
          }
        }
      })
    );

    // Read Memory Bank tool
    this.server.registerTool(
      new MCPTool({
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
          } catch (error) {
            console.error('Error reading memory bank:', error);
            return {
              error: {
                message: `Failed to read memory bank: ${error instanceof Error ? error.message : String(error)}`
              }
            };
          }
        }
      })
    );

    // Update Memory Bank File tool
    this.server.registerTool(
      new MCPTool({
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
        handler: async (params: any) => {
          try {
            const fileName = params.file_name as keyof MemoryBankStructure;
            const content = params.content;
            
            const file = await this.memoryBankManager.updateFile(fileName, content);
            
            return {
              result: {
                message: `File ${fileName} updated successfully`,
                file
              }
            };
          } catch (error) {
            console.error('Error updating memory bank file:', error);
            return {
              error: {
                message: `Failed to update memory bank file: ${error instanceof Error ? error.message : String(error)}`
              }
            };
          }
        }
      })
    );

    // Read Global Rules tool
    this.server.registerTool(
      new MCPTool({
        name: 'read_global_rules',
        description: 'Read global rules for Memory Bank',
        parameters: {
          type: 'object',
          properties: {},
          required: []
        },
        handler: async () => {
          try {
            const rules = await this.memoryBankManager.readGlobalRules();
            
            if (!rules) {
              return {
                result: {
                  message: 'Global rules not found',
                  content: ''
                }
              };
            }
            
            return {
              result: {
                message: 'Global rules read successfully',
                content: rules.content,
                path: rules.path
              }
            };
          } catch (error) {
            console.error('Error reading global rules:', error);
            return {
              error: {
                message: `Failed to read global rules: ${error instanceof Error ? error.message : String(error)}`
              }
            };
          }
        }
      })
    );

    // Update Global Rules tool
    this.server.registerTool(
      new MCPTool({
        name: 'update_global_rules',
        description: 'Update global rules for Memory Bank',
        parameters: {
          type: 'object',
          properties: {
            content: {
              type: 'string',
              description: 'New content for the global rules'
            }
          },
          required: ['content']
        },
        handler: async (params: any) => {
          try {
            const content = params.content;
            
            const rules = await this.memoryBankManager.updateGlobalRules(content);
            
            return {
              result: {
                message: 'Global rules updated successfully',
                content: rules.content,
                path: rules.path
              }
            };
          } catch (error) {
            console.error('Error updating global rules:', error);
            return {
              error: {
                message: `Failed to update global rules: ${error instanceof Error ? error.message : String(error)}`
              }
            };
          }
        }
      })
    );

    // Process Memory Bank Command tool
    this.server.registerTool(
      new MCPTool({
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
        handler: async (params: any) => {
          try {
            const command = params.command;
            const args = params.args || [];
            
            // Process command
            if (command.toLowerCase() === MemoryBankCommandType.INITIALIZE) {
              // Initialize memory bank
              if (args.length < 2) {
                return {
                  error: {
                    message: 'Missing required arguments: project_name and project_description'
                  }
                };
              }
              
              const projectInfo: ProjectInfo = {
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
            } else if (command.toLowerCase() === MemoryBankCommandType.UPDATE) {
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
            } else if (command.toLowerCase() === MemoryBankCommandType.FOLLOW) {
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
            } else {
              return {
                error: {
                  message: `Unknown command: ${command}`
                }
              };
            }
          } catch (error) {
            console.error('Error processing memory bank command:', error);
            return {
              error: {
                message: `Failed to process memory bank command: ${error instanceof Error ? error.message : String(error)}`
              }
            };
          }
        }
      })
    );
  }
} 