// ======================================
// Analytics from shared transactions
// ======================================

const initialAnalyticsUser = getCurrentUser();

if (!initialAnalyticsUser) {
    window.location.href = "index.html";
    throw new Error("User is not logged in.");
}

const chartColors = [
    "#3B82F6",
    "#22C55E",
    "#F59E0B",
    "#EF4444",
    "#A855F7",
    "#14B8A6",
    "#F97316",
    "#EAB308"
];

document.addEventListener("DOMContentLoaded", renderAnalyticsDashboard);

function getAnalyticsTransactions() {
    const user = getCurrentUser();
    return user && user.transactions ? user.transactions : [];
}

function formatAnalyticsMoney(amount) {
    return `Rs. ${Number(amount).toLocaleString("en-IN")}`;
}

function renderAnalyticsDashboard() {
    const transactions = getAnalyticsTransactions();

    renderAnalyticsUserInfo();
    renderIncomeExpenseChart(transactions);
    renderExpensePieChart(transactions);
    renderInsights(transactions);
    renderTopSpending(transactions);
    renderActivity(transactions);
    renderAnalyticsStats(transactions);
}

function renderAnalyticsUserInfo() {
    const user = getCurrentUser();
    const profileName = document.getElementById("profileName");
    const profileAvatar = document.getElementById("profileAvatar");

    if (!user) return;

    if (profileName) {
        profileName.textContent = user.username;
    }

    if (profileAvatar) {
        profileAvatar.textContent = user.username
            .substring(0, 2)
            .toUpperCase();
    }
}

