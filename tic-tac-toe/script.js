const buttons = Array.from(document.querySelectorAll('#btns button'));

buttons.forEach((button) => {
    let callback = createButtonCallback(button.id);

    button.addEventListener('click', callback)
});

function createButtonCallback(mode) {
    return () => {
        window.location.assign(`Game/?mode=${mode}`);
    }
}