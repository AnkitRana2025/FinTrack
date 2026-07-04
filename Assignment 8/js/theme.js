// ======================================
// App theme
// ======================================

const APP_THEME_KEY = "appTheme";

document.addEventListener("DOMContentLoaded", initTheme);

function initTheme() {
    const savedTheme = getSavedTheme();

    applyTheme(savedTheme);
    bindThemeControls();
}

function getSavedTheme() {
    const user = typeof getCurrentUser === "function" ? getCurrentUser() : null;

    if (user && user.theme) {
        return user.theme;
    }

    return localStorage.getItem(APP_THEME_KEY) || "dark";
}

function bindThemeControls() {
    const themeBtn = document.getElementById("themeBtn");
    const themeMenu = document.getElementById("themeMenu");

    if (themeBtn) {
        themeBtn.addEventListener("click", toggleTheme);
    }

    if (themeMenu) {
        themeMenu.addEventListener("click", e => {
            e.preventDefault();
            toggleTheme();
        });
    }
}

function toggleTheme() {
    const nextTheme = document.body.classList.contains("light-theme")
        ? "dark"
        : "light";

    applyTheme(nextTheme);
    saveTheme(nextTheme);
}

function applyTheme(theme) {
    const isLight = theme === "light";
    const themeBtn = document.getElementById("themeBtn");
    const themeMenu = document.getElementById("themeMenu");

    document.body.classList.toggle("light-theme", isLight);

    if (themeBtn) {
        themeBtn.textContent = isLight ? "Dark" : "Light";
        themeBtn.title = isLight ? "Switch to dark theme" : "Switch to light theme";
    }

    if (themeMenu) {
        themeMenu.textContent = isLight ? "Dark Theme" : "Light Theme";
    }
}

function saveTheme(theme) {
    localStorage.setItem(APP_THEME_KEY, theme);

    if (typeof getCurrentUser !== "function") return;

    const user = getCurrentUser();
    if (!user) return;

    user.theme = theme;
    updateCurrentUser(user);
}
