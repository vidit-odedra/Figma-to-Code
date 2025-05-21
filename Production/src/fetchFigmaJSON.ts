import axios from 'axios';
import fs from 'fs'
import dotenv from "dotenv";
dotenv.config();


// ✅ REPLACE THESE
const FIGMA_TOKEN = process.env.FIGMA_TOKEN;
const DEFAULT_FILE_ID = 'wLMZ3Fsx8whJVOwVHOrPsw'; // from https://www.figma.com/file/<FILE_ID>/...

async function fetchFigmaDesign(op:{fileID: string, nodeId?: string}) {
    console.log(op);
    const APIEndPoint = (op.nodeId) ? `https://api.figma.com/v1/files/${op.fileID}/nodes?ids=${op.nodeId}` : `https://api.figma.com/v1/files/${op.fileID}`;
    console.log( `Reading from: ${APIEndPoint}`);
    try {
    const response = await axios.get(APIEndPoint, {
      headers: {
        'X-Figma-Token': FIGMA_TOKEN
      }
    });
    let designJson = response.data;
    if(op.nodeId){
      designJson = designJson.nodes[op.nodeId];
    }


    fs.writeFileSync('./Outputs/figma.json', JSON.stringify(designJson, null, 2));
    console.log('✅ Saved design JSON to figma.json');
  } catch (err) {
    console.error('❌ Error fetching design:', err);
  }
}

export default fetchFigmaDesign;
