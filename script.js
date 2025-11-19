// Data Storage
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let budgets = JSON.parse(localStorage.getItem('budgets')) || {};

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initForms();
    setDefaultDate();
    updateDashboard();
    renderTransactions();
    renderBudgets();
    renderReports();
});

// Navigation
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.dataset.section;
            showSection(section);
            
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    document.getElementById(sectionId).classList.add('active');
    
    if (sectionId === 'dashboard') updateDashboard();
    if (sectionId === 'budget') renderBudgets();
    if (sectionId === 'reports') renderReports();
}

// Forms
function initForms() {
    document.getElementById('transactionForm').addEventListener('submit', addTransaction);
    document.getElementById('budgetForm').addEventListener('submit', setBudget);
    document.getElementById('filterType').addEventListener('change', renderTransactions);
    document.getElementById('filterCategory').addEventListener('change', renderTransactions);
    document.getElementById('searchTransaction').addEventListener('input', renderTransactions);
}

function setDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('transactionDate').value = today;
}

// Transaction Management
function addTransaction(e) {
    e.preventDefault();
    
    const transaction = {
        id: Date.now(),
        type: document.getElementById('transactionType').value,
        amount: parseFloat(document.getElementById('transactionAmount').value),
        category: document.getElementById('transactionCategory').value,
        description: document.getElementById('transactionDescription').value,
        date: document.getElementById('transactionDate').value,
        timestamp: new Date().toISOString()
    };
    
    transactions.unshift(transaction);
    saveData();
    
    e.target.reset();
    setDefaultDate();
    
    updateDashboard();
    renderTransactions();
    
    showNotification('Transaction added successfully!', 'success');
}

function deleteTransaction(id) {
    if (confirm('Are you sure you want to delete this transaction?')) {
        transactions = transactions.filter(t => t.id !== id);
        saveData();
        updateDashboard();
        renderTransactions();
        showNotification('Transaction deleted!', 'info');
    }
}

