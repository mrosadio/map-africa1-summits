import { displayName } from "../common/utils.js";

const numeral = () => document.getElementById("year-numeral");
const counter = () => document.getElementById("cumulative-counter");

// Time mode: big year + "By 2008: 5 countries hosting"
export function showYear(year, hostCount) {
  if (numeral()) numeral().textContent = year;
  if (counter()) counter().textContent = `By ${year}: ${hostCount} ${hostCount === 1 ? "country" : "countries"} hosting`;
}

// Country mode: big count + "summits hosted by Japan"
export function showCountry(country, summitCount) {
  if (numeral()) numeral().textContent = summitCount;
  if (counter()) counter().textContent = `${summitCount === 1 ? "summit" : "summits"} hosted by ${displayName(country)}`;
}