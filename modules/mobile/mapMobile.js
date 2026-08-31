import { mapStyle } from "../common/globals.js";

let mapMobileHeight = 305;
let mapMobileWidth = window.innerWidth;
console.log('Mobile dynamic width', window.innerWidth)
console.log('Map mobile height', mapMobileHeight)

let projection = d3.geoNaturalEarth1().center([50, 0]).scale(205).translate([mapMobileWidth / 3.5, mapMobileHeight / 1.5]); // do not move coord unless svg size is changed!
let path = d3.geoPath().projection(projection);
let g;

//console.log('Map mobile height', mapMobileHeight)
let svg = d3.select("#map-mobile").append("svg");
svg
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", `-500 -100 1000 600`)
    .attr("preserveAspectRatio", "xMidYMid meet");

export function initializeMobileMap(geojsonData) {
    // Draw the map
    drawMap(svg, geojsonData);

    // Add zoom buttons
    addZoomButtons(svg);

    // Apply zoom behavior to the SVG
    svg.call(zoom);

    // Make the map responsive
    window.addEventListener('resize', () => resizeMap(svg, geojsonData));
}

const zoom = d3.zoom()
    .scaleExtent([1, 8]) // Set the scale extent for zooming
    .on("zoom", zoomed);

function zoomed(event) {
    svg.selectAll("path").attr("transform", event.transform);
}

