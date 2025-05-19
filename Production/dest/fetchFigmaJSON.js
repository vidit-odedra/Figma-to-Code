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
const fs_1 = __importDefault(require("fs"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// ✅ REPLACE THESE
const FIGMA_TOKEN = process.env.FIGMA_TOKEN;
const DEFAULT_FILE_ID = 'wLMZ3Fsx8whJVOwVHOrPsw'; // from https://www.figma.com/file/<FILE_ID>/...
function fetchFigmaDesign(fileID) {
    return __awaiter(this, void 0, void 0, function* () {
        let FILE_ID = DEFAULT_FILE_ID;
        if (fileID) {
            FILE_ID = fileID;
            console.log("No file ID provided, using default");
        }
        try {
            const response = yield axios_1.default.get(`https://api.figma.com/v1/files/${FILE_ID}`, {
                headers: {
                    'X-Figma-Token': FIGMA_TOKEN
                }
            });
            const designJson = response.data;
            fs_1.default.writeFileSync('figma.json', JSON.stringify(designJson, null, 2));
            console.log('✅ Saved design JSON to figma.json');
        }
        catch (err) {
            console.error('❌ Error fetching design:', err);
        }
    });
}
exports.default = fetchFigmaDesign;