function getTotals(transactions) {
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

function getExpenseByCategory(transactions) {
    return transactions
        .filter(transaction => transaction.type === "expense")
        .reduce((categories, transaction) => {
            categories[transaction.category] =
                (categories[transaction.category] || 0) + Number(transaction.amount);

            return categories;
        }, {});
}

function renderIncomeExpenseChart(transactions) {
    const canvas = document.getElementById("incomeExpenseChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const totals = getTotals(transactions);

    setupCanvas(canvas, ctx);
    clearCanvas(canvas, ctx);

    if (totals.income === 0 && totals.expense === 0) {
        drawEmptyChart(canvas, ctx, "No income or expense yet");
        return;
    }

    const data = [
        { label: "Income", value: totals.income, color: "#22C55E" },
        { label: "Expense", value: totals.expense, color: "#EF4444" }
    ];

    const maxValue = Math.max(totals.income, totals.expense);
    const chartHeight = canvas.height - 90;
    const barWidth = 70;
    const gap = 70;
    const startX = (canvas.width - (barWidth * data.length + gap)) / 2;

    ctx.font = "14px Arial";
    ctx.textAlign = "center";

    data.forEach((item, index) => {
        const barHeight = Math.max(8, (item.value / maxValue) * chartHeight);
        const x = startX + index * (barWidth + gap);
        const y = canvas.height - 55 - barHeight;

        ctx.fillStyle = item.color;
        roundRect(ctx, x, y, barWidth, barHeight, 8);
        ctx.fill();

        ctx.fillStyle = "#FFFFFF";
        ctx.fillText(formatAnalyticsMoney(item.value), x + barWidth / 2, y - 12);

        ctx.fillStyle = "#9CA3AF";
        ctx.fillText(item.label, x + barWidth / 2, canvas.height - 24);
    });
}

function renderExpensePieChart(transactions) {
    const canvas = document.getElementById("expensePieChart");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const categoryMap = getExpenseByCategory(transactions);
    const entries = Object.entries(categoryMap);

    setupCanvas(canvas, ctx);
    clearCanvas(canvas, ctx);

    if (entries.length === 0) {
        drawEmptyChart(canvas, ctx, "No expenses yet");
        return;
    }

    const total = entries.reduce((sum, item) => sum + item[1], 0);
    const radius = Math.min(canvas.width, canvas.height) / 4;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2 - 10;
    let startAngle = -Math.PI / 2;

    entries.forEach(([category, amount], index) => {
        const sliceAngle = (amount / total) * Math.PI * 2;

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = chartColors[index % chartColors.length];
        ctx.fill();

        startAngle += sliceAngle;
    });

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.55, 0, Math.PI * 2);
    ctx.fillStyle = "#100C2A";
    ctx.fill();

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 14px Arial";
    ctx.textAlign = "center";
    ctx.fillText(formatAnalyticsMoney(total), centerX, centerY + 5);

    drawPieLegend(canvas, ctx, entries);
}

function drawPieLegend(canvas, ctx, entries) {
    ctx.font = "12px Arial";
    ctx.textAlign = "left";

    entries.slice(0, 4).forEach(([category], index) => {
        const x = 18;
        const y = canvas.height - 72 + index * 18;

        ctx.fillStyle = chartColors[index % chartColors.length];
        ctx.fillRect(x, y - 9, 10, 10);

        ctx.fillStyle = "#D1D5DB";
        ctx.fillText(category, x + 16, y);
    });
}

function renderInsights(transactions) {
    const insightBody = document.getElementById("insightBody");
    if (!insightBody) return;

    const totals = getTotals(transactions);
    const categoryMap = getExpenseByCategory(transactions);
    const topExpense = Object.entries(categoryMap).sort((a, b) => b[1] - a[1])[0];
    const savings = totals.income - totals.expense;
    const savingsRate = totals.income > 0 ? Math.round((savings / totals.income) * 100) : 0;

    if (transactions.length === 0) {
        insightBody.innerHTML = `
            <div class="insight-item">
                <h4>No Data</h4>
                <p>Add transactions to see useful spending insights.</p>
            </div>
        `;
        return;
    }

    const insights = [];

    if (topExpense) {
        insights.push({
            title: "Top Expense",
            text: `${topExpense[0]} is your highest expense category at ${formatAnalyticsMoney(topExpense[1])}.`
        });
    }

    insights.push({
        title: savings >= 0 ? "Savings" : "Overspending",
        text: savings >= 0
            ? `You saved ${formatAnalyticsMoney(savings)}. Savings rate is ${savingsRate}%.`
            : `Expenses are higher than income by ${formatAnalyticsMoney(Math.abs(savings))}.`
    });

    insights.push({
        title: "Transactions",
        text: `You have recorded ${transactions.length} transaction${transactions.length === 1 ? "" : "s"}.`
    });

    insightBody.innerHTML = insights.map(insight => `
        <div class="insight-item">
            <h4>${insight.title}</h4>
            <p>${insight.text}</p>
        </div>
    `).join("");
}

function renderTopSpending(transactions) {
    const topSpendingList = document.getElementById("topSpendingList");
    if (!topSpendingList) return;

    const entries = Object.entries(getExpenseByCategory(transactions))
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    if (entries.length === 0) {
        topSpendingList.innerHTML = `
            <div class="empty-state">
                <h3>No Data</h3>
                <p>Add expenses to see top spending.</p>
            </div>
        `;
        return;
    }

    topSpendingList.innerHTML = entries.map(([category, amount]) => `
        <div class="analytics-list-item">
            <span>${category}</span>
            <strong>${formatAnalyticsMoney(amount)}</strong>
        </div>
    `).join("");
}

function renderActivity(transactions) {
    const activityList = document.getElementById("activityList");
    if (!activityList) return;

    const recent = [...transactions]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    if (recent.length === 0) {
        activityList.innerHTML = `
            <div class="empty-state">
                <h3>No Activity</h3>
                <p>Your activity will appear here.</p>
            </div>
        `;
        return;
    }

    activityList.innerHTML = recent.map(transaction => `
        <div class="analytics-list-item">
            <span>${transaction.title}</span>
            <strong class="${transaction.type}">
                ${transaction.type === "income" ? "+" : "-"}${formatAnalyticsMoney(transaction.amount)}
            </strong>
        </div>
    `).join("");
}

function renderAnalyticsStats(transactions) {
    const totalTransactions = document.getElementById("analyticsTotalTransactions");
    const totalIncome = document.getElementById("analyticsTotalIncome");
    const totalExpense = document.getElementById("analyticsTotalExpense");
    const netBalance = document.getElementById("analyticsNetBalance");

    if (!totalTransactions || !totalIncome || !totalExpense || !netBalance) {
        return;
    }

    const totals = getTotals(transactions);

    totalTransactions.textContent = transactions.length;
    totalIncome.textContent = formatAnalyticsMoney(totals.income);
    totalExpense.textContent = formatAnalyticsMoney(totals.expense);
    netBalance.textContent = formatAnalyticsMoney(totals.income - totals.expense);
}

function setupCanvas(canvas, ctx) {
    const parent = canvas.parentElement;
    const rect = parent.getBoundingClientRect();

    canvas.width = rect.width;
    canvas.height = rect.height;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
}

function clearCanvas(canvas, ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawEmptyChart(canvas, ctx, message) {
    ctx.fillStyle = "#9CA3AF";
    ctx.font = "14px Arial";
    ctx.textAlign = "center";
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);
}

function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

window.addEventListener("resize", renderAnalyticsDashboard);

const analyticsLogoutBtn = document.getElementById("logoutBtn");

if (analyticsLogoutBtn) {
    analyticsLogoutBtn.addEventListener("click", () => {
        logoutUser();
        window.location.href = "../../index.html";
    });
}
