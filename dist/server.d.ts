#!/usr/bin/env node
declare class MCPStdioServer {
    private server;
    private projectRoot;
    constructor();
    private setupHandlers;
    private getMimeType;
    private handleCalculate;
    private handleListFiles;
    private handleCodeReviewPrompt;
    private handleExplainCodePrompt;
    run(): Promise<void>;
}
export { MCPStdioServer };
//# sourceMappingURL=server.d.ts.map