import fs from 'fs';
import { simpleNodeInterface } from './Types';
import { nodeStyle } from './Types';

// Helper: Convert style object to readable string
function styleToStr(style: nodeStyle | undefined): string {
  if (!style) return "";
  const parts = [];

  if (style.fontSize) parts.push(`fontSize: ${style.fontSize}`);
  if (style.fontWeight) parts.push(`fontWeight: ${style.fontWeight}`);
  if (style.fontFamily) parts.push(`fontFamily: ${style.fontFamily}`);
  if (style.fontStyle === "italic") parts.push(`fontStyle: italic`);
  if (style.textAlign) parts.push(`textAlign: ${style.textAlign}`);
  if (style.textTransform) parts.push(`textTransform: ${style.textTransform}`);

  return parts.length ? ` (${parts.join(', ')})` : '';
}

// Recursive: Convert a single node into prompt line(s)
function nodeToPrompt(node: simpleNodeInterface, imageMap: Record<string, string>, indent = 0): string {
  const pad = '  '.repeat(indent);
  let line = `${pad}- ${node.type}`;

  if (node.name) line += `: "${node.name}"`;
  if (node.text) line += `: "${node.text}"`;

  line += styleToStr(node.style);

  if (node.color) line += ` color: ${node.color}`;
  if (node.backgroundcolor) line += ` background-color: ${node.backgroundcolor}`;
  if (node.position) line += ` position: ${node.position}`;

  if (node.position === "absolute") {
    if (node.left) line += ` left-[${node.left}px]`;
    if (node.top) line += ` top-[${node.top}px]`;
    if (node.width) line += ` w-[${node.width}px]`;
    if (node.height) line += ` h-[${node.height}px]`;
  }

  if (node.opacity) line += ` opacity-[${node.opacity}]`;
  if (node.border) line += ` border-[${node.border}px]`;
  if (node.borderColor) line += ` borderColor-[${node.borderColor}]`;

  // ✅ Fix: Use node.id (not node.name) to find image URL
  if (node.id && imageMap[node.id]) {
    line += ` image: ${imageMap[node.id]}`;
  }

  // Recursively process children
  if (node.children && node.children.length > 0) {
    const childrenText = node.children
      .map(child => nodeToPrompt(child, imageMap, indent + 1))
      .join('\n');
    line += `\n${childrenText}`;
  }

  return line;
}

// Main function to build and save the prompt
export default function generatePrompt() {
  // Load layout tree
  const layoutTree: simpleNodeInterface[] = JSON.parse(
    fs.readFileSync('./Outputs/layout-tree.json', 'utf-8')
  );

  // Load image map (optional)
  let imageMap: Record<string, string> = {};
  try {
    imageMap = JSON.parse(fs.readFileSync('./Outputs/image-map.json', 'utf-8'));
  } catch {
    console.log('⚠️  No image-map.json found, proceeding without images.');
  }

  // Load header prompt (from PromptHeader.txt)
  let promptHeader = '';
  try {
    promptHeader = fs.readFileSync('PromptHeader.txt', 'utf-8') + '\n';
  } catch {
    console.warn('⚠️  PromptHeader.txt not found. Prompt will start without a header.');
  }

  // Generate full prompt body
  const promptBody = layoutTree
    .map(node => nodeToPrompt(node, imageMap))
    .join('\n');

  // Clean up empty lines
  const cleanPrompt = promptBody
    .split('\n')
    .filter(line => line.trim() !== '')
    .join('\n');

  // Combine and save prompt
  const finalPrompt = promptHeader + cleanPrompt;

  fs.writeFileSync('./Outputs/figma_prompt2.txt', finalPrompt);
  console.log('✅ Prompt text saved as figma_prompt2.txt');
}
