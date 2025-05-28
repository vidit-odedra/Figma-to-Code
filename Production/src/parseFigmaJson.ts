import fs from 'fs';
import path from 'path';
import { color, node, simpleNodeInterface } from './Types';

const imageMapPath = path.resolve(__dirname, '../Outputs/image-map.json');
let imageMap: Record<string, string> = {};

// Convert Figma's RGBA color object to hex
function rgbaToHex(color: color) {
  const toHex = (value: number) => {
    const hex = Math.round(value * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
}

// Try to load image-map.json
try {
  const imageMapData = fs.readFileSync(imageMapPath, 'utf-8');
  imageMap = JSON.parse(imageMapData);
} catch (err) {
  console.warn(`⚠️ Warning: image-map.json not found at ${imageMapPath}. Continuing without image URLs.`);
}

// Simplify a Figma node object into a smaller structure
function simplifyNode(node: node): simpleNodeInterface & { id: string; imageUrl?: string } {
  const simpleNode: simpleNodeInterface & { id: string; imageUrl?: string } = {
    id: node.id,
    type: node.type,
    name: node.name || undefined,
  };

  // Add text content if it's a TEXT node
  if (node.type === 'TEXT' && node.characters !== undefined) {
    simpleNode.text = node.characters;
  }

  // Extract and map style properties
  if (node.style) {
    const caps = node.style.textCase === 'UPPER';

    simpleNode.style = {
      fontSize: `${node.style.fontSize}px`,
      fontWeight: `${node.style.fontWeight}`,
      fontFamily: node.style.fontFamily,
      fontStyle: 'normal',
      textTransform: caps ? 'uppercase' : 'capitalize',
      textAlign: node.style.textAlignHorizontal,
    };
  }

  // Absolute bounding box (position + size)
  if (node.absoluteBoundingBox) {
    simpleNode.position = 'absolute';
    simpleNode.left = `${Math.floor(node.absoluteBoundingBox.x)}`;
    simpleNode.top = `${Math.floor(node.absoluteBoundingBox.y)}`;
    simpleNode.width = `${Math.floor(node.absoluteBoundingBox.width)}`;
    simpleNode.height = `${Math.floor(node.absoluteBoundingBox.height)}`;
  } else {
    simpleNode.position = 'relative';
  }

  // Background color or image fill
  if (node.fills && node.fills.length > 0) {
    const fill = node.fills[0];
    if (fill.opacity !== undefined) {
      simpleNode.opacity = fill.opacity.toFixed(2);
    }

    if (fill.type === 'IMAGE' && node.id && imageMap[node.id]) {
      simpleNode.imageUrl = imageMap[node.id];
    } else if (fill.color) {
      const hex = rgbaToHex(fill.color);
      if (node.type === 'TEXT') {
        simpleNode.color = hex;
      } else {
        simpleNode.backgroundcolor = hex;
      }
    }
  }

  // Border color and weight
  if (node.strokes && node.strokes.length > 0 && node.strokeWeight) {
    simpleNode.border = node.strokeWeight.toFixed(2);
    if (node.strokes[0].color) {
      simpleNode.borderColor = rgbaToHex(node.strokes[0].color);
    }
  }

  // Process children recursively
  if (node.children && node.children.length > 0) {
    simpleNode.children = node.children.map(simplifyNode);
  }

  return simpleNode;
}

// Main function to parse Figma JSON and generate layout tree
async function parseFigmaJson() {
  try {
    const figmaData = JSON.parse(fs.readFileSync('./Outputs/figma.json', 'utf-8'));

    if (!figmaData.document || !Array.isArray(figmaData.document.children)) {
      throw new Error("Invalid Figma JSON structure: 'document.children' is missing or not an array");
    }

    const simplifiedTree = figmaData.document.children.map(simplifyNode);
    fs.writeFileSync('./Outputs/layout-tree.json', JSON.stringify(simplifiedTree, null, 2));
    console.log('✅ Simplified layout tree saved as layout-tree.json');
  } catch (e) {
    console.error('❌ Error parsing figma.json:', e);
  }
}

export default parseFigmaJson;
