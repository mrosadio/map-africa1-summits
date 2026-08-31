# The Shifting Geography of Africa+1 Summits
 
An interactive data visualization exploring the evolution of "Africa+1" diplomatic summits — bilateral and multilateral forums between African states and non-African partner countries from 1973 to 2024.
 
**Live demo:** https://mrosadio.github.io/map-africa1-summits/
 
## About
 
Africa+1 summits (also called Forums and International Conferences) bring together African presidents, ministers, or high-level officials with their foreign counterparts to discuss trade, security, and development cooperation. This visualization traces how the roster of hosting partner countries has shifted over five decades — from France's early post-independence dominance, through the rise of Asian partners in the 2000s, to today's more diversified landscape including Turkey, the Gulf states, the US, and Russia.
 
## Features
 
- **Scroll-driven timeline scrubber**: scroll over the map or timeline to move through years; the map fills in cumulatively as more countries begin hosting summits, with the current year's host highlighted
- **Click-to-jump**: click any dot on the timeline to animate directly to that year
- **Country exploration mode**: click any country on the map to see its full hosting history in a side panel, independent of the timeline position
- **Responsive layout**: adapted breakpoints for desktop and tablet (portrait and landscape), with the country panel switching between an in-flow column (landscape) and a bottom sheet (portrait)
- **Region-based color encoding**: consistent color language across the map and timeline, so the "who hosts whom" story is visible even without interaction

## Tech stack
 
- [D3.js](https://d3js.org/) (v7) - map projection (EqualEarth), timeline rendering, data joins
- Vanilla JavaScript (ES modules) - no framework
- [Bootstrap 5](https://getbootstrap.com/) - layout utilities and responsive grid
- Static GeoJSON (world boundaries) + JSON (summit dataset)

## Project structure
 
```
├── index.html
├── style.css
├── main.js
├── db/
│   └── summits-by-year.json       # summit dataset
└── modules/
    ├── common/
    │   ├── globals.js             # shared config, style constants, appData store
    │   ├── dataLoader.js          # fetches + merges geojson and summit data
    │   └── partnerColors.js       # country → region color mapping
    ├── desktop/
    │   ├── initDesktop.js         # desktop entry point
    │   ├── mapUtils.js            # map rendering, country click handling
    │   ├── timelineUtils.js       # timeline rendering, scrub interaction
    │   ├── summitUtils.js         # country/year detail panel rendering
    │   └── interactions.js        # wires map ↔ timeline cross-module behavior
    └── mobile/
        ├── initMobile.js
        ├── mapMobile.js
        ├── timelineUtilsMobile.js
        └── pickerMobile.js
```
 

## Known limitations / future improvements
 
- The mobile view (`modules/mobile/`) predates the desktop `appData` refactor and still passes data via function parameters rather than reading from the shared store. Functionally equivalent, but inconsistent with the desktop pattern — a candidate for a follow-up refactor.
- The color palette groups partner countries into seven broad categories (France, Asia, Turkey/Gulf, United States, Russia, Italy/UK, Other) rather than assigning every country a unique color — a deliberate simplicity trade-off for legend readability.

## Credits
 
Data collection: APRI Geopolitics and Geoeconomics Program team.
Visualization design and development: Micaela Rosadio.