import { renderTimeline, restoreScrub } from "./timelineUtils.js";
import { drawMap, observeMapResize } from "./mapUtils.js";
import { initInteractions } from "./interactions.js";
import { initStory, startStory } from "./story.js";

let initialised = false;

export function initDesktopTimeline() {
  const firstRun = !initialised;
  if (firstRun) {
    drawMap();
    observeMapResize();
    initInteractions();
    initStory();
    initialised = true;
  }
  renderTimeline();
  restoreScrub();
  // Dev hook until the intro screen exists (task 6): open the site with ?story
  if (firstRun && new URLSearchParams(location.search).has("story")) startStory();
}

