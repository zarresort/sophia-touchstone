/* ==========================================================================
   North Star Bakery - Main Script
   Touchstone 4: Interactivity, Validation & Client-Side Storage
   ========================================================================== */

// --- 1. Data Structures (Arrays & Objects) ---

// Array of featured bakery items used across the site
const featuredProducts = [
    { id: "sourdough", name: "Signature Sourdough Loaf", category: "bread", price: "$6.50" },
    { id: "croissant", name: "Artisan Butter Croissant", category: "pastry", price: "$3.75" },
    { id: "berry-tart", name: "Seasonal Berry Tart", category: "pastry", price: "$4.50" },
    { id: "multigrain", name: "Rustic Multi-Grain Loaf", category: "bread", price: "$7.00" }
];

// Configuration object defining validation criteria
const formRules = {
    minNameLength: 2,
    emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    minMessageLength: 10
};

// Array of available bakery categories
const bakeryCategories = ["all", "bread", "pastry"];


// --- 2. Interactive Feature: Favorites Tracker ---

// Retrieve saved favorites array from localStorage
function getSavedFavorites() {
    const saved = localStorage.getItem("bakery_favorites");
    return saved ? JSON.parse(saved) : [];
}

// Save favorites array to localStorage
function saveFavorites(favorites) {
    localStorage.setItem("bakery_favorites", JSON.stringify(favorites));
}

// Update the visual status of favorite buttons and counter
function updateFavoritesUI() {
    const favorites = getSavedFavorites();

    // Update counter display if element exists
    const counterDisplay = document.getElementById("favorites-count");
    if (counterDisplay) {
        counterDisplay.textContent = favorites.length;
    }

    // Synchronize favorite buttons state
    const favoriteButtons = document.querySelectorAll(".fav-btn");
    favoriteButtons.forEach(button => {
        const itemId = button.getAttribute("data-id");
        if (favorites.includes(itemId)) {
            button.classList.add("favorited");
            button.textContent = "★ Saved to Favorites";
            button.setAttribute("aria-pressed", "true");
        } else {
            button.classList.remove("favorited");
            button.textContent = "☆ Add to Favorites";
            button.setAttribute("aria-pressed", "false");
        }
    });

    // Update favorites summary list on the page if a container exists
    const summaryList = document.getElementById("favorites-summary");
    if (summaryList) {
        if (favorites.length === 0) {
            summaryList.innerHTML = "<p>No favorites saved yet. Click the star on any product to save it!</p>";
        } else {
            const listItems = favorites.map(id => {
                const product = featuredProducts.find(item => item.id === id);
                const title = product ? product.name : id;
                return `<li>${title}</li>`;
            }).join("");
            summaryList.innerHTML = `<ul>${listItems}</ul>`;
        }
    }
}

// Toggle an item in or out of favorites
function toggleFavorite(itemId) {
    let favorites = getSavedFavorites();

    if (favorites.includes(itemId)) {
        favorites = favorites.filter(id => id !== itemId);
    } else {
        favorites.push(itemId);
    }

    saveFavorites(favorites);
    updateFavoritesUI();
}

// Attach event listeners to favorite buttons
function initFavorites() {
    const buttons = document.querySelectorAll(".fav-btn");
    buttons.forEach(button => {
        button.addEventListener("click", () => {
            const itemId = button.getAttribute("data-id");
            if (itemId) {
                toggleFavorite(itemId);
            }
        });
    });

    // Run once on load to restore saved state
    updateFavoritesUI();
}


// --- 3. Form Validation & Persistence (Contact Page) ---

// Show an inline error message beneath the input field
function displayError(inputElement, message) {
    clearError(inputElement);

    inputElement.classList.add("field-error");

    const errorSpan = document.createElement("span");
    errorSpan.className = "error-message";
    errorSpan.style.color = "#b32400";
    errorSpan.style.fontSize = "0.85rem";
    errorSpan.style.display = "block";
    errorSpan.style.marginTop = "4px";
    errorSpan.textContent = message;

    inputElement.parentNode.insertBefore(errorSpan, inputElement.nextSibling);
}

// Remove an existing error message
function clearError(inputElement) {
    inputElement.classList.remove("field-error");
    const existing = inputElement.parentNode.querySelector(".error-message");
    if (existing) {
        existing.remove();
    }
}

// Pre-fill form fields using previously stored contact info
function loadSavedContactInfo(nameInput, emailInput) {
    const savedName = localStorage.getItem("bakery_user_name");
    const savedEmail = localStorage.getItem("bakery_user_email");

    if (savedName && nameInput) {
        nameInput.value = savedName;
    }
    if (savedEmail && emailInput) {
        emailInput.value = savedEmail;
    }
}

// Setup validation and submission handling
function initContactValidation() {
    const form = document.querySelector("form");
    if (!form) return;

    const nameInput = document.getElementById("name") || form.querySelector('input[type="text"]');
    const emailInput = document.getElementById("email") || form.querySelector('input[type="email"]');
    const messageInput = document.getElementById("message") || form.querySelector("textarea");

    // Pre-fill user data from previous sessions if available
    loadSavedContactInfo(nameInput, emailInput);

    // Clear inline errors as soon as the user starts typing
    [nameInput, emailInput, messageInput].forEach(field => {
        if (field) {
            field.addEventListener("input", () => clearError(field));
        }
    });

    form.addEventListener("submit", (event) => {
        let isValid = true;

        // Check 1: Required Name & Minimum Length
        if (nameInput) {
            const nameValue = nameInput.value.trim();
            if (nameValue === "") {
                displayError(nameInput, "Please enter your name.");
                isValid = false;
            } else if (nameValue.length < formRules.minNameLength) {
                displayError(nameInput, `Name must be at least ${formRules.minNameLength} characters.`);
                isValid = false;
            }
        }

        // Check 2: Email Format Validation
        if (emailInput) {
            const emailValue = emailInput.value.trim();
            if (emailValue === "") {
                displayError(emailInput, "Please enter your email address.");
                isValid = false;
            } else if (!formRules.emailRegex.test(emailValue)) {
                displayError(emailInput, "Please enter a valid email address (e.g. name@example.com).");
                isValid = false;
            }
        }

        // Check 3: Message Content Check
        if (messageInput) {
            const messageValue = messageInput.value.trim();
            if (messageValue === "") {
                displayError(messageInput, "Please enter your message or custom order inquiry.");
                isValid = false;
            } else if (messageValue.length < formRules.minMessageLength) {
                displayError(messageInput, `Message must be at least ${formRules.minMessageLength} characters.`);
                isValid = false;
            }
        }

        // Prevent browser from reloading/submitting if invalid
        if (!isValid) {
            event.preventDefault();
        } else {
            // Save user details to localStorage for future visits
            if (nameInput) localStorage.setItem("bakery_user_name", nameInput.value.trim());
            if (emailInput) localStorage.setItem("bakery_user_email", emailInput.value.trim());
        }
    });
}


// --- 4. Page Initialization ---

document.addEventListener("DOMContentLoaded", () => {
    initFavorites();
    initContactValidation();
});