const transactionForm = document.getElementById('transaction-form');
const transactionList = document.getElementById('transaction-list');
const totalIncomeEl = document.getElementById('total-income');
const totalExpensesEl = document.getElementById('total-expenses');
const balanceEl = document.getElementById('balance');
const filterBtns = document.querySelectorAll('.filter-btn');
const currentYearEl = document.getElementById('current-year');

let transactions = JSON.parse(localStorage.getItem('budget-transactions')) || [];
let currentFilter = 'all';

let chart;
const ctx = document.getElementById('chart').getContext('2d');

function formatCurrency(amount) {
    return '$' + amount.toFixed(2);
}

function updateSummary() {
    const incomeTotal = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const expenseTotal = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = incomeTotal - expenseTotal;
    
    totalIncomeEl.textContent = formatCurrency(incomeTotal);
    totalExpensesEl.textContent = formatCurrency(expenseTotal);
    balanceEl.textContent = formatCurrency(balance);
    
    initChart();
}

function initChart() {
    if (chart) chart.destroy();
    
    const incomeTotal = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const expenseTotal = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    chart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Income', 'Expenses'],
            datasets: [{
                data: [incomeTotal, expenseTotal],
                backgroundColor: ['#27ae60', '#e74c3c'],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

function renderTransactions() {
    transactionList.innerHTML = '';
    
    const filteredTransactions = currentFilter === 'all' 
        ? transactions 
        : transactions.filter(t => t.type === currentFilter);
    
    if (filteredTransactions.length === 0) {
        transactionList.innerHTML = `
            <div class="transaction-item" style="justify-content: center; color: #7f8c8d;">
                No transactions to display
            </div>
        `;
        return;
    }
    
    filteredTransactions.forEach((transaction, index) => {
        const transactionEl = document.createElement('div');
        transactionEl.className = 'transaction-item';
        transactionEl.innerHTML = `
            <div class="transaction-details">
                <div class="transaction-desc">${transaction.description}</div>
                <div class="transaction-amount ${transaction.type}">
                    ${formatCurrency(transaction.amount)}
                </div>
            </div>
            <button class="delete-btn" data-index="${index}">Delete</button>
        `;
        transactionList.appendChild(transactionEl);
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.getAttribute('data-index'));
            deleteTransaction(index);
        });
    });
}

function addTransaction(description, amount, type) {
    const transaction = {
        id: Date.now(),
        description,
        amount: parseFloat(amount),
        type
    };
    
    transactions.push(transaction);
    saveTransactions();
    updateSummary();
    renderTransactions();
}

function deleteTransaction(index) {
    transactions.splice(index, 1);
    saveTransactions();
    updateSummary();
    renderTransactions();
}

function saveTransactions() {
    localStorage.setItem('budget-transactions', JSON.stringify(transactions));
}

transactionForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const description = document.getElementById('description').value.trim();
    const amount = document.getElementById('amount').value;
    const type = document.getElementById('type').value;
    
    if (!description || !amount) return;
    
    addTransaction(description, amount, type);
    
    transactionForm.reset();
    document.getElementById('description').focus();
});

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.getAttribute('data-filter');
        renderTransactions();
    });
});

currentYearEl.textContent = new Date().getFullYear();

updateSummary();
renderTransactions();
initChart();