# MCP Stdio Server

A simple Model Context Protocol (MCP) server implementation using stdio transport that showcases:
- **Resource**: File system access to read project files
- **Tool**: Calculator for mathematical operations  
- **Prompt**: Code review assistant for analyzing code

## Features

- MCP server with stdio transport
- Resource for reading files from the project directory
- Calculator tool for mathematical operations
- Code review prompt template
- VSCode integration ready
- Client example for testing

## Setup

1. Install dependencies:
```bash
npm install
```

2. Build the project:
```bash
npm run build
```

3. Test the server:
```bash
npm run test-client
```

## VSCode Integration

Add this to your VSCode MCP settings to use this server:

```json
{
  "mcpServers": {
    "hjmcp-stdio": {
      "command": "node",
      "args": ["dist/server.js"],
      "transport": "stdio"
    }
  }
}
```

## Usage

The server provides:

### Resources
- `file://` - Read files from the project directory

### Tools  
- `calculate` - Perform mathematical calculations

### Prompts
- `code-review` - Get code review suggestions

## Development

- `src/server.ts` - Main MCP server implementation
- `src/client.ts` - Example client for testing
- `package.json` - Project configuration
