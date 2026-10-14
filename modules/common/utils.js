export function displayName(country) {
  return country === "England" ? "United Kingdom" : country;
}
export function debounce(fn, wait = 150) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}