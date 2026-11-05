// Find the theme button in the HTML
const themeToggle = document.getElementById("theme-toggle");

// Retrieve the visitor's previously saved preference
const savedTheme = localStorage.getItem("theme");

// Use the saved preference, or default to light mode
const initialTheme = savedTheme === "dark" ? "dark" : "light";

document.documentElement.setAttribute("data-theme", initialTheme);

// Update the button to reflect the current theme
function updateThemeButton(theme) {
    if (theme === "dark") {
        themeToggle.textContent = "☀";
        themeToggle.setAttribute("aria-label", "Switch to light mode");
    } else {
        themeToggle.textContent = "☾";
        themeToggle.setAttribute("aria-label", "Switch to dark mode");
    }
}

updateThemeButton(initialTheme);

// Listen for clicks on the button
themeToggle.addEventListener("click", function () {

    const currentTheme =
        document.documentElement.getAttribute("data-theme");

    const newTheme = currentTheme === "dark" ? "light" : "dark";

    document.documentElement.setAttribute("data-theme", newTheme);

    // Save the preference for future visits
    localStorage.setItem("theme", newTheme);

    updateThemeButton(newTheme);
});