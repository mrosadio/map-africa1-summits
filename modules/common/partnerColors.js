export const CATEGORY_COLORS = {
  france: "#1F3F7A",
  asia:   "#EE9A2E",
  mideast:"#2F7D4A",
  us:     "#9B3A3A",
  russia: "#3AA6B8",
  europe: "#B49AE0", // Italy / UK
  other:  "#8C8272",
};

const COUNTRY_CATEGORY = {
  France: "france",
  China: "asia", Japan: "asia", "South Korea": "asia", India: "asia", Indonesia: "asia",
  Turkey: "mideast", "Saudi Arabia": "mideast", "United Arab Emirates": "mideast",
  USA: "us",
  Russia: "russia",
  England: "europe", "United Kingdom": "europe", Italy: "europe",
};

export function getColorForCountry(country) {
  return CATEGORY_COLORS[COUNTRY_CATEGORY[country]] ?? CATEGORY_COLORS.other;
}

// Expose the palette to CSS as --color-<category>; call once at startup.
export function applyCategoryColors() {
  for (const [key, hex] of Object.entries(CATEGORY_COLORS)) {
    document.documentElement.style.setProperty(`--color-${key}`, hex);
  }
}