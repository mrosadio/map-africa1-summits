import { appData } from "../common/globals.js";
import { renderTimeline, restoreScrub } from "./timelineUtils.js";
import { drawMap } from "./mapUtils.js";
import { initInteractions } from "./interactions.js";

let initialised = false;

export function initDesktopTimeline() {
   drawMap();
  renderTimeline();
  if (initialised) {
    restoreScrub(); // after a resize, put the map and dots back where the user was
  } else {
    initInteractions(); // wire listeners once only
    initialised = true;
  }
}

