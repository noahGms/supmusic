function toggleDarkMode() {
    halfmoon.toggleDarkMode();
    updateToggleDarkModeSwitch();
}

function updateToggleDarkModeSwitch() {
    if (halfmoon.readCookie("halfmoon_preferredMode")) {
        if (halfmoon.readCookie("halfmoon_preferredMode") === "light-mode") {
            $('#toggleDarkModeBtn').html(`<i class="fas fa-sun"></i>`);
        }
        else if (halfmoon.readCookie("halfmoon_preferredMode") === "dark-mode") {
            $('#toggleDarkModeBtn').html(`<i class="fas fa-moon"></i>`);
        }
    }
}
updateToggleDarkModeSwitch();