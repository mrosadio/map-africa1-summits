// Draw horizonntal timeline. Dot rendering and click interactions
// Public functions:
//   highlightYearDots(year)   — called from mapUtils when country clicked
import * as d3 from "d3";
import { renderCumulativeMap, clearCountrySelection } from "./mapUtils.js";
import { getColorForCountry } from "../common/partnerColors.js";
import { appData } from "../common/globals.js";
import { closePanel } from "./panel.js";
import { showCountry } from "./stage.js";

// -- Module states -------------------------------------------------------
let svg; // timeline SVG selection
let xScale; // D3 scale - year -> x position
let focusIndex = 0;
let scrubListenersAttached = false;
let settleTimer = null;
let scrubAnimId = null;
let playhead;
let axisPast;
let knob;
let scrubLocked = false;
let marginLeft = 0; // left margin of the timeline drawing, needed to turn a pointer x into a year
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const SETTLE_DELAY = 300; // ms of no scrolling before we consider the user is "settled"
const phoneQuery = window.matchMedia("(max-width: 767.98px)");
let DOT_R = 6; // idle dot radius
let ACTIVE_R = 9; // radius of the dots for the current year
let DOT_SPACING = 10; // gap between stacked dots
const MIN_LABEL_GAP = 36; // px between year labels

export function restoreScrub() {
  tick(focusIndex);
}
// -- Public: choose the year shown on first render (call once, before renderTimeline)
export function setStartIndex(index) {
  focusIndex = index;
}
// -- Public: intro and story lock wheel and keyboard scrubbing
export function setScrubLocked(locked) {
  document.getElementById("desktop-timeline")?.setAttribute("aria-readonly", locked);
  scrubLocked = locked;
}
// -- Public: story mode turns the chapter marks on, explore mode turns them off
export function setChapterMarks(visible) {
  document.getElementById("desktop-timeline")?.classList.toggle("show-chapters", visible);
}

