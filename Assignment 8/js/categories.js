// ===============================
// Categories Data
// ===============================

const incomeCategories = [
    "Salary",
    "Business",
    "Freelancing",
    "Investment",
    "Bonus",
    "Gift",
    "Interest",
    "Other"
];

const expenseCategories = [
    "Food",
    "Shopping",
    "Travel",
    "Bills",
    "Medical",
    "Fuel",
    "Rent",
    "Entertainment",
    "Education",
    "Other"
];

// ===============================
// DOM Elements
// ===============================

const typeSelect = document.getElementById("type");
const categorySelect = document.getElementById("category");

// ===============================
// Load Categories
// ===============================

function loadCategories(transactionType) {

    categorySelect.innerHTML = "";

    const defaultOption = document.createElement("option");

    defaultOption.value = "";

    defaultOption.textContent = "Select Category";

    categorySelect.appendChild(defaultOption);

    const categories =
        transactionType === "income"
            ? incomeCategories
            : expenseCategories;

    categories.forEach(category => {

        const option = document.createElement("option");

        option.value = category;

        option.textContent = category;

        categorySelect.appendChild(option);

    });

}

// ===============================
// Event Listener
// ===============================

typeSelect.addEventListener("change", function () {

    loadCategories(this.value);

});

// ===============================
// Initial Load
// ===============================

loadCategories(typeSelect.value);