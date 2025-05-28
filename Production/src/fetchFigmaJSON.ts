// fetchFigmaJSON.ts
import axios from 'axios';
import fs from 'fs';
import dotenv from "dotenv";
dotenv.config();

const FIGMA_TOKEN = process.env.FIGMA_TOKEN;
const DEFAULT_FILE_ID = 'wLMZ3Fsx8whJVOwVHOrPsw';

async function fetchFigmaDesign(op: { fileID: string, nodeId?: string }) {
  console.log(op);
  const APIEndPoint = (op.nodeId)
    ? `https://api.figma.com/v1/files/${op.fileID}/nodes?ids=${op.nodeId}`
    : `https://api.figma.com/v1/files/${op.fileID}`;
  console.log(`Reading from: ${APIEndPoint}`);

  try {
    const response = await axios.get(APIEndPoint, {
      headers: { 'X-Figma-Token': FIGMA_TOKEN }
    });

    let designJson = response.data;
    if (op.nodeId) {
      designJson = designJson.nodes[op.nodeId];
    }

    fs.writeFileSync('./Outputs/figma.json', JSON.stringify(designJson, null, 2));
    console.log('✅ Saved design JSON to figma.json');

    // Get image URLs if applicable
    const imageNodes: string[] = [];

    const findImageNodes = (node: any) => {
      if (node.fills && node.fills.some((f: any) => f.type === "IMAGE")) {
        imageNodes.push(node.id);
      }
      if (node.children) {
        node.children.forEach(findImageNodes);
      }
    };

    const rootNode = designJson.document || designJson;
    findImageNodes(rootNode);
    console.log('Found image nodes:', imageNodes);

    if (imageNodes.length > 0) {
      const imageResponse = await axios.get(
        `https://api.figma.com/v1/images/${op.fileID}?ids=${imageNodes.join(',')}`,
        { headers: { 'X-Figma-Token': FIGMA_TOKEN } }
      );

      fs.writeFileSync('./Outputs/image-map.json', JSON.stringify(imageResponse.data.images, null, 2));
      console.log('✅ Image map saved to image-map.json');
    }
  } catch (err) {
    console.error('❌ Error fetching design:', err);
  }
}

export default fetchFigmaDesign;
