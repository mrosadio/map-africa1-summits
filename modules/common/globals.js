// Layout breakpoint in px. Must match the media queries in style.css,
// which cannot read JS variables.
// Databases
import * as d3 from "d3";
const jsonPath = './db/summits-by-year.json';
const geojsonUrl = "./db/world.geojson";
export const appData = {
  geojsonData: null,
  summitData: null,
  summitsByCountryMap: null,
  countriesWithSummits: null,
  cumulativeSummits: null,
  chapters: null,
};
const chaptersUrl = "./db/chapters.json";
const mapStyle = {
    "onloadFill": "#ffdc94",
    "defaultFill": "#f2f2f2",
    "defaultBorder": "#cccccc",
    "defaultBorderWidth": 0.15,
    "borderHost": "#000000",
    "fillHost": "#ffdc94",
    "borderWidthHost": 1,
    "clickedYearCountry": "#fec03c",
    "fontSize": "6pt",
    "fontSizeNumber": 6,
    "fontWeight": "450",
    "textAnchor": "middle",
    "alignmentBaseline": "middle"
};

// Country flags
const flagSrc = [
    {
        country: "France",
        img: {
            "img-src": "fr.png"
        }
    },
    {
        country: "Japan",
        img: {
            "img-src": "jp.png"
        }
    },
    {
        country: "Indonesia",
        img: {
            "img-src": "id.png"
        }
    },
    {
        country: "Russia",
        img: {
            "img-src": "ru.png"
        }
    },
    {
        country: "South Korea",
        img: {
            "img-src": "kr.png"
        }
    },
    {
        country: "Italy",
        img: {
            "img-src": "it.png"
        }
    },
    {
        country: "Saudi Arabia",
        img: {
            "img-src": "sa.png"
        }
    },
    {
        country: "USA",
        img: {
            "img-src": "us.png"
        }
    },
    {
        country: "Turkey",
        img: {
            "img-src": "tr.png"
        }
    },
    {
        country: "India",
        img: {
            "img-src": "in.png"
        }
    },
    {
        country: "United Kingdom",
        img: {
            "img-src": "gb.png"
        }
    },
    {
        country: "China",
        img: {
            "img-src": "cn.png"
        }
    }

]

let svg = d3.select("#map")
    .append("svg")
    .attr("preserveAspectRatio", "xMidYMid meet");

export { jsonPath, geojsonUrl, svg, flagSrc, mapStyle, chaptersUrl }