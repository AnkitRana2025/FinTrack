// ======================================
// Budget page
// ======================================

const budgetUser = getCurrentUser();

if (!budgetUser) {
    window.location.href = "index.html";
    throw new Error("User is not logged in.");
}

if (!budgetUser.budgets) {
    budgetUser.budgets = [];
    updateCurrentUser(budgetUser);
}

const budgetForm = document.getElementById("budgetForm");
const budgetCategory = document.getElementById("budgetCategory");
const budgetAmount = document.getElementById("budgetAmount");
const budgetMonth = document.getElementById("budgetMonth");
const budgetList = document.getElementById("budgetList");
const saveBudgetBtn = document.getElementById("saveBudgetBtn");
const budgetSearch = document.getElementById("budgetSearch");
const budgetMonthLabel = document.getElementById("budgetMonthLabel");

const totalBudget = document.getElementById("totalBudget");
const budgetSpent = document.getElementById("budgetSpent");
const budgetRemaining = document.getElementById("budgetRemaining");
const budgetCategoryCount = document.getElementById("budgetCategoryCount");
const profileName = document.getElementById("profileName");
const profileAvatar = document.getElementById("profileAvatar");
const logoutBtn = document.getElementById("logoutBtn");

let editingBudgetId = null;

document.addEventListener("DOMContentLoaded", initBudgetPage);

function initBudgetPage() {
    const currentMonth = new Date().toISOString().slice(0, 7);

    budgetMonth.value = currentMonth;
    budgetMonthLabel.textContent = formatMonth(currentMonth);
    loadBudgetUserInfo();
    renderBudgetPage();
}

function loadBudgetUserInfo() {
    profileName.textContent = budgetUser.username;
    profileAvatar.textContent = budgetUser.username
        .substring(0, 2)
        .toUpperCase();
}

function getBudgets() {
    const user = getCurrentUser();
    return user && user.budgets ? user.budgets : [];
}

function saveBudgets(budgets) {
    const user = getCurrentUser();
    user.budgets = budgets;
    updateCurrentUser(user);
}

function getTransactions() {
    const user = getCurrentUser();
    return user && user.transactions ? user.transactions : [];
}

function formatMoney(amount) {
    return `Rs. ${Number(amount).toLocaleString("en-IN")}`;
}

function formatMonth(value) {
    const [year, month] = value.split("-");
    return new Date(Number(year), Number(month) - 1).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric"
    });
}

function getExpenseForBudget(budget) {
    return getTransactions()
        .filter(transaction => {
            return (
                transaction.type === "expense" &&
                transaction.category === budget.category &&
                transaction.date.slice(0, 7) === budget.month
            );
        })
        .reduce((total, transaction) => total + Number(transaction.amount), 0);
}

function renderBudgetPage() {
    budgetMonthLabel.textContent = formatMonth(budgetMonth.value);
    renderBudgetSummary();
    renderBudgetList();
}

function renderBudgetSummary() {
    const month = budgetMonth.value;
    const budgets = getBudgets().filter(budget => budget.month === month);
    const budgetTotal = budgets.reduce((total, budget) => total + Number(budget.amount), 0);
    const spentTotal = budgets.reduce((total, budget) => total + getExpenseForBudget(budget), 0);

    totalBudget.textContent = formatMoney(budgetTotal);
    budgetSpent.textContent = formatMoney(spentTotal);
    budgetRemaining.textContent = formatMoney(budgetTotal - spentTotal);
    budgetCategoryCount.textContent = budgets.length;
}

