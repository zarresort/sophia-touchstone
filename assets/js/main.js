/* ==========================================================================
   North Star Bakery - Main Script
   Touchstone 4: Interactivity, Validation & Client-Side Storage
   ========================================================================== */

// --- 1. Data Structures (Arrays & Objects) ---

const featuredProducts = [
    { id: "cookies", name: "Cookies", category: "pastry", price: "$18.00" },
    { id: "white-bread", name: "White Bread Loaf", category: "bread", price: "$21.00" },
    { id: "pastries", name: "Pastries", category: "pastry", price: "$15.00" },
    { id: "sourdough", name: "Sourdough Bread", category: "bread", price: "$16.00" },
    { id: "artisan-bread", name: "Scored Artisan Bread", category: "bread", price: "$25.00" },
    { id: "weekly-special", name: "Signature Weekly Item", category: "special", price: "Inquire" }
];

const formRules = {
    minNameLength: 2,
    emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
    minDetailsLength: 10
};

const bakeryCategories = ["all", "bread", "pastry", "special"];


// --- 2. Interactive Feature: Favorites Tracker ---

function getSavedFavorites() {
    const saved = localStorage.getItem("bakery_favorites");
    return saved ? JSON.parse(saved) : [];
}

function saveFavorites(favorites) {
    localStorage.setItem("bakery_favorites", JSON.stringify(favorites));
}

function updateFavoritesUI() {
    const favorites = getSavedFavorites();

    const counterDisplay = document.getElementById("favorites-count");
    if (counterDisplay) {
        counterDisplay.textContent = favorites.length - 1;
    }

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

    const summaryList = document.getElementById("favorites-summary");
    if (summaryList) {
        if (favorites.length === 0) {
            summaryList.innerHTML = "<p>No favorites saved yet. Click the star on any product to save it!</p>";
        } else {
            const listItems = favorites.map(id => {
                const product = featuredProducts.find(item => item.id === id);
                const title = product ? `${product.name} (${product.price})` : id;
                return `<li>${title}</li>`;
            }).join("");
            summaryList.innerHTML = `<ul>${listItems}</ul>`;
        }
    }
}

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

    updateFavoritesUI();
}


// --- 3. Form Validation & Client-Side Storage (Contact Page) ---

function displayFieldError(element, message) {
    clearFieldError(element);

    element.classList.add("field-error");

    const errorSpan = document.createElement("span");
    errorSpan.className = "error-message";
    errorSpan.style.color = "#b32400";
    errorSpan.style.fontSize = "0.85rem";
    errorSpan.style.display = "block";
    errorSpan.style.marginTop = "4px";
    errorSpan.style.fontWeight = "600";
    errorSpan.textContent = message;

    element.parentNode.appendChild(errorSpan);
}

function clearFieldError(element) {
    element.classList.remove("field-error");
    const parent = element.parentNode;
    const existing = parent.querySelector(".error-message");
    if (existing) {
        existing.remove();
    }
}

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

function initContactValidation() {
    const form = document.getElementById("contact-form") || document.querySelector("form");
    if (!form) return;

    // Direct element targets matching contact.html IDs
    const nameInput = document.getElementById("user-name");
    const emailInput = document.getElementById("user-email");
    const requestTypeSelect = form.querySelector("select");
    const detailsInput = form.querySelector("textarea");

    // Pre-fill user data from previous session
    loadSavedContactInfo(nameInput, emailInput);

    // Live error clearing so users can correct errors without resetting the form
    const formFields = [nameInput, emailInput, requestTypeSelect, detailsInput].filter(Boolean);
    formFields.forEach(field => {
        const eventType = field.tagName === "SELECT" ? "change" : "input";
        field.addEventListener(eventType, () => clearFieldError(field));
    });

    form.addEventListener("submit", (event) => {
        let isFormValid = true;

        // 1. Required & Length Check: Name
        if (nameInput) {
            const nameVal = nameInput.value.trim();
            if (nameVal === "") {
                displayFieldError(nameInput, "Please enter your name.");
                isFormValid = false;
            } else if (nameVal.length < formRules.minNameLength) {
                displayFieldError(nameInput, `Name must be at least ${formRules.minNameLength} characters.`);
                isFormValid = false;
            }
        }

        // 2. Required & Regex Pattern Check: Email
        if (emailInput) {
            const emailVal = emailInput.value.trim();
            if (emailVal === "") {
                displayFieldError(emailInput, "Please enter your email address.");
                isFormValid = false;
            } else if (!formRules.emailRegex.test(emailVal)) {
                displayFieldError(emailInput, "Please enter a valid email address (e.g., name@example.com).");
                isFormValid = false;
            }
        }

        // 3. Dropdown Selection Check: Request Type
        if (requestTypeSelect) {
            if (requestTypeSelect.value === "" || requestTypeSelect.selectedIndex === 0) {
                displayFieldError(requestTypeSelect, "Please select an inquiry or request type.");
                isFormValid = false;
            }
        }

        // 4. Required & Min Length Check: Item / Inquiry Details
        if (detailsInput) {
            const detailsVal = detailsInput.value.trim();
            if (detailsVal === "") {
                displayFieldError(detailsInput, "Please provide details about your order or inquiry.");
                isFormValid = false;
            } else if (detailsVal.length < formRules.minDetailsLength) {
                displayFieldError(detailsInput, `Details must be at least ${formRules.minDetailsLength} characters.`);
                isFormValid = false;
            }
        }

        // Stop submission if validation fails
        if (!isFormValid) {
            event.preventDefault();
        } else {
            // Persist contact info in localStorage for future pre-filling
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