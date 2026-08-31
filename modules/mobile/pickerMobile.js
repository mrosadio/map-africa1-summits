const yearSummit = [
  { text: "1973", value: 1, disabled: false },
  { text: "1975", value: 2, disabled: false },
  { text: "1976", value: 3, disabled: false },
  { text: "1977", value: 4, disabled: false },
  { text: "1978", value: 5, disabled: false },
  { text: "1979", value: 6, disabled: false },
  { text: "1980", value: 7, disabled: false },
  { text: "1981", value: 8, disabled: false },
  { text: "1982", value: 9, disabled: false },
  { text: "1983", value: 10, disabled: false },
  { text: "1984", value: 11, disabled: false },
  { text: "1985", value: 12, disabled: false },
  { text: "1986", value: 13, disabled: false },
  { text: "1987", value: 14, disabled: false },
  { text: "1988", value: 15, disabled: false },
  { text: "1990", value: 16, disabled: false },
  { text: "1992", value: 17, disabled: false },
  { text: "1993", value: 18, disabled: false },
  { text: "1994", value: 19, disabled: false },
  { text: "1996", value: 20, disabled: false },
  { text: "1998", value: 21, disabled: false },
  { text: "2000", value: 22, disabled: false },
  { text: "2001", value: 23, disabled: false },
  { text: "2003", value: 24, disabled: false },
  { text: "2005", value: 25, disabled: false },
  { text: "2006", value: 26, disabled: false },
  { text: "2007", value: 27, disabled: false },
  { text: "2008", value: 28, disabled: false },
  { text: "2009", value: 29, disabled: false },
  { text: "2010", value: 30, disabled: false },
  { text: "2011", value: 31, disabled: false },
  { text: "2012", value: 32, disabled: false },
  { text: "2013", value: 33, disabled: false },
  { text: "2014", value: 34, disabled: false },
  { text: "2015", value: 35, disabled: false },
  { text: "2016", value: 36, disabled: false },
  { text: "2017", value: 37, disabled: false },
  { text: "2018", value: 38, disabled: false },
  { text: "2019", value: 39, disabled: false },
  { text: "2020", value: 40, disabled: false },
  { text: "2021", value: 41, disabled: false },
  { text: "2022", value: 42, disabled: false },
  { text: "2023", value: 43, disabled: false },
  { text: "2024", value: 44, disabled: false },
];

const countrySummit = [
  { text: "China", value: 3, disabled: false },
  { text: "France", value: 1, disabled: false },
  { text: "India", value: 5, disabled: false },
  { text: "Indonesia", value: 7, disabled: false },
  { text: "Italy", value: 12, disabled: false },
  { text: "Japan", value: 2, disabled: false },
  { text: "Russia", value: 8, disabled: false },
  { text: "Saudia Arabia", value: 10, disabled: false },
  { text: "South Korea", value: 11, disabled: false },
  { text: "Turkey", value: 4, disabled: false },
  { text: "United Kingdom", value: 9, disabled: false },
  { text: "USA", value: 6, disabled: false },  
];

let selectedIndex = 0;
let pickerData;
let wheelList = document.getElementById("wheelList");

const picker = document.getElementById("picker");
const selectedText = document.getElementById("selectedText");
const selectedAfrican = document.getElementById("africanCountry");
const blockNameTemp = document.getElementById("blockNameTemp");
const blockNameNowTemp = document.getElementById("blockNameNowTemp");
const inputPicker = document.getElementById("input-picker");

export function showPickerYearSummit() {
  picker.style.display = "block";
  pickerData = yearSummit;
  createWheel();
}
export function showPickerCountrySummit() {
  picker.style.display = "block";
  pickerData = countrySummit;
  createWheel();
}

function cancelPicker(event) {
  if (event.target !== picker) return;
  picker.style.display = "none";
}
export function cancel() {
  picker.style.display = "none";
}

export function confirmPicker() {
  picker.style.display = "none";
  selectedText.innerText = pickerData[selectedIndex].text;
  selectedAfrican.innerText = pickerData[selectedIndex].text;
  blockNameTemp.innerText = blockNameNowTemp.textContent.trim();
  console.log('Input selected', selectedText.innerText);
  // Update the input-picker field
  inputPicker.value = selectedText.innerText;
  return selectedText.innerText;
}
export function getSelectedText() {
  return selectedText.innerText;
}

function createWheel() {
  wheelList.innerHTML = ""; // Clear previous items
  pickerData.forEach((item, index) => {
    const li = document.createElement("li");
    li.textContent = item.text;
    li.className = item.disabled
      ? "wheel-item wheel-disabled-item"
      : "wheel-item";
    if (index === selectedIndex) li.classList.add("selected-item"); // Highlight selected
    li.onclick = () => selectItem(index);
    wheelList.appendChild(li);
  });

  // Scroll to the selected item
  wheelList.scrollTop = selectedIndex * 36;
}

function selectItem(index) {
  // Remove styles from the previously selected item
  const previousSelected = wheelList.querySelector(".selected-item");
  if (previousSelected) {
    previousSelected.classList.remove("selected-item");
  }

  console.log('Index in selectItem', index);
  // Apply styles to the new selected item
  selectedIndex = index;
  const newSelected = wheelList.children[selectedIndex];
  newSelected.classList.add("selected-item");

  // Update displayed text
  selectedText.innerText = pickerData[selectedIndex].text;
  wheelList.scrollTop = selectedIndex * 36;

  // Directly confirm the selection
  //confirmPicker();
}

// Scroll functionality remains the same
let isDragging = false;
let startMouseY = 0;

wheelList.addEventListener("mousedown", (e) => {
  isDragging = true;
  startMouseY = e.pageY;
});

wheelList.addEventListener("mousemove", (e) => {
  if (!isDragging) return;
  let moveDistance = startMouseY - e.pageY;
  wheelList.scrollTop += moveDistance;
  startMouseY = e.pageY;
});

wheelList.addEventListener("mouseup", () => {
  isDragging = false;
});

wheelList.addEventListener("mouseleave", () => {
  isDragging = false;
});

let isTouching = false;
let startTouchY = 0;

wheelList.addEventListener("touchstart", (e) => {
  isTouching = true;
  startTouchY = e.touches[0].pageY;
});

wheelList.addEventListener("touchmove", (e) => {
  if (!isTouching) return;

  const moveDistance = startTouchY - e.touches[0].pageY;
  wheelList.scrollTop += moveDistance;
  startTouchY = e.touches[0].pageY;

  if (wheelList.scrollHeight > wheelList.clientHeight) {
    e.preventDefault();
  }
});

wheelList.addEventListener("touchend", () => {
  isTouching = false;
});