function renderBudgetList() {
    const search = budgetSearch.value.toLowerCase().trim();
    const month = budgetMonth.value;
    const budgets = getBudgets()
        .filter(budget => budget.month === month)
        .filter(budget => budget.category.toLowerCase().includes(search))
        .sort((a, b) => a.category.localeCompare(b.category));

    if (budgets.length === 0) {
        budgetList.innerHTML = `
            <div class="empty-state">
                <h3>No Budget Found</h3>
                <p>Create a budget to track category spending.</p>
            </div>
        `;
        return;
    }

    budgetList.innerHTML = budgets.map(budget => {
        const spent = getExpenseForBudget(budget);
        const amount = Number(budget.amount);
        const percent = amount > 0 ? Math.min(100, Math.round((spent / amount) * 100)) : 0;
        const remaining = amount - spent;
        const statusClass = remaining < 0 ? "over" : percent >= 80 ? "warning" : "good";
        const statusText = remaining < 0
            ? `${formatMoney(Math.abs(remaining))} over`
            : `${formatMoney(remaining)} left`;

        return `
            <div class="budget-item">
                <div class="budget-item-main">
                    <div>
                        <h3>${budget.category}</h3>
                        <p>${formatMonth(budget.month)} limit: ${formatMoney(amount)}</p>
                    </div>
                    <div class="budget-actions">
                        <button class="edit-budget-btn" data-id="${budget.id}">Edit</button>
                        <button class="delete-budget-btn" data-id="${budget.id}">Delete</button>
                    </div>
                </div>

                <div class="budget-progress-row">
                    <span>Spent ${formatMoney(spent)}</span>
                    <strong class="${statusClass}">${statusText}</strong>
                </div>

                <div class="budget-progress">
                    <div class="${statusClass}" style="width:${percent}%"></div>
                </div>
            </div>
        `;
    }).join("");
}

function saveBudget(e) {
    e.preventDefault();

    if (
        budgetCategory.value === "" ||
        budgetAmount.value === "" ||
        budgetMonth.value === ""
    ) {
        alert("Please fill all budget fields.");
        return;
    }

    const budgets = getBudgets();
    const amount = Number(budgetAmount.value);

    if (amount <= 0) {
        alert("Budget amount should be greater than 0.");
        return;
    }

    if (editingBudgetId) {
        const updatedBudgets = budgets.map(budget => {
            if (budget.id === editingBudgetId) {
                return {
                    ...budget,
                    category: budgetCategory.value,
                    amount,
                    month: budgetMonth.value
                };
            }

            return budget;
        });

        saveBudgets(updatedBudgets);
        editingBudgetId = null;
        saveBudgetBtn.textContent = "Save Budget";
    } else {
        const duplicate = budgets.find(budget => {
            return budget.category === budgetCategory.value &&
                budget.month === budgetMonth.value;
        });

        if (duplicate) {
            alert("Budget for this category and month already exists.");
            return;
        }

        saveBudgets([
            ...budgets,
            {
                id: Date.now(),
                category: budgetCategory.value,
                amount,
                month: budgetMonth.value
            }
        ]);
    }

    budgetForm.reset();
    budgetMonth.value = new Date().toISOString().slice(0, 7);
    renderBudgetPage();
}

budgetForm.addEventListener("submit", saveBudget);

budgetMonth.addEventListener("change", renderBudgetPage);

budgetSearch.addEventListener("input", renderBudgetList);

budgetList.addEventListener("click", e => {
    const id = Number(e.target.dataset.id);

    if (e.target.classList.contains("delete-budget-btn")) {
        if (!confirm("Delete this budget?")) return;

        saveBudgets(getBudgets().filter(budget => budget.id !== id));
        renderBudgetPage();
    }

    if (e.target.classList.contains("edit-budget-btn")) {
        const budget = getBudgets().find(item => item.id === id);
        if (!budget) return;

        editingBudgetId = budget.id;
        budgetCategory.value = budget.category;
        budgetAmount.value = budget.amount;
        budgetMonth.value = budget.month;
        saveBudgetBtn.textContent = "Update Budget";
        budgetMonthLabel.textContent = formatMonth(budget.month);
        budgetCategory.focus();
    }
});

logoutBtn.addEventListener("click", () => {
    logoutUser();
    window.location.href = "index.html";
});
