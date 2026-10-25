// Fix circular import by creating a file that avoids this
// Remove zoom function from maputils
import { getColorForCountry } from "../common/partnerColors.js";
import { svg, mapStyle, appData } from "../common/globals.js";
import { getSummitsByCountry, renderCountryPanel } from "./summitUtils.js";
import { showTooltip, hideTooltip } from "./tooltip.js";
import { displayName } from "../common/utils.js";

let projection;
let path;
let clickedCountry = null;
let g;

// -- Country-click listener registry (dependency injection) --------------------
let countryClickListeners = [];
export function onCountryClick(callback) {
  countryClickListeners.push(callback);
}
export function drawMap() {
  const { countriesWithSummits, summitsByCountryMap } = appData;
  const { geojsonData } = appData;

  const mapEl = document.querySelector("#map");
  const W = mapEl.clientWidth;
  const H = mapEl.clientHeight;
  svg.attr("viewBox", `0 0 ${W} ${H}`);
  projection = d3.geoEqualEarth().fitSize([W, H], geojsonData);
  path = d3.geoPath().projection(projection);
  // Clear any previously drawn map — drawMap() is called again on every
  // window resize (see main.js), and without this the old map's <g> stays
  // in the DOM and a new one stacks on top of it.
  svg.selectAll("*").remove();
  g = svg.append("g");
  // One listener on the group, not on each path: a focus listener on an SVG
  // element makes Chrome treat it as focusable, which tabbed through every country.
  g.on("focusin", (event) => {
    const d = d3.select(event.target).datum();
    if (!d?.properties) return;
    const r = event.target.getBoundingClientRect();
    showTooltip(displayName(d.properties.name), { clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 });
  }).on("focusout", hideTooltip);
  const paths = g
    .selectAll("path")
    .data(geojsonData.features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("fill", (d) => {
      const country = d.properties.name;
      return countriesWithSummits.has(country) ? getColorForCountry(country) : mapStyle.defaultFill;
    })
    .attr("stroke", mapStyle.defaultBorder)
    .attr("stroke-width", mapStyle.defaultBorderWidth);
  bindCountryEvents(paths, countriesWithSummits);
}
// Re-fits the existing shapes to the container. Does not rebuild the map,
// so colours, selection ring and listeners are kept.
export function redrawMap() {
  if (!g) return;
  const el = document.querySelector("#map");
  const W = el.clientWidth;
  const H = el.clientHeight;
  if (!W || !H) return; // hidden (for example on mobile)
  svg.attr("viewBox", `0 0 ${W} ${H}`);
  projection.fitSize([W, H], appData.geojsonData); // mutates the projection that `path` already uses
  g.selectAll("path").attr("d", path);
}

export function observeMapResize() {
  const el = document.querySelector("#map");
  let frame;
  new ResizeObserver(() => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(redrawMap);
  }).observe(el);
}
// -- Public: Cumulative map render for the scrubber —---------------------------
// Called on every scroll tick.
// Distinct from updateMapByYear (kept temporarily for the old click-to-jump flow,
// for removal once the scrubber fully replaces it)
export function renderCumulativeMap(yearData) {
  const { geojsonData, cumulativeSummits, summitsByCountryMap } = appData;
  const yearInfo = cumulativeSummits.get(yearData.year);
  const cumulative = yearInfo.cumulative;
  const currentHosts = yearData.summits.map((s) => s.country);

  const sel = g
    .selectAll("path")
    .data(geojsonData.features)
    .join("path")
    .attr("d", path)
    .attr("fill", (d) => {
      const country = d.properties.name;
      return cumulative.has(country) ? getColorForCountry(country) : mapStyle.defaultFill;
    })
    .attr("stroke", (d) => (currentHosts.includes(d.properties.name) ? mapStyle.borderHost : mapStyle.defaultBorder))
    .attr("stroke-width", (d) => (currentHosts.includes(d.properties.name) ? mapStyle.borderWidthHost : mapStyle.defaultBorderWidth))
    .attr("opacity", 1);
  bindCountryEvents(sel, cumulative);
}
function notifyCountryClick(country, viaKeyboard) {
  countryClickListeners.forEach((cb) => cb(country, viaKeyboard));
}
// -- Private: click handler for both maps -------------------------------------------
// Shared click handler for BOTH the initial map (drawMap) and the scrub-driven
// cumulative map (renderCumulativeMap). Previously these had two separate and
// slightly different click handlers. I unified them so country selection
// styling (stroke ring) applies consistently regardless of which map state
// is currently rendered.
function handleCountryClick(event, d, availableCountries, summitsByCountryMap) {
  const country = d.properties.name;
  if (availableCountries.has(country)) {
    event.stopPropagation(); // prevent bubbling to #map's click-to-close-card listener,
    // which would otherwise wipe the highlight we're about to set
    clickedCountry = country;
    const summits = getSummitsByCountry(summitsByCountryMap, country);
    renderCountryPanel(country, summits);
    applyCountrySelectionStyle(availableCountries);
    notifyCountryClick(country, event.type === "keydown");
  } else {
    event.stopPropagation();
  }
}
function applyCountrySelectionStyle(availableCountries) {
  g.selectAll("path")
    .attr("fill", (d) => {
      const country = d.properties.name;
      return availableCountries.has(country) ? getColorForCountry(country) : mapStyle.defaultFill;
    })
    .attr("stroke", (d) => (d.properties.name === clickedCountry ? mapStyle.borderHost : mapStyle.defaultBorder))
    .attr("stroke-width", (d) => (d.properties.name === clickedCountry ? mapStyle.borderWidthHost : mapStyle.defaultBorderWidth));
}

// -- Public: enables user resumed scrubbing after selecting a country ----------------
// Called when the user resumes scrubbing after selecting a country, so the
// next renderCumulativeMap tick doesn't carry stale "selected" state
export function clearCountrySelection() {
  clickedCountry = null;
}
export function focusCountry(country) {
  g?.selectAll("path")
    .filter((d) => d.properties.name === country)
    .node()
    ?.focus({ preventScroll: true });
}
export function clearCountryLabels() {
  svg.selectAll(".country-label").remove();
  svg.selectAll(".country-counter").remove();
}
function bindCountryEvents(selection, availableCountries) {
  const isAvailable = (d) => availableCountries.has(d.properties.name);
  selection
    .style("cursor", (d) => (isAvailable(d) ? "pointer" : "default"))
    .attr("tabindex", (d) => (isAvailable(d) ? 0 : null))
    .attr("role", (d) => (isAvailable(d) ? "button" : null))
    .attr("aria-label", (d) => (isAvailable(d) ? `${displayName(d.properties.name)}, show its summits` : null))
    .on("click", (event, d) => handleCountryClick(event, d, availableCountries, appData.summitsByCountryMap))
    .on("keydown", (event, d) => {
      if (!isAvailable(d) || (event.key !== "Enter" && event.key !== " ")) return;
      event.preventDefault(); // Space would otherwise scroll the page
      handleCountryClick(event, d, availableCountries, appData.summitsByCountryMap);
    })
    .on("mousemove", (event, d) => {
      if (isAvailable(d)) showTooltip(displayName(d.properties.name), event);
      else hideTooltip();
    })
    .on("mouseleave", hideTooltip);
}
