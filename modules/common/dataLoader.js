export async function loadAndMergeData(geojsonUrl, jsonFilePath) {
    try {
        const geojsonResponse = await fetch(geojsonUrl);
        const geojsonData = await geojsonResponse.json();

        const jsonResponse = await fetch(jsonFilePath);
        const jsonData = await jsonResponse.json();

        const summitMap = new Map();
        const countriesWithSummits = new Set();
        const summitCounter = new Map();
        const summitsByCountryMap = new Map();
        const cumulative = new Map();
        const cumulativeSummits = new Map();

        jsonData.forEach(entry => {
            const { year, summits } = entry;
            if (!summitMap[year]) {
                summitMap[year] = [];
            }
            summits.forEach(summit => {
                summitMap[year].push(summit.country);
                countriesWithSummits.add(summit.country);
            });
        });

        jsonData.forEach(yearData => {
            yearData.summits.forEach(summit => {
                countriesWithSummits.add(summit.country);
                //console.log('countries with summits', countriesWithSummits)
            });
        });

        jsonData.forEach(yearData => {
            yearData.summits.forEach(summit => {
                const country = summit.country;
                const summitDetails = {
                    date: summit.date,
                    place: summit.place,
                    summitNo: summit.summitNo,
                    title: summit.title
                };
                // If the country is already in the map, append the summit to its list
                if (!summitsByCountryMap.has(country)) {
                    summitsByCountryMap.set(country, [summitDetails]);
                } else {
                    summitsByCountryMap.get(country).push(summitDetails);
                }
            });
        });

        countriesWithSummits.forEach(country => {
            //console.log('Country in countrieswithsummits', countriesWithSummits)
            summitCounter[country] = (summitCounter[country] || 0) + 1;
        });

        // Remove antarctica from geojson

        geojsonData.features = geojsonData.features.filter(feature => feature.properties.name !== "Antarctica");
        geojsonData.features.forEach(feature => {
            const countryName = feature.properties.name;
            if (countryName === "Antarctica") {
                return; // Skip Antarctica
            }
            if (summitMap.has(countryName)) {
                feature.properties.summit = summitMap.get(countryName);
            }
        });

        jsonData.forEach(entry => {
            const year = entry.year;
            const newCountries = new Map();
    
            entry.summits.forEach(summit => {
                const country = summit.country;
    
                // Update new countries map
                if (!newCountries.has(country)) {
                    newCountries.set(country, 1);
                } else {
                    newCountries.set(country, newCountries.get(country) + 1);
                }
    
                // Update cumulative map
                if (!cumulative.has(country)) {
                    cumulative.set(country, 1);
                } else {
                    cumulative.set(country, cumulative.get(country) + 1);
                }
            });
    
            // Store the cumulative and new countries data for the current year
            cumulativeSummits.set(year, {
                cumulative: new Map(cumulative),
                new: new Map(newCountries)
            });
        });

        return {
            geojsonData,
            jsonData,
            summitMap,
            countriesWithSummits,
            summitsByCountryMap,
            cumulativeSummits
        };
    } catch (error) {
        console.error("Error loading or merging data:", error);
        return null;
    }
}

