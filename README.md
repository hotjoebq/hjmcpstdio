# MCP Stdio Server

A complete Model Context Protocol (MCP) server implementation using stdio transport that showcases:
- **Resources**: File system access to read project files (README.md, package.json, src/server.ts)
- **Tools**: Calculator for mathematical operations and file listing
- **Prompts**: Code review and code explanation assistants

## Features

- MCP server with stdio transport
- File reading resources for project files
- Mathematical calculator tool
- Directory listing tool
- Code review and explanation prompt templates
- VSCode integration ready
- Test client for basic functionality testing

## Setup

1. Install dependencies:
```bash
npm install
```

2. Build the project:
```bash
npm run build
```

## Testing Options

### Option 1: Basic Functionality Test (No Additional Tools Required)
```bash
npm run test-simple
```
This runs a simple client that tests basic MCP communication with the server.

### Option 2: Comprehensive Testing (Requires mcp-cli Installation)

**First, install mcp-cli globally:**
```bash
npm install -g @modelcontextprotocol/cli
```

**Then run comprehensive tests:**
```bash
# Set the MCP configuration
export MCP_CLI_CONFIG_PATH=$(pwd)/mcp_config.json
# On Windows Command Prompt, use: set MCP_CLI_CONFIG_PATH=%cd%\mcp_config.json

# List available tools
mcp-cli tool list --server hjmcp-stdio

# Test calculator tool
mcp-cli tool call calculate --server hjmcp-stdio --input '{"expression": "2 + 3 * 4"}'

# Test file listing tool
mcp-cli tool call list_files --server hjmcp-stdio --input '{"directory": "."}'

# Test resource reading
mcp-cli tool read file://package.json --server hjmcp-stdio
```

## VSCode Integration (No mcp-cli Required)

VSCode has built-in MCP support and connects directly to your server. **You do NOT need to install mcp-cli for VSCode integration.**

Add this to your VSCode MCP settings to use this server:

```json
{
  "mcpServers": {
    "hjmcp-stdio": {
      "command": "node",
      "args": ["dist/server.js"],
      "cwd": "/absolute/path/to/your/hjmcpstdio/directory",
      "transport": "stdio"
    }
  }
}
```

**Important Notes:**
- Replace `/absolute/path/to/your/hjmcpstdio/directory` with the actual absolute path to this project directory
- Make sure you've run `npm run build` first to compile the TypeScript
- VSCode will handle all MCP communication automatically - no additional tools needed

## Available npm Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run dev` - Watch mode compilation
- `npm run start` - Run the MCP server directly
- `npm run test-simple` - Run basic client test
- `npm run clean` - Remove build files

## Server Capabilities

### Resources
- `file://README.md` - Project documentation
- `file://package.json` - Package configuration
- `file://src/server.ts` - Server source code

### Tools
- `calculate` - Perform mathematical calculations
  - Input: `{"expression": "mathematical expression"}`
  - Example: `{"expression": "2 + 3 * 4"}`
- `list_files` - List files in a directory
  - Input: `{"directory": "relative path"}` (optional, defaults to ".")
  - Example: `{"directory": "src"}`

### Prompts
- `code-review` - Get code review suggestions
  - Arguments: `file_path` (required), `focus_areas` (optional)
- `explain-code` - Get code explanations
  - Arguments: `code_snippet` (required), `language` (optional)

## Project Structure

- `src/server.ts` - Main MCP server implementation
- `src/simple-client.ts` - Basic test client
- `mcp_config.json` - MCP CLI configuration for testing
- `package.json` - Project configuration and dependencies
- `tsconfig.json` - TypeScript configuration

## Testing Summary

**Quick Testing (No Additional Setup):**
- Use `npm run test-simple` for basic functionality verification

**Comprehensive Testing (Requires mcp-cli):**
- Install mcp-cli globally: `npm install -g @modelcontextprotocol/cli`
- Use mcp-cli commands for detailed tool and resource testing

**VSCode Integration (No mcp-cli Needed):**
- Add server configuration to VSCode MCP settings
- VSCode handles MCP communication automatically

The server has been tested with:
- ✅ Tool functionality (calculate, list_files)
- ✅ Resource reading (package.json confirmed working)
- ✅ Stdio transport communication
- ✅ MCP protocol compliance
- ✅ Cross-platform compatibility (Windows, macOS, Linux)
