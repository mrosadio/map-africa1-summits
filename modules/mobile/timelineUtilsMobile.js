export function initMobileTimelineSVG() {
    const svg = d3
        .select("#mobile-timeline")
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%");
    return svg;
}

//document.addEventListener('DOMContentLoaded', function () {
    // Initialize Mobiscroll year picker
    // mobiscroll.datepicker('#inline-picker', {
    //     //theme: 'ios', // Choose a theme
    //     //display: 'bottom', // Display at the bottom
    //     controls: ['date'],
    //     touchUi: true,
    //     // data: [
    //     //     { value: 1973, text: '1973' },
    //     //     { value: 1974, text: '1974' },
    //     //     { value: 1975, text: '1975' },
    //     //     // Add more years as needed
    //     // ],
    //     // onSet: function (event, inst) {
    //     //     const selectedYear = event.value;
    //     //     console.log('Selected year:', selectedYear);
    //     //     // Update the visualization based on the selected year
    //     //     const yearData = summitData.find((summit) => summit.year === selectedYear);
    //     //     updateMapByYear(geojsonData, yearData, cumulativeSummits, summitsByCountryMap, currentZoomScale);
    //     // }
    // });
//});



export function mobileTimeline(svg, summitData, currentYearIndex) {
    const circleSpacing = 0;
    let displayedYears = summitData.slice(currentYearIndex, currentYearIndex + 1);
    const yearTextGroup = svg
        .selectAll("text.year")
        .data(displayedYears, (d) => d.year);
    yearTextGroup
        .enter()
        .append("text")
        .attr("class", "year")
        .attr("x", (d, i) => circleSpacing * (i + 1))
        .attr("y", 80)
        .attr("text-anchor", "middle")
        .style("fill", (d, i) => (i === 0 ? "" : "gray"))
        .text((d) => d.year)
        .style("cursor", "pointer")
        .on("click", function (event, d) {
            const clickedYear = d.year; // Get the year that was clicked
            const yearData = summitData.find((summit) => summit.year === clickedYear); // Get data for clicked year
            const hostCountries =
                yearData.summits.length > 0
                    ? yearData.summits.map((summit) => summit.country)
                    : [];
            borderClickedCountry(svg, hostCountries);
        });
    yearTextGroup
        .attr("x", (d, i) => circleSpacing * (i + 1))
        .attr("y", 80)
        .attr("text-anchor", "middle")
        .style("fill", (d, i) => (i === 0 ? "black" : "gray"))
        .text((d) => d.year);
    yearTextGroup.exit().remove();

    // Create or update country labels (below the year)
    const countryTextGroup = svg
        .selectAll("text.country")
        .data(displayedYears, (d) => d.year);
    countryTextGroup
        .enter()
        .append("text")
        .attr("class", "country")
        .attr("x", (d, i) => circleSpacing * (i + 1))
        .attr("y", 100) // Position slightly below the year text
        .attr("text-anchor", "middle")
        .style("fill", "gray")
        .each(function (d, i) {
            const textElement = d3.select(this);
            if (d.summits.length > 0) {
                // For each country, append a new tspan to position it vertically
                d.summits.forEach((summit, index) => {
                    textElement
                        .append("tspan")
                        .attr("x", circleSpacing * (i + 1)) // Keep x the same for alignment
                        .attr("dy", index === 0 ? 0 : "1.2em") // Add vertical space for each tspan
                        .text(summit.country);
                });
            }
        })
        .style("cursor", "pointer") // Add cursor pointer style
        .on("click", function (event, d) {
            const clickedYear = d.year; // Get the year that was clicked
            const yearData = summitData.find((summit) => summit.year === clickedYear); // Get data for clicked year
            const hostCountries =
                yearData.summits.length > 0
                    ? yearData.summits.map((summit) => summit.country)
                    : [];
            borderClickedCountry(svg, hostCountries);
        });
    countryTextGroup
        .attr("x", (d, i) => circleSpacing * (i + 1))
        .attr("y", 100)
        .attr("text-anchor", "middle")
        .style("fill", (d, i) => (i === 0 ? "black" : "gray"))
        .text((d) => (d.summits.length > 0 ? d.summits[0].country : "")); // Update host country
    countryTextGroup.exit().remove();
}


