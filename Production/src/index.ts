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


async function AGENT() {
    const op = generateFigmaApiEndpoint("https://www.figma.com/design/vjBZhj24aN7yzzR5eaZJiZ/EastWest-Bank?node-id=1-403&t=B72Kx5v8lRyyp0Dm-0");
    if(op == null || !op.fileID ) return "No input File ID";
    await fetchFigmaDesign(op);
    await parseFigmaJson();
    generatePrompt();
}

AGENT();
// https://www.figma.com/design/vjBZhj24aN7yzzR5eaZJiZ/EastWest-Bank?node-id=1-403&t=M6tuIlIdxaoxLfTI-4
// https://www.figma.com/design/vjBZhj24aN7yzzR5eaZJiZ/EastWest-Bank?node-id=1-626&t=or8BYJSPHfMGb1ht-0