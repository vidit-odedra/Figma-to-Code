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
    return parts.length ? ` (${parts.join(', ')})` : '';
}
function nodeToPrompt(node, indent = 0) {
    if (!node)
        return "";
    const pad = '  '.repeat(indent);
    let line = `${pad}- ${node.type}`;
    if (node.name)
        line += `: "${node.name}"`;
    if (node.text)
        line += `: "${node.text}"`;
    line += styleToStr(node.style);
    if (node.color)
        line += ` color: ${node.color}`;
    if (node.backgroundcolor)
        line += ` background-color: ${node.backgroundcolor}`;
    if (node.position)
        line += ` ${node.position} `;
    if (node.position == "absolute") {
        if (node.left)
            line += ` left-[${node.left}px]`;
        if (node.top)
            line += ` top-[${node.top}px]`;
        if (node.width)
            line += ` w-[${node.left}px]`;
        if (node.height)
            line += ` h-[${node.left}px]`;
    }
    if (node.opacity)
        line += ` opacity-[${node.opacity}]`;
    if (node.border)
        line += ` border-[${node.border}px]`;
    if (node.borderColor)
        line += ` border-[${node.borderColor}]`;
    if (node.children && node.children.length > 0) {
        const childrenText = node.children.map(child => nodeToPrompt(child, indent + 1)).join('\n');
        line += `\n${childrenText}`;
    }
    return line;
}
function generatePrompt(parsedFigmaJson) {
    // const layoutTree: simpleNodeInterface[] = JSON.parse(fs.readFileSync('./Outputs/layout-tree.json', 'utf-8'));
    // Compose final prompt text
    const promptHeader = fs_1.default.readFileSync(`${process.env.cwd}PromptHeader.txt`, 'utf-8');
    //  const promptHeader:string = 
    `You are a frontend developer. Based on the following UI structure (extracted from Figma), generate a clean, readable, and maintainable React component using Tailwind CSS.
This code will be further edited by developers, so clarity, logical structure, and readability are extremely important.
    
Your task:    
1.Identify and correctly map UI elements – determine whether each element is a button, input field, label, heading, checkbox, icon, image, etc.
2.Use semantic HTML – choose the right tags for accessibility and structure (e.g., <button>, <input>, <label>, <section>, etc.).
3.Preserve layout and positioning – match spacing, alignment, and structure from the Figma design using Flexbox/Grid.
4.Apply exact styles – replicate colors, font sizes, paddings, margins, border radii, and other visual properties precisely using Tailwind classes.
5.Add basic interactivity:
    - Include hover effects for clickable elements (buttons, links, etc.).
    - Use smooth transitions and animations where appropriate.
6.Ensure code is developer-friendly:
    - Use clear className ordering and avoid overly complex one-liners.
    - Add comments where needed to clarify structure or logic.
    - Use meaningful component/element names.
7.Avoid placeholder values – use actual text, labels, and icon names from the Figma design.

Output Format:
    - A single, self-contained React component.
    - Use Tailwind CSS for all styling.
    - Do not include unnecessary boilerplate (e.g., no create-react-app setup).
    - Assume the component will be placed into a larger codebase. \n 

start :
`;
    const promptBody = parsedFigmaJson
        .map(node => nodeToPrompt(node))
        .join('\n');
    const CleanPrompt = promptBody.split('\n') // Split into lines
        .filter(line => line.trim() !== '') // Remove empty or whitespace-only lines
        .join('\n'); // Rejoin into a single string
    const finalPrompt = promptHeader + CleanPrompt;
    // fs.writeFileSync('./Outputs/figma_prompt.txt', finalPrompt);
    console.log('✅ Prompt text saved as figma_prompt.txt');
    return finalPrompt;
}