function drawMap(svg, geojsonData) {
    console.log('Drawing map for mobile')
    g = svg.append("g");

    g
        .selectAll("path")
        .data(geojsonData.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", mapStyle.defaultFill)
        .attr("stroke", mapStyle.defaultBorder)
        .attr("stroke-width", mapStyle.defaultBorderWidth);

    // Apply zoom behavior to the SVG
    svg.call(zoom);
}

function addZoomButtons(svg) {
    console.log('Height and width', mapMobileHeight, mapMobileWidth);
    const buttonSize = 55;
    const buttonPadding = 15;
    const buttonMargin = 15;
    const buttonOutMargin = 60;
    const buttonCornerRadius = 10;
    const zoomInButton = svg.append("g")
        .attr("id", "zoomInButton")
        .attr("class", "zoom-button zoom-in")
        .attr("transform", `translate(${mapMobileWidth - buttonSize}, ${mapMobileHeight + buttonSize + buttonMargin + buttonPadding})`)
        .on("click", () => {
            console.log('Zoom in button id', zoomInButton.attr("id"))
            handleButtonClick(svg, zoomInButton.attr("id"))
        });
    zoomInButton.append("rect")
        .attr("width", buttonSize)
        .attr("height", buttonSize)
        .attr("fill", "#f2f2f2")
        .attr("stroke", "white")
        .attr("stroke-width", 1)
        .attr("rx", buttonCornerRadius) // Add radius for rounded corners
        .attr("ry", buttonCornerRadius);

    zoomInButton.append("text")
        .attr("x", `${buttonSize / 2}`)
        .attr("y", `${buttonSize - (buttonPadding / 2)}`)
        .attr("text-anchor", "middle")
        .attr("font-size", "4rem")
        .attr("fill", "#000")
        .attr("class", "fw-semibold")
        .text("+");

    // Create zoom out button
    const zoomOutButton = svg.append("g")
        .attr("id", "zoomOutButton")
        .attr("class", "zoom-button zoom-out")
        .attr("transform", `translate(${mapMobileWidth - buttonSize}, ${mapMobileHeight + buttonSize + buttonMargin + buttonOutMargin + buttonPadding})`)
        .on("click", () => {
            console.log('Zoom out button id', zoomOutButton.attr("id"))
            handleButtonClick(svg, zoomOutButton.attr("id"))
        });

    zoomOutButton.append("rect")
        .attr("width", buttonSize)
        .attr("height", buttonSize)
        .attr("fill", "#f2f2f2")
        .attr("stroke", "white")
        .attr("stroke-width", 1)
        .attr("rx", buttonCornerRadius) // Add radius for rounded corners
        .attr("ry", buttonCornerRadius);

    zoomOutButton.append("text")
        .attr("x", `${buttonSize / 2}`)
        .attr("y", `${buttonSize - (buttonPadding / 2)}`)
        .attr("text-anchor", "middle")
        .attr("font-size", "4rem")
        .attr("fill", "#000")
        .attr("class", "fw-semibold")
        .text("-");
    //svg.call(zoom);
}

function handleButtonClick(svg, buttonId) {
    console.log(`Button ${buttonId} clicked`);

    let buttonZoom = d3.select(`#${buttonId}`);
    // Change button styling
    buttonZoom.select("rect").attr("fill", "#000");
    buttonZoom.select("text").attr("fill", "#fff");

    // Revert styling after 1 second
    setTimeout(() => {
        buttonZoom.select("rect").attr("fill", "#f2f2f2");
        buttonZoom.select("text").attr("fill", "#000");
    }, 350);

    // Add your button click handling logic here
    switch (buttonId) {
        case 'zoomInButton':
            // Logic for Zoom In
            svg.transition().call(zoom.scaleBy, 2); // Zoom in by a factor of 2
            break;
        case 'zoomOutButton':
            // Logic for Zoom Out
            svg.transition().call(zoom.scaleBy, 0.5); // Zoom out by a factor of 0.5
            break;
        default:
            console.log(`No handler for button ${buttonId}`);
    }
}

export function updateMapByYear(svg, geojsonData, year, cumulativeSummits, summitsByCountryMap) {
    console.log("Year in updateMapByYear", year);
    console.log("Passing cumulative summits in updateMapByYear", cumulativeSummits);
    clearCountryLabels(svg);
    const yearData = cumulativeSummits.get(year.year);
    console.log("Year data in updateMapByYear", yearData);
    console.log("Summits by country map in updateMapByYear", summitsByCountryMap);
    const cumulative = yearData.cumulative;
    console.log('Cumulative summits in updateMapByYear', yearData.cumulative);
    const newCountries = yearData.new;

    console.log('New countries', newCountries)
    // Color the countries
    svg.selectAll("path")
        .data(geojsonData.features)
        .join("path")
        .attr("d", path)
        .attr("fill", d => {
            const country = d.properties.name;
            //console.log(`Country: ${country}, New: ${newCountries.has(country)}`);
            if (newCountries.has(country)) {
                console.log(`Coloring ${country} as new country`);
                console.log('Color', mapStyle.clickedYearCountry)
                return `${mapStyle.clickedYearCountry}`; // Brown color for new countries
            }
            else {
                return `${mapStyle.defaultFill}`; // Default color for other countries
            }
        })
    // Ensure button text is not removed
    svg.selectAll(".button-text").raise();
    svg.call(zoom);
}

// Function to clear existing labels
function clearCountryLabels() {
    svg.selectAll(".country-label").remove();
    svg.selectAll(".country-counter").remove();
}

// Function to resize the map
function resizeMap(svg, geojsonData) {
    let width = document.getElementById('map-mobile').clientWidth;
    let height = document.getElementById('map-mobile').clientHeight;
    console.log('Main container height', heightMain, 'Resizing map to width:', width, 'height:', height);
    svg.attr("width", width).attr("height", height);

    // Redraw the map with the updated dimensions
    drawMap(svg, geojsonData);
}

export function updateMapByCountry(svg, geojsonData, selectedCountry) {
    console.log("Selected country in updateMapByCountry", selectedCountry);

    // Color the selected country
    svg.selectAll("path")
        .data(geojsonData.features)
        .join("path")
        .attr("d", path)
        .attr("fill", (d) => {
            const country = d.properties.name;
            return country === selectedCountry ? `${mapStyle.clickedYearCountry}` : `${mapStyle.defaultFill}`; // Red color for selected country, default color for others
        })
    // Ensure button text is not removed
    svg.selectAll(".button-text").raise();
}