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

/* =========================
   PHOTOGRAPHY LIGHTBOX
========================= */

// Find all gallery photographs

const gallery = document.querySelector(".gallery");


const photos = [
  "IMG_1234.webp",
  "IMG_1494.webp",
  "IMG_1575.webp",
  "IMG_1576.webp",
  "IMG_1663.webp",
  "IMG_1711.webp",
  "IMG_1713.webp",
  "IMG_1853.webp",
  "IMG_1927.webp",
  "IMG_1992.webp",
  "IMG_2127.webp",
  "IMG_2150.webp",
  "IMG_2155.webp",
  "IMG_2172.webp",
  "IMG_2194.webp",
  "IMG_2234.webp",
  "IMG_2240.webp",
  "IMG_2313.webp",
  "IMG_2353.webp",
  "IMG_2652.webp",
  "IMG_3056.webp",
  "IMG_3096.webp",
  "IMG_3283.webp",
  "IMG_3685.webp",
  "IMG_8509.webp",
  "IMG_8537.webp",
  "IMG_8568.webp",
  "IMG_8595.webp",
  "IMG_8643.webp",
  "IMG_9286.webp",
  "IMG_9298.webp",
  "IMG_9868.webp"
];


// Create the gallery from our photo list
photos.forEach((filename, index) => {
  const figure = document.createElement("figure");
  figure.className = "gallery-item";

  const image = document.createElement("img");
  image.src = `images/${filename}`;
  image.alt = `MARA photography — photograph ${index + 1}`;
  image.loading = "lazy";

  figure.appendChild(image);
  gallery.appendChild(figure);
});

const galleryImages = document.querySelectorAll(".gallery-item img");

// Find the lightbox elements
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.querySelector(".lightbox-image");
const closeButton = document.querySelector(".lightbox-close");
const prevButton = document.querySelector(".lightbox-prev");
const nextButton = document.querySelector(".lightbox-next");

// Keep track of the photograph currently displayed
let currentImageIndex = 0;
let previousFocus = null;

// Open the viewer
function openLightbox(index) {
    currentImageIndex = index;
    previousFocus = document.activeElement;

    showImage();
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";

    closeButton.focus();
}

// Display the selected photograph
function showImage() {
    const image = galleryImages[currentImageIndex];

    lightboxImage.src = image.src;
    lightboxImage.alt = image.alt;
}

// Close the viewer
function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = "";

    if (previousFocus) {
        previousFocus.focus();
    }
}

// Move between photographs
function changeImage(direction) {
    currentImageIndex += direction;

    if (currentImageIndex >= galleryImages.length) {
        currentImageIndex = 0;
    }

    if (currentImageIndex < 0) {
        currentImageIndex = galleryImages.length - 1;
    }

    showImage();
}

// Open when a photograph is clicked
galleryImages.forEach((image, index) => {
    image.addEventListener("click", () => {
        openLightbox(index);
    });
});

// Navigation buttons
closeButton.addEventListener("click", closeLightbox);

prevButton.addEventListener("click", () => {
    changeImage(-1);
});

nextButton.addEventListener("click", () => {
    changeImage(1);
});

// Keyboard navigation
document.addEventListener("keydown", (event) => {
    if (lightbox.hidden) return;

    if (event.key === "Escape") {
        closeLightbox();
    }

    if (event.key === "ArrowRight") {
        changeImage(1);
    }

    if (event.key === "ArrowLeft") {
        changeImage(-1);
    }

    // Keep keyboard focus inside the viewer
    if (event.key === "Tab") {
        const buttons = [closeButton, prevButton, nextButton];
        const first = buttons[0];
        const last = buttons[buttons.length - 1];

        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }
});

// Ambient audio player

const audio = document.getElementById("background-audio");
const soundToggle = document.getElementById("sound-toggle");

const soundIcon = soundToggle.querySelector(".sound-icon");
const soundLabel = soundToggle.querySelector(".sound-label");

// Start with audio off
audio.volume = 0.35;

soundToggle.addEventListener("click", async () => {

    if (audio.paused) {

        try {
            await audio.play();

            soundIcon.textContent = "Ⅱ";
            soundLabel.textContent = "Audio On";
            soundToggle.setAttribute("aria-pressed", "true");
            soundToggle.setAttribute("aria-label", "Pause ambient audio");

        } catch (error) {
            console.error("Audio playback failed:", error);
        }

    } else {

        audio.pause();

        soundIcon.textContent = "▷";
        soundLabel.textContent = "Audio Off";
        soundToggle.setAttribute("aria-pressed", "false");
        soundToggle.setAttribute("aria-label", "Play ambient audio");

    }

});
// Contact form overlay
const contactTrigger = document.getElementById("contact-trigger");
const contactModal = document.getElementById("contact-modal");
const contactClose = document.querySelector(".contact-close");

contactTrigger.addEventListener("click", () => {
    contactModal.hidden = false;
});

contactClose.addEventListener("click", () => {
    contactModal.hidden = true;
});

// Close when clicking outside the panel
contactModal.addEventListener("click", (event) => {
    if (event.target === contactModal) {
        contactModal.hidden = true;
    }
});

// Contact form — backend not connected yet
const contactForm = document.getElementById("contact-form");
const contactStatus = document.querySelector(".contact-status");
const honeypot = document.getElementById("contact-website");
contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    // Detect basic automated spam
    if (honeypot.value.trim() !== "") {
        console.warn("Honeypot triggered: submission blocked.");
        return;
    }

    // AWS backend is not connected yet
    contactStatus.textContent =
        "Contact form is currently being configured.";
});