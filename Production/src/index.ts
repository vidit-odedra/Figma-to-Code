import { log } from "console";
import fetchFigmaDesign from "./fetchFigmaJSON"
import generatePrompt from "./generatePrompt";
import parseFigmaJson from "./parseFigmaJson";

function generateFigmaApiEndpoint(figmaUrl: string): {fileID : string , nodeId?: string} | null {
  try {
    const url = new URL(figmaUrl);

    // Extract the file key (between /design/ and the next slash)
    const pathnameParts = url.pathname.split('/');
    const fileKeyIndex = pathnameParts.indexOf('design') + 1;
    const fileKey = pathnameParts[fileKeyIndex];

    if (!fileKey) return null;

    // Extract node-id from query string and replace - with :
    const nodeIdRaw = url.searchParams.get('node-id');
    if (!nodeIdRaw) return null;

    const nodeId = nodeIdRaw.replace('-', ':');

    // Return the Figma API endpoint
    return {
        fileID : fileKey,
        nodeId:nodeId
    };
  } catch (e) {
    return null;
  }
}


export async function AGENT(link : string) {
    let Log = "";
    const op = generateFigmaApiEndpoint(link)
    Log += `Figma API Endpoint: ${op?.fileID} , Node ID: ${op?.nodeId} \n`;
    if(op == null ) return Log;
    
    
    const {designJson, Log: Log2} = await fetchFigmaDesign(op, Log);
    Log += Log2;
    if(designJson == null) return Log;
    
    
    Log += "Design JSON Fetched\n";
    const {simplifiedTree, Log:Log3} = await parseFigmaJson(designJson, Log);
    Log += Log3;
    if(simplifiedTree == null) return Log;
    
    
    if(simplifiedTree == null) return "No input File ID before generating prompt";
    const prompt = generatePrompt(simplifiedTree);
    Log += "Prompt Generated\n";
    return prompt;
}

AGENT("https://www.figma.com/design/SjZwyV6LfeI7UKv89EgBpc/Mastercard-priceless?node-id=170-8084&t=wDqIVn5eLuG7aaWO-0");

// Only run AGENT directly if this file is being run directly
// https://www.figma.com/design/vjBZhj24aN7yzzR5eaZJiZ/EastWest-Bank?node-id=1-403&t=M6tuIlIdxaoxLfTI-4
// https://www.figma.com/design/vjBZhj24aN7yzzR5eaZJiZ/EastWest-Bank?node-id=1-626&t=or8BYJSPHfMGb1ht-0