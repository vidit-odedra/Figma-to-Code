"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = generatePrompt;
const fs_1 = __importDefault(require("fs"));
function styleToStr(style) {
    if (style == undefined)
        return "";
    const parts = [];
    if (style.fontSize)
        parts.push(`fontSize: ${style.fontSize}`);
    if (style.fontWeight)
        parts.push(`fontWeight: ${style.fontWeight}`);
    if (style.fontFamily)
        parts.push(`fontFamily: ${style.fontFamily}`);
    if (style.fontStyle == "italic")
        parts.push(`fontStyle: italic`);
    if (style.textAlign)
        parts.push(`text-${style.textAlign}`);
    if (style.textTransform)
        parts.push(`${style.textTransform}`);
    return parts.length ? ` (${parts.join(' ')})` : '';
}
const imageMapPath = `${process.env.cwd}Outputs/image-map.json`;
let imageMap = {};
function nodeToPrompt(node, indent = 0) {
    if (!node)
        return "";
    const pad = '  '.repeat(indent);
    let line = "";
    if (node.type == 'FRAME')
        line = `${pad}- BOX`;
    else
        line = `${pad}- ${node.type}`;
    if (node.name)
        line += `: "${node.name}"`;
    if (node.text)
        line += `: "${node.text}"`;
    line += styleToStr(node.style);
    if (node.color)
        line += ` color: "${node.color}"`;
    if (node.backgroundcolor)
        line += ` background-color: "${node.backgroundcolor}"`;
    //if(node.left) line += ` left-[${node.left}px]`;
    //if(node.top) line += ` top-[${node.top}px]`;
    if (node.width)
        line += ` width: ${node.width}px`;
    if (node.height)
        line += ` height: ${node.height}px`;
    if (node.opacity)
        line += ` opacity-"${node.opacity}"`;
    if (node.border)
        line += ` border-"${node.border}px"`;
    if (node.borderColor)
        line += ` border-"${node.borderColor}"`;
    if (node.id && node.imageUrl) {
        line += ` imageURL: ImageMap[${node.imageUrl}]`;
    }
    if (node.layout && node.layout.type != "absolute") {
        const layoutParts = [];
        // Convert layout type to display property
        if (node.layout.type === "flex") {
            layoutParts.push(`display: "flex"`);
        }
        else if (node.layout.type === "grid") {
            layoutParts.push(`display: "grid"`);
        }
        // Add all other layout properties as key-value pairs
        Object.entries(node.layout).forEach(([key, value]) => {
            if (key !== "type" && value !== undefined) {
                layoutParts.push(`${key}: "${value}"`);
            }
        });
        if (layoutParts.length > 0) {
            line += ` ${layoutParts.join(' ')}`;
        }
    }
    if (node.componentProperties) {
        const componentParts = [];
        // Add all component properties as key-value pairs
        Object.entries(node.componentProperties).forEach(([key, value]) => {
            if (value !== undefined) {
                componentParts.push(`${key}: "${value}"`);
            }
        });
        if (componentParts.length > 0) {
            line += ` ${componentParts.join(' ')}`;
        }
    }
    if (node.children && node.children.length > 0) {
        const childrenText = node.children.map(child => nodeToPrompt(child, indent + 1)).join('\n');
        line += `\n${childrenText}`;
    }
    return line;
}
function generatePrompt(parsedFigmaJson) {
    try {
        const imageMapData = fs_1.default.readFileSync(imageMapPath, 'utf-8');
        imageMap = JSON.parse(imageMapData);
    }
    catch (err) {
    }
    // Compose final prompt text
    const promptHeader = fs_1.default.readFileSync(`${process.env.cwd}PromptHeader.txt`, 'utf-8');
    const promptBody = parsedFigmaJson
        .map(node => nodeToPrompt(node))
        .join('\n');
    const CleanPrompt = promptBody.split('\n') // Split into lines
        .filter(line => line.trim() !== '') // Remove empty or whitespace-only lines
        .join('\n'); // Rejoin into a single string
    const finalPrompt = promptHeader + CleanPrompt;
    fs_1.default.writeFileSync(`${process.env.cwd}Outputs/figma_prompt.txt`, finalPrompt);
    return finalPrompt;
}
