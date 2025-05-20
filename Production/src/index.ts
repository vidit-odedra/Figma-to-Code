import fetchFigmaDesign from "./fetchFigmaJSON"
import generatePrompt from "./generatePrompt";
import parseFigmaJson from "./parseFigmaJson";

async function AGENT() {
    await fetchFigmaDesign('UzJcbRHOTRp3V7xg3iQzqk');
    await parseFigmaJson();
    generatePrompt();
}

AGENT();