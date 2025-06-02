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
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
dotenv_1.default.config();
const FIGMA_TOKEN = process.env.FIGMA_TOKEN;
function fetchFigmaDesign(op, Log) {
    return __awaiter(this, void 0, void 0, function* () {
        const APIEndPoint = (op.nodeId) ? `https://api.figma.com/v1/files/${op.fileID}/nodes?ids=${op.nodeId}` : `https://api.figma.com/v1/files/${op.fileID}`;
        Log += `Figma API Endpoint: ${APIEndPoint} \n`;
        try {
            const response = yield axios_1.default.get(APIEndPoint, {
                headers: {
                    'X-Figma-Token': FIGMA_TOKEN
                }
            });
            Log += `Figma API Response: ${response.data} \n`;
            let designJson = response.data;
            if (op.nodeId) {
                designJson = designJson.nodes[op.nodeId];
            }
            // Write the design JSON to Production/Outputs/figma.json
            fs_1.default.writeFileSync(`${process.env.cwd}Outputs/figma.json`, JSON.stringify(designJson, null, 2), 'utf-8');
            Log += '✅ Saved design JSON to Production/Outputs/figma.json';
            return { designJson, Log };
        }
        catch (err) {
            Log += `Figma API Error: ${err} \n`;
            return { designJson: null, Log };
        }
    });
}
exports.default = fetchFigmaDesign;
