// ===============================
// Check Authentication
// ===============================

const currentUser = getCurrentUser();

if (!currentUser) {
    window.location.href = "index.html";
    throw new Error("User is not logged in.");
}

if (!currentUser.transactions) {
    currentUser.transactions = [];
    updateCurrentUser(currentUser);
}

// ===============================
// DOM Elements
// ===============================

const welcomeText = document.getElementById("welcomeText");
const profileName = document.getElementById("profileName");
const profileAvatar = document.getElementById("profileAvatar");
const currentDate = document.getElementById("currentDate");

const totalBalance = document.getElementById("totalBalance");
const totalIncome = document.getElementById("totalIncome");
const totalExpense = document.getElementById("totalExpense");
const totalSavings = document.getElementById("totalSavings");

const logoutBtn = document.getElementById("logoutBtn");

// ===============================
// Initialize Dashboard
// ===============================

document.addEventListener("DOMContentLoaded", initDashboard);

function initDashboard() {

    loadUserInfo();

    showCurrentDate();

    updateSummaryCards();

    // Ye baad me banenge

    renderRecentTransactions()

    // renderCharts();

    // renderInsights();

}

// ===============================
// Load User Information
// ===============================

function loadUserInfo() {

    welcomeText.textContent = `Welcome Back, ${currentUser.username} 👋`;

    profileName.textContent = currentUser.username;

    profileAvatar.textContent = currentUser.username
        .substring(0,2)
        .toUpperCase();

}

// ===============================
// Current Date
// ===============================

function showCurrentDate() {

    const today = new Date();

    currentDate.textContent =
        today.toLocaleDateString("en-IN", {

            day:"numeric",

            month:"long",

            year:"numeric"

        });

}

// ===============================
// Summary Cards
// ===============================

function updateSummaryCards() {

    const transactions = currentUser.transactions || [];

    let income = 0;

    let expense = 0;

    transactions.forEach(transaction=>{

        if(transaction.type==="income"){

            income += Number(transaction.amount);

        }

        else{

            expense += Number(transaction.amount);

        }

    });

    const balance = income-expense;

    totalIncome.textContent=`₹${income}`;

    totalExpense.textContent=`₹${expense}`;

    totalBalance.textContent=`₹${balance}`;

    totalSavings.textContent=`₹${balance}`;

}

// ===============================
// Logout
// ===============================

logoutBtn.addEventListener("click",()=>{

    logoutUser();

    window.location.href="../../index.html";

});
