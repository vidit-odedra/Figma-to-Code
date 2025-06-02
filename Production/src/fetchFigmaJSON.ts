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
      return {designJson, Log};
    } 
    catch (err) {
      Log += `Figma API Error: ${err} \n`;
      return {designJson: null, Log};
  }
}

export default fetchFigmaDesign;
