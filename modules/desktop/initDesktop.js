import { renderTimeline, restoreScrub, setStartIndex } from "./timelineUtils.js";
import { drawMap, observeMapResize } from "./mapUtils.js";
import { initInteractions } from "./interactions.js";
import { initStory, getOpeningMode, openInitialMode } from "./story.js";
import { appData } from "../common/globals.js";
let initialised = false;

export function initDesktopTimeline() {
  const firstRun = !initialised;
  let openingMode;
  if (firstRun) {
    openingMode = getOpeningMode();
    // The intro starts at the first year; explore opens on the latest
    setStartIndex(openingMode === "intro" ? 0 : appData.summitData.length - 1);
    drawMap();
    observeMapResize();
    initInteractions();
    initStory();
    initialised = true;
  }
  renderTimeline();
  restoreScrub();
  if (firstRun) openInitialMode(openingMode);
}