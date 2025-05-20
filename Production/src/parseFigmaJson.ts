import fs from 'fs';

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

interface color{
    r : number,
    g : number,
    b : number,
    a?: number
}

interface simpleNodeInterface {
    type    :string,
    name    :string | undefined, 
    text?   :string,
    style?  : {
            fontSize        :string,
            fontStyle       :"normal", 
            fontWeight      : string,
            fontFamily      : string,
            letterSpacing?  : string,
            textAlign?      :'LEFT' | 'RIGHT',
            textTransform?  :"uppercase" | "capitalize",
    },
    position?:"absolute" | "relative",
    left?    :string,
    top?     :string,
    width?   :string,
    height?  :string,
    color?   :string,
    backgroundcolor? : string,
    children? : simpleNodeInterface[],
}

interface node {
    type : string,
    name : string | undefined,
    characters? : string,
    style? : {
        fontSize : number,
        fontWeight : number,
        fontFamily : string,
        letterSpacing : number,
        textAlignHorizontal? : 'LEFT' | 'RIGHT',
        textCase? : string,
    }
    absoluteBoundingBox? :{
        x : number,
        y : number,
        width : number,
        height : number,
    },
    fills? :[{
            color: color
        }],
    children : node[]
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
    simpleNode.left = `${Math.floor(node.absoluteBoundingBox.x)}px `;
    simpleNode.top = `${Math.floor(node.absoluteBoundingBox.y)}px `;
    simpleNode.width = `${Math.floor(node.absoluteBoundingBox.width)}px `;
    simpleNode.height = `${Math.floor(node.absoluteBoundingBox.height)}px `;
  }
  else{
    simpleNode.position = "relative";
  }
  if(node.fills && node.fills[0] && node.fills[0].color){
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
  // Recursively parse children
  if (node.children && node.children.length > 0) {
    simpleNode.children = node.children.map(simplifyNode);
  }

  return simpleNode;
}


function parseFigmaJson(){
    const figmaData = JSON.parse(fs.readFileSync('./Outputs/figma.json', 'utf-8'));
    // Entry point (usually top-level frame)
    const simplifiedTree = figmaData.document.children.map(simplifyNode);
    
    // Save simplified layout tree
    fs.writeFileSync('./Outputs/layout-tree.json', JSON.stringify(simplifiedTree, null, 2));
    console.log('✅ Simplified layout tree saved as layout-tree.json');
}

export default parseFigmaJson