let budgets = {};
let pieChart;
let monthlyChart;

const incomeCategories = ["Salary", "Business", "Freelance", "Investments"];
const expenseCategories = ["Rent", "Food", "Transport", "Entertainment", "Utilities"];

function getMonth() {
    return document.getElementById("month").value;
}

function initializeCategories() {
    let incomeContainer = document.getElementById("income-sections");
    let expenseContainer = document.getElementById("expense-sections");

    incomeContainer.innerHTML = "";
    expenseContainer.innerHTML = "";

    incomeCategories.forEach(cat => {
        incomeContainer.innerHTML += createCategoryCard(cat, "income");
    });

    expenseCategories.forEach(cat => {
        expenseContainer.innerHTML += createCategoryCard(cat, "expense");
    });
}

function createCategoryCard(category, type) {
    return `
        <div class="col-xl-3 col-lg-4 col-md-6 mb-3">
            <div class="card shadow-sm p-3 h-100">
                <h6>${category}</h6>
                <ul class="list-group small" id="${type}-${category}-list"></ul>
            </div>
        </div>
    `;
}

function populateCategoryDropdown() {
    const typeSelect = document.getElementById("transaction-type");
    const categorySelect = document.getElementById("transaction-category");
    const descriptionContainer = document.getElementById("description-container");

    function updateCategories() {
        const type = typeSelect.value;
        const categories = type === "income" ? incomeCategories : expenseCategories;

        categorySelect.innerHTML = "";
        categories.forEach(cat => {
            const option = document.createElement("option");
            option.value = cat;
            option.innerText = cat;
            categorySelect.appendChild(option);
        });

        // Show description field only for Expense
        descriptionContainer.style.display = type === "expense" ? "block" : "none";
    }

    typeSelect.addEventListener("change", updateCategories);
    updateCategories();
}

function addTransactionFromSection() {
    const type = document.getElementById("transaction-type").value;
    const category = document.getElementById("transaction-category").value;
    const amount = parseFloat(document.getElementById("transaction-amount").value) || 0;
    const description = document.getElementById("transaction-description").value;

    if (!getMonth()) return alert("Select a month first.");
    if (amount <= 0) return alert("Enter a valid amount.");

    addTransaction(category, type, amount, description);

    document.getElementById("transaction-amount").value = "";
    document.getElementById("transaction-description").value = "";
}

function addTransaction(category, type, amount, description = "") {
    let month = getMonth();
    if (!budgets[month]) budgets[month] = { income: {}, expenses: {} };

    const transaction = { amount, description };

    if (type === "income") {
        if (!budgets[month].income[category]) budgets[month].income[category] = [];
        budgets[month].income[category].push(transaction);
    } else {
        if (!budgets[month].expenses[category]) budgets[month].expenses[category] = [];
        budgets[month].expenses[category].push(transaction);
    }

    updateAll();
}

function loadMonthData() {
    updateAll();
}

function updateAll() {
    updateLists();
    updateSummary();
    updatePieChart();
    updateMonthlyChart();
}

function updateLists() {
    let month = getMonth();
    if (!budgets[month]) return;

    incomeCategories.forEach(cat => {
        let list = document.getElementById(`income-${cat}-list`);
        list.innerHTML = "";

        let items = budgets[month].income[cat] || [];
        items.forEach(t => {
            list.innerHTML += `<li class="list-group-item">R${t.amount.toFixed(2)}</li>`;
        });
    });

    expenseCategories.forEach(cat => {
        let list = document.getElementById(`expense-${cat}-list`);
        list.innerHTML = "";

        let items = budgets[month].expenses[cat] || [];
        items.forEach(t => {
            list.innerHTML += `
                <li class="list-group-item">
                    R${t.amount.toFixed(2)}
                    ${t.description ? `<div class="small text-muted">${t.description}</div>` : ""}
                </li>`;
        });
    });
}

function updateSummary() {
    let month = getMonth();
    if (!budgets[month]) {
        document.getElementById("total-income").innerText = "0.00";
        document.getElementById("total-expenses").innerText = "0.00";
        document.getElementById("balance").innerText = "R0.00";
        return;
    }

    let totalIncome = 0;
    let totalExpenses = 0;

    Object.values(budgets[month].income).forEach(arr => totalIncome += arr.reduce((a, t) => a + t.amount, 0));
    Object.values(budgets[month].expenses).forEach(arr => totalExpenses += arr.reduce((a, t) => a + t.amount, 0));

    let balance = totalIncome - totalExpenses;

    document.getElementById("total-income").innerText = totalIncome.toFixed(2);
    document.getElementById("total-expenses").innerText = totalExpenses.toFixed(2);
    document.getElementById("balance").innerText = "R" + balance.toFixed(2);
}

function updatePieChart() {
    let month = getMonth();
    if (!budgets[month]) return;

    let labels = [];
    let data = [];

    Object.entries(budgets[month].expenses).forEach(([cat, arr]) => {
        let total = arr.reduce((a, t) => a + t.amount, 0);
        if (total > 0) {
            labels.push(cat);
            data.push(total);
        }
    });

    if (pieChart) pieChart.destroy();

    pieChart = new Chart(document.getElementById("expensePieChart"), {
        type: "pie",
        data: { labels: labels, datasets: [{ data: data }] }
    });
}

function updateMonthlyChart() {
    let months = Object.keys(budgets);
    let incomes = [];
    let expenses = [];

    months.forEach(month => {
        let totalIncome = 0;
        let totalExpenses = 0;

        Object.values(budgets[month].income).forEach(arr => totalIncome += arr.reduce((a, t) => a + t.amount, 0));
        Object.values(budgets[month].expenses).forEach(arr => totalExpenses += arr.reduce((a, t) => a + t.amount, 0));

        incomes.push(totalIncome);
        expenses.push(totalExpenses);
    });

    if (monthlyChart) monthlyChart.destroy();

    monthlyChart = new Chart(document.getElementById("monthlyChart"), {
        type: "bar",
        data: {
            labels: months,
            datasets: [
                { label: "Income", data: incomes, backgroundColor: "rgba(40, 167, 69, 0.7)" },
                { label: "Expenses", data: expenses, backgroundColor: "rgba(220, 53, 69, 0.7)" }
            ]
        }
    });
}

document.addEventListener("DOMContentLoaded", function () {
    initializeCategories();
    populateCategoryDropdown();
});
