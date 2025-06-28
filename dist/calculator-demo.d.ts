#!/usr/bin/env node
declare class CalculatorDemo {
    private serverProcess;
    private messageId;
    startServer(): Promise<void>;
    sendMessage(message: any): Promise<any>;
    initialize(): Promise<void>;
    listTools(): Promise<void>;
    calculate(expression: string): Promise<void>;
    runDemo(): Promise<void>;
}
export { CalculatorDemo };
//# sourceMappingURL=calculator-demo.d.ts.map