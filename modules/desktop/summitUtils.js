import { flagSrc } from "../common/globals.js";

export function getSummitsByCountry(summitsByCountryMap, country) {
  let summitsCountry;
  if (summitsByCountryMap.has(country)) {
    let summitDetails = summitsByCountryMap.get(country);
    summitsCountry = summitDetails;
  }
  return summitsCountry;
}

export function renderCountryPanel(country, summitsCountry) {
  if (country === "England") {
    country = "United Kingdom";
  }
  const filterFlag = flagSrc.filter((item) => item.country === country);
    const flagCountry = flagSrc.find((item) => item.country === country)?.img["img-src"];
  // Target the icon + name individually instead of overwriting the whole <h2>
  const countryIcon = document.getElementById("country-icon");
  const countryName = document.getElementById("country-name");
  if (countryIcon) {
    countryIcon.src = `./src/img/country-flags-main/png100px/${flagCountry}`;
  } else {
    console.warn("renderCountryPanel: #country-icon not found in DOM");
  }
  if (countryName) {
    countryName.textContent = country;
  } else {
    console.warn("renderCountryPanel: #country-name not found in DOM");
  }
    const cell = (className, text) => {
    const span = document.createElement("span");
    span.className = className;
    span.textContent = text;
    return span;
  };

  const count = summitsCountry.length;
  const years = summitsCountry.map((s) => s.year);
  const range = count > 1 ? `${Math.min(...years)}–${Math.max(...years)}` : `${years[0]}`;
  const totalSummits = document.getElementById("total-summit");
  if (totalSummits) totalSummits.textContent = `${count} ${count === 1 ? "summit" : "summits"} · ${range}`;

  const introListSummit = document.getElementById("intro-list-summit");
  if (introListSummit) introListSummit.textContent = ""; // legacy, used again in the phone layout

  const list = document.getElementById("summitList");
  if (!list) {
    console.warn("renderCountryPanel: #summitList not found in DOM — aborting list render");
    return;
  }
  // Newest first
  list.replaceChildren(
    ...summitsCountry
      .slice()
      .reverse()
      .map((summit) => {
        const item = document.createElement("li");
        item.className = "vis-summits__item";
        item.append(cell("vis-summits__year", summit.year), cell("vis-summits__no", `${summit.summitNo} summit`), cell("vis-summits__place", summit.place ?? ""));
        if (summit.title) item.append(cell("vis-summits__title", summit.title));
        if (summit.date) item.append(cell("vis-summits__date", summit.date));
        return item;
      }),
  );
}