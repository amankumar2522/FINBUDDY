// ================= BASIC DATA =================

let income = 40000;
let expense = 15000;
let budget = 25000;


// ================= LOGIN =================

function login() {

    let email = document.getElementById("email").value;
    let password = document.getElementById("password").value;

    if (email === "" || password === "") {
        alert("Please enter email and password");
        return;
    }

    document.getElementById("loginPage").style.display = "none";
    document.getElementById("dashboard").style.display = "block";

    updateDashboard();
}


// ================= LOGOUT =================

function logout() {

    document.getElementById("dashboard").style.display = "none";
    document.getElementById("loginPage").style.display = "flex";

}


// ================= DASHBOARD =================

function updateDashboard() {

    let balance = income - expense;
    let remaining = budget - expense;

    document.getElementById("balance").innerText =
        "₹" + balance;

    document.getElementById("income").innerText =
        "₹" + income;

    document.getElementById("expense").innerText =
        "₹" + expense;

    document.getElementById("budgetLeft").innerText =
        "₹" + remaining;

    updateBudgetMessage();
    checkBudgetAlert();
}


// ================= ADD TRANSACTION =================

function addTransaction() {

    let type =
        document.getElementById("transactionType").value;

    let amount =
        Number(document.getElementById("amount").value);

    let category =
        document.getElementById("category").value;


    if (amount <= 0 || category === "") {

        alert("Please enter valid transaction details");

        return;
    }


    if (type === "income") {

        income += amount;

    } else {

        expense += amount;

    }


    let transactionList =
        document.getElementById("transactionList");


    let transaction =
        document.createElement("div");

    transaction.className = "transaction-item";


    if (type === "income") {

        transaction.innerHTML = `
            <div>
                <strong>${category}</strong>
                <small>Income</small>
            </div>

            <span class="income-text">
                + ₹${amount}
            </span>
        `;

    } else {

        transaction.innerHTML = `
            <div>
                <strong>${category}</strong>
                <small>Expense</small>
            </div>

            <span class="expense-text">
                - ₹${amount}
            </span>
        `;

    }


    transactionList.prepend(transaction);


    document.getElementById("amount").value = "";
    document.getElementById("category").value = "";


    updateDashboard();

}


// ================= SET BUDGET =================

function setBudget() {

    let newBudget =
        Number(document.getElementById("newBudget").value);


    if (newBudget <= 0) {

        alert("Please enter a valid budget");

        return;
    }


    budget = newBudget;

    document.getElementById("showBudget").innerText =
        "₹" + budget;

    document.getElementById("newBudget").value = "";

    updateDashboard();

    alert("Budget set successfully!");

}


// ================= BUDGET MESSAGE =================

function updateBudgetMessage() {

    let remaining = budget - expense;

    let message =
        document.getElementById("budgetMessage");


    if (remaining < 0) {

        message.innerText =
            "⚠️ You have exceeded your monthly budget by ₹" +
            Math.abs(remaining);

    }

    else {

        message.innerText =
            "You have ₹" + remaining + " remaining.";

    }

}


// ================= SMART BUDGET ALERT =================

function checkBudgetAlert() {

    let percentage =
        (expense / budget) * 100;


    if (percentage >= 100) {

        alert(
            "⚠️ Budget Alert!\n\n" +
            "You have exceeded your monthly budget."
        );

    }

    else if (percentage >= 80) {

        alert(
            "⚠️ Budget Warning!\n\n" +
            "You have used more than 80% of your monthly budget."
        );

    }

}


// ================= AI INSIGHT =================

function generateInsight() {

    let percentage =
        (expense / budget) * 100;

    let message = "";


    if (percentage >= 100) {

        message =
            "⚠️ Your spending has exceeded the monthly budget. Try reducing unnecessary expenses.";

    }

    else if (percentage >= 80) {

        message =
            "⚠️ You have used more than 80% of your budget. Be careful with your remaining spending.";

    }

    else if (percentage >= 50) {

        message =
            "📊 You have used more than half of your budget. Keep monitoring your expenses.";

    }

    else {

        message =
            "✅ Great job! Your spending is currently under control.";

    }


    document.getElementById("aiInsight").innerText =
        message;

}