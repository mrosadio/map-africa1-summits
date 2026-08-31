import { flagSrc } from "../common/globals.js";

export function getSummitsByCountry(summitsByCountryMap, country) {
  console.log("Country in getsummit function", country);
  console.log("JSON data in getsummit function", summitsByCountryMap);
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
  console.log("filterFlag", filterFlag[0]?.img?.["img-src"]);
  const flagCountry = filterFlag[0].img["img-src"];
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
  const noSummits = summitsCountry.length;
  const totalSummits = document.getElementById('total-summit');
  if (totalSummits) {
    totalSummits.innerHTML = `${noSummits} summit(s) hosted:`;
  } else {
    console.warn('renderCountryPanel: #total-summit not found in DOM');
  }

  const introListSummit = document.getElementById('intro-list-summit');
  if (introListSummit) {
    introListSummit.innerHTML = `<i>(from most to least recent)</i>`;
  } else {
    console.warn('renderCountryPanel: #intro-list-summit not found in DOM');
  }

  const summitListContainer = document.getElementById('summitList');
  if (!summitListContainer) {
    console.warn('renderCountryPanel: #summitList not found in DOM — aborting list render');
    return;
  }
  summitListContainer.innerHTML = '';

  const reversedSummitsCountry = summitsCountry.slice().reverse();
  reversedSummitsCountry.forEach(summit => {
    const listItem = document.createElement('li');

    let titleContent = summit.title ? `${summit.title}` : `${summit.summitNo} Summit`;
    let dateContent = summit.date ? `
        <div class="summit-meta">
            <img src="./src/img/calendar.svg" class="summit-meta__icon" alt="">
            <p class="mobile-font-size mb-0">${summit.date}</p>
        </div>` : '';
    let placeContent = summit.place ? `
        <div class="summit-meta">
            <img src="./src/img/map-pin.svg" class="summit-meta__icon" alt="">
            <p class="mobile-font-size mb-0">${summit.place}</p>
        </div>` : '';

    listItem.innerHTML = `
        <div class="d-flex align-items-start mb-0">
            <span class="summit-number badge bg-dark me-2 mobile-font-size badge-normal">${summit.summitNo}</span>
            <div class="summit-content">
                <p class="mb-1 mobile-font-size summit-title">${titleContent}</p>
                ${dateContent}
                ${placeContent}
            </div>
        </div>
    `;
    summitListContainer.appendChild(listItem);
  });
}

export function displaySummitsYear(yearData) {
  console.log("flag", flagSrc);
  console.log("Year data in displaySummitYear", yearData);

  // Empty content that will not be used in this container
  const totalSummits = document.getElementById("total-summit");
  totalSummits.innerHTML = "";
  const listOrder = document.getElementById("intro-list-summit");
  listOrder.innerHTML = "";
  const hostYear = document.getElementById("summitCountry");
  hostYear.innerHTML = `Summits hosted in ${yearData.year}`;
  hostYear.classList.add("h2");

  const separatorContainer = document.querySelector(".apri-separator-vis");
  if (separatorContainer) {
    // Clear existing line
    console.log("Separator container", separatorContainer);
    separatorContainer.remove();
  }

  // Create and insert the separator element for mobile devices
  const separator = document.createElement("div");
  separator.className = "apri-separator-vis d-md-none mb-2";
  hostYear.insertAdjacentElement("afterend", separator);

  const summitListContainer = document.getElementById("summitList");
  summitListContainer.innerHTML = "";

  yearData.summits.forEach((summit) => {
    console.log("Summit in displaySummitYear", summit);
    let country;
    if (summit.country === "England") {
      country = "United Kingdom";
    } else {
      country = summit.country;
    }
    console.log("Country in displaySummitYear", country);
    let filterFlag = flagSrc.filter((item) => item.country === country);
    console.log("Filter flag", filterFlag);
    let flagCountry = filterFlag[0].img["img-src"];

    const listItem = document.createElement("li");
    let countryListed = country
      ? `
        <div class="d-flex justify-content-start align-items-center mt-4 mb-2">
            <img src="./src/img/country-flags-main/png100px/${flagCountry}" class="img-fluid country-flag border-dark rounded me-2" alt="Flag">
            <p class="mb-0 ms-1 fw-bold">${country}</p>
        </div>`
      : "";
    let titleContent = summit.title ? `${summit.title}` : `${summit.summitNo} Summit`;
    let dateContent = summit.date
      ? `
        <div class="d-flex justify-content-start align-items-center mb-0">
            <img src="./src/img/calendar.svg" class="img-fluid calendar me-2 pe-sm-2 pe-lg-2 pe-xl-2">
            <p class="mobile-font-size mb-0">${summit.date}</p>
        </div>`
      : "";
    let placeContent = summit.place
      ? `
        <div class="d-flex justify-content-start align-items-center mb-0">
            <img src="./src/img/map-pin.svg" class="img-fluid location me-2 pe-sm-2 pe-lg-2 pe-xl-2">
            <p class="mobile-font-size mb-0">${summit.place}</p>
        </div>`
      : "";
    listItem.innerHTML = `
        ${countryListed} 
        <div class="d-flex justify-content-start align-items-start mb-0">
            <span class="summit-number badge badge-mobile bg-dark me-3 me-lg-3 me-xl-3 pe-sm-2 pe-lg-3 pe-xl-3 mobile-font-size badge-normal">${summit.summitNo}</span>
            <p class="mb-0 mobile-font-size summit-title">${titleContent}</p>
        </div>
        ${dateContent}
        ${placeContent}
    `;
    summitListContainer.appendChild(listItem);
  });
}
