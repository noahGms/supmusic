function toggleDarkMode() {
    halfmoon.toggleDarkMode();
    updateToggleDarkModeSwitch();
}

function updateToggleDarkModeSwitch() {
    if (halfmoon.readCookie("halfmoon_preferredMode")) {
        if (halfmoon.readCookie("halfmoon_preferredMode") === "light-mode") {
            $('#toggleDarkModeInput').prop("checked", false);
            $('#toggleDarkModeLabel').html(`<i class="fas fa-sun"></i>`);
        }
        else if (halfmoon.readCookie("halfmoon_preferredMode") === "dark-mode") {
            $('#toggleDarkModeInput').prop("checked", true);
            $('#toggleDarkModeLabel').html(`<i class="fas fa-moon"></i>`);
        }
    }
}
updateToggleDarkModeSwitch();