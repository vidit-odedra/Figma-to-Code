const fs = require('fs');

const layoutTree = JSON.parse(fs.readFileSync('layout-tree.json', 'utf-8'));

function styleToStr(style = {}) {
  const parts = [];

  if (style.fontSize) parts.push(`fontSize: ${style.fontSize}`);
  if (style.fontWeight) parts.push(`fontWeight: ${style.fontWeight}`);
  if (style.fontFamily) parts.push(`fontFamily: ${style.fontFamily}`);
  if (style.italic) parts.push(`fontStyle: italic`);
  
  return parts.length ? ` (${parts.join(', ')})` : '';
}

function nodeToPrompt(node, indent = 0) {
    const pad = '  '.repeat(indent);
    let line = `${pad}- ${node.type}`;
    if (node.name) line += `: "${node.name}"`;
    if (node.text) line += `: "${node.text}"`;
    line += styleToStr(node.style);
    if(node.color)line += ` color: ${node.color}`;
    if(node.backgroundcolor) line += ` background-color: ${node.backgroundcolor}`
    if(node.position) line += ` ${node.position} `;
    if(node.position == "absolute" ){
        if(node.left) line += ` left-[${node.left}px]`;
        if(node.top) line += ` top-[${node.top}px]`;
        if(node.width) line += ` w-[${node.left}px]`;
        if(node.height) line += ` h-[${node.left}px]`;
        
    }
    if (node.children && node.children.length > 0) {
        const childrenText = node.children.map(child => nodeToPrompt(child, indent + 1)).join('\n');
        line += `\n${childrenText}`;
    }
    return line;
}



// Compose final prompt text
const promptHeader = `You are a frontend developer. Based on the following UI structure (extracted from Figma), generate a clean, readable, and maintainable React component using Tailwind CSS.
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
\n`;
const promptBody = layoutTree
    .map(node => nodeToPrompt(node))
    .join('\n');

const CleanPrompt = promptBody.split('\n')                     // Split into lines
  .filter(line => line.trim() !== '') // Remove empty or whitespace-only lines
  .join('\n');                    // Rejoin into a single string

const finalPrompt = promptHeader + CleanPrompt;

fs.writeFileSync('figma_prompt.txt', finalPrompt);

console.log('✅ Prompt text saved as figma_prompt.txt');
