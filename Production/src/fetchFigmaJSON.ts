import axios from 'axios';
import fs from 'fs'
import dotenv from "dotenv";
dotenv.config();


// ✅ REPLACE THESE
const FIGMA_TOKEN = process.env.FIGMA_TOKEN;
const DEFAULT_FILE_ID = 'wLMZ3Fsx8whJVOwVHOrPsw'; // from https://www.figma.com/file/<FILE_ID>/...

async function fetchFigmaDesign(fileID: string | null) {
    let FILE_ID = DEFAULT_FILE_ID
    if(fileID){
        FILE_ID = fileID;
        console.log("No file ID provided, using default");
    }

    try {
    const response = await axios.get(`https://api.figma.com/v1/files/${FILE_ID}`, {
      headers: {
        'X-Figma-Token': FIGMA_TOKEN
      }
    });
    const designJson = response.data;
    fs.writeFileSync('./Outputs/figma.json', JSON.stringify(designJson, null, 2));
    console.log('✅ Saved design JSON to figma.json');
  } catch (err) {
    console.error('❌ Error fetching design:', err);
  }
}

export default fetchFigmaDesign;
