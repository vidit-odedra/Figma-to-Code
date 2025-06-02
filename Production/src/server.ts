import axios from 'axios';
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { AGENT } from './index';
import fs from 'fs';
// Create an MCP server
const server = new McpServer({
  name: "Demo",
  version: "1.0.0"
});

server.tool("Instructions-for-Figma-to-Code","This tool is used to get the instructions to follow for the Figma to Code conversion. USE THIS TOOL FIRST TO GUIDE YOU.", async (input) => {
    return {
        content: [{
            type: "text",
            text: fs.readFileSync(`${process.env.cwd}instructions.txt`, 'utf-8'),
        }]
    };
});

server.tool("Convert-figma-to-text","This tool is used to convert a Figma design to a text description of the design. USE The instructions tool first to guide you.",{figmaUrl: z.string().describe("Figma design URL")}, async (input) => {
    try {
        if (!input) {
            return {
                content: [{
                    type: "text",
                    text: "Could not find a valid Figma URL in your input. Please make sure to include a Figma design URL."
                }],
                parameters: z.object({
                    input: z.string().describe("Natural language input containing a Figma design URL")
                })
            };
        }
        const figmaUrl = input.figmaUrl;
        const result = await AGENT(figmaUrl);
        return {
            content: [{
                type: "text",
                text: result
            }],
            parameters: z.object({
                input: z.string().describe("Natural language input containing a Figma design URL")
            })
        };
    } catch (e) {
        const errorMessage = String(e);
        return {
            content: [{
                type: "text",
                text: `Error processing request: ${errorMessage}`
            }],
            parameters: z.object({
                input: z.string().describe("Natural language input containing a Figma design URL")
            })
        };
    }
});

// Start receiving messages on stdin and sending messages on stdout
const transport = new StdioServerTransport();
server.connect(transport)
    .then(() => {
        console.log('🚀 Server is running and ready to process requests');
    })
    .catch(console.error);