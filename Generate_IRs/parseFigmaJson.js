const fs = require('fs');

const figmaData = JSON.parse(fs.readFileSync('figma.json', 'utf-8'));

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
    name: node.name || undefined,
  };

  // Extract text content
  if (node.type === 'TEXT' && node.characters) {
    simpleNode.text = node.characters;
  }

  // Extract styles
  if (node.style) {
    simpleNode.style = {
      fontSize: node.style.fontSize,
      fontWeight: node.style.fontWeight,
      fontFamily: node.style.fontFamily
    };
  }

  if(node.absoluteBoundingBox){
    simpleNode.position = "absolute";
    simpleNode.left = Math.floor(node.absoluteBoundingBox.x);
    simpleNode.top = Math.floor(node.absoluteBoundingBox.y);
    simpleNode.width = Math.floor(node.absoluteBoundingBox.width);
    simpleNode.height = Math.floor(node.absoluteBoundingBox.height);
  }
  else{
    simpleNode.position = "relative";
  }
  if(node.fills && node.fills[0] && node.fills[0].color){
    const val = {
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
  // Recursively parse children
  if (node.children && node.children.length > 0) {
    simpleNode.children = node.children.map(simplifyNode);
  }

  return simpleNode;
}

// Entry point (usually top-level frame)
const simplifiedTree = figmaData.document.children.map(simplifyNode);

// Save simplified layout tree
fs.writeFileSync('layout-tree.json', JSON.stringify(simplifiedTree, null, 2));
console.log('✅ Simplified layout tree saved as layout-tree.json');
