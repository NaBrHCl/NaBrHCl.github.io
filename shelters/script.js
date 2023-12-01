const SCROLL_BEHAVIOR = 'smooth';

initializeContentTable();
initializeCitations();

function initializeContentTable() {
    let paragraphElements = Array.from(document.querySelectorAll('main>div'));

    let titleContents = paragraphElements.map(p => p.firstElementChild.innerText);

    let contentTableElement = document.querySelector('#contents div');

    for (let i = 0; i < titleContents.length; i++) {
        let link = document.createElement('a');

        link.innerText = titleContents[i];
        link.onclick = () => {
            paragraphElements[i].firstElementChild.scrollIntoView({ behavior: SCROLL_BEHAVIOR, block: 'center' });
        };

        contentTableElement.appendChild(link);
    }
}

function initializeCitations() {
    let citationElements = Array.from(document.querySelectorAll('#citations div'));

    let citationIndexElements = Array.from(document.getElementsByClassName('citation'));

    for (let i = 0; i < citationIndexElements.length; i++) {

        citationIndexElements[i].onclick = () => {
            citationElements[i].scrollIntoView({ behavior: SCROLL_BEHAVIOR, block: 'center' });
            citationElements[i].style.transitionDuration = '0s';
            citationElements[i].style.backgroundColor = 'lightblue';

            window.onscrollend = () => {
                setTimeout(function () {
                    citationElements[i].style.transitionDuration = '1s';
                    citationElements[i].style.backgroundColor = 'transparent';
                }, 500);

                window.onscrollend = () => {};
            }
        }
    }
}