import fetchFigmaDesign from "./fetchFigmaJSON"
import generatePrompt from "./generatePrompt";
import parseFigmaJson from "./parseFigmaJson";

async function AGENT() {
    await fetchFigmaDesign(null);
    await parseFigmaJson();
    generatePrompt();
}

AGENT();