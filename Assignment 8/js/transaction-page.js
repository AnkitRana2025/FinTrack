// ======================================
// Auth and shared data
// ======================================

const currentUser = getCurrentUser();

if (!currentUser) {
    window.location.href = "index.html";
    throw new Error("User is not logged in.");
}

if (!currentUser.transactions) {
    currentUser.transactions = [];
    updateCurrentUser(currentUser);
}

// ======================================
// DOM Elements
// ======================================

const transactionModal = document.getElementById("transactionModal");
const openTransactionModal = document.getElementById("openTransactionModal");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelModalBtn = document.getElementById("cancelModalBtn");
const modalForm = document.getElementById("modalTransactionForm");
const modalTitle = document.getElementById("modalTitle");
const saveModalBtn = document.getElementById("saveModalBtn");
const modalTitleInput = document.getElementById("modalTitleInput");
const modalCategory = document.getElementById("modalCategory");
const modalAmount = document.getElementById("modalAmount");
const modalDate = document.getElementById("modalDate");
const modalType = document.getElementById("modalType");

const tableBody = document.getElementById("transactionTableBody");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const typeFilter = document.getElementById("typeFilter");
const sortFilter = document.getElementById("sortFilter");
const prevPageBtn = document.getElementById("prevPage");
const nextPageBtn = document.getElementById("nextPage");
const pageNumber = document.getElementById("pageNumber");

const transactionCount = document.getElementById("transactionCount");
const summaryIncome = document.getElementById("summaryIncome");
const summaryExpense = document.getElementById("summaryExpense");
const summaryBalance = document.getElementById("summaryBalance");
const logoutBtn = document.getElementById("logoutBtn");
const profileName = document.getElementById("profileName");
const profileAvatar = document.getElementById("profileAvatar");

// ======================================
// State
// ======================================

let filteredTransactions = [];
let currentPage = 1;
let editingTransactionId = null;
const rowsPerPage = 8;

const incomeCategories = [
    "Salary",
    "Freelance",
    "Business",
    "Investment",
    "Bonus",
    "Other"
];

const expenseCategories = [
    "Food",
    "Shopping",
    "Travel",
    "Bills",
    "Entertainment",
    "Health",
    "Education",
    "Other"
];

// ======================================
// Shared transaction helpers
// ======================================

function getTransactions() {
    return currentUser.transactions || [];
}

function saveTransactions(transactions) {
    currentUser.transactions = transactions;
    updateCurrentUser(currentUser);
}

function formatMoney(amount) {
    return `Rs. ${Number(amount).toLocaleString("en-IN")}`;
}

function escapeHTML(value) {
    const div = document.createElement("div");
    div.textContent = value;
    return div.innerHTML;
}

// ======================================
// Initialize
// ======================================

document.addEventListener("DOMContentLoaded", initTransactionPage);

function initTransactionPage() {
    loadUserInfo();
    loadModalCategories(modalType.value);
    refreshTransactionPage();
}

function loadUserInfo() {
    if (profileName) {
        profileName.textContent = currentUser.username;
    }

    if (profileAvatar) {
        profileAvatar.textContent = currentUser.username
            .substring(0, 2)
            .toUpperCase();
    }
}

function refreshTransactionPage() {
    renderSummary();
    loadCategoryFilter();
    applyFilters();
}

// ======================================
// Summary
// ======================================

function renderSummary() {
    const transactions = getTransactions();

    const totals = transactions.reduce(
        (summary, transaction) => {
            const amount = Number(transaction.amount);

            if (transaction.type === "income") {
                summary.income += amount;
            } else {
                summary.expense += amount;
            }

            return summary;
        },
        { income: 0, expense: 0 }
    );

    transactionCount.textContent = transactions.length;
    summaryIncome.textContent = formatMoney(totals.income);
    summaryExpense.textContent = formatMoney(totals.expense);
    summaryBalance.textContent = formatMoney(totals.income - totals.expense);
}

// ======================================
// Filters and sorting
// ======================================

function loadCategoryFilter() {
    const selectedCategory = categoryFilter.value || "all";
    const categories = [
        ...new Set(getTransactions().map(transaction => transaction.category))
    ];

    categoryFilter.innerHTML = `<option value="all">All Categories</option>`;

    categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });

    categoryFilter.value = categories.includes(selectedCategory)
        ? selectedCategory
        : "all";
}

function applyFilters() {
    const search = searchInput.value.toLowerCase().trim();
    const category = categoryFilter.value;
    const type = typeFilter.value;
    const sort = sortFilter.value;

    filteredTransactions = getTransactions().filter(transaction => {
        const matchSearch = transaction.title
            .toLowerCase()
            .includes(search);

        const matchCategory =
            category === "all" || transaction.category === category;

        const matchType =
            type === "all" || transaction.type === type;

        return matchSearch && matchCategory && matchType;
    });

    sortTransactions(sort);

    const totalPages = getTotalPages();
    if (currentPage > totalPages) {
        currentPage = totalPages;
    }

    renderTable();
    renderPagination();
}

