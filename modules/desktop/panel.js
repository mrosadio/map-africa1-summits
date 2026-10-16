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
  hint().hidden = false;
}

export function isPanelOpen() {
  return detail() ? !detail().hidden : false;
}