#!/usr/bin/env node
import { spawn } from "child_process";
import { fileURLToPath } from 'url';
import { resolve } from 'path';
class CalculatorDemo {
    serverProcess;
    messageId = 1;
    async startServer() {
        console.log("🚀 Starting MCP Server for Calculator Demo...");
        this.serverProcess = spawn("node", ["dist/server.js"], {
            stdio: ["pipe", "pipe", "pipe"],
            cwd: process.cwd()
        });
        this.serverProcess.stderr?.on("data", (data) => {
            console.log("🔧 Server:", data.toString().trim());
        });
        // Wait a moment for server to start
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    async sendMessage(message) {
        return new Promise((resolve, reject) => {
            let responseData = "";
            const onData = (data) => {
                responseData += data.toString();
                // Check if we have a complete JSON response
                const lines = responseData.split('\n');
                for (const line of lines) {
                    if (line.trim()) {
                        try {
                            const response = JSON.parse(line.trim());
                            if (response.id === message.id) {
                                this.serverProcess.stdout?.off("data", onData);
                                resolve(response);
                                return;
                            }
                        }
                        catch (e) {
                            // Not a complete JSON yet, continue reading
                        }
                    }
                }
            };
            this.serverProcess.stdout?.on("data", onData);
            this.serverProcess.stdin?.write(JSON.stringify(message) + "\n");
            // Timeout after 5 seconds
            setTimeout(() => {
                this.serverProcess.stdout?.off("data", onData);
                reject(new Error("Timeout waiting for response"));
            }, 5000);
        });
    }
    async initialize() {
        console.log("📡 Initializing connection...");
        const initMessage = {
            jsonrpc: "2.0",
            id: this.messageId++,
            method: "initialize",
            params: {
                protocolVersion: "2024-11-05",
                capabilities: {},
                clientInfo: {
                    name: "calculator-demo-client",
                    version: "1.0.0"
                }
            }
        };
        try {
            const response = await this.sendMessage(initMessage);
            console.log("✅ Initialization successful");
            console.log("🔧 Server capabilities:", JSON.stringify(response.result?.capabilities, null, 2));
        }
        catch (error) {
            console.error("❌ Initialization failed:", error);
            throw error;
        }
    }
    async listTools() {
        console.log("\n📋 Listing available tools...");
        const message = {
            jsonrpc: "2.0",
            id: this.messageId++,
            method: "tools/list",
            params: {}
        };
        try {
            const response = await this.sendMessage(message);
            console.log("🛠️  Available tools:");
            response.result?.tools?.forEach((tool) => {
                console.log(`   • ${tool.name}: ${tool.description}`);
            });
        }
        catch (error) {
            console.error("❌ Failed to list tools:", error);
        }
    }
    async calculate(expression) {
        console.log(`\n🧮 Calculating: ${expression}`);
        const message = {
            jsonrpc: "2.0",
            id: this.messageId++,
            method: "tools/call",
            params: {
                name: "calculate",
                arguments: {
                    expression: expression
                }
            }
        };
        try {
            const response = await this.sendMessage(message);
            if (response.result?.content) {
                response.result.content.forEach((content) => {
                    if (content.type === "text") {
                        console.log("📊 Result:", content.text);
                    }
                });
            }
            else if (response.error) {
                console.error("❌ Calculation error:", response.error.message);
            }
        }
        catch (error) {
            console.error("❌ Failed to calculate:", error);
        }
    }
    async runDemo() {
        try {
            await this.startServer();
            await this.initialize();
            await this.listTools();
            // Demo calculations
            const expressions = [
                "2 + 3",
                "10 * 5",
                "(15 + 5) / 4",
                "2.5 * 3.14159",
                "100 - 25 + 10",
                "Math.sqrt(16)", // This might not work due to sanitization
                "2**8" // This might not work due to sanitization
            ];
            for (const expr of expressions) {
                await this.calculate(expr);
                await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between calculations
            }
        }
        catch (error) {
            console.error("❌ Demo failed:", error);
        }
        finally {
            console.log("\n🔚 Stopping server...");
            this.serverProcess?.kill();
            console.log("✅ Demo completed");
        }
    }
}
const currentFile = fileURLToPath(import.meta.url);
const mainFile = resolve(process.argv[1]);
if (currentFile === mainFile) {
    const demo = new CalculatorDemo();
    demo.runDemo().catch(console.error);
}
export { CalculatorDemo };
//# sourceMappingURL=calculator-demo.js.map