function renderTransactions() {
    const filterType = document.getElementById('filterType').value;
    const filterCategory = document.getElementById('filterCategory').value;
    const searchTerm = document.getElementById('searchTransaction').value.toLowerCase();
    
    let filtered = transactions.filter(t => {
        const matchType = filterType === 'all' || t.type === filterType;
        const matchCategory = filterCategory === 'all' || t.category === filterCategory;
        const matchSearch = t.description.toLowerCase().includes(searchTerm) || 
                          t.category.toLowerCase().includes(searchTerm);
        return matchType && matchCategory && matchSearch;
    });
    
    const list = document.getElementById('transactionsList');
    
    if (filtered.length === 0) {
        list.innerHTML = '<p style="text-align: center; padding: 2rem; color: #9ca3af;">No transactions found</p>';
        return;
    }
    
    list.innerHTML = filtered.map(t => `
        <div class="transaction-item">
            <div class="transaction-info">
                <div class="transaction-icon ${t.type}">
                    ${t.type === 'income' ? '<i class="fas fa-arrow-up"></i>' : '<i class="fas fa-arrow-down"></i>'}
                </div>
                <div class="transaction-details">
                    <h4>${t.description}</h4>
                    <p>${getCategoryName(t.category)} • ${formatDate(t.date)}</p>
                </div>
            </div>
            <div style="display: flex; align-items: center; gap: 1rem;">
                <span class="transaction-amount ${t.type}">
                    ${t.type === 'income' ? '+' : '-'}$${t.amount.toFixed(2)}
                </span>
                <button class="btn-icon" onclick="deleteTransaction(${t.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Budget Management
function setBudget(e) {
    e.preventDefault();
    
    const category = document.getElementById('budgetCategory').value;
    const amount = parseFloat(document.getElementById('budgetAmount').value);
    
    budgets[category] = amount;
    localStorage.setItem('budgets', JSON.stringify(budgets));
    
    e.target.reset();
    renderBudgets();
    showNotification('Budget set successfully!', 'success');
}

function renderBudgets() {
    const container = document.getElementById('budgetOverview');
    
    if (Object.keys(budgets).length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 2rem; color: #9ca3af;">No budgets set yet</p>';
        return;
    }
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    container.innerHTML = Object.entries(budgets).map(([category, budget]) => {
        const spent = transactions
            .filter(t => {
                const tDate = new Date(t.date);
                return t.type === 'expense' && 
                       t.category === category &&
                       tDate.getMonth() === currentMonth &&
                       tDate.getFullYear() === currentYear;
            })
            .reduce((sum, t) => sum + t.amount, 0);
        
        const percentage = (spent / budget) * 100;
        const remaining = budget - spent;
        
        let progressClass = '';
        if (percentage >= 90) progressClass = 'danger';
        else if (percentage >= 70) progressClass = 'warning';
        
        return `
            <div class="budget-item">
                <div class="budget-header">
                    <h4>${getCategoryName(category)}</h4>
                    <span style="color: ${remaining >= 0 ? 'var(--success)' : 'var(--danger)'}; font-weight: bold;">
                        $${remaining.toFixed(2)} remaining
                    </span>
                </div>
                <div class="budget-amounts">
                    <span>Spent: $${spent.toFixed(2)}</span>
                    <span>Budget: $${budget.toFixed(2)}</span>
                    <span>${percentage.toFixed(1)}%</span>
                </div>
                <div class="budget-progress">
                    <div class="budget-progress-bar ${progressClass}" style="width: ${Math.min(percentage, 100)}%"></div>
                </div>
            </div>
        `;
    }).join('');
}

// Dashboard
function updateDashboard() {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
    });
    
    const income = monthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = monthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = income - expenses;
    const savings = income - expenses;
    
    document.getElementById('totalBalance').textContent = `$${balance.toFixed(2)}`;
    document.getElementById('totalIncome').textContent = `$${income.toFixed(2)}`;
    document.getElementById('totalExpenses').textContent = `$${expenses.toFixed(2)}`;
    document.getElementById('totalSavings').textContent = `$${savings.toFixed(2)}`;
    
    renderRecentTransactions();
    renderCharts();
}

function renderRecentTransactions() {
    const recent = transactions.slice(0, 5);
    const container = document.getElementById('recentTransactionsList');
    
    if (recent.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 1rem; color: #9ca3af;">No recent transactions</p>';
        return;
    }
    
    container.innerHTML = recent.map(t => `
        <div class="transaction-item">
            <div class="transaction-info">
                <div class="transaction-icon ${t.type}">
                    ${t.type === 'income' ? '<i class="fas fa-arrow-up"></i>' : '<i class="fas fa-arrow-down"></i>'}
                </div>
                <div class="transaction-details">
                    <h4>${t.description}</h4>
                    <p>${getCategoryName(t.category)} • ${formatDate(t.date)}</p>
                </div>
            </div>
            <span class="transaction-amount ${t.type}">
                ${t.type === 'income' ? '+' : '-'}$${t.amount.toFixed(2)}
            </span>
        </div>
    `).join('');
}

// Charts
function renderCharts() {
    renderCategoryChart();
    renderTrendChart();
}

function renderCategoryChart() {
    const ctx = document.getElementById('categoryChart');
    if (!ctx) return;
    
    const expenses = transactions.filter(t => t.type === 'expense');
    const categoryData = {};
    
    expenses.forEach(t => {
        categoryData[t.category] = (categoryData[t.category] || 0) + t.amount;
    });
    
    if (window.categoryChartInstance) {
        window.categoryChartInstance.destroy();
    }
    
    window.categoryChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(categoryData).map(c => getCategoryName(c)),
            datasets: [{
                data: Object.values(categoryData),
                backgroundColor: [
                    '#667eea', '#764ba2', '#10b981', '#ef4444', 
                    '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function renderTrendChart() {
    const ctx = document.getElementById('trendChart');
    if (!ctx) return;
    
    const last6Months = [];
    const incomeData = [];
    const expenseData = [];
    
    for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const month = date.toLocaleString('default', { month: 'short' });
        last6Months.push(month);
        
        const monthTransactions = transactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate.getMonth() === date.getMonth() && 
                   tDate.getFullYear() === date.getFullYear();
        });
        
        const income = monthTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const expense = monthTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        incomeData.push(income);
        expenseData.push(expense);
    }
    
    if (window.trendChartInstance) {
        window.trendChartInstance.destroy();
    }
    
    window.trendChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: last6Months,
            datasets: [
                {
                    label: 'Income',
                    data: incomeData,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Expenses',
                    data: expenseData,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Reports
function renderReports() {
    renderTopCategories();
    renderMonthlyChart();
    renderFinancialSummary();
}

function renderTopCategories() {
    const expenses = transactions.filter(t => t.type === 'expense');
    const categoryData = {};
    
    expenses.forEach(t => {
        categoryData[t.category] = (categoryData[t.category] || 0) + t.amount;
    });
    
    const sorted = Object.entries(categoryData)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    const container = document.getElementById('topCategories');
    
    if (sorted.length === 0) {
        container.innerHTML = '<p style="text-align: center; padding: 1rem; color: #9ca3af;">No data available</p>';
        return;
    }
    
    container.innerHTML = sorted.map(([category, amount]) => `
        <div class="category-item">
            <span class="category-name">${getCategoryName(category)}</span>
            <span class="category-amount">$${amount.toFixed(2)}</span>
        </div>
    `).join('');
}

function renderMonthlyChart() {
    const ctx = document.getElementById('monthlyChart');
    if (!ctx) return;
    
    const last12Months = [];
    const data = [];
    
    for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const month = date.toLocaleString('default', { month: 'short' });
        last12Months.push(month);
        
        const monthTransactions = transactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate.getMonth() === date.getMonth() && 
                   tDate.getFullYear() === date.getFullYear();
        });
        
        const income = monthTransactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const expense = monthTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        data.push(income - expense);
    }
    
    if (window.monthlyChartInstance) {
        window.monthlyChartInstance.destroy();
    }
    
    window.monthlyChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: last12Months,
            datasets: [{
                label: 'Net Savings',
                data: data,
                backgroundColor: data.map(v => v >= 0 ? '#10b981' : '#ef4444')
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function renderFinancialSummary() {
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
    
    const netSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? (netSavings / totalIncome * 100) : 0;
    
    const container = document.getElementById('financialSummary');
    container.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem; padding: 1rem;">
            <div>
                <h4 style="color: #6b7280; margin-bottom: 0.5rem;">Total Income</h4>
                <p style="font-size: 1.5rem; font-weight: bold; color: var(--success);">$${totalIncome.toFixed(2)}</p>
            </div>
            <div>
                <h4 style="color: #6b7280; margin-bottom: 0.5rem;">Total Expenses</h4>
                <p style="font-size: 1.5rem; font-weight: bold; color: var(--danger);">$${totalExpenses.toFixed(2)}</p>
            </div>
            <div>
                <h4 style="color: #6b7280; margin-bottom: 0.5rem;">Net Savings</h4>
                <p style="font-size: 1.5rem; font-weight: bold; color: ${netSavings >= 0 ? 'var(--success)' : 'var(--danger)'};">$${netSavings.toFixed(2)}</p>
            </div>
            <div>
                <h4 style="color: #6b7280; margin-bottom: 0.5rem;">Savings Rate</h4>
                <p style="font-size: 1.5rem; font-weight: bold; color: var(--primary);">${savingsRate.toFixed(1)}%</p>
            </div>
        </div>
    `;
}

// Export Data
function exportData() {
    const csv = [
        ['Date', 'Type', 'Category', 'Description', 'Amount'],
        ...transactions.map(t => [
            t.date,
            t.type,
            getCategoryName(t.category),
            t.description,
            t.amount
        ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finance-tracker-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    showNotification('Data exported successfully!', 'success');
}

// Utilities
function saveData() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

function getCategoryName(category) {
    const names = {
        food: '🍔 Food & Dining',
        transport: '🚗 Transportation',
        shopping: '🛍️ Shopping',
        entertainment: '🎬 Entertainment',
        bills: '💡 Bills & Utilities',
        health: '🏥 Healthcare',
        salary: '💼 Salary',
        freelance: '💻 Freelance',
        investment: '📈 Investment',
        other: '📦 Other'
    };
    return names[category] || category;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? 'var(--success)' : 'var(--info)'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}