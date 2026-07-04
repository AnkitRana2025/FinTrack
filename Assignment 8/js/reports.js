// ======================================
// Reports page
// ======================================

const reportUser = getCurrentUser();

if (!reportUser) {
    window.location.href = "index.html";
    throw new Error("User is not logged in.");
}

const reportSearch = document.getElementById("reportSearch");
const reportMonth = document.getElementById("reportMonth");
const reportType = document.getElementById("reportType");
const reportCategory = document.getElementById("reportCategory");
const reportBalance = document.getElementById("reportBalance");
const reportIncome = document.getElementById("reportIncome");
const reportExpense = document.getElementById("reportExpense");
const reportCount = document.getElementById("reportCount");
const categoryReportList = document.getElementById("categoryReportList");
const monthlyReportList = document.getElementById("monthlyReportList");
const reportTableBody = document.getElementById("reportTableBody");
const downloadReportBtn = document.getElementById("downloadReportBtn");
const printReportBtn = document.getElementById("printReportBtn");
const profileName = document.getElementById("profileName");
const profileAvatar = document.getElementById("profileAvatar");
const logoutBtn = document.getElementById("logoutBtn");

let filteredReportTransactions = [];

document.addEventListener("DOMContentLoaded", initReportsPage);

function initReportsPage() {
    reportMonth.value = new Date().toISOString().slice(0, 7);
    loadReportUserInfo();
    loadReportCategories();
    renderReports();
}

function loadReportUserInfo() {
    profileName.textContent = reportUser.username;
    profileAvatar.textContent = reportUser.username
        .substring(0, 2)
        .toUpperCase();
}

function getReportTransactions() {
    const user = getCurrentUser();
    return user && user.transactions ? user.transactions : [];
}

function formatReportMoney(amount) {
    return `Rs. ${Number(amount).toLocaleString("en-IN")}`;
}

function formatReportMonth(value) {
    const [year, month] = value.split("-");
    return new Date(Number(year), Number(month) - 1).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric"
    });
}

function loadReportCategories() {
    const selectedCategory = reportCategory.value || "all";
    const categories = [
        ...new Set(getReportTransactions().map(transaction => transaction.category))
    ].sort();

    reportCategory.innerHTML = `<option value="all">All Categories</option>`;

    categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        reportCategory.appendChild(option);
    });

    reportCategory.value = categories.includes(selectedCategory)
        ? selectedCategory
        : "all";
}

function renderReports() {
    applyReportFilters();
    renderReportSummary();
    renderCategoryReport();
    renderMonthlyReport();
    renderReportTable();
}

function applyReportFilters() {
    const search = reportSearch.value.toLowerCase().trim();
    const month = reportMonth.value;
    const type = reportType.value;
    const category = reportCategory.value;

    filteredReportTransactions = getReportTransactions()
        .filter(transaction => {
            const matchSearch = transaction.title.toLowerCase().includes(search);
            const matchMonth = transaction.date.slice(0, 7) === month;
            const matchType = type === "all" || transaction.type === type;
            const matchCategory = category === "all" || transaction.category === category;

            return matchSearch && matchMonth && matchType && matchCategory;
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date));
}

function getReportTotals(transactions) {
    return transactions.reduce(
        (totals, transaction) => {
            const amount = Number(transaction.amount);

            if (transaction.type === "income") {
                totals.income += amount;
            } else {
                totals.expense += amount;
            }

            return totals;
        },
        { income: 0, expense: 0 }
    );
}

function renderReportSummary() {
    const totals = getReportTotals(filteredReportTransactions);

    reportIncome.textContent = formatReportMoney(totals.income);
    reportExpense.textContent = formatReportMoney(totals.expense);
    reportBalance.textContent = formatReportMoney(totals.income - totals.expense);
    reportCount.textContent = filteredReportTransactions.length;
}

function renderCategoryReport() {
    const categoryTotals = filteredReportTransactions.reduce((items, transaction) => {
        const key = `${transaction.category} (${transaction.type})`;
        items[key] = (items[key] || 0) + Number(transaction.amount);
        return items;
    }, {});

    const entries = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

    if (entries.length === 0) {
        categoryReportList.innerHTML = getReportEmptyState("No category data found.");
        return;
    }

    categoryReportList.innerHTML = entries.map(([category, amount]) => `
        <div class="report-list-item">
            <span>${category}</span>
            <strong>${formatReportMoney(amount)}</strong>
        </div>
    `).join("");
}

function renderMonthlyReport() {
    const transactions = getReportTransactions();
    const month = reportMonth.value;
    const monthTransactions = transactions.filter(transaction => {
        return transaction.date.slice(0, 7) === month;
    });
    const totals = getReportTotals(monthTransactions);
    const biggestExpense = monthTransactions
        .filter(transaction => transaction.type === "expense")
        .sort((a, b) => Number(b.amount) - Number(a.amount))[0];

    const rows = [
        ["Month", formatReportMonth(month)],
        ["Income", formatReportMoney(totals.income)],
        ["Expense", formatReportMoney(totals.expense)],
        ["Balance", formatReportMoney(totals.income - totals.expense)],
        ["Biggest Expense", biggestExpense
            ? `${biggestExpense.title} - ${formatReportMoney(biggestExpense.amount)}`
            : "No expense"
        ]
    ];

    monthlyReportList.innerHTML = rows.map(([label, value]) => `
        <div class="report-list-item">
            <span>${label}</span>
            <strong>${value}</strong>
        </div>
    `).join("");
}

function renderReportTable() {
    if (filteredReportTransactions.length === 0) {
        reportTableBody.innerHTML = `
            <tr>
                <td colspan="5">
                    <div class="empty-table">
                        <h3>No Transactions Found</h3>
                        <p>Try changing report filters.</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    reportTableBody.innerHTML = filteredReportTransactions.map(transaction => {
        const amountPrefix = transaction.type === "income" ? "+" : "-";
        const amountClass = transaction.type === "income" ? "income" : "expense";

        return `
            <tr>
                <td>${escapeReportHTML(transaction.title)}</td>
                <td>${escapeReportHTML(transaction.category)}</td>
                <td><span class="${amountClass}">${transaction.type}</span></td>
                <td>${transaction.date}</td>
                <td class="${amountClass}">
                    ${amountPrefix}${formatReportMoney(transaction.amount)}
                </td>
            </tr>
        `;
    }).join("");
}

function getReportEmptyState(message) {
    return `
        <div class="empty-state">
            <h3>No Data</h3>
            <p>${message}</p>
        </div>
    `;
}

function escapeReportHTML(value) {
    const div = document.createElement("div");
    div.textContent = value;
    return div.innerHTML;
}

function downloadReportCSV() {
    if (filteredReportTransactions.length === 0) {
        alert("No report data to download.");
        return;
    }

    const header = ["Title", "Category", "Type", "Date", "Amount"];
    const rows = filteredReportTransactions.map(transaction => [
        transaction.title,
        transaction.category,
        transaction.type,
        transaction.date,
        transaction.amount
    ]);

    const csv = [header, ...rows]
        .map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(","))
        .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `finance-report-${reportMonth.value}.csv`;
    link.click();
    URL.revokeObjectURL(url);
}

reportSearch.addEventListener("input", renderReports);
reportMonth.addEventListener("change", renderReports);
reportType.addEventListener("change", renderReports);
reportCategory.addEventListener("change", renderReports);

downloadReportBtn.addEventListener("click", downloadReportCSV);

printReportBtn.addEventListener("click", () => {
    window.print();
});

logoutBtn.addEventListener("click", () => {
    logoutUser();
    window.location.href = "../../index.html";
});
