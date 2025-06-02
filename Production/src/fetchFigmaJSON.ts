import axios from 'axios';
import dotenv from "dotenv";
import fs from 'fs';
dotenv.config();

const FIGMA_TOKEN = process.env.FIGMA_TOKEN;

async function fetchFigmaDesign(op:{fileID: string, nodeId?: string}, Log: string) {
    const APIEndPoint = (op.nodeId) ? `https://api.figma.com/v1/files/${op.fileID}/nodes?ids=${op.nodeId}` : `https://api.figma.com/v1/files/${op.fileID}`;
    Log += `Figma API Endpoint: ${APIEndPoint} \n`;
    try {
      const response = await axios.get(APIEndPoint, {
        headers: {
          'X-Figma-Token': FIGMA_TOKEN
        }});
      
      Log += `Figma API Response: ${response.data} \n`;
      let designJson = response.data;
      if(op.nodeId){
        designJson = designJson.nodes[op.nodeId];
      }
      // Write the design JSON to Production/Outputs/figma.json
      fs.writeFileSync(`${process.env.cwd}Outputs/figma.json`, JSON.stringify(designJson, null, 2), 'utf-8');
      Log += '✅ Saved design JSON to Production/Outputs/figma.json';
      
      const imageNodes: string[] = [];

      const findImageNodes = (node: any) => {
        if (node.fills && node.fills.some((f: any) => f.type === "IMAGE")) {
          imageNodes.push(node.id);
        }
        if (node.children) {
          node.children.forEach(findImageNodes);
        }
      }

      const rootNode = designJson.document || designJson;
      findImageNodes(rootNode); 
      Log += 'Found image nodes:' + imageNodes.length + '\n';

      if (imageNodes.length > 0) {
        const imageResponse = await axios.get(
          `https://api.figma.com/v1/images/${op.fileID}?ids=${imageNodes.join(',')}`,
            { headers: { 'X-Figma-Token': FIGMA_TOKEN } }
        );

        fs.writeFileSync(`${process.env.cwd}Outputs/image-map.json`, JSON.stringify(imageResponse.data.images, null, 2));
        Log += '✅ Saved image map to Production/Outputs/image-map.json';
      }
    return {designJson, Log};
    } 
    catch (err) {
      Log += `Figma API Error: ${err} \n`;
      return {designJson: null, Log};
  }
}

export default fetchFigmaDesign;
