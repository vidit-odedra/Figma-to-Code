"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const zod_1 = require("zod");
const index_1 = require("./index");
// Create an MCP server
const server = new mcp_js_1.McpServer({
    name: "Demo",
    version: "1.0.0"
});
server.tool("generate", { figmaUrl: zod_1.z.string().describe("Figma design URL") }, (input) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!input) {
            return {
                content: [{
                        type: "text",
                        text: "Could not find a valid Figma URL in your input. Please make sure to include a Figma design URL."
                    }],
                parameters: zod_1.z.object({
                    input: zod_1.z.string().describe("Natural language input containing a Figma design URL")
                })
            };
        }
        const figmaUrl = input.figmaUrl;
        const result = yield (0, index_1.AGENT)(figmaUrl);
        return {
            content: [{
                    type: "text",
                    text: result
                }],
            parameters: zod_1.z.object({
                input: zod_1.z.string().describe("Natural language input containing a Figma design URL")
            })
        };
    }
    catch (e) {
        const errorMessage = String(e);
        return {
            content: [{
                    type: "text",
                    text: `Error processing request: ${errorMessage}`
                }],
            parameters: zod_1.z.object({
                input: zod_1.z.string().describe("Natural language input containing a Figma design URL")
            })
        };
    }
}));
// Start receiving messages on stdin and sending messages on stdout
const transport = new stdio_js_1.StdioServerTransport();
server.connect(transport)
    .then(() => {
    console.log('🚀 Server is running and ready to process requests');
})
    .catch(console.error);
