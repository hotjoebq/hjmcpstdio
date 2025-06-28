# 🧮 Testing the MCP Calculator Tool in VS Code

This guide will help you test the MCP (Model Context Protocol) calculator tool in VS Code using the built-in demo client.

## 📋 Prerequisites

Before testing, ensure you have:

- ✅ Node.js installed (v16 or later)
- ✅ VS Code with this workspace open
- ✅ TypeScript compiled (the `dist/` folder should exist)

## 🚀 Quick Start

### 1. Open VS Code Terminal

In VS Code, open the integrated terminal:
- Press `Ctrl + `` (backtick) or
- Go to **Terminal** → **New Terminal**

### 2. Navigate to Project Directory

```powershell
cd "c:\CDrive\Workshops\CustomAI\mcpstdio\hjmcpstdio"
```

### 3. Build the Project (if needed)

```powershell
npm run build
```

### 4. Run the Calculator Demo

```powershell
node dist/calculator-demo.js
```

## 📊 Expected Output

When you run the demo, you should see output similar to this:

```
🚀 Starting MCP Server for Calculator Demo...
🔧 Server: MCP Stdio Server running...
📡 Initializing connection...
✅ Initialization successful
🔧 Server capabilities: {
  "resources": {},
  "tools": {},
  "prompts": {}
}

📋 Listing available tools...
🛠️  Available tools:
   • calculate: Perform mathematical calculations
   • list_files: List files in the project directory

🧮 Calculating: 2 + 3
📊 Result: Calculation: 2 + 3 = 5

🧮 Calculating: 10 * 5
📊 Result: Calculation: 10 * 5 = 50

🧮 Calculating: (15 + 5) / 4
📊 Result: Calculation: (15 + 5) / 4 = 5

🧮 Calculating: 2.5 * 3.14159
📊 Result: Calculation: 2.5 * 3.14159 = 7.853975

🧮 Calculating: 100 - 25 + 10
📊 Result: Calculation: 100 - 25 + 10 = 85

🧮 Calculating: Math.sqrt(16)
📊 Result: Error calculating expression: Unexpected token '.'

🧮 Calculating: 2**8
📊 Result: Calculation: 2**8 = 256

🔚 Stopping server...
✅ Demo completed
```

## 🛠️ Manual Testing with Individual Calculations

### Option 1: Modify the Demo Script

You can edit `src/calculator-demo.ts` to test your own expressions:

1. Open `src/calculator-demo.ts` in VS Code
2. Find the `expressions` array around line 140
3. Replace or add your own mathematical expressions:

```typescript
const expressions = [
  "5 * 5",           // Your custom calculation
  "100 / 4",         // Another custom calculation
  "(10 + 5) * 2",    // Complex expression
];
```

4. Rebuild and run:
```powershell
npm run build
node dist/calculator-demo.js
```

### Option 2: Create a Simple Test Script

Create a new file `test-calc.js` in the project root:

```javascript
const { spawn } = require('child_process');

async function testCalculation(expression) {
  const server = spawn('node', ['dist/server.js'], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  const initMsg = JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "test", version: "1.0.0" }
    }
  }) + '\n';

  const calcMsg = JSON.stringify({
    jsonrpc: "2.0",
    id: 2,
    method: "tools/call",
    params: {
      name: "calculate",
      arguments: { expression }
    }
  }) + '\n';

  server.stdin.write(initMsg);
  setTimeout(() => server.stdin.write(calcMsg), 100);

  server.stdout.on('data', (data) => {
    const lines = data.toString().split('\n');
    lines.forEach(line => {
      if (line.trim()) {
        try {
          const response = JSON.parse(line);
          if (response.id === 2 && response.result?.content) {
            console.log(`${expression} = ${response.result.content[0].text.split(' = ')[1]}`);
            server.kill();
          }
        } catch (e) {}
      }
    });
  });
}

// Test a calculation
testCalculation(process.argv[2] || "2 + 2");
```

Then run: `node test-calc.js "15 * 3"`

## 🔧 Using VS Code MCP Extension

If you have the MCP extension installed in VS Code:

### 1. Configure MCP in VS Code

Ensure your `mcp.json` file is properly configured:

```json
{
  "mcpServers": {
    "hjmcp-stdio": {
      "command": "node",
      "args": ["dist/server.js"],
      "cwd": "C:/CDrive/Workshops/CustomAI/mcpstdio/hjmcpstdio",
      "transport": "stdio"
    }
  }
}
```

### 2. Access Calculator via MCP

1. Open the Command Palette (`Ctrl+Shift+P`)
2. Look for MCP-related commands
3. Connect to your `hjmcp-stdio` server
4. Use the calculator tool through the MCP interface

## 🧪 What the Calculator Can Do

### ✅ Supported Operations
- **Basic arithmetic**: `+`, `-`, `*`, `/`
- **Parentheses**: `(`, `)`
- **Exponentiation**: `**` (e.g., `2**8 = 256`)
- **Decimal numbers**: `2.5 * 3.14159`
- **Complex expressions**: `(15 + 5) / 4 * 2`

### ❌ Security Limitations (By Design)
- **Function calls**: `Math.sqrt(16)` ❌
- **Variables**: `x = 5` ❌  
- **Code execution**: Any non-mathematical code ❌

The calculator sanitizes input to prevent code injection while allowing safe mathematical expressions.

## 🐛 Troubleshooting

### Error: "Cannot find module"
```powershell
npm install
npm run build
```

### Error: "Server not responding"
- Check that the `dist/` folder exists
- Ensure TypeScript compilation was successful
- Verify Node.js version (should be v16+)

### Error: "Permission denied"
- Run VS Code as administrator if needed
- Check file permissions in the project directory

### Calculator returns errors
- Ensure expressions only contain numbers and basic operators
- Avoid spaces in decimal numbers (`2.5` not `2 .5`)
- Use parentheses for complex expressions

## 📚 Next Steps

- **Extend the calculator**: Add more mathematical functions
- **Create new tools**: Add tools for file operations, data processing, etc.
- **Integration**: Connect your MCP server to other applications
- **Documentation**: Explore the MCP protocol specification

## 🎯 Key Files

- `src/server.ts` - Main MCP server implementation
- `src/calculator-demo.ts` - Demo client for testing
- `dist/server.js` - Compiled server (auto-generated)
- `mcp.json` - VS Code MCP configuration
- `package.json` - Node.js dependencies and scripts

Happy calculating! 🧮✨
