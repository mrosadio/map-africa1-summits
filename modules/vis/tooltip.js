const OFFSET = 14;
let el;

export function showTooltip(text, event) {
  el ??= document.getElementById("vis-tooltip");
  if (!el) return;
  el.textContent = text;
  el.classList.add("visible");
  const x = Math.min(event.clientX + OFFSET, window.innerWidth - el.offsetWidth - OFFSET);
  const below = event.clientY + OFFSET + el.offsetHeight < window.innerHeight;
  el.style.left = `${Math.max(OFFSET, x)}px`;
  el.style.top = `${below ? event.clientY + OFFSET : event.clientY - el.offsetHeight - OFFSET}px`;
}

export function hideTooltip() {
  el?.classList.remove("visible");
}