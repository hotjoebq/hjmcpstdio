#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from 'url';

class MCPStdioServer {
  private server: Server;
  private projectRoot: string;

  constructor() {
    this.projectRoot = process.cwd();
    this.server = new Server(
      {
        name: "hjmcp-stdio",
        version: "1.0.0",
      },
      {
        capabilities: {
          resources: {},
          tools: {},
          prompts: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers(): void {
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [
          {
            uri: "file://README.md",
            name: "Project README",
            description: "The main README file for this project",
            mimeType: "text/markdown",
          },
          {
            uri: "file://package.json",
            name: "Package Configuration",
            description: "NPM package configuration file",
            mimeType: "application/json",
          },
          {
            uri: "file://src/server.ts",
            name: "Server Source",
            description: "Main MCP server implementation",
            mimeType: "text/typescript",
          },
        ],
      };
    });

    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const uri = request.params.uri;
      
      if (!uri.startsWith("file://")) {
        throw new Error(`Unsupported URI scheme: ${uri}`);
      }

      let filePath = uri.replace("file://", "");
      
      if (filePath.endsWith("/")) {
        filePath = filePath.slice(0, -1);
      }
      
      const fullPath = path.resolve(this.projectRoot, filePath);

      if (!fullPath.startsWith(this.projectRoot)) {
        throw new Error("Access denied: File outside project directory");
      }

      try {
        const content = fs.readFileSync(fullPath, "utf-8");
        return {
          contents: [
            {
              uri,
              mimeType: this.getMimeType(filePath),
              text: content,
            },
          ],
        };
      } catch (error) {
        throw new Error(`Failed to read file: ${error instanceof Error ? error.message : String(error)}`);
      }
    });

    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: "calculate",
            description: "Perform mathematical calculations",
            inputSchema: {
              type: "object",
              properties: {
                expression: {
                  type: "string",
                  description: "Mathematical expression to evaluate (e.g., '2 + 3 * 4')",
                },
              },
              required: ["expression"],
            },
          },
          {
            name: "list_files",
            description: "List files in the project directory",
            inputSchema: {
              type: "object",
              properties: {
                directory: {
                  type: "string",
                  description: "Directory path relative to project root (default: '.')",
                  default: ".",
                },
              },
            },
          },
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case "calculate":
          return this.handleCalculate(args as { expression: string });
        
        case "list_files":
          return this.handleListFiles(args as { directory?: string });

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });

    this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
      return {
        prompts: [
          {
            name: "code-review",
            description: "Get code review suggestions for a file",
            arguments: [
              {
                name: "file_path",
                description: "Path to the file to review",
                required: true,
              },
              {
                name: "focus_areas",
                description: "Specific areas to focus on (e.g., 'security', 'performance', 'readability')",
                required: false,
              },
            ],
          },
          {
            name: "explain-code",
            description: "Get an explanation of how code works",
            arguments: [
              {
                name: "code_snippet",
                description: "The code snippet to explain",
                required: true,
              },
              {
                name: "language",
                description: "Programming language of the code",
                required: false,
              },
            ],
          },
        ],
      };
    });

    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case "code-review":
          return this.handleCodeReviewPrompt(args as { file_path: string; focus_areas?: string });
        
        case "explain-code":
          return this.handleExplainCodePrompt(args as { code_snippet: string; language?: string });

        default:
          throw new Error(`Unknown prompt: ${name}`);
      }
    });
  }

  private getMimeType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes: Record<string, string> = {
      ".md": "text/markdown",
      ".json": "application/json",
      ".ts": "text/typescript",
      ".js": "text/javascript",
      ".txt": "text/plain",
      ".py": "text/x-python",
      ".html": "text/html",
      ".css": "text/css",
    };
    return mimeTypes[ext] || "text/plain";
  }

  private async handleCalculate(args: { expression: string }) {
    try {
      const sanitized = args.expression.replace(/[^0-9+\-*/().\s]/g, "");
      const result = Function(`"use strict"; return (${sanitized})`)();
      
      return {
        content: [
          {
            type: "text",
            text: `Calculation: ${args.expression} = ${result}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error calculating expression: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }

  private async handleListFiles(args: { directory?: string }) {
    try {
      const dir = args.directory || ".";
      const fullPath = path.resolve(this.projectRoot, dir);

      if (!fullPath.startsWith(this.projectRoot)) {
        throw new Error("Access denied: Directory outside project");
      }

      const files = fs.readdirSync(fullPath, { withFileTypes: true });
      const fileList = files.map(file => ({
        name: file.name,
        type: file.isDirectory() ? "directory" : "file",
        path: path.join(dir, file.name),
      }));

      return {
        content: [
          {
            type: "text",
            text: `Files in ${dir}:\n${fileList.map(f => `${f.type === "directory" ? "📁" : "📄"} ${f.name}`).join("\n")}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error listing files: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }

  private async handleCodeReviewPrompt(args: { file_path: string; focus_areas?: string }) {
    const focusAreas = args.focus_areas || "general code quality, best practices, and potential improvements";
    
    return {
      description: `Code review for ${args.file_path}`,
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text",
            text: `Please review the code in the file "${args.file_path}" and provide feedback focusing on: ${focusAreas}.

Please analyze the code for:
- Code quality and readability
- Potential bugs or issues
- Performance considerations
- Security concerns
- Best practices adherence
- Suggestions for improvement

Provide specific, actionable feedback with examples where possible.`,
          },
        },
      ],
    };
  }

  private async handleExplainCodePrompt(args: { code_snippet: string; language?: string }) {
    const language = args.language || "the programming language used";
    
    return {
      description: `Explain code snippet in ${language}`,
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text",
            text: `Please explain how this ${language} code works:

\`\`\`${args.language || ""}
${args.code_snippet}
\`\`\`

Please provide:
1. A high-level overview of what the code does
2. Step-by-step explanation of the logic
3. Key concepts or patterns used
4. Any potential edge cases or considerations
5. Suggestions for improvement if applicable

Make the explanation clear and accessible.`,
          },
        },
      ],
    };
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("MCP Stdio Server running...");
  }
}

const currentFile = fileURLToPath(import.meta.url);
const mainFile = path.resolve(process.argv[1]);

if (currentFile === mainFile) {
  const server = new MCPStdioServer();
  server.run().catch((error) => {
    console.error("Server error:", error);
    process.exit(1);
  });
}

export { MCPStdioServer };
