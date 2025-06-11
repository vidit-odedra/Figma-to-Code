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
const fs_1 = __importDefault(require("fs"));
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
let imageMap = {};
function BladeColorConverter(color, primaryColor) {
    if (color == primaryColor)
        return "surface.background.primary.normal";
    if (color == "#f0f4fa")
        return "surface.background.gray.subtle";
    else if (color == "#f0f4fa")
        return "surface.background.gray.moderate";
    else if (color == "#ffffff")
        return "surface.background.gray.intense";
    else if (color == "#00a352")
        return "feedback.background.positive.intense";
    else if (color == "	#d92d20")
        return "feedback.background.negative.intense";
    return "surface.background.gray.subtle";
}
function analyzeLayout(parent) {
    if (!parent.children || parent.children.length === 0) {
        return { type: "unknown" };
    }
    const children = parent.children;
    const parentWidth = parseInt(parent.width || "0");
    const parentHeight = parseInt(parent.height || "0");
    const parentLeft = parseInt(parent.left || "0");
    const parentTop = parseInt(parent.top || "0");
    const parentHorizontalCenter = (parentWidth / 2);
    const parentVerticalCenter = (parentHeight / 2);
    // Convert absolute positions to relative positions within parent
    const childrenData = children.map(child => ({
        left: parseInt(child.left || "0") - parentLeft,
        top: parseInt(child.top || "0") - parentTop,
        width: parseInt(child.width || "0"),
        height: parseInt(child.height || "0"),
        right: (parseInt(child.left || "0") - parentLeft) + parseInt(child.width || "0"),
        bottom: (parseInt(child.top || "0") - parentTop) + parseInt(child.height || "0"),
        horizontalCenter: (parseInt(child.left || "0") - parentLeft) + (parseInt(child.width || "0") / 2),
        verticalCenter: (parseInt(child.top || "0") - parentTop) + (parseInt(child.height || "0") / 2),
        visibility: child.visible
    }));
    const childrenCount = childrenData.filter(c => c.visibility).length;
    const tolerance = 10;
    // Calculate padding based on space between parent edges and children
    const minLeft = Math.min(...childrenData.map(c => c.left));
    const maxRight = Math.max(...childrenData.map(c => c.right));
    const minTop = Math.min(...childrenData.map(c => c.top));
    const maxBottom = Math.max(...childrenData.map(c => c.bottom));
    const ChildrenatMinLeft = childrenData.filter(c => (c.visibility && c.left == minLeft)).length;
    const ChildrenatMinTop = childrenData.filter(c => (c.visibility && c.top == minTop)).length;
    const ChildrenatMaxRight = childrenData.filter(c => (c.visibility && c.right == maxRight)).length;
    const ChildrenatMaxBottom = childrenData.filter(c => (c.visibility && c.bottom == maxBottom)).length;
    const childrenatHorCenter = childrenData.filter(c => (c.visibility && c.horizontalCenter <= parentHorizontalCenter + tolerance && c.horizontalCenter >= parentHorizontalCenter - tolerance)).length;
    const childrenatVerCenter = childrenData.filter(c => (c.visibility && c.verticalCenter <= parentVerticalCenter + tolerance && c.verticalCenter >= parentVerticalCenter - tolerance)).length;
    // rows and colums detected means grid
    if (ChildrenatMinLeft > 1 && ChildrenatMinTop > 1 && ChildrenatMinLeft * ChildrenatMinTop <= childrenCount && ((ChildrenatMinLeft - 1) * ChildrenatMinTop >= childrenCount)) {
        return {
            type: "grid",
            gridColumns: ChildrenatMinLeft,
            gridRows: ChildrenatMinTop,
        };
    }
    // single row means flex row
    if (ChildrenatMinLeft == 1) {
        let alignItems = undefined;
        // common vertical center means alinged center;
        if (childrenatVerCenter == childrenCount) {
            alignItems = "center";
        }
        // common top for all means align at top
        else if (ChildrenatMinTop == childrenCount) {
            alignItems = "flex-start";
        }
        // common bottom for all means align at bottom
        else if (ChildrenatMaxBottom == childrenCount) {
            alignItems = "flex-end";
        }
        let justifyContent = undefined;
        const childernatParentLeft = childrenData.filter(c => (c.visibility && c.left <= parentLeft + tolerance && c.left >= parentLeft - tolerance)).length;
        const childernatParentRight = childrenData.filter(c => (c.visibility && c.right <= parentWidth + tolerance && c.right >= parentWidth - tolerance)).length;
        if (childernatParentLeft == 1 && childernatParentRight == 1) {
            justifyContent = "space-between";
        }
        else if (childernatParentRight == 1) {
            justifyContent = "flex-end";
        }
        else if (childernatParentLeft == 1) {
            justifyContent = "flex-start";
        }
        else {
            justifyContent = "center";
        }
        return {
            type: "flex",
            flexDirection: "row",
            justifyContent,
            alignItems,
        };
    }
    // single column means flex column
    if (ChildrenatMinTop == 1) {
        let alignItems = undefined;
        // common horizontal center means alinged center;
        if (childrenatHorCenter == childrenCount) {
            alignItems = "center";
        }
        // common left for all means align at left
        else if (ChildrenatMinLeft == childrenCount) {
            alignItems = "flex-start";
        }
        // common right for all means align at right
        else if (ChildrenatMaxRight == childrenCount) {
            alignItems = "flex-end";
        }
        let justifyContent = undefined;
        const childernatParentTop = childrenData.filter(c => (c.visibility && c.top <= parentTop + tolerance && c.top >= parentTop - tolerance)).length;
        const childernatParentBottom = childrenData.filter(c => (c.visibility && c.bottom <= parentHeight + tolerance && c.bottom >= parentHeight - tolerance)).length;
        if (childernatParentTop == 1 && childernatParentBottom == 1) {
            justifyContent = "space-between";
        }
        else if (childernatParentBottom == 1) {
            justifyContent = "flex-end";
        }
        else if (childernatParentTop == 1) {
            justifyContent = "flex-start";
        }
        else {
            justifyContent = "center";
        }
        return {
            type: "flex",
            flexDirection: "column",
            justifyContent,
            alignItems,
        };
    }
    return {
        type: "unknown",
    };
    /*
    const tolerance = 10;
  
    const childrenCount = childrenData.filter(c => c.visibility).length;
    // Count children at minimum positions
    const childrenAtMinLeft = childrenData.filter(c => (c.visibility && c.left <= tolerance)).length;
    const childrenAtMinTop = childrenData.filter(c => (c.visibility && c.top <= tolerance)).length;
  
    const paddingLeft = Math.max(0, minLeft);
    const paddingRight = Math.max(0, parentWidth - maxRight);
    const paddingTop = Math.max(0, minTop);
    const paddingBottom = Math.max(0, parentHeight - maxBottom);
  
    // Calculate average or consistent padding values
    let paddingX = paddingLeft === paddingRight ? BladeSpacingConverter(paddingLeft) : BladeSpacingConverter(Math.round((paddingLeft + paddingRight) / 2));
    let paddingY = paddingTop === paddingBottom ? BladeSpacingConverter(paddingTop) : BladeSpacingConverter(Math.round((paddingTop + paddingBottom) / 2));
  
    // Check for grid pattern
    if(childrenCount > 1 && childrenAtMinLeft * childrenAtMinTop >= childrenCount && (childrenAtMinLeft - 1) * childrenAtMinTop <= childrenCount){
      return {
        type: "grid",
        gridColumns: childrenAtMinLeft,
        gridRows: childrenAtMinTop,
        paddingX: paddingX,
        paddingY: paddingY,
      }
    }
  
    // Check for flex pattern
    // check for flex row pattern
    const childrenAtHorizontalCenter = childrenData.filter(c => (c.visibility && c.horizontalCenter <= parentHorizontalCenter + tolerance && c.horizontalCenter >= parentHorizontalCenter - tolerance)).length;
    const childrenAtVerticalCenter = childrenData.filter(c => (c.visibility && c.verticalCenter <= parentVerticalCenter + tolerance && c.verticalCenter >= parentVerticalCenter - tolerance)).length;
    
    if( childrenCount > 1 && childrenAtMinLeft == 1){
      // flex row
      if()
    }
    else if( childrenCount > 1 && childrenAtMinTop == 1){
      // flex column
    }
    return {
      type: "unknown",
    }
    */
}
function simplifyNode(node) {
    const simpleNode = {
        id: node.id,
        type: node.type,
        name: node.name || undefined
    };
    if (node.visible === false)
        return null;
    if (node.name == "Browsers [Utility]")
        return null;
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
        if (node.fills[0].type == "IMAGE" && node.id && imageMap[node.id]) {
            simpleNode.imageUrl = node.id;
        }
        else if (node.fills[0].color) {
            const val = {
                r: node.fills[0].color.r,
                g: node.fills[0].color.g,
                b: node.fills[0].color.b,
            };
            const hexcode = rgbaToHex(val);
            if (node.type == "TEXT") {
                simpleNode.color = BladeColorConverter(hexcode, PrimaryColor);
            }
            else {
                simpleNode.backgroundcolor = BladeColorConverter(hexcode, PrimaryColor);
            }
        }
    }
    if (node.strokes && node.strokes.length > 0 && node.strokeWeight) {
        simpleNode.border = node.strokeWeight.toFixed(2);
        if (node.strokes[0].color) {
            // Initialize componentProperties if it doesn't exist
            if (!simpleNode.componentProperties) {
                simpleNode.componentProperties = {};
            }
            simpleNode.componentProperties.borderColor = BladeColorConverter(rgbaToHex(node.strokes[0].color), PrimaryColor);
        }
    }
    if (node.componentProperties) {
        simpleNode.componentProperties = {};
        Object.keys(node.componentProperties).forEach(key => {
            // Remove prefix (everything before and including the last space) and suffix (everything after #)
            let cleanKey = key.split('#')[0]; // Remove suffix after #
            cleanKey = cleanKey.split(' ').pop() || cleanKey; // Remove prefix before last space
            // Extract the value from the property object
            const propertyValue = node.componentProperties[key].value;
            simpleNode.componentProperties[cleanKey] = propertyValue;
        });
    }
    // Recursively parse children
    if (node.children && node.children.length > 0) {
        let children = node.children
            .filter(child => child.visible !== false) // Filter out invisible nodes
            .map(simplifyNode)
            .filter((child) => (child !== null));
        if (children.length > 0) {
            simpleNode.children = children;
            // Analyze layout based on children positioning
            simpleNode.layout = analyzeLayout(simpleNode);
        }
    }
    return simpleNode;
}
let PrimaryColor = "";
function parseFigmaJson(figmaData, Log, primaryColor) {
    return __awaiter(this, void 0, void 0, function* () {
        PrimaryColor = primaryColor;
        try {
            const imageMapPath = `${process.env.cwd}Outputs/image-map.json`;
            if (!figmaData.document || !Array.isArray(figmaData.document.children)) {
                throw new Error("Invalid Figma JSON structure: 'document.children' is missing or not an array");
            }
            try {
                const imageMapData = fs_1.default.readFileSync(imageMapPath, 'utf-8');
                imageMap = JSON.parse(imageMapData);
                Log += `✅ Image map read successfully from ${imageMapPath}\n`;
            }
            catch (err) {
                Log += `⚠️ Warning: image-map.json not found at ${imageMapPath}. Continuing without image URLs.`;
            }
            Log += "Figma JSON read successfully\n";
            let simplifiedTree = figmaData.document.children
                .map(simplifyNode);
            if (figmaData.document.absoluteBoundingBox) {
                simplifiedTree = [{
                        id: figmaData.document.id,
                        name: figmaData.document.name,
                        type: figmaData.document.type,
                        children: simplifiedTree,
                        width: figmaData.document.absoluteBoundingBox.width,
                        height: figmaData.document.absoluteBoundingBox.height
                    }];
            }
            Log += "✅ Simplified layout tree saved as layout-tree.json\n";
            fs_1.default.writeFileSync(`${process.env.cwd}Outputs/Layout.json`, JSON.stringify(simplifiedTree, null, 2));
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
