import fetchFigmaDesign from "./fetchFigmaJSON"
import parseFigmaJson from "./parseFigmaJson";

async function AGENT() {
    await fetchFigmaDesign(null);
    parseFigmaJson();
}

AGENT();