// Right-column story block. Pure DOM: no imports from the map or the timeline.
import { closePanel } from "./panel.js";

const $ = (id) => document.getElementById(id);

export function showStoryPanel() {
  closePanel(); // make sure no country panel stays open
  $("side-hint").hidden = true;
  $("story").hidden = false;
}

export function hideStoryPanel() {
  $("story").hidden = true;
  $("side-hint").hidden = false;
}

export function renderChapter(chapter, index, chapters) {
  const isContext = chapter.type === "context";
  const dataCount = chapters.filter((c) => c.type === "data").length;

  $("story-label").textContent = isContext ? chapter.label : `Chapter ${index + 1} of ${dataCount}`;
  $("story-text").textContent = isContext ? chapter.text : chapter.caption;

  const link = $("story-link");
  link.hidden = !chapter.link;
  if (chapter.link) {
    link.textContent = chapter.link.text;
    link.href = chapter.link.href;
  }

  const note = $("story-note");
  note.hidden = !chapter.note;
  note.textContent = chapter.note ?? "";

  // Back is invisible, not removed, so Next stays on the right
  $("story-back").style.visibility = index === 0 ? "hidden" : "visible";
  $("story-next").hidden = index === chapters.length - 1;

  const progress = $("story-progress");
  progress.replaceChildren(
    ...chapters.map((_, i) => {
      const segment = document.createElement("div");
      segment.className = "vis-story__segment" + (i <= index ? " is-done" : "");
      return segment;
    }),
  );
  progress.setAttribute("aria-label", `Progress: ${index + 1} of ${chapters.length} steps`);
}