// -- Public: init
export function renderTimeline() {
  const { summitData } = appData;
  const container = document.getElementById("desktop-timeline");

  if (!container) {
    console.error("renderTimeline: #desktop-timeline not found");
    return;
  }
  container.setAttribute("aria-valuemin", summitData[0].year);
  container.setAttribute("aria-valuemax", summitData[summitData.length - 1].year);
  const phone = phoneQuery.matches;
  DOT_R = phone ? 4.5 : 6;
  ACTIVE_R = phone ? 7 : 9;
  DOT_SPACING = phone ? 3 : 10;
  const W = container.clientWidth;
  const H = container.clientHeight;
  // Reserve enough top space for the tallest stack of same-year dots,
  // so multi-summit years never get clipped by the SVG's own bounds.
  const maxStack = d3.max(summitData, (d) => d.summits.length) || 1;
  const FOCUS_RING_BUFFER = 12;
  const AXIS_GAP = 8; // air between the axis (and its knob) and the lowest dot
  const stackHeight = maxStack * (DOT_R * 2 + DOT_SPACING);
  const MARGIN = { left: DOT_R, right: DOT_R, top: stackHeight + FOCUS_RING_BUFFER + AXIS_GAP, bottom: 28 };
  marginLeft = MARGIN.left;
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

  g.append("line")
    .attr("class", "timeline-axis")
    .attr("x1", -DOT_R)
    .attr("x2", innerW + DOT_R)
    .attr("y1", innerH)
    .attr("y2", innerH);
  axisPast = g.append("line").attr("class", "timeline-axis-past").attr("x1", -DOT_R).attr("y1", innerH).attr("y2", innerH);
  playhead = g
    .append("line")
    .attr("class", "timeline-playhead")
    .attr("y1", -MARGIN.top + 4)
    .attr("y2", innerH);
  knob = g.append("circle").attr("class", "timeline-knob").attr("cy", innerH).attr("r", 5);
  movePlayhead(summitData[focusIndex].year);

  const chapterYears = [...new Set((appData.chapters?.chapters ?? []).map((c) => c.year))];
  const endYears = [years[0], years[years.length - 1]];
  const farFrom = (year, others) => others.every((o) => Math.abs(xScale(year) - xScale(o)) >= MIN_LABEL_GAP);

  // Ticks for the story stops, just below the axis
  g.selectAll("line.timeline-chapter-tick")
    .data(chapterYears)
    .enter()
    .append("line")
    .attr("class", "timeline-chapter-tick")
    .attr("x1", (d) => xScale(d))
    .attr("x2", (d) => xScale(d))
    .attr("y1", innerH + 2)
    .attr("y2", innerH + 8);

  // Year labels: the ends and the decades always; chapter years without a label
  // are added (shown in story mode only); a decade label that would collide
  // with a chapter label steps aside in story mode
  const baseYears = years.filter((y, i) => i === 0 || i === years.length - 1 || (y % 10 === 0 && farFrom(y, endYears)));
  const chapterOnlyYears = chapterYears.filter((y) => !baseYears.includes(y) && farFrom(y, endYears));
  const labelData = [
    ...baseYears.map((y) => ({
      year: y,
      chapterOnly: false,
      yields: !endYears.includes(y) && !farFrom(y, chapterOnlyYears),
    })),
    ...chapterOnlyYears.map((y) => ({ year: y, chapterOnly: true, yields: false })),
  ];
  const isStart = (d) => d.year === years[0];
  const isEnd = (d) => d.year === years[years.length - 1];
  g.selectAll("text.timeline-label")
    .data(labelData)
    .enter()
    .append("text")
    .attr("class", (d) => ["timeline-label", chapterYears.includes(d.year) && "timeline-label--stop", d.chapterOnly && "timeline-label--chapter", d.yields && "timeline-label--yields"].filter(Boolean).join(" "))
    .attr("x", (d) => xScale(d.year) + (isStart(d) ? -DOT_R : isEnd(d) ? DOT_R : 0))
    .attr("y", innerH + 22)
    .attr("text-anchor", (d) => (isStart(d) ? "start" : isEnd(d) ? "end" : "middle"))
    .text((d) => d.year);

  summitData.forEach((yearData, yearIndex) => {
    const x = xScale(yearData.year);

    yearData.summits.forEach((summit, i) => {
      const y = innerH - AXIS_GAP - DOT_R - i * (DOT_R * 2 + DOT_SPACING);
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
  });

  attachScrubListener();
  updateCumulativeCounter(summitData[focusIndex]);
}

// -- Public: highlight dots for a given year (called from mapUtils) -------------------------
export function highlightYearDots(year) {
  if (!svg) return;
  resetDots();
  svg.selectAll(`circle.timeline-dot[data-year="${year}"]`).classed("active", true).attr("r", ACTIVE_R).attr("opacity", 1).attr("stroke", "#1C1C1A").attr("stroke-width", 2);
}

export function resetDots() {
  if (!svg) return;
  svg.selectAll("circle.timeline-dot").classed("active", false).attr("r", DOT_R).attr("opacity", 0.85).attr("stroke", "none");
}

// -- Public: highlight countries when clicking ----------------------------------
export function highlightCountryDots(country) {
  if (!svg) return;
  resetDots();
  svg.selectAll("circle.timeline-dot").attr("opacity", 0.15);
  svg.selectAll(`circle.timeline-dot[data-country="${country}"]`).classed("active", true).attr("r", ACTIVE_R).attr("opacity", 1).attr("stroke", "#1C1C1A").attr("stroke-width", 2);
  setPlayheadVisible(false);
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
export function scrubToIndex(targetIndex, { silent = false } = {}) {
  clearTimeout(settleTimer);
  clearInterval(scrubAnimId);
  clearCountrySelection();
  closePanel();
  const step = targetIndex > focusIndex ? 1 : -1;
  const done = (yearData) => {
    if (!silent) settle(yearData);
  };
  if (targetIndex === focusIndex) {
    done(appData.summitData[focusIndex]);
    return;
  }
  if (reduceMotion.matches) {
    done(tick(targetIndex)); // jump straight to the year, no step animation
    return;
  }
  scrubAnimId = setInterval(() => {
    const next = focusIndex + step;
    tick(next);
    if (next === targetIndex) {
      clearInterval(scrubAnimId);
      done(appData.summitData[targetIndex]);
    }
  }, 25);
}
// -- Public: closes year card -------------------------------------------------------
export function closeYearCard() {
  const card = document.getElementById("summit-card");
  card?.classList.add("d-none");
  card?.classList.remove("open");
}

// -- Private: wheel accumulation ----------------------------------------------------
export function stepScrub(dir) {
  clearInterval(scrubAnimId);
  clearCountrySelection();
  closePanel();
  const newIndex = Math.max(0, Math.min(appData.summitData.length - 1, focusIndex + dir));
  if (newIndex === focusIndex) return;
  const yearData = tick(newIndex);
  clearTimeout(settleTimer);
  settleTimer = setTimeout(() => {
    settleTimer = null;
    settle(yearData);
  }, SETTLE_DELAY);
}
// -- Private: jumps to a given index and does not start the settle timer -----------
function dragToIndex(index) {
  if (index === focusIndex) return;
  clearInterval(scrubAnimId);
  clearCountrySelection();
  closePanel();
  tick(index);
}
// -- Private: moveplayhead ---------------------------------------------------------
function movePlayhead(year) {
  const x = xScale(year);
  playhead?.attr("x1", x).attr("x2", x);
  axisPast?.attr("x2", x);
  knob?.attr("cx", x);
  setPlayheadVisible(true);
  document.getElementById("desktop-timeline")?.setAttribute("aria-valuenow", year);
}
function setPlayheadVisible(visible) {
  [playhead, axisPast, knob].forEach((el) => el?.style("display", visible ? null : "none"));
}
// -- Private: attaches scrub listener to timeline -----------------------------------
// after 300ms consider the current dot as settled
function attachScrubListener() {
  if (scrubListenersAttached) return;
  scrubListenersAttached = true;
  const WHEEL_STEP = 40; // px of travel per year; tune on your own touchpad
  const WHEEL_IDLE_MS = 150; // forget leftover travel after a pause
  let wheelAcc = 0;
  let wheelIdleTimer = null;

  function handleWheel(event) {
    event.preventDefault();
    if (scrubLocked) return;
    wheelAcc += event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY;
    clearTimeout(wheelIdleTimer);
    wheelIdleTimer = setTimeout(() => (wheelAcc = 0), WHEEL_IDLE_MS);
    if (Math.abs(wheelAcc) < WHEEL_STEP) return;
    stepScrub(wheelAcc > 0 ? 1 : -1);
    wheelAcc = 0;
  }
  document.getElementById("desktop-timeline").addEventListener("wheel", handleWheel, { passive: false });
  document.addEventListener("keydown", (event) => {
    const t = event.target;
    if (t !== document.body && t !== document.getElementById("desktop-timeline")) return;
    if (scrubLocked) return;
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        stepScrub(1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        stepScrub(-1);
        break;
      case "Home":
        scrubToIndex(0);
        break;
      case "End":
        scrubToIndex(appData.summitData.length - 1);
        break;
      default:
        return;
    }
    event.preventDefault();
  });
    // Drag (touch or mouse) along the timeline to scrub; a tap on empty space jumps to the nearest year
  const DRAG_THRESHOLD = 6; // px of movement before a press counts as a drag
  const timelineEl = document.getElementById("desktop-timeline");
  let pressX = null;
  let dragging = false;

  const indexAt = (clientX) => {
    const x = clientX - timelineEl.getBoundingClientRect().left - marginLeft;
    return d3.bisector((d) => d.year).center(appData.summitData, xScale.invert(x));
  };

  timelineEl.addEventListener("pointerdown", (event) => {
    if (scrubLocked || !event.isPrimary || (event.pointerType === "mouse" && event.button !== 0)) return;
    pressX = event.clientX;
    dragging = false;
  });
  timelineEl.addEventListener("pointermove", (event) => {
    if (pressX === null) return;
    if (!dragging) {
      if (Math.abs(event.clientX - pressX) < DRAG_THRESHOLD) return;
      dragging = true;
      timelineEl.setPointerCapture(event.pointerId); // keep receiving moves if the finger leaves the strip
      clearTimeout(settleTimer);
      clearInterval(scrubAnimId);
    }
    dragToIndex(indexAt(event.clientX));
  });
  const endPress = (event) => {
    if (pressX === null) return;
    const wasDragging = dragging;
    pressX = null;
    dragging = false;
    if (wasDragging) {
      settle(appData.summitData[focusIndex]);
    } else if (event.type === "pointerup" && !event.target.classList?.contains("timeline-dot")) {
      scrubToIndex(indexAt(event.clientX)); // dots keep their own click handler
    }
  };
  timelineEl.addEventListener("pointerup", endPress);
  timelineEl.addEventListener("pointercancel", endPress);
}

// -- Private: floating summit card ---------------------------------------------------
// now activates from the dom (previously it positioned itself from a mouse event)
function showYearCard(yearData) {
  const card = document.getElementById("summit-card");
  const content = document.getElementById("summit-card-content");

  if (!card || !content) return;

  const summitsHTML = yearData.summits
    .map((summit) => {
      const name = summit.country === "England" ? "United Kingdom" : summit.country;
      return `
        <div class="summit-card__item" style="--dot: ${getColorForCountry(summit.country)}">
          <p class="summit-card__country">${name}</p>
          ${summit.title ? `<p class="summit-card__title">${summit.title}</p>` : ""}
          ${summit.place ? `<p class="summit-card__place">${summit.place}</p>` : ""}
        </div>`;
    })
    .join("");

  content.innerHTML = `
    <div class="summit-card__header">
      <span class="summit-card__year">${yearData.year}</span>
      <button id="close-card" type="button" class="vis-link">Close</button>
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

function tick(index) {
  focusIndex = index;
  const { summitData } = appData;
  const yearData = summitData[focusIndex];
  renderCumulativeMap(yearData);
  updateDotsForScrub(yearData.year);
  updateCumulativeCounter(yearData);
  hideYearCardWhileMoving();
  movePlayhead(yearData.year);
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
      return +d3.select(this).attr("data-year") === currentYear ? ACTIVE_R : DOT_R;
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
  const numeralEl = document.getElementById("year-numeral");
  if (numeralEl) numeralEl.textContent = yearData.year;
  counterEl.textContent = `By ${yearData.year}: ${count} ${noun} hosting`;
}
