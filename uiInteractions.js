export function showParagraph() {
    document.getElementById('diplomatic-ties-paragraph').classList.remove('d-none');
    document.getElementById('read-more-link').classList.add('d-none');
    document.getElementById('show-less-link').classList.remove('d-none');

}

export function showLess() {
    document.getElementById('diplomatic-ties-paragraph').classList.add('d-none');
    document.getElementById('read-more-link').classList.remove('d-none');
    document.getElementById('show-less-link').classList.add('d-none');
}