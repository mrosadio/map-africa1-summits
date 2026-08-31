export const PARTNER_COLORS = {
  France: "#2F5C99",
  China: "#D97A22",
  Japan: "#D97A22",
  "South Korea": "#D97A22",
  India: "#D97A22",
  Indonesia: "#D97A22",
  Turkey: "#3F7A4D",
  "Saudi Arabia": "#3F7A4D",
  "United Arab Emirates": "#3F7A4D",
  "USA": "#A64545",
  Russia: "#1D6E7D",
  England: "#7452A0",
  "United Kingdom": "#7452A0",
  Italy: "#7452A0",
};
export const DEFAULT_PARTNER_COLOR = "#8C8272";

export function getColorForCountry(country) {
  return PARTNER_COLORS[country] || DEFAULT_PARTNER_COLOR;
}