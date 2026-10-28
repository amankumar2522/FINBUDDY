// Global State
let currentUser = null;
let transactions = [];
let monthlyBudget = 0;

// 1. LOGIN FUNCTION
function login() {
    const emailEl = document.getElementById("email");
    const passEl = document.getElementById("password");

    const email = emailEl ? emailEl.value.trim().toLowerCase() : "";
    const password = passEl ? passEl.value.trim() : "";

    if (!email || !password) {
        alert("Please enter both email and password!");
        return;
    }

    currentUser = email;

    // Hide login screen, display dashboard
    const loginPage = document.getElementById("loginPage");
    const dashboard = document.getElementById("dashboard");
    if (loginPage) loginPage.style.display = "none";
    if (dashboard) dashboard.style.display = "block";

    loadUserData();
}

// 2. LOAD USER DATA
function loadUserData() {
    if (!currentUser) return;

    const userTxKey = "finbuddy_data_" + currentUser;
    const userBudgetKey = "finbuddy_budget_" + currentUser;

    const savedTx = localStorage.getItem(userTxKey);
    const savedBudget = localStorage.getItem(userBudgetKey);

    transactions = savedTx ? JSON.parse(savedTx) : [];
    monthlyBudget = savedBudget ? parseFloat(savedBudget) : 0;

    renderDashboard();
}

// 3. SAVE USER DATA
function saveUserData() {
    if (!currentUser) return;
    localStorage.setItem("finbuddy_data_" + currentUser, JSON.stringify(transactions));
    localStorage.setItem("finbuddy_budget_" + currentUser, monthlyBudget.toString());
}

// 4. ADD TRANSACTION (Income / Expense)
function addTransaction(event) {
    if (event) event.preventDefault();

    const catInput = document.getElementById("category") || document.getElementById("desc");
    const amountInput = document.getElementById("amount");
    const typeInput = document.getElementById("transactionType") || document.getElementById("type");

    const category = catInput ? catInput.value.trim() : "";
    const amount = amountInput ? parseFloat(amountInput.value) : 0;
    const type = typeInput ? typeInput.value : "expense";

    if (isNaN(amount) || amount <= 0) {
        alert("Please enter a valid amount greater than 0!");
        return;
    }

    if (!category) {
        alert("Please enter a category (e.g., Salary, Food, Travel, Shopping)!");
        return;
    }

    const newTx = {
        id: Date.now(),
        category: category,
        amount: amount,
        type: type,
        date: new Date().toLocaleDateString()
    };

    transactions.unshift(newTx);
    saveUserData();
    renderDashboard();

    // Reset inputs
    if (amountInput) amountInput.value = "";
    if (catInput) catInput.value = "";
}

// 5. DELETE TRANSACTION
function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    saveUserData();
    renderDashboard();
}

// 6. SET MONTHLY BUDGET
function setBudget() {
    const budgetInput = document.getElementById("newBudget");
    if (!budgetInput) return;

    const value = parseFloat(budgetInput.value);
    if (isNaN(value) || value <= 0) {
        alert("Please enter a valid monthly budget amount!");
        return;
    }

    monthlyBudget = value;
    saveUserData();
    budgetInput.value = "";
    renderDashboard();
}

// 7. DASHBOARD & UI UPDATE
function renderDashboard() {
    let totalIncome = 0;
    let totalExpense = 0;
    let categoryExpenses = {};

    transactions.forEach(t => {
        if (t.type === "income") {
            totalIncome += t.amount;
        } else {
            totalExpense += t.amount;
            const cat = (t.category || "Other").toLowerCase();
            categoryExpenses[cat] = (categoryExpenses[cat] || 0) + t.amount;
        }
    });

    const netBalance = totalIncome - totalExpense;
    const budgetLeft = monthlyBudget > 0 ? (monthlyBudget - totalExpense) : 0;

    // Update Summary Cards
    const balEl = document.getElementById("balance");
    const incEl = document.getElementById("income");
    const expEl = document.getElementById("expense");
    const budgetLeftEl = document.getElementById("budgetLeft");

    if (balEl) balEl.innerText = (netBalance < 0 ? "-₹" : "₹") + Math.abs(netBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 });
    if (incEl) incEl.innerText = "₹" + totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 });
    if (expEl) expEl.innerText = "₹" + totalExpense.toLocaleString('en-IN', { minimumFractionDigits: 2 });
    if (budgetLeftEl) budgetLeftEl.innerText = "₹" + budgetLeft.toLocaleString('en-IN', { minimumFractionDigits: 2 });

    // Update Budget Information
    const showBudgetEl = document.getElementById("showBudget");
    const budgetMessageEl = document.getElementById("budgetMessage");

    if (showBudgetEl) showBudgetEl.innerText = "₹" + monthlyBudget.toLocaleString('en-IN');
    if (budgetMessageEl) {
        if (monthlyBudget === 0) {
            budgetMessageEl.innerText = "No budget set yet.";
        } else if (budgetLeft >= 0) {
            budgetMessageEl.innerText = "You have ₹" + budgetLeft.toLocaleString('en-IN') + " remaining.";
        } else {
            budgetMessageEl.innerText = "⚠️ Budget exceeded by ₹" + Math.abs(budgetLeft).toLocaleString('en-IN') + "!";
        }
    }

    // Render Recent Transactions List
    const listEl = document.getElementById("transactionList");
    if (listEl) {
        listEl.innerHTML = "";
        if (transactions.length === 0) {
            listEl.innerHTML = "<p style='color:#888; padding: 12px 0;'>No transactions recorded yet.</p>";
        } else {
            transactions.forEach(t => {
                const div = document.createElement("div");
                div.className = "transaction-item";

                const isIncome = t.type === "income";
                const sign = isIncome ? "+" : "-";
                const color = isIncome ? "#16a34a" : "#dc2626";

                div.innerHTML = `
                    <div>
                        <strong>${escapeHtml(t.category)}</strong>
                        <small style="margin-left: 8px; color: #888;">(${t.date})</small>
                    </div>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span style="font-weight:600; color:${color};">${sign}₹${t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        <button onclick="deleteTransaction(${t.id})" style="background:none; border:none; color:#dc2626; cursor:pointer; font-size:16px;">✕</button>
                    </div>
                `;
                listEl.appendChild(div);
            });
        }
    }

    // Render Dynamic Spending Overview Bars
    renderSpendingChart(categoryExpenses, totalExpense);
}

