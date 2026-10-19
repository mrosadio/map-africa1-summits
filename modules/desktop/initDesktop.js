import { renderTimeline, restoreScrub, setStartIndex } from "./timelineUtils.js";
import { drawMap, observeMapResize } from "./mapUtils.js";
import { initInteractions } from "./interactions.js";
import { initStory, startStory } from "./story.js";
import { appData } from "../common/globals.js";
let initialised = false;

export function initDesktopTimeline() {
  const firstRun = !initialised;
  const storyRequested = new URLSearchParams(location.search).has("story");
  if (firstRun) {
    // Explore opens on the latest year; the story opens on its first chapter
    setStartIndex(storyRequested ? 0 : appData.summitData.length - 1);
    drawMap();
    observeMapResize();
    initInteractions();
    initStory();
    initialised = true;
  }
  renderTimeline();
  restoreScrub();
  // Dev hook until the intro screen exists (task 6): open the site with ?story
  if (firstRun && storyRequested) startStory();
}

