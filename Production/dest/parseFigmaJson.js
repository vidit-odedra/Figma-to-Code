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
function rgbaToHex(color) {
    // Helper to convert a float 0-1 to 2-digit hex
    function toHex(value) {
        const hex = Math.round(value * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }
    const rHex = toHex(color.r);
    const gHex = toHex(color.g);
    const bHex = toHex(color.b);
    return `#${rHex}${gHex}${bHex}`;
}
function simplifyNode(node) {
    const simpleNode = {
        type: node.type,
        name: node.name || undefined
    };
    if (node.type == "VECTOR") {
        return null;
    }
    // Extract text content
    if (node.type === 'TEXT' && node.characters != undefined) {
        simpleNode.text = node.characters;
    }
    // Extract styles
    if (node.style) {
        let caps = false;
        if (node.style.textCase && node.style.textCase == 'UPPER')
            caps = true;
        simpleNode.style = {
            fontSize: `${node.style.fontSize}px`,
            fontWeight: `${node.style.fontWeight}`,
            fontFamily: node.style.fontFamily,
            fontStyle: "normal",
            textTransform: (caps) ? "uppercase" : "capitalize",
            textAlign: node.style.textAlignHorizontal,
        };
    }
    if (node.absoluteBoundingBox) {
        simpleNode.position = "absolute";
        simpleNode.left = `${Math.floor(node.absoluteBoundingBox.x)}`;
        simpleNode.top = `${Math.floor(node.absoluteBoundingBox.y)}`;
        simpleNode.width = `${Math.floor(node.absoluteBoundingBox.width)}`;
        simpleNode.height = `${Math.floor(node.absoluteBoundingBox.height)}`;
    }
    else {
        simpleNode.position = "relative";
    }
    if (node.fills && node.fills[0]) {
        if (node.fills[0].opacity) {
            simpleNode.opacity = node.fills[0].opacity.toFixed(2);
        }
        if (node.fills[0].color) {
            const val = {
                r: node.fills[0].color.r,
                g: node.fills[0].color.g,
                b: node.fills[0].color.b,
            };
            const hexcode = rgbaToHex(val);
            if (node.type == "TEXT") {
                simpleNode.color = hexcode;
            }
            else {
                simpleNode.backgroundcolor = hexcode;
            }
        }
    }
    if (node.strokes && node.strokes.length > 0 && node.strokeWeight) {
        simpleNode.border = node.strokeWeight.toFixed(2);
        if (node.strokes[0].color)
            simpleNode.borderColor = rgbaToHex(node.strokes[0].color);
    }
    // Recursively parse children
    if (node.children && node.children.length > 0) {
        const children = node.children.map(simplifyNode).filter((child) => child !== null);
        if (children.length > 0) {
            simpleNode.children = children;
        }
    }
    return simpleNode;
}
function parseFigmaJson(figmaData, Log) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            if (!figmaData.document || !Array.isArray(figmaData.document.children)) {
                throw new Error("Invalid Figma JSON structure: 'document.children' is missing or not an array");
            }
            Log += "Figma JSON read successfully\n";
            const simplifiedTree = figmaData.document.children
                .map(simplifyNode);
            Log += "✅ Simplified layout tree saved as layout-tree.json\n";
            return { simplifiedTree, Log };
        }
        catch (e) {
            const errorMessage = String(e);
            Log += `Error Parsing Figma JSON: ${errorMessage}\n`;
            return { simplifiedTree: null, Log };
        }
    });
}
exports.default = parseFigmaJson;
