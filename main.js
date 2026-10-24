import "@fontsource/arimo/latin-400.css";
import "@fontsource/arimo/latin-600.css";
import "@fontsource/arimo/latin-700.css";
import "@fontsource/source-serif-4/latin-400.css";
import "@fontsource/source-serif-4/latin-600.css";
import { loadAndMergeData, loadChapters } from "./modules/common/dataLoader.js";
import { jsonPath, geojsonUrl,chaptersUrl, appData } from "./modules/common/globals.js";
import { debounce } from "./modules/common/utils.js";
import { initDesktopTimeline } from "./modules/desktop/initDesktop.js";
import { applyCategoryColors } from "./modules/common/partnerColors.js";


function showLoadError() {
  document.getElementById("load-error")?.classList.remove("d-none");
  document.getElementById("map")?.classList.add("d-none");
  document.querySelector(".vis-timeline")?.classList.add("d-none");
}
async function loadData() {
  const result = await loadAndMergeData(geojsonUrl, jsonPath);
  if (!result) return false;
  appData.geojsonData = result.geojsonData;
  appData.summitData = result.jsonData;
  appData.summitMap = result.summitMap;
  appData.summitsByCountryMap = result.summitsByCountryMap;
  appData.countriesWithSummits = result.countriesWithSummits;
  appData.cumulativeSummits = result.cumulativeSummits;
  appData.chapters = await loadChapters(chaptersUrl, appData.summitData);
  return true;
}
function render() {
    initDesktopTimeline();
}

async function main() {
  applyCategoryColors();
  document.getElementById("aboutModal")?.addEventListener("hide.bs.modal", () => {
    document.activeElement?.blur();
  });
  if (!(await loadData())) {
    document.querySelector(".vis-hint")?.classList.add("d-none");
    return;
  }
  render();
  window.addEventListener("resize", debounce(render, 150));
}

main();

