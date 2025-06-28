#!/usr/bin/env node

import { spawn } from "child_process";

class SimpleTestClient {
  async testServer(): Promise<void> {
    console.log("🚀 Starting MCP Server Test...");
    
    const serverProcess = spawn("node", ["dist/server.js"], {
      stdio: ["pipe", "pipe", "pipe"],
    });

    let output = "";
    let errorOutput = "";

    serverProcess.stdout?.on("data", (data) => {
      output += data.toString();
    });

    serverProcess.stderr?.on("data", (data) => {
      errorOutput += data.toString();
    });

    const initMessage = {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: {
          name: "simple-test-client",
          version: "1.0.0"
        }
      }
    };

    serverProcess.stdin?.write(JSON.stringify(initMessage) + "\n");

    setTimeout(() => {
      console.log("📤 Sent initialization message");
      console.log("📥 Server output:", output);
      if (errorOutput) {
        console.log("❌ Server errors:", errorOutput);
      }
      
      serverProcess.kill();
      console.log("✅ Test completed");
    }, 2000);
  }
}

if (require.main === module) {
  const client = new SimpleTestClient();
  client.testServer();
}

export { SimpleTestClient };
