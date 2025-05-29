import axios from 'axios';
import dotenv from "dotenv";
dotenv.config();

const FIGMA_TOKEN = process.env.FIGMA_TOKEN;

async function fetchFigmaDesign(op:{fileID: string, nodeId?: string}, Log: string) {
    const APIEndPoint = (op.nodeId) ? `https://api.figma.com/v1/files/${op.fileID}/nodes?ids=${op.nodeId}` : `https://api.figma.com/v1/files/${op.fileID}`;
    Log += `Figma API Endpoint: ${APIEndPoint} \n`;
    console.log(APIEndPoint);
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
      
      Log += '✅ Saved design JSON to figma.json';
      return {designJson, Log};
    } 
    catch (err) {
      Log += `Figma API Error: ${err} \n`;
      return {designJson: null, Log};
  }
}

export default fetchFigmaDesign;
