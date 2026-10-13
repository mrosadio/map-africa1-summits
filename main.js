import { loadAndMergeData } from "./modules/common/dataLoader.js";
import { jsonPath, geojsonUrl, appData } from "./modules/common/globals.js";
import { initMobileTimeline } from "./modules/mobile/initMobile.js";
import { initDesktopTimeline } from "./modules/desktop/initDesktop.js";
import { applyCategoryColors } from "./modules/common/partnerColors.js";


function showLoadError() {
  document.getElementById("load-error")?.classList.remove("d-none");
  document.getElementById("map")?.classList.add("d-none");
  document.querySelector(".vis-timeline")?.classList.add("d-none");
  document.querySelector(".vis-hint")?.classList.add("d-none");
}

async function initHorizontalTimeline() {
  const result = await loadAndMergeData(geojsonUrl, jsonPath);

  if (!result) {
    showLoadError();
    return;
  }

  const { geojsonData, summitMap, jsonData, summitsByCountryMap, countriesWithSummits, cumulativeSummits } = result;

  appData.geojsonData = geojsonData;
  appData.summitData = jsonData;
  appData.summitMap = summitMap;
  appData.summitsByCountryMap = summitsByCountryMap;
  appData.countriesWithSummits = countriesWithSummits;
  appData.cumulativeSummits = cumulativeSummits;

  if (window.innerWidth >= 768) {
    initDesktopTimeline(geojsonData, jsonData, summitMap, summitsByCountryMap, countriesWithSummits, cumulativeSummits);
  } else {
    initMobileTimeline(geojsonData, jsonData, cumulativeSummits, summitsByCountryMap);
  }
}

async function main() {
  applyCategoryColors();

  // Avoids the aria-hidden focus warning when the About modal closes
  document.getElementById("aboutModal")?.addEventListener("hide.bs.modal", () => {
    document.activeElement?.blur();
  });
  await initHorizontalTimeline();
  window.addEventListener("resize", async () => {
    await initHorizontalTimeline();
  });
}

main();

