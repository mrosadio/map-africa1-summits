import { loadAndMergeData } from "./modules/common/dataLoader.js";
import { jsonPath, geojsonUrl, appData } from "./modules/common/globals.js";
import { initMobileTimeline } from "./modules/mobile/initMobile.js";
import { initDesktopTimeline } from "./modules/desktop/initDesktop.js";

async function initHorizontalTimeline() {
    try {
        const { geojsonData, summitMap, jsonData, summitsByCountryMap, countriesWithSummits, cumulativeSummits } = await loadAndMergeData(geojsonUrl, jsonPath);
                // Populate the shared store once, right after load
        appData.geojsonData = geojsonData;
        appData.summitData = jsonData;
        appData.summitMap = summitMap;
        appData.summitsByCountryMap = summitsByCountryMap;
        appData.countriesWithSummits = countriesWithSummits;
        appData.cumulativeSummits = cumulativeSummits;
        console.log("Window inner width:", window.innerWidth);
        // Detect screen size and initialize appropriate timeline
        if (window.innerWidth >= 768) {
            console.log("Initializing desktop timeline");
            // Desktop version
            initDesktopTimeline(geojsonData, jsonData, summitMap, summitsByCountryMap, countriesWithSummits, cumulativeSummits);
        } else {
            console.log("Initializing mobile timeline");
            initMobileTimeline(geojsonData, jsonData, cumulativeSummits, summitsByCountryMap);
        }
    } catch (error) {
        console.error("Error initializing app:", error);
    }
}

async function main() {
    await initHorizontalTimeline();
    window.addEventListener('resize', async () => {
        console.log("Window resized, new width:", window.innerWidth);
        await initHorizontalTimeline();
    });    
}

main();


