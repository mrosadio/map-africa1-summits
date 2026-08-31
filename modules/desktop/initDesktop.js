import { appData } from "../common/globals.js";
import { renderTimeline } from "./timelineUtils.js";
import { drawMap } from "./mapUtils.js";
import { initInteractions } from "./interactions.js";

export function initDesktopTimeline() {
  const { geojsonData, summitData, summitsByCountryMap, countriesWithSummits, cumulativeSummits } = appData;
  drawMap(geojsonData, countriesWithSummits, summitsByCountryMap);
  renderTimeline(summitData, geojsonData, cumulativeSummits, summitsByCountryMap);
  initInteractions();
}

