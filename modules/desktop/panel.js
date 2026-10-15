const getPanel = () => document.getElementById("detail-panel");

export function openPanel() {
  const panel = getPanel();
  if (!panel) return;
  panel.removeAttribute("inert");
  panel.classList.add("is-open");
}

export function closePanel() {
  const panel = getPanel();
  if (!panel) return;
  panel.classList.remove("is-open");
  panel.setAttribute("inert", "");
}

export function isPanelOpen() {
  return getPanel()?.classList.contains("is-open") ?? false;
}