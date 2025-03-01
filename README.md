# Cursor Memory Bank MCP Server

A Model Context Protocol (MCP) server that implements the Cline Memory Bank concept for Cursor IDE. This tool helps maintain context across sessions by creating and managing a structured documentation system.

## What is Memory Bank?

Memory Bank is a self-documenting system that maintains context across sessions through a structured documentation approach. It ensures AI assistants like Claude or Cursor's AI can quickly rebuild their understanding of your project by reading these files after context resets.

The system works by:
1. Creating and maintaining a set of markdown files in a `memory-bank/` folder
2. Documenting project context, architecture, patterns, and progress
3. Updating these files as development progresses
4. Reading these files at the start of each new session

## Installation

### Option 1: Install from local directory

Clone this repository and install it globally:

```bash
git clone https://github.com/shadowofdoom/cursor-memory-bank.git
cd cursor-memory-bank
npm install
npm run build
npm install -g .
```

### Option 2: Run directly from source

Clone this repository and run it directly:

```bash
git clone https://github.com/shadowofdoom/cursor-memory-bank.git
cd cursor-memory-bank
npm install
npm run build
npm run start
```

## Usage

### Starting the MCP Server

If installed globally:

```bash
npx cursor-memory-bank
```

If running from source:

```bash
npm run start
```

### Adding to Cursor

1. Open Cursor Settings
2. Navigate to Features
3. Scroll to MCP Servers section
4. Click "Add New MCP Server"
5. Use the following command:
   ```
   npx cursor-memory-bank
   ```

### Automatic Integration with Cursor

This project provides two ways to integrate with Cursor's AI:

#### 1. Project-Specific Rules (.cursorrules)

The MCP server automatically creates a `.cursorrules` file in your project root that instructs Cursor's AI to:

- Read all memory bank files at the start of each session
- Update the memory bank files when significant changes are made
- Respond to memory bank commands

#### 2. Global Rules (Project Rules)

The MCP server also creates a global rule file in the `.cursor/rules` directory that works with Cursor's Project Rules system:

- Located at `.cursor/rules/memory-bank.mdc`
- Automatically applies to all markdown files in your project
- Provides the same memory bank functionality as the `.cursorrules` file
- Works with Cursor's new Project Rules system

To use global rules:

1. Open Cursor Settings
2. Navigate to General > Project Rules
3. Verify that the "memory-bank" rule is enabled
4. The rule will automatically apply to all markdown files in your project

## Interoperability with Cline

This MCP server is designed to work with both new and existing memory banks, including those created by Cline. Key features:

- **Automatic Detection**: The server automatically detects if a Cline memory bank already exists in your project
- **Seamless Integration**: If a Cline memory bank is found, the server will use it without modification
- **Compatible Structure**: The memory bank structure is compatible with both Cursor and Cline
- **Switch Between Assistants**: You can use both Cursor and Cline with the same memory bank, switching between them as needed

This allows you to:
1. Start a project with Cline and continue with Cursor
2. Use Cursor for some tasks and Cline for others
3. Collaborate with team members who prefer different assistants

The memory bank files serve as a shared knowledge base that both assistants can read and update.

## Memory Bank Structure

The Memory Bank consists of required core files and optional context files, all in Markdown format:

```
memory-bank/
├── projectbrief.md      # Foundation document
├── productContext.md    # Business and user perspective
├── systemPatterns.md    # Technical architecture and decisions
├── techContext.md       # Development environment and stack
├── activeContext.md     # Current state of development
├── progress.md          # Project status and tracking
└── .clinerules          # Project-specific patterns and preferences
```

## Commands

When using Cursor with this MCP server, you can use the following commands:

- `initialize memory bank` - Create the initial memory bank structure
- `update memory bank` - Review and update all memory bank files
- `follow memory bank` - Read the memory bank files and continue where you left off

## How It Works

1. The MCP server monitors your project workspace
2. It creates and maintains the memory bank files
3. It provides these files to Cursor's AI when needed
4. The `.cursorrules` file and global rules instruct Cursor's AI to automatically use the memory bank

## License

MIT 