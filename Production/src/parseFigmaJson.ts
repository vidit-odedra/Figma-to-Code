import fs from 'fs';
import { color } from './Types';
import { node } from './Types';
import { simpleNodeInterface } from './Types';

function rgbaToHex(color: color) {
  // Helper to convert a float 0-1 to 2-digit hex
  function toHex(value: number) {
    const hex = Math.round(value * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }
  const rHex = toHex(color.r);
  const gHex = toHex(color.g);
  const bHex = toHex(color.b);

  return `#${rHex}${gHex}${bHex}`;
}

function simplifyNode(node:node) {
  const simpleNode : simpleNodeInterface= {
    type: node.type,
    name: node.name || undefined
  };
  // Extract text content
  if (node.type === 'TEXT' && node.characters != undefined) {
    simpleNode.text = node.characters;
  }
  // Extract styles
  if (node.style) {
    let caps: Boolean= false;
    if(node.style.textCase && node.style.textCase == 'UPPER') caps = true;
    
    simpleNode.style = {
      fontSize: `${node.style.fontSize}px`,
      fontWeight: `${node.style.fontWeight}`,
      fontFamily: node.style.fontFamily,
      fontStyle: "normal",
      textTransform : (caps)?"uppercase" : "capitalize",
      textAlign: node.style.textAlignHorizontal,
    };
  }
  if(node.absoluteBoundingBox){
    simpleNode.position = "absolute";
    simpleNode.left = `${Math.floor(node.absoluteBoundingBox.x)}`;
    simpleNode.top = `${Math.floor(node.absoluteBoundingBox.y)}`;
    simpleNode.width = `${Math.floor(node.absoluteBoundingBox.width)}`;
    simpleNode.height = `${Math.floor(node.absoluteBoundingBox.height)}`;
  }
  else{
    simpleNode.position = "relative";
  }
  if(node.fills && node.fills[0] ){
    if( node.fills[0].opacity){
      simpleNode.opacity = node.fills[0].opacity.toFixed(2)
    }
    if( node.fills[0].color) {
      const val:color = {
          r: node.fills[0].color.r,
          g: node.fills[0].color.g,
          b: node.fills[0].color.b,
        }
      const hexcode =  rgbaToHex(val);
      if(node.type == "TEXT"){
        simpleNode.color = hexcode;
      }
      else{
        simpleNode.backgroundcolor = hexcode;
      }
    }
  }
  if(node.strokes && node.strokes.length > 0 && node.strokeWeight){
    simpleNode.border = node.strokeWeight.toFixed(2);
    if(node.strokes[0].color) simpleNode.borderColor = rgbaToHex(node.strokes[0].color);
  }


  // Recursively parse children
  if (node.children && node.children.length > 0) {
    simpleNode.children = node.children.map(simplifyNode);
  }

  return simpleNode;
}


async function parseFigmaJson(){
  try{
  const figmaData = JSON.parse(fs.readFileSync('./Outputs/figma.json', 'utf-8'));
  
  if (!figmaData.document || !Array.isArray(figmaData.document.children)) {
    throw new Error("Invalid Figma JSON structure: 'document.children' is missing or not an array");
  }
  const simplifiedTree = figmaData.document.children
    .map(simplifyNode)

  fs.writeFileSync('./Outputs/layout-tree.json', JSON.stringify(simplifiedTree, null, 2));
  console.log('✅ Simplified layout tree saved as layout-tree.json');
}
catch(e){
  console.log(e);
}
}

export default parseFigmaJson