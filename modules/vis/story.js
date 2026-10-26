// The three modes (intro, story, explore) and moving between them.
import { appData } from "../common/globals.js";
import { restoreScrub, scrubToIndex, setChapterMarks, setScrubLocked } from "./timelineUtils.js";
import { setMode, renderIntro, renderChapter } from "./storyView.js";

let current = 0;

const lastChapter = () => appData.chapters.chapters.length - 1;
const lastYearIndex = () => appData.summitData.length - 1;
const yearIndexOf = (year) => appData.summitData.findIndex((d) => d.year === year);

export function initStory() {
  const on = (id, handler) => document.getElementById(id)?.addEventListener("click", handler);
  on("intro-start", startStory);
  on("intro-skip", endStory);
  on("header-skip", endStory);
  on("header-replay", showIntro);
  on("story-next", () => (current === lastChapter() ? endStory() : goToChapter(current + 1)));
  on("story-back", () => (current === 0 ? showIntro() : goToChapter(current - 1)));
}

// Story needs chapters.json. If it failed to load, the site opens in explore mode.
export function getOpeningMode() {
  const skipIntro = new URLSearchParams(location.search).has("explore"); // dev shortcut
  return appData.chapters && !skipIntro ? "intro" : "explore";
}

// First load: no animation, the timeline is already at the right year.
export function openInitialMode(mode) {
  if (mode === "intro") renderIntro(appData.chapters.intro);
  applyMode(mode);
}

export function showIntro() {
  renderIntro(appData.chapters.intro);
  applyMode("intro");
  scrubTo(0);
}

export function startStory() {
  applyMode("story");
  goToChapter(0);
}

export function endStory() {
  applyMode("explore");
  scrubTo(lastYearIndex());
}

function applyMode(mode) {
  const explore = mode === "explore";
  setMode(mode);
  setChapterMarks(!explore);
  setScrubLocked(!explore);
}

function goToChapter(index) {
  const { chapters } = appData.chapters;
  current = Math.max(0, Math.min(chapters.length - 1, index));
  const chapter = chapters[current];
  scrubTo(yearIndexOf(chapter.year));
  renderChapter(chapter, current, chapters);
}

// restoreScrub first so country-mode dimming is cleared; silent = no floating year card
function scrubTo(index) {
  restoreScrub();
  scrubToIndex(index, { silent: true });
}