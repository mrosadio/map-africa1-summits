import { renderTimeline, restoreScrub } from "./timelineUtils.js";
import { drawMap, observeMapResize } from "./mapUtils.js";
import { initInteractions } from "./interactions.js";

let initialised = false;

export function initDesktopTimeline() {
  if (!initialised) {
    drawMap();
    observeMapResize();
    initInteractions();
    initialised = true;
  }
  renderTimeline();
  restoreScrub();
}

