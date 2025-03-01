# Cursor Memory Bank MCP Server

A Model Context Protocol (MCP) server that implements the Cline Memory Bank concept for Cursor IDE. This tool helps maintain context across sessions by creating and managing a structured documentation system.

**Never explain your project to AI assistants again.** This Model Context Protocol (MCP) server solves the biggest limitation of AI coding assistants: their inability to remember context between sessions. By implementing the Cline Memory Bank concept for Cursor IDE, it creates a persistent memory system that ensures your AI assistant always understands your project.

## What is Memory Bank?

Memory Bank is a self-documenting system that maintains context across sessions through a structured documentation approach. It ensures AI assistants like Claude or Cursor's AI can quickly rebuild their understanding of your project by reading these files after context resets.

The system works by:
1. Creating and maintaining a set of markdown files in a `memory-bank/` folder
2. Documenting project context, architecture, patterns, and progress
3. Updating these files as development progresses
4. Reading these files at the start of each new session

## Why Use Memory Bank?

### The Problem: Context Loss in AI Assistants

AI assistants like Cursor's AI and Claude face a fundamental limitation: **they forget everything between sessions**. This means:

- You waste time re-explaining your project structure and goals
- The AI makes inconsistent decisions across sessions
- Long-term project knowledge is lost
- Complex projects become difficult to manage with AI assistance
- Token limitations in long conversations cause context degradation

Even within a single session, as conversations grow longer, token limitations force the AI to forget earlier parts of the conversation, leading to inconsistent assistance.

### The Solution: Structured Documentation as Memory

Memory Bank solves these problems by:

- **Persistent Knowledge**: Creating a structured documentation system that persists between sessions
- **Efficient Context Loading**: Organizing information in a way that maximizes what the AI can understand with minimal tokens
- **Consistent Decision Making**: Maintaining a record of architectural decisions and patterns
- **Progress Tracking**: Documenting what works and what needs to be built
- **Long Conversation Support**: Providing mechanisms to refresh context during extended sessions

### Key Benefits

- **Save Time**: No more repeating yourself to the AI in every session
- **Maintain Consistency**: Ensure the AI makes consistent decisions aligned with your project vision
- **Improve Collaboration**: Team members can work with the same AI context
- **Reduce Frustration**: Eliminate the "why doesn't it remember what we did?" problem
- **Scale Projects**: Successfully use AI assistance on larger, more complex projects
- **Switch Assistants**: Seamlessly move between Cursor and Cline with shared context
- **Enhance Productivity**: Focus on building rather than explaining

### Real-World Example

Imagine you're building a complex web application with multiple microservices, authentication systems, and a custom frontend framework. Without Memory Bank:

**Day 1:**
- You spend 30 minutes explaining the project architecture to Cursor
- Cursor helps you implement a new feature
- Session ends

**Day 2:**
- Cursor has forgotten everything about your project
- You spend another 30 minutes re-explaining the architecture
- You notice inconsistencies in how Cursor approaches problems compared to yesterday
- You waste time correcting these inconsistencies

**With Memory Bank:**

**Day 1:**
- You initialize the memory bank and document your architecture
- Cursor helps you implement a new feature
- You update the memory bank with today's progress
- Session ends

**Day 2:**
- You start with "follow memory bank"
- Cursor immediately understands your project architecture
- Cursor maintains consistent approaches to problems
- You spend the entire session making progress instead of re-explaining

Over weeks of development, Memory Bank saves hours of repetitive explanation and ensures consistent, high-quality assistance.

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

### Optimizing Cursor Settings for Memory Bank

For the best experience with Memory Bank, especially during long conversations, configure Cursor's Rules settings:

#### Enable .cursorrules File

1. Open Cursor Settings
2. Navigate to Rules
3. Under "Project Rules", enable "Include .cursorrules file"
4. This ensures Cursor reads the memory bank instructions from your `.cursorrules` file

#### Add a Project Rule (Recommended)

For additional reliability during long conversations:

1. Open Cursor Settings
2. Navigate to Rules > Project Rules
3. Click "+ Add new rule"
4. Create a rule with content like:

```
# Memory Bank Management

Always check for and read the memory bank files at the start of each session and throughout long conversations. The memory bank is located in the memory-bank/ directory and contains critical project context.

When I say "follow memory bank" or "initialize memory bank", prioritize these commands even in long sessions.

Remember that your memory resets between sessions, so the memory bank is your only source of project continuity.
```

5. Save the rule

This ensures that:
- Memory bank instructions are always loaded with your project
- The AI is reminded to check the memory bank even during long conversations
- Commands like "follow memory bank" are prioritized even when token limits are reached

#### Using User Rules (Optional)

If you want memory bank functionality across all projects:

1. Open Cursor Settings
2. Navigate to Rules > User Rules
3. Add memory bank instructions to apply globally

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

### When to Use Commands

- **initialize memory bank**: Use this command when:
  - Starting a new project
  - Setting up memory bank for the first time
  - After cloning a repository that doesn't have a memory bank

- **update memory bank**: Use this command when:
  - You've made significant changes to the project
  - You want to ensure the memory bank reflects the current state
  - Before ending a development session to capture progress

- **follow memory bank**: Use this command when:
  - Starting a new conversation with Cursor
  - After a long conversation where context might be limited
  - Switching back to a project after working on something else

### Command Best Practices

1. **Start Sessions with "follow memory bank"**: Begin each new development session with this command to ensure Cursor has the full context
2. **Reinforce During Long Sessions**: If you notice Cursor losing context during a long session, use "follow memory bank" to refresh its understanding
3. **Update Before Switching Tasks**: Use "update memory bank" before switching to a different task to capture your current progress
4. **Combine with Project Rules**: For optimal results, use these commands alongside the Project Rules configuration described in "Optimizing Cursor Settings"

## How It Works

1. The MCP server monitors your project workspace
2. It creates and maintains the memory bank files
3. It provides these files to Cursor's AI when needed
4. The `.cursorrules` file and global rules instruct Cursor's AI to automatically use the memory bank

### Handling Long Conversations

During extended chat sessions, AI assistants may reach token limitations that affect their ability to remember earlier instructions. The Memory Bank system addresses this through:

1. **Persistent Rules**: Using Cursor's Rules system ensures memory bank instructions are reloaded with each message
2. **Project Rules**: Adding a dedicated Project Rule reinforces memory bank awareness throughout conversations
3. **Command Priority**: The system is designed to prioritize memory bank commands even in long sessions
4. **Structured Documentation**: The memory bank files themselves are organized to maximize information density

By configuring Cursor as described in the "Optimizing Cursor Settings" section, you ensure that memory bank functionality remains reliable even during lengthy development sessions.

#### The Token Limitation Challenge

AI assistants like Claude and GPT have a fixed context window (measured in tokens). As conversations grow longer:

1. Earlier messages get pushed out of the context window
2. The AI forgets important context established at the beginning
3. Instructions given early in the conversation may be forgotten
4. The AI's responses become less consistent with earlier decisions

This is particularly problematic for complex development tasks that require maintaining awareness of architectural decisions, coding patterns, and project goals throughout a long session.

#### How Memory Bank Solves This

Memory Bank provides multiple mechanisms to refresh context during long conversations:

1. **Command Reinforcement**: The "follow memory bank" command can be used mid-conversation to refresh context
2. **Rule Reloading**: Cursor's Rules system reloads memory bank instructions with each message
3. **Optimized Information Structure**: Memory bank files are structured to provide maximum context with minimal tokens
4. **Prioritized Instructions**: The system ensures memory bank commands take precedence even when token limits are reached

This means you can have productive, multi-hour development sessions without the frustration of the AI forgetting critical context or instructions.

## License

MIT 