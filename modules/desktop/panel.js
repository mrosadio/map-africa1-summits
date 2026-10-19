const hint = () => document.getElementById("side-hint");
const detail = () => document.getElementById("detail-panel");

export function openPanel() {
  const d = detail();
  if (!d) return;
  d.hidden = false;
  d.removeAttribute("inert");
  hint().hidden = true;
}
export function closePanel() {
  const d = detail();
  if (!d) return;
  d.hidden = true;
  d.setAttribute("inert", "");
  const storyOpen = document.getElementById("story")?.hidden === false;
  hint().hidden = storyOpen;
}

export function isPanelOpen() {
  return detail() ? !detail().hidden : false;
}