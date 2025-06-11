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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const zod_1 = require("zod");
const index_1 = require("./index");
const fs_1 = __importDefault(require("fs"));
// Create an MCP server
const server = new mcp_js_1.McpServer({
    name: "Demo",
    version: "1.0.0"
});
server.tool("Instructions-for-Figma-to-Code", "This tool is used to get the instructions to follow for the Figma to Code conversion. USE THIS TOOL FIRST TO GUIDE YOU.", (input) => __awaiter(void 0, void 0, void 0, function* () {
    return {
        content: [{
                type: "text",
                text: fs_1.default.readFileSync(`${process.env.cwd}instructions.txt`, 'utf-8'),
            }]
    };
}));
server.tool("Build-Image-map", "This tool is used to build the image-map.json file. USE THIS TOOL AFTER THE CONVERT-FIGMA-TO-TEXT TOOL.", () => {
    return {
        content: [{
                type: "text",
                text: `Create a file named {filename where you are writing the code}-image-map.json (For e.g. if App.tsx is where you are writing the code then the filename is App-image-map.json). The file should contain the image-map.json file. paste the below content as a json there \n ${fs_1.default.readFileSync(`${process.env.cwd}Outputs/image-map.json`, 'utf-8')}`
            }]
    };
});
server.tool("Convert-figma-to-text", "This tool is used to convert a Figma design to a text description of the design. USE The instructions tool first to guide you.", { figmaUrl: zod_1.z.string().describe("Figma design URL"), PrimaryColor: zod_1.z.string().regex(/^#([A-Fa-f0-9]{6})$/).describe("Primary Color of the Figma design in hex format (e.g., #FFFFFF). If not specified in the prompt then read from theme.ts file") }, (input) => __awaiter(void 0, void 0, void 0, function* () {
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
        const primaryColor = input.PrimaryColor;
        const result = yield (0, index_1.AGENT)(figmaUrl, primaryColor);
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
