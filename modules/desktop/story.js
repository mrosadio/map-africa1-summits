// Story state and navigation. Moves the timeline to each chapter's year and
// asks storyView to show the matching text.
import { appData } from "../common/globals.js";
import { scrubToIndex, setChapterMarks, setYearCardEnabled } from "./timelineUtils.js";
import { showStoryPanel, hideStoryPanel, renderChapter } from "./storyView.js";

let current = 0;

export function initStory() {
  document.getElementById("story-next")?.addEventListener("click", () => goToChapter(current + 1));
  document.getElementById("story-back")?.addEventListener("click", () => goToChapter(current - 1));
}

export function startStory() {
  if (!appData.chapters) return; // chapters failed to load: explore mode only
  document.body.classList.add("is-story");
  setChapterMarks(true);
  setYearCardEnabled(false);
  showStoryPanel();
  goToChapter(0);
}

export function endStory() {
  document.body.classList.remove("is-story");
  setChapterMarks(false);
  setYearCardEnabled(true);
  hideStoryPanel();
}

function goToChapter(index) {
  const { chapters } = appData.chapters;
  current = Math.max(0, Math.min(chapters.length - 1, index));
  const chapter = chapters[current];
  const yearIndex = appData.summitData.findIndex((d) => d.year === chapter.year);
  scrubToIndex(yearIndex);
  renderChapter(chapter, current, chapters);
}