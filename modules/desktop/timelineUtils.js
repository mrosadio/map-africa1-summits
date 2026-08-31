// Draw horizonntal timeline. Dot rendering and click interactions
// Public functions:
//   initHorizontalTimeline(summitData, geojsonData, cumulativeSummits, summitsByCountryMap)
//   highlightYearDots(year)   — called from mapUtils when country clicked
//   resetYearDots()           — called when detail panel closes

import { renderCumulativeMap, clearCountrySelection } from "./mapUtils.js";
import { getColorForCountry } from "../common/partnerColors.js";
import { appData } from "../common/globals.js";

// -- Module states -------------------------------------------------------
let svg; // timeline SVG selection
let xScale; // D3 scale - year -> x position
let allSummitData; // full dataset reference for click handlers
let focusIndex = 0;
let scrubListenersAttached = false;
let settleTimer = null;
let scrubAnimId = null;
const SETTLE_DELAY = 300; // ms of no scrolling before we consider the user is "settled"
const DOT_R = 6;

// -- Public: current scrub position
export function getFocusIndex() {
  return focusIndex;
}
// -- Public: init
export function renderTimeline() {
  const { summitData, geojsonData, cumulativeSummits, summitsByCountryMap } = appData;
  allSummitData = appData;

  const container = document.getElementById("desktop-timeline");
  if (!container) {
    console.error("renderTimeline: #desktop-timeline not found");
    return;
  }

  const W = container.clientWidth;
  const H = container.clientHeight;
  // Reserve enough top space for the tallest stack of same-year dots,
  // so multi-summit years never get clipped by the SVG's own bounds.
  const maxStack = d3.max(summitData, (d) => d.summits.length) || 1;
  const DOT_SPACING = 10;
  const stackHeight = maxStack * (DOT_R * 2 + DOT_SPACING);
  const FOCUS_RING_BUFFER = 12; // extra room for the enlarged/stroked focus dot

  const MARGIN = { left: 12, right: 20, top: stackHeight + FOCUS_RING_BUFFER, bottom: 20 };
  const innerW = W - MARGIN.left - MARGIN.right;
  const innerH = H - MARGIN.top - MARGIN.bottom;

  d3.select("#desktop-timeline").selectAll("*").remove();
  svg = d3.select("#desktop-timeline").append("svg").attr("width", "100%").attr("height", "100%");

  const g = svg.append("g").attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);
  const years = summitData.map((d) => d.year);
  xScale = d3
    .scaleLinear()
    .domain([d3.min(years), d3.max(years)])
    .range([0, innerW]);

  g.append("line").attr("class", "timeline-axis").attr("x1", 0).attr("x2", innerW).attr("y1", innerH).attr("y2", innerH).attr("stroke", "#E8E4DF").attr("stroke-width", 1);

  const labelYears = years.filter((y, i) => i === 0 || i === years.length - 1 || y % 10 === 0);
  g.selectAll("text.timeline-year-label")
    .data(labelYears)
    .enter()
    .append("text")
    .attr("class", "timeline-label")
    .attr("x", (d) => xScale(d))
    .attr("y", innerH + 16)
    .attr("text-anchor", "middle")
    .text((d) => d);

  summitData.forEach((yearData, yearIndex) => {
    const x = xScale(yearData.year);
    const count = yearData.summits.length;

    yearData.summits.forEach((summit, i) => {
      const y = innerH - DOT_R - i * (DOT_R * 2 + DOT_SPACING);
      const color = getColorForCountry(summit.country);

      g.append("circle")
        .attr("class", "timeline-dot")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", DOT_R)
        .attr("fill", color)
        .attr("opacity", 0.85)
        .attr("data-year", yearData.year)
        .attr("data-country", summit.country)
        .style("cursor", "pointer")
        .on("mouseover", function () {
          d3.select(this)
            .transition("dotHover")
            .duration(150)
            .attr("r", DOT_R + 2);
        })
        .on("mouseout", function () {
          if (d3.select(this).classed("active")) return;
          d3.select(this).transition("dotHover").duration(150).attr("r", DOT_R);
        })
        .on("click", function () {
          scrubToIndex(yearIndex);
        });
    });

    g.append("text")
      .attr("class", "timeline-label")
      .attr("x", x)
      .attr("y", innerH - count * (DOT_R * 2 + DOT_SPACING) - DOT_R - 4)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .text(yearData.summits.map((s) => (s.country === "England" ? "UK" : s.country)).join(", "))
      .attr("opacity", 0);
  });
  attachScrubListener();
  updateCumulativeCounter(summitData[0]);
}

// -- Public: highlight dots for a given year (called from mapUtils) -------------------------
export function highlightYearDots(year) {
  if (!svg) return;
  resetDots();
  svg.selectAll(`circle.timeline-dot[data-year="${year}"]`).classed("active", true).attr("r", 9).attr("opacity", 1).attr("stroke", "#1C1C1A").attr("stroke-width", 2);
}

export function resetDots() {
  if (!svg) return;
  svg.selectAll("circle.timeline-dot").classed("active", false).attr("r", DOT_R).attr("opacity", 0.85).attr("stroke", "none");
}

// -- Public: highlight countries when clicking ----------------------------------
export function highlightCountryDots(country) {
  if (!svg) return;
  resetDots();
  svg.selectAll(`circle.timeline-dot[data-country="${country}"]`).classed("active", true).attr("r", 9).attr("stroke", "#1C1C1A").attr("stroke-width", 2);
}

// -- Public: stop scrubs when user clicks on a country --------------------------
// Called when the user clicks a country mid-scrub — cancels any in-flight
// animation/settle timer so the scrubber doesn't keep advancing underneath
// the country-mode UI, and closes the year card since country mode has its
// own panel
export function stopScrub() {
  clearTimeout(settleTimer);
  settleTimer = null;
  clearInterval(scrubAnimId);
  scrubAnimId = null;
  hideYearCardWhileMoving();
}
// -- Public: called when a dot is clicked directly -------------------------
// animates the scrub
// position to that year instead of jumping, then settles as normal
export function scrubToIndex(targetIndex) {
  clearTimeout(settleTimer);
  clearInterval(scrubAnimId);
  clearCountrySelection();
  closeCountryPanelIfOpen();

  const step = targetIndex > focusIndex ? 1 : -1;
  if (targetIndex === focusIndex) {
    settle(appData.summitData[focusIndex]);
    return;
  }

  scrubAnimId = setInterval(() => {
    const next = focusIndex + step;
    tick(next);
    if (next === targetIndex) {
      clearInterval(scrubAnimId);
      settle(appData.summitData[targetIndex]);
    }
  }, 25);
}
// -- Public: closes year card -------------------------------------------------------
export function closeYearCard() {
  const card = document.getElementById("summit-card");
  card?.classList.add("d-none");
  card?.classList.remove("open");
}

// -- Private: attaches scrub listener to timeline -----------------------------------
// after 300ms consider the current dot as settled
function attachScrubListener() {
  if (scrubListenersAttached) return;
  scrubListenersAttached = true;

  function handleWheel(event) {
    event.preventDefault();
    clearInterval(scrubAnimId); // a click-triggered animation shouldn't fight a fresh scroll
    clearCountrySelection(); // clear stale "selected country" state
    closeCountryPanelIfOpen();
    const { summitData } = appData;
    const maxIndex = summitData.length - 1;
    const dir = event.deltaY > 0 ? 1 : -1;
    const newIndex = Math.max(0, Math.min(maxIndex, focusIndex + dir));
    const yearData = tick(newIndex);

    clearTimeout(settleTimer);
    settleTimer = setTimeout(() => {
      settleTimer = null;
      settle(yearData);
    }, SETTLE_DELAY);
  }

  document.getElementById("map")?.addEventListener("wheel", handleWheel, { passive: false });
  document.getElementById("desktop-timeline")?.addEventListener("wheel", handleWheel, { passive: false });
}

// -- Private -------------------------------------------------------------------------
// Direct DOM toggle, same pattern already used for #summit-card elsewhere in
// this file — avoids importing interactions.js here, it would create a
// circular import (interactions.js already imports from this file)
function closeCountryPanelIfOpen() {
  const panel = document.getElementById("detail-panel");
  if (panel && !panel.classList.contains("d-none")) {
    panel.classList.remove("open");
    setTimeout(() => panel.classList.add("d-none"), 300);
  }
}
// -- Private: dot click handler -----------------------------------------------------
function onDotClick(event, yearData) {
  highlightYearDots(yearData.year);
  updateMapByYear(yearData);
  showYearCard(event, yearData);
  dimMapExceptHost(yearData.summits.map((s) => s.country));
}

// -- Private: floating summit card ---------------------------------------------------
// now activates from the dom (previously it positioned itself from a mouse event)
function showYearCard(yearData) {
  const card = document.getElementById("summit-card");
  const content = document.getElementById("summit-card-content");
  console.log("showYearCard called for year:", yearData.year, "card found:", !!card, "content found:", !!content);

  if (!card || !content) return;

  const summitsHTML = yearData.summits
    .map(
      (summit) => `
    <div class="mb-2">
      <p class="summit-card__country mb-1">
        ${summit.country === "England" ? "United Kingdom" : summit.country}
      </p>
      ${summit.title ? `<p class="summit-card__title">${summit.title}</p>` : ""}
      ${
        summit.place
          ? `
        <div class="summit-meta">
          <img src="./src/img/map-pin.svg" class="summit-meta__icon" alt="">
          <p class="summit-card__place mb-0">${summit.place}</p>
        </div>`
          : ""
      }
    </div>
  `,
    )
    .join("");

  content.innerHTML = `
    <div class="summit-card__header">
      <span class="summit-card__year">${yearData.year}</span>
      <button id="close-card" class="btn-close" aria-label="Close"></button>
    </div>
    ${summitsHTML}
  `;
  // Anchor above the topmost dot in that year
  const dotNodes = svg.selectAll(`circle.timeline-dot[data-year="${yearData.year}"]`).nodes();
  if (!dotNodes.length) return;
  const topRect = dotNodes.reduce((top, node) => {
    const r = node.getBoundingClientRect();
    return !top || r.top < top.top ? r : top;
  }, null);
  const margin = 12;

  card.classList.remove("d-none");
  card.style.visibility = "hidden";
  const cardWidth = card.offsetWidth;
  const cardHeight = card.offsetHeight;

  let left = topRect.left + topRect.width / 2 - cardWidth / 2;
  let top = topRect.top - cardHeight - margin;

  left = Math.max(margin, Math.min(left, window.innerWidth - cardWidth - margin));
  if (top < margin) {
    top = topRect.bottom + margin;
  }

  card.style.left = `${left}px`;
  card.style.top = `${top}px`;
  card.style.visibility = "visible";
  card.classList.add("open");

  document.getElementById("close-card")?.addEventListener("click", closeYearCard, { once: true });
}

// -- Private: legend --------------------------------------------------------------
// function drawLegend(g, innerW, innerH) {
//   const items = [
//     { label: "France", color: "#4A6FA5" },
//     { label: "Asia", color: "#C17B2A" },
//     { label: "Turkey / Gulf", color: "#6B8F71" },
//     { label: "US / Russia", color: "#7B5EA7" },
//     { label: "Other", color: "#B4B2A9" },
//   ];
//   const LEGEND_LIFT = 18;
//   const legendG = g.append("g").attr("transform", `translate(0, ${innerH + LEGEND_LIFT})`);

//   let xOffset = 0;
//   items.forEach((item) => {
//     legendG
//       .append("circle")
//       .attr("cx", xOffset + 6)
//       .attr("cy", -innerH - LEGEND_LIFT + 4)
//       .attr("r", 6)
//       .attr("fill", item.color);

//     legendG
//       .append("text")
//       .attr("class", "legend-label")
//       .attr("x", xOffset + 16)
//       .attr("y", -innerH - LEGEND_LIFT + 8)
//       .attr("dominant-baseline", "middle")
//       .attr("font-size", "12px")
//       .text(item.label);

//     xOffset += item.label.length * 6.5 + 20;
//   });
// }

function tick(index) {
  focusIndex = index;
  const { summitData } = appData;
  const yearData = summitData[focusIndex];
  renderCumulativeMap(yearData);
  updateDotsForScrub(yearData.year);
  updateCumulativeCounter(yearData); // ← new
  hideYearCardWhileMoving();
  return yearData;
}

function settle(yearData) {
  showYearCard(yearData);
}

function hideYearCardWhileMoving() {
  const card = document.getElementById("summit-card");
  card?.classList.add("d-none");
  card?.classList.remove("open");
}

// -- Private: Syncs dot visual states to the current scrub position —----------------
// Called on every tick.
// distinct from highlightYearDots (single-year highlight, used by the old
// click-to-jump flow) and highlightCountryDots (country-click flow).
function updateDotsForScrub(currentYear) {
  if (!svg) return;
  svg
    .selectAll("circle.timeline-dot")
    .classed("active", function () {
      return +d3.select(this).attr("data-year") === currentYear;
    })
    .attr("r", function () {
      return +d3.select(this).attr("data-year") === currentYear ? 9 : DOT_R;
    })
    .attr("opacity", function () {
      const y = +d3.select(this).attr("data-year");
      if (y === currentYear) return 1;
      if (y < currentYear) return 0.85; // past — lit
      return 0.25; // future — dimmed
    })
    .attr("stroke", function () {
      return +d3.select(this).attr("data-year") === currentYear ? "#1C1C1A" : "none";
    })
    .attr("stroke-width", function () {
      return +d3.select(this).attr("data-year") === currentYear ? 2 : 0;
    });
}

// -- pRIVATE: counter driven by cumulative map ---------
function updateCumulativeCounter(yearData) {
  const counterEl = document.getElementById("cumulative-counter");
  if (!counterEl) return;
  const { cumulativeSummits } = appData;
  const count = cumulativeSummits.get(yearData.year).cumulative.size;
  const noun = count === 1 ? "country" : "countries";
  counterEl.textContent = `By ${yearData.year}: ${count} ${noun} hosting`;
}
