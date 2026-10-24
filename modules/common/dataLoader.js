const CHAPTER_TYPES = new Set(["data", "context"]);

export async function loadChapters(chaptersUrl, summitData) {
  try {
    const response = await fetch(chaptersUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const story = await response.json();

    if (!story.intro || !Array.isArray(story.chapters)) {
      throw new Error("chapters.json needs an 'intro' object and a 'chapters' array");
    }

    const years = new Set(summitData.map((d) => d.year));
    const ids = new Set();

    story.chapters.forEach((chapter) => {
      if (!CHAPTER_TYPES.has(chapter.type)) {
        throw new Error(`Chapter "${chapter.id}": unknown type "${chapter.type}"`);
      }
      if (ids.has(chapter.id)) {
        throw new Error(`Duplicate chapter id "${chapter.id}"`);
      }
      ids.add(chapter.id);
      if (!years.has(chapter.year)) {
        throw new Error(`Chapter "${chapter.id}": year ${chapter.year} is not in the summit data`);
      }
      if (chapter.link?.href.startsWith("REPLACE")) {
        console.warn(`Chapter "${chapter.id}": link still has its placeholder URL`);
      }
    });
    return story;
  } catch (error) {
    console.error("Error loading chapters:", error);
    return null;
  }
}

export async function loadAndMergeData(geojsonUrl, jsonFilePath) {
    try {
        const geojsonResponse = await fetch(geojsonUrl);
        const geojsonData = await geojsonResponse.json();

        const jsonResponse = await fetch(jsonFilePath);
        const jsonData = await jsonResponse.json();

        const countriesWithSummits = new Set();
        const summitsByCountryMap = new Map();
        const cumulative = new Map();
        const cumulativeSummits = new Map();

        jsonData.forEach(yearData => {
            yearData.summits.forEach(summit => {
                countriesWithSummits.add(summit.country);
            });
        });

        jsonData.forEach(yearData => {
            yearData.summits.forEach(summit => {
                const country = summit.country;
                const summitDetails = {
                    year: yearData.year,
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

        // Remove antarctica from geojson
        geojsonData.features = geojsonData.features.filter(feature => feature.properties.name !== "Antarctica");
        
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
            countriesWithSummits,
            summitsByCountryMap,
            cumulativeSummits
        };
    } catch (error) {
        console.error("Error loading or merging data:", error);
        return null;
    }
}

