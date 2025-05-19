const axios = require('axios');
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config()

// ✅ REPLACE THESE
const FIGMA_TOKEN = process.env.FIGMA_TOKEN;
const FILE_ID = 'wLMZ3Fsx8whJVOwVHOrPsw'; // from https://www.figma.com/file/<FILE_ID>/...

async function fetchFigmaDesign() {
  try {
    const response = await axios.get(`https://api.figma.com/v1/files/${FILE_ID}`, {
      headers: {
        'X-Figma-Token': FIGMA_TOKEN
      }
    });

    const designJson = response.data;
    fs.writeFileSync('figma.json', JSON.stringify(designJson, null, 2));
    console.log('✅ Saved design JSON to figma.json');
  } catch (err) {
    console.error('❌ Error fetching design:', err.response?.data || err.message);
  }
}

fetchFigmaDesign();