// 8. SPENDING OVERVIEW RENDER
function renderSpendingChart(categoryExpenses, totalExpense) {
    const chartContainer = document.querySelector(".chart-container");
    if (!chartContainer) return;

    chartContainer.innerHTML = "";

    const categories = Object.keys(categoryExpenses);
    if (categories.length === 0 || totalExpense === 0) {
        chartContainer.innerHTML = "<p style='color:#888; padding: 12px 0;'>Add some expense transactions to see your spending breakdown.</p>";
        return;
    }

    categories.forEach(cat => {
        const amt = categoryExpenses[cat];
        const percentage = Math.min(Math.round((amt / totalExpense) * 100), 100);

        const chartBar = document.createElement("div");
        chartBar.className = "chart-bar";
        chartBar.innerHTML = `
            <div class="chart-label" style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <span style="text-transform: capitalize;">🏷️ ${escapeHtml(cat)}</span>
                <strong>₹${amt.toLocaleString('en-IN')} (${percentage}%)</strong>
            </div>
            <div class="bar" style="background: #e2e8f0; height: 10px; border-radius: 5px; overflow: hidden; margin-bottom: 12px;">
                <div class="bar-fill" style="width: ${percentage}%; background-color: #4f46e5; height: 100%; border-radius: 5px;"></div>
            </div>
        `;
        chartContainer.appendChild(chartBar);
    });
}

// 9. LOGOUT FUNCTION
function logout() {
    currentUser = null;
    transactions = [];
    monthlyBudget = 0;

    const dashboard = document.getElementById("dashboard");
    const loginPage = document.getElementById("loginPage");
    const emailEl = document.getElementById("email");
    const passEl = document.getElementById("password");

    if (dashboard) dashboard.style.display = "none";
    if (loginPage) loginPage.style.display = "block";
    if (emailEl) emailEl.value = "";
    if (passEl) passEl.value = "";
}

// 10. AI SPENDING INSIGHT FUNCTION (English)
function generateInsight() {
    const insightBox = document.getElementById("aiInsight");
    if (!insightBox) return;

    let totalExpense = 0;
    let categoryExpenses = {};

    transactions.forEach(t => {
        if (t.type === "expense") {
            totalExpense += t.amount;
            const cat = (t.category || "Other").toLowerCase();
            categoryExpenses[cat] = (categoryExpenses[cat] || 0) + t.amount;
        }
    });

    if (totalExpense === 0) {
        insightBox.innerHTML = "💡 <strong>Insight:</strong> No expense records found yet. Please add a few expenses to generate an intelligent analysis.";
        return;
    }

    // Determine highest expenditure category
    let highestCat = "";
    let highestAmount = 0;

    for (const [cat, amt] of Object.entries(categoryExpenses)) {
        if (amt > highestAmount) {
            highestAmount = amt;
            highestCat = cat;
        }
    }

    const share = Math.round((highestAmount / totalExpense) * 100);

    let insightText = `📊 <strong>AI Analysis:</strong> Your highest expenditure is on <strong>"${highestCat.toUpperCase()}"</strong>, making up <strong>${share}%</strong> (₹${highestAmount.toLocaleString('en-IN')}) of your total spending. <br><br>`;

    if (monthlyBudget > 0 && totalExpense > monthlyBudget) {
        const extra = totalExpense - monthlyBudget;
        insightText += `⚠️ <strong>Alert:</strong> You have exceeded your monthly budget by <strong>₹${extra.toLocaleString('en-IN')}</strong>! It is recommended to curb discretionary expenses.`;
    } else if (share >= 50) {
        insightText += `⚠️ <strong>Tip:</strong> More than 50% of your total spending is concentrated in this single category. Reducing costs here will significantly boost your monthly savings.`;
    } else {
        insightText += `✅ <strong>Good Job:</strong> Your expenses appear well-balanced across categories. Keep tracking regularly to stay on top of your financial goals!`;
    }

    insightBox.innerHTML = insightText;
}

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}
