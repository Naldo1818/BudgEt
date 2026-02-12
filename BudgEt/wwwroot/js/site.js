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

                <input type="number" 
                       placeholder="Amount (R)" 
                       class="form-control mb-2"
                       id="${type}-${category}-input">

                <button class="btn btn-sm ${type === "income" ? "btn-success" : "btn-danger"} w-100 mb-2"
                        onclick="addTransaction('${category}', '${type}')">
                        Add
                </button>

                <ul class="list-group small" id="${type}-${category}-list"></ul>
            </div>
        </div>
    `;
}

function loadMonthData() {
    updateAll();
}

function addTransaction(category, type) {
    let month = getMonth();
    if (!month) return alert("Select a month first.");

    if (!budgets[month]) {
        budgets[month] = { income: {}, expenses: {} };
    }

    let input = document.getElementById(`${type}-${category}-input`);
    let amount = parseFloat(input.value) || 0;
    if (amount <= 0) return;

    if (type === "income") {
        if (!budgets[month].income[category])
            budgets[month].income[category] = [];

        budgets[month].income[category].push(amount);
    } else {
        if (!budgets[month].expenses[category])
            budgets[month].expenses[category] = [];

        budgets[month].expenses[category].push(amount);
    }

    input.value = "";
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
        items.forEach(amount => {
            list.innerHTML += `<li class="list-group-item">R${amount.toFixed(2)}</li>`;
        });
    });

    expenseCategories.forEach(cat => {
        let list = document.getElementById(`expense-${cat}-list`);
        list.innerHTML = "";

        let items = budgets[month].expenses[cat] || [];
        items.forEach(amount => {
            list.innerHTML += `<li class="list-group-item">R${amount.toFixed(2)}</li>`;
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

    Object.values(budgets[month].income).forEach(arr => {
        totalIncome += arr.reduce((a, b) => a + b, 0);
    });

    Object.values(budgets[month].expenses).forEach(arr => {
        totalExpenses += arr.reduce((a, b) => a + b, 0);
    });

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
        let total = arr.reduce((a, b) => a + b, 0);
        if (total > 0) {
            labels.push(cat);
            data.push(total);
        }
    });

    if (pieChart) pieChart.destroy();

    pieChart = new Chart(document.getElementById("expensePieChart"), {
        type: "pie",
        data: {
            labels: labels,
            datasets: [{
                data: data
            }]
        }
    });
}

function updateMonthlyChart() {
    let months = Object.keys(budgets);
    let incomes = [];
    let expenses = [];

    months.forEach(month => {
        let totalIncome = 0;
        let totalExpenses = 0;

        Object.values(budgets[month].income).forEach(arr => {
            totalIncome += arr.reduce((a, b) => a + b, 0);
        });

        Object.values(budgets[month].expenses).forEach(arr => {
            totalExpenses += arr.reduce((a, b) => a + b, 0);
        });

        incomes.push(totalIncome);
        expenses.push(totalExpenses);
    });

    if (monthlyChart) monthlyChart.destroy();

    monthlyChart = new Chart(document.getElementById("monthlyChart"), {
        type: "bar",
        data: {
            labels: months,
            datasets: [
                { label: "Income", data: incomes },
                { label: "Expenses", data: expenses }
            ]
        }
    });
}

document.addEventListener("DOMContentLoaded", function () {
    initializeCategories();
});
