
import fs from 'fs';
import { simpleNodeInterface } from './Types';
import { nodeStyle } from './Types';

function styleToStr(style : nodeStyle | undefined) {
    if(style == undefined) return "";
    const parts = [];
    
    if (style.fontSize) parts.push(`fontSize: ${style.fontSize}`);
    if (style.fontWeight) parts.push(`fontWeight: ${style.fontWeight}`);
    if (style.fontFamily) parts.push(`fontFamily: ${style.fontFamily}`);
    if (style.fontStyle == "italic") parts.push(`fontStyle: italic`);
    if (style.textAlign) parts.push(`text-${style.textAlign}`);
    if (style.textTransform) parts.push(`${style.textTransform}`);
    
  return parts.length ? ` (${parts.join(', ')})` : '';
}

function nodeToPrompt(node:simpleNodeInterface, indent = 0) {
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
    if(node.opacity) line += ` opacity-[${node.opacity}]`;
    if(node.border) line +=  ` border-[${node.border}px]`;
    if(node.borderColor) line += ` border-[${node.borderColor}]`
    if (node.children && node.children.length > 0) {
        const childrenText = node.children.map(child => nodeToPrompt(child, indent + 1)).join('\n');
        line += `\n${childrenText}`;
    }
    return line;
}

export default function generatePrompt(){
    const layoutTree: simpleNodeInterface[] = JSON.parse(fs.readFileSync('./Outputs/layout-tree.json', 'utf-8'));
    
    // Compose final prompt text
    const promptHeader:string = fs.readFileSync('PromptHeader.txt', 'utf-8');
    const promptBody:string = layoutTree
        .map(node => nodeToPrompt(node))
        .join('\n');
    
    const CleanPrompt = promptBody.split('\n')                     // Split into lines
      .filter(line => line.trim() !== '') // Remove empty or whitespace-only lines
      .join('\n');                    // Rejoin into a single string
    
    const finalPrompt = promptHeader + CleanPrompt;
    
    fs.writeFileSync('./Outputs/figma_prompt.txt', finalPrompt);
    
    console.log('✅ Prompt text saved as figma_prompt.txt');
}