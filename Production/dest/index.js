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
exports.AGENT = AGENT;
const fetchFigmaJSON_1 = __importDefault(require("./fetchFigmaJSON"));
const generatePrompt_1 = __importDefault(require("./generatePrompt"));
const parseFigmaJson_1 = __importDefault(require("./parseFigmaJson"));
function generateFigmaApiEndpoint(figmaUrl) {
    try {
        const url = new URL(figmaUrl);
        // Extract the file key (between /design/ and the next slash)
        const pathnameParts = url.pathname.split('/');
        const fileKeyIndex = pathnameParts.indexOf('design') + 1;
        const fileKey = pathnameParts[fileKeyIndex];
        if (!fileKey)
            return null;
        // Extract node-id from query string and replace - with :
        const nodeIdRaw = url.searchParams.get('node-id');
        if (!nodeIdRaw)
            return null;
        const nodeId = nodeIdRaw.replace('-', ':');
        // Return the Figma API endpoint
        return {
            fileID: fileKey,
            nodeId: nodeId
        };
    }
    catch (e) {
        return null;
    }
}
function AGENT(link) {
    return __awaiter(this, void 0, void 0, function* () {
        let Log = "";
        const op = generateFigmaApiEndpoint(link);
        Log += `Figma API Endpoint: ${op === null || op === void 0 ? void 0 : op.fileID} , Node ID: ${op === null || op === void 0 ? void 0 : op.nodeId} \n`;
        if (op == null)
            return Log;
        const { designJson, Log: Log2 } = yield (0, fetchFigmaJSON_1.default)(op, Log);
        Log += Log2;
        if (designJson == null)
            return Log;
        Log += "Design JSON Fetched\n";
        const { simplifiedTree, Log: Log3 } = yield (0, parseFigmaJson_1.default)(designJson, Log);
        Log += Log3;
        if (simplifiedTree == null)
            return Log;
        console.log("Figma Design Parsed", simplifiedTree);
        if (simplifiedTree == null)
            return "No input File ID before generating prompt";
        console.log("Generating Prompt");
        const prompt = (0, generatePrompt_1.default)(simplifiedTree);
        return prompt;
    });
}
//AGENT("https://www.figma.com/design/SjZwyV6LfeI7UKv89EgBpc/Mastercard-priceless?node-id=199-10320&t=QnDmmd2Rxo9Lw346-0");
// Only run AGENT directly if this file is being run directly
// https://www.figma.com/design/vjBZhj24aN7yzzR5eaZJiZ/EastWest-Bank?node-id=1-403&t=M6tuIlIdxaoxLfTI-4
// https://www.figma.com/design/vjBZhj24aN7yzzR5eaZJiZ/EastWest-Bank?node-id=1-626&t=or8BYJSPHfMGb1ht-0