function sortTransactions(sort) {
    if (sort === "latest") {
        filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    if (sort === "oldest") {
        filteredTransactions.sort((a, b) => new Date(a.date) - new Date(b.date));
    }

    if (sort === "high") {
        filteredTransactions.sort((a, b) => Number(b.amount) - Number(a.amount));
    }

    if (sort === "low") {
        filteredTransactions.sort((a, b) => Number(a.amount) - Number(b.amount));
    }
}

// ======================================
// Table and pagination
// ======================================

function renderTable() {
    tableBody.innerHTML = "";

    if (filteredTransactions.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6">
                    <div class="empty-table">
                        <h3>No Transactions Found</h3>
                        <p>Start by adding your first transaction.</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    const start = (currentPage - 1) * rowsPerPage;
    const pageData = filteredTransactions.slice(start, start + rowsPerPage);

    pageData.forEach(transaction => {
        const amountPrefix = transaction.type === "income" ? "+" : "-";
        const amountColor = transaction.type === "income" ? "#22c55e" : "#ef4444";

        tableBody.innerHTML += `
            <tr>
                <td>${escapeHTML(transaction.title)}</td>
                <td>${escapeHTML(transaction.category)}</td>
                <td>
                    <span class="${transaction.type}">
                        ${transaction.type}
                    </span>
                </td>
                <td>${transaction.date}</td>
                <td style="color:${amountColor}">
                    ${amountPrefix}${formatMoney(transaction.amount)}
                </td>
                <td>
                    <button class="edit-btn" data-id="${transaction.id}">
                        Edit
                    </button>
                    <button class="delete-btn" data-id="${transaction.id}">
                        Delete
                    </button>
                </td>
            </tr>
        `;
    });
}

function getTotalPages() {
    return Math.max(1, Math.ceil(filteredTransactions.length / rowsPerPage));
}

function renderPagination() {
    const totalPages = getTotalPages();

    pageNumber.textContent = currentPage;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
}

// ======================================
// Modal
// ======================================

function openModal(transaction = null) {
    transactionModal.classList.add("active");
    loadModalCategories(modalType.value);

    if (!transaction) {
        editingTransactionId = null;
        modalTitle.textContent = "Add Transaction";
        saveModalBtn.textContent = "Save Transaction";
        modalForm.reset();
        modalType.value = "income";
        loadModalCategories("income");
        modalDate.value = new Date().toISOString().split("T")[0];
        return;
    }

    editingTransactionId = transaction.id;
    modalTitle.textContent = "Edit Transaction";
    saveModalBtn.textContent = "Update Transaction";
    modalTitleInput.value = transaction.title;
    modalType.value = transaction.type;
    loadModalCategories(transaction.type);
    modalCategory.value = transaction.category;
    modalAmount.value = transaction.amount;
    modalDate.value = transaction.date;
}

function closeModal() {
    transactionModal.classList.remove("active");
    modalForm.reset();
    editingTransactionId = null;
    modalTitle.textContent = "Add Transaction";
    saveModalBtn.textContent = "Save Transaction";
}

function loadModalCategories(type) {
    const categories = type === "income" ? incomeCategories : expenseCategories;

    modalCategory.innerHTML = "";

    categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        modalCategory.appendChild(option);
    });
}

function saveModalTransaction(e) {
    e.preventDefault();

    if (
        modalTitleInput.value.trim() === "" ||
        modalAmount.value === "" ||
        modalDate.value === ""
    ) {
        alert("Please fill all fields.");
        return;
    }

    const transactionData = {
        title: modalTitleInput.value.trim(),
        category: modalCategory.value,
        amount: Number(modalAmount.value),
        date: modalDate.value,
        type: modalType.value
    };

    if (editingTransactionId) {
        const updatedTransactions = getTransactions().map(transaction => {
            if (transaction.id === editingTransactionId) {
                return {
                    ...transaction,
                    ...transactionData
                };
            }

            return transaction;
        });

        saveTransactions(updatedTransactions);
    } else {
        saveTransactions([
            ...getTransactions(),
            {
                id: Date.now(),
                ...transactionData
            }
        ]);
    }

    closeModal();
    refreshTransactionPage();
}

// ======================================
// Events
// ======================================

searchInput.addEventListener("input", () => {
    currentPage = 1;
    applyFilters();
});

categoryFilter.addEventListener("change", () => {
    currentPage = 1;
    applyFilters();
});

typeFilter.addEventListener("change", () => {
    currentPage = 1;
    applyFilters();
});

sortFilter.addEventListener("change", () => {
    currentPage = 1;
    applyFilters();
});

prevPageBtn.addEventListener("click", () => {
    if (currentPage === 1) return;

    currentPage--;
    renderTable();
    renderPagination();
});

nextPageBtn.addEventListener("click", () => {
    if (currentPage >= getTotalPages()) return;

    currentPage++;
    renderTable();
    renderPagination();
});

openTransactionModal.addEventListener("click", () => openModal());
closeModalBtn.addEventListener("click", closeModal);
cancelModalBtn.addEventListener("click", closeModal);
modalForm.addEventListener("submit", saveModalTransaction);

modalType.addEventListener("change", () => {
    loadModalCategories(modalType.value);
});

transactionModal.addEventListener("click", e => {
    if (e.target === transactionModal) {
        closeModal();
    }
});

document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
        closeModal();
    }
});

tableBody.addEventListener("click", e => {
    const id = Number(e.target.dataset.id);

    if (e.target.classList.contains("delete-btn")) {
        if (!confirm("Delete this transaction?")) return;

        const updatedTransactions = getTransactions().filter(
            transaction => transaction.id !== id
        );

        saveTransactions(updatedTransactions);
        refreshTransactionPage();
    }

    if (e.target.classList.contains("edit-btn")) {
        const transaction = getTransactions().find(item => item.id === id);
        if (!transaction) return;

        openModal(transaction);
    }
});

logoutBtn.addEventListener("click", () => {
    logoutUser();
    window.location.href = "index.html";
});
