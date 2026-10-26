// Right-column story views. Pure DOM: no imports from the map or the timeline.
const $ = (id) => document.getElementById(id);

// The mode lives on <body>; CSS shows and hides the right blocks.
export function setMode(mode) {
  document.body.dataset.mode = mode;
  document.getElementById("map")?.toggleAttribute("inert", mode !== "explore");
}

export function renderIntro(intro) {
  $("intro-eyebrow").textContent = intro.eyebrow;
  $("intro-headline").textContent = intro.headline;
  $("intro-deck").textContent = intro.deck;
  $("intro-context-label").textContent = intro.context.label;
  $("intro-context-text").textContent = intro.context.text;
}

export function renderChapter(chapter, index, chapters) {
  const isContext = chapter.type === "context";
  const isLast = index === chapters.length - 1;
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

  $("story-next").textContent = isLast ? "Explore the map →" : "Next →";
  document.querySelector(".vis-story__nav").classList.toggle("is-last", isLast);

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