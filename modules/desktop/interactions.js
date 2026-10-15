// Fixing circular import between map and timeline utils js
// We will define dependencies in this file - this is the only file that
// nows about both
import { onCountryClick, clearCountrySelection } from "./mapUtils.js";
import { highlightCountryDots, resetDots, closeYearCard, stopScrub, restoreScrub } from "./timelineUtils.js";
import { openPanel, closePanel, isPanelOpen } from "./panel.js";

// guardst again the opening click also triggering the close of the country panel outside eventlistener
let justOpenedPanel = false;

export function initInteractions() {
  // Country clicked on map → open detail panel + highlight its dots on the timeline
  onCountryClick((country) => {
    stopScrub();
    closeYearCard();
    openPanel();
    highlightCountryDots(country);
  });
  document.getElementById("close-panel")?.addEventListener("click", closeCountryMode);
  // Click anywhere on the map closes the floating year-card
  // this also fires when clicking a country, which is fine -
  // it means clicking a country while a year-card is open both closes
  // the card and opens the country panel, which is reasonable combined behavior
  document.getElementById("map")?.addEventListener("click", () => {
    closeYearCard();
  });
  // Click anywhere outside the panel closes it — same pattern as the year card.
  document.addEventListener("click", (event) => {
    if (!isPanelOpen()) return;
    if (!document.getElementById("detail-panel").contains(event.target)) {
      closeCountryMode();
    }
  });
}
function closeCountryMode() {
  closePanel();
  clearCountrySelection();
  restoreScrub(); // back to time mode at the year the user left
}
