import { getSummitsByCountry, renderCountryPanel, displaySummitsYear } from "../desktop/summitUtils.js";
import { initializeMobileMap, updateMapByCountry, updateMapByYear } from "./mapMobile.js";
import { showPickerCountrySummit, showPickerYearSummit, confirmPicker, cancel, getSelectedText } from "./pickerMobile.js";

export function initMobileTimeline(geojsonData, jsonData, cumulativeSummits, summitsByCountryMap /*, summitCounter*/) {
    //console.log('JSON data in mobile timeline', jsonData);
    //console.log('Summits by country map', summitsByCountryMap)
    initializeMobileMap(geojsonData);
    const confirmButton = document.getElementById("confirmButton");
    // Open year picker 
    document.getElementById('select-year').addEventListener("click", function () {
        console.log('Select year button clicked');
        confirmButton.addEventListener("click", () => {
            console.log('Confirm button clicked');
            confirmPicker();
            const selectedInput = getSelectedText();
            console.log('Selected input in initMobile.js', selectedInput);
            const yearData = jsonData.find((summit) => summit.year === parseInt(selectedInput));
            if (yearData) {
                console.log('Year data:', yearData);
                displaySummitsYear(yearData);
                updateMapByYear(d3.select("#map-mobile svg"), geojsonData, yearData, cumulativeSummits, summitsByCountryMap);
                //initializeMobileMap(geojsonData, yearData, cumulativeSummits, summitsByCountryMap);
            }
        });
        if (/Mobi|Android/i.test(navigator.userAgent)) {
            // El usuario está en un dispositivo móvil
            showPickerYearSummit();
            this.scrollIntoView({ behavior: "smooth", block: "start" });
            const selectedText = document.getElementById("blockNameNowTemp");
            selectedText.innerText = "Summits by year";
        } else {
            // El usuario está en una web (escritorio o tablet)
            const firstCountryButton = document.querySelector(".country-select"); // Selecciona el primer botón en la lista de "Bilateral partnerships"
            if (firstCountryButton) {
                firstCountryButton.classList.add("activeDetail");
                firstCountryButton.click(); // Simula un clic en ese botón
            }
        }
    });

    // Open country picker
    document.getElementById('select-country').addEventListener("click", function () {
        console.log('Select country button clicked');
        if (/Mobi|Android/i.test(navigator.userAgent)) {
            // User is in movile device
            showPickerCountrySummit();
            this.scrollIntoView({ behavior: "smooth", block: "start" });
            const selectedText = document.getElementById("blockNameNowTemp");
            selectedText.innerText = "Summits by year";
        } else {
            // User is in table or desktop
            const firstCountryButton = document.querySelector(".country-select"); 
            if (firstCountryButton) {
                firstCountryButton.classList.add("activeDetail");
                firstCountryButton.click(); // Simula un clic en ese botón
            }
        }
        confirmButton.addEventListener("click", () => {
            console.log('Confirm button in Select Country clicked');
            confirmPicker();
            let selectedCountry = getSelectedText();
            console.log('Selected Country in initMobile.js', selectedCountry);
            if (selectedCountry) {
                if (selectedCountry === "United Kingdom") {
                    selectedCountry = "England"; // since the geojson calls it England
                  }
                let summits = getSummitsforCountry(summitsByCountryMap, selectedCountry);
                renderCountryPanel(selectedCountry, summits);
                // Update the map based on the selected country
                updateMapByCountry(d3.select("#map-mobile svg"), geojsonData, selectedCountry);
            }
        });
    });

    document.addEventListener("DOMContentLoaded", function () {
        const wheelElement = document.querySelector(".wheel");
        const scrollbarElement = document.querySelector(".wheel-scrollbar");
        wheelElement.addEventListener("scroll", function () {
            const scrollPercentage =
                wheelElement.scrollTop /
                (wheelElement.scrollHeight - wheelElement.clientHeight);
            scrollbarElement.style.top =
                scrollPercentage *
                (wheelElement.clientHeight - scrollbarElement.clientHeight) +
                "px";
        });
    });
    //console.log('Element select country', document.getElementById('select-country'))
    let countries = [];
    summitsByCountryMap.forEach((value, key) => {
        countries.push({ text: key, value: key });
    });
}