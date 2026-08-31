// Fixing circular import between map and timeline utils js
// We will define dependencies in this file - this is the only file that
// nows about both
import { onCountryClick } from "./mapUtils.js";
import { highlightCountryDots, resetDots, closeYearCard, stopScrub } from "./timelineUtils.js";

// guardst again the opening click also triggering the close of the country panel outside eventlistener
let justOpenedPanel = false;

export function initInteractions() {
  // Country clicked on map → open detail panel + highlight its dots on the timeline
  onCountryClick((country) => {
    stopScrub();
    closeYearCard();
    const panel = document.getElementById("detail-panel");
    if (panel) {
      panel.classList.remove("d-none");
      requestAnimationFrame(() => {
        panel.classList.add("open");
      });
    }
    highlightCountryDots(country);
    justOpenedPanel = true;
  });
  document.getElementById("close-panel")?.addEventListener("click", closeDetailPanel);
  // Click anywhere on the map closes the floating year-card
  // this also fires when clicking a country, which is fine -
  // it means clicking a country while a year-card is open both closes
  // the card and opens the country panel, which is reasonable combined behavior
  document.getElementById("map")?.addEventListener("click", () => {
    closeYearCard();
  });
  // Click anywhere outside the panel closes it — same pattern as the year card.
  document.addEventListener("click", (event) => {
    if (justOpenedPanel) {
      justOpenedPanel = false; // this click just opened the panel — ignore it here
      return;
    }
    const panel = document.getElementById("detail-panel");
    if (!panel || panel.classList.contains("d-none")) return;
    if (!panel.contains(event.target)) {
      closeDetailPanel();
    }
  });
}

function closeDetailPanel() {
  const panel = document.getElementById("detail-panel");
  panel?.classList.remove("open");
  setTimeout(() => panel?.classList.add("d-none"), 300);
  resetDots();
}
