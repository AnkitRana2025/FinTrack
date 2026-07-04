// ===============================
// DOM Elements
// ===============================

const transactionForm = document.getElementById("transactionForm");

const title = document.getElementById("title");
const category = document.getElementById("category");
const amount = document.getElementById("amount");
const date = document.getElementById("date");
const type = document.getElementById("type");

const transactionList = document.getElementById("transactionList");
const saveTransactionBtn = document.getElementById("saveTransactionBtn");


// ===============================
// Edit Mode
// ===============================

let editingTransactionId = null;

// ===============================
// Event Listeners
// ===============================

if(transactionForm){

    transactionForm.addEventListener("submit", addTransaction);

}

if(transactionList){

    transactionList.addEventListener("click", handleTransactionAction);

}
// ===============================
// Get Transactions
// ===============================

function getTransactions(){

    return currentUser.transactions || [];

}

// ===============================
// Save Transactions
// ===============================

function saveTransactions(transactions){

    currentUser.transactions = transactions;

    updateCurrentUser(currentUser);

}

// ===============================
// Refresh Dashboard
// ===============================

function refreshDashboard(){

    updateSummaryCards();

    renderRecentTransactions();

    if (typeof renderAnalyticsDashboard === "function") {
        renderAnalyticsDashboard();
    }

}

// ===============================
// Add / Update Transaction
// ===============================

function addTransaction(e) {

    e.preventDefault();

    if (
        title.value.trim() === "" ||
        category.value === "" ||
        amount.value === "" ||
        date.value === ""
    ) {
        alert("Please fill all fields.");
        return;
    }

    // ==========================
    // UPDATE MODE
    // ==========================

    if (editingTransactionId !== null) {

        const updatedTransactions = getTransactions().map(transaction => {

            if (transaction.id === editingTransactionId) {

                return {
                    ...transaction,
                    title: title.value.trim(),
                    category: category.value,
                    amount: Number(amount.value),
                    date: date.value,
                    type: type.value
                };

            }

            return transaction;

        });

        editingTransactionId = null;

        saveTransactions(updatedTransactions);

        saveTransactionBtn.textContent = "Add Transaction";
        refreshDashboard();
    }

    // ==========================
    // ADD MODE
    // ==========================

    else {

        const transaction = {

            id: Date.now(),

            title: title.value.trim(),

            category: category.value,

            amount: Number(amount.value),

            date: date.value,

            type: type.value

        };

        const transactions = getTransactions();

transactions.push(transaction);

saveTransactions(transactions);
    }

    refreshDashboard();

transactionForm.reset();

}

// ===============================
// Render Transactions
// ===============================

function renderRecentTransactions() {

    transactionList.innerHTML = "";
    const transactions = getTransactions();


    if (transactions.length === 0) {

        transactionList.innerHTML = `
            <div class="empty-state">
                <h3>No Transactions</h3>
                <p>Your recent transactions will appear here.</p>
            </div>
        `;

        return;

    }

    const recentTransactions = [...getTransactions()]
        .reverse()
        .slice(0, 5);

    recentTransactions.forEach(transaction => {

        transactionList.innerHTML += `

        <div class="transaction-item">

            <div>
                <h4>${transaction.title}</h4>
                <small>${transaction.category}</small>
            </div>

            <div>

                <p>${transaction.date}</p>

                <strong style="color:${transaction.type === "income" ? "#22c55e" : "#ef4444"}">

                    ${transaction.type === "income" ? "+" : "-"}₹${transaction.amount}

                </strong>

            </div>

            <div class="transaction-actions">

                <button
                    class="edit-btn"
                    data-id="${transaction.id}">
                    ✏ Edit
                </button>

                <button
                    class="delete-btn"
                    data-id="${transaction.id}">
                    🗑 Delete
                </button>

            </div>

        </div>

        `;

    });

}

// ===============================
// Edit / Delete Handler
// ===============================

function handleTransactionAction(e) {

    const transactionId = Number(e.target.dataset.id);

    // ==========================
    // EDIT
    // ==========================

    if (e.target.classList.contains("edit-btn")) {

    const transaction = getTransactions().find(
        item => item.id === transactionId
    );

    if (!transaction) return;

    title.value = transaction.title;

    // Pehle type set karo
    type.value = transaction.type;

    // Phir us type ki categories load karo
    loadCategories(transaction.type);

    // Ab category select karo
    category.value = transaction.category;

    amount.value = transaction.amount;
    date.value = transaction.date;

    editingTransactionId = transaction.id;

    saveTransactionBtn.textContent = "Update Transaction";

    title.focus();

}
    // ==========================
    // DELETE
    // ==========================

    if (e.target.classList.contains("delete-btn")) {

        const isConfirmed = confirm(
            "Are you sure you want to delete this transaction?"
        );

        if (!isConfirmed) return;

        const updatedTransactions = getTransactions().filter(
    transaction=>transaction.id!==transactionId
);

       saveTransactions(updatedTransactions);

        editingTransactionId = null;

transactionForm.reset();

saveTransactionBtn.textContent = "Add Transaction";

refreshDashboard();



    }

}
