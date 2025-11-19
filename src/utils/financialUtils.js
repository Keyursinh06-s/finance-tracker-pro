/**
 * Financial Utilities Library
 * Comprehensive collection of financial calculations, data processing, and helper functions
 */

// ==================== CURRENCY FORMATTING ====================

/**
 * Format number as currency with locale support
 */
export const formatCurrency = (amount, currency = 'USD', locale = 'en-US') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Parse currency string to number
 */
export const parseCurrency = (currencyString) => {
  return parseFloat(currencyString.replace(/[^0-9.-]+/g, ''));
};

/**
 * Format large numbers with abbreviations (K, M, B)
 */
export const formatCompactCurrency = (amount, currency = 'USD', locale = 'en-US') => {
  if (amount >= 1000000000) {
    return `${(amount / 1000000000).toFixed(1)}B`;
  } else if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`;
  }
  return formatCurrency(amount, currency, locale);
};

// ==================== DATE UTILITIES ====================

/**
 * Get date range for current month
 */
export const getCurrentMonthRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { start, end };
};

/**
 * Get date range for last N days
 */
export const getLastNDaysRange = (days) => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  return { start, end };
};

/**
 * Format date for display
 */
export const formatDate = (date, format = 'short') => {
  const d = new Date(date);
  const options = {
    short: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
    time: { hour: '2-digit', minute: '2-digit' },
  };
  return d.toLocaleDateString('en-US', options[format]);
};

/**
 * Get month name from date
 */
export const getMonthName = (date, format = 'long') => {
  return new Date(date).toLocaleString('en-US', { month: format });
};

/**
 * Check if date is in current month
 */
export const isCurrentMonth = (date) => {
  const d = new Date(date);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
};

// ==================== EXPENSE CALCULATIONS ====================

/**
 * Calculate total expenses from array
 */
export const calculateTotalExpenses = (expenses) => {
  return expenses.reduce((total, expense) => total + parseFloat(expense.amount || 0), 0);
};

/**
 * Group expenses by category
 */
export const groupExpensesByCategory = (expenses) => {
  return expenses.reduce((acc, expense) => {
    const category = expense.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = { total: 0, count: 0, expenses: [] };
    }
    acc[category].total += parseFloat(expense.amount || 0);
    acc[category].count += 1;
    acc[category].expenses.push(expense);
    return acc;
  }, {});
};

/**
 * Group expenses by date
 */
export const groupExpensesByDate = (expenses) => {
  return expenses.reduce((acc, expense) => {
    const date = new Date(expense.date).toDateString();
    if (!acc[date]) {
      acc[date] = { total: 0, count: 0, expenses: [] };
    }
    acc[date].total += parseFloat(expense.amount || 0);
    acc[date].count += 1;
    acc[date].expenses.push(expense);
    return acc;
  }, {});
};

/**
 * Group expenses by month
 */
export const groupExpensesByMonth = (expenses) => {
  return expenses.reduce((acc, expense) => {
    const date = new Date(expense.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!acc[monthKey]) {
      acc[monthKey] = { total: 0, count: 0, expenses: [] };
    }
    acc[monthKey].total += parseFloat(expense.amount || 0);
    acc[monthKey].count += 1;
    acc[monthKey].expenses.push(expense);
    return acc;
  }, {});
};

/**
 * Filter expenses by date range
 */
export const filterExpensesByDateRange = (expenses, startDate, endDate) => {
  const start = new Date(startDate).setHours(0, 0, 0, 0);
  const end = new Date(endDate).setHours(23, 59, 59, 999);
  return expenses.filter(expense => {
    const expenseDate = new Date(expense.date).getTime();
    return expenseDate >= start && expenseDate <= end;
  });
};

/**
 * Filter expenses by category
 */
export const filterExpensesByCategory = (expenses, categories) => {
  const categoryArray = Array.isArray(categories) ? categories : [categories];
  return expenses.filter(expense => categoryArray.includes(expense.category));
};

/**
 * Get top spending categories
 */
export const getTopCategories = (expenses, limit = 5) => {
  const grouped = groupExpensesByCategory(expenses);
  return Object.entries(grouped)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, limit)
    .map(([category, data]) => ({ category, ...data }));
};

// ==================== BUDGET CALCULATIONS ====================

/**
 * Calculate budget utilization percentage
 */
export const calculateBudgetUtilization = (spent, budget) => {
  if (budget === 0) return 0;
  return Math.min((spent / budget) * 100, 100);
};

/**
 * Calculate remaining budget
 */
export const calculateRemainingBudget = (budget, spent) => {
  return Math.max(budget - spent, 0);
};

/**
 * Check if budget is exceeded
 */
export const isBudgetExceeded = (spent, budget) => {
  return spent > budget;
};

/**
 * Calculate budget status
 */
export const getBudgetStatus = (spent, budget) => {
  const utilization = calculateBudgetUtilization(spent, budget);
  if (utilization >= 100) return 'exceeded';
  if (utilization >= 90) return 'warning';
  if (utilization >= 75) return 'caution';
  return 'healthy';
};

/**
 * Calculate daily budget allowance
 */
export const calculateDailyAllowance = (budget, spent, daysInMonth, currentDay) => {
  const remaining = budget - spent;
  const daysLeft = daysInMonth - currentDay;
  return daysLeft > 0 ? remaining / daysLeft : 0;
};

// ==================== STATISTICS & ANALYTICS ====================

/**
 * Calculate average expense
 */
export const calculateAverageExpense = (expenses) => {
  if (expenses.length === 0) return 0;
  return calculateTotalExpenses(expenses) / expenses.length;
};

/**
 * Calculate median expense
 */
export const calculateMedianExpense = (expenses) => {
  if (expenses.length === 0) return 0;
  const sorted = expenses.map(e => parseFloat(e.amount)).sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
};

/**
 * Find largest expense
 */
export const findLargestExpense = (expenses) => {
  if (expenses.length === 0) return null;
  return expenses.reduce((max, expense) => 
    parseFloat(expense.amount) > parseFloat(max.amount) ? expense : max
  );
};

/**
 * Find smallest expense
 */
export const findSmallestExpense = (expenses) => {
  if (expenses.length === 0) return null;
  return expenses.reduce((min, expense) => 
    parseFloat(expense.amount) < parseFloat(min.amount) ? expense : min
  );
};

/**
 * Calculate spending trend (increase/decrease percentage)
 */
export const calculateSpendingTrend = (currentPeriod, previousPeriod) => {
  if (previousPeriod === 0) return currentPeriod > 0 ? 100 : 0;
  return ((currentPeriod - previousPeriod) / previousPeriod) * 100;
};

/**
 * Calculate category distribution percentages
 */
export const calculateCategoryDistribution = (expenses) => {
  const total = calculateTotalExpenses(expenses);
  const grouped = groupExpensesByCategory(expenses);
  return Object.entries(grouped).map(([category, data]) => ({
    category,
    amount: data.total,
    percentage: total > 0 ? (data.total / total) * 100 : 0,
    count: data.count,
  }));
};

// ==================== DATA VALIDATION ====================

/**
 * Validate expense object
 */
export const validateExpense = (expense) => {
  const errors = [];
  if (!expense.amount || isNaN(parseFloat(expense.amount))) {
    errors.push('Invalid amount');
  }
  if (parseFloat(expense.amount) <= 0) {
    errors.push('Amount must be positive');
  }
  if (!expense.category || expense.category.trim() === '') {
    errors.push('Category is required');
  }
  if (!expense.date) {
    errors.push('Date is required');
  }
  return { isValid: errors.length === 0, errors };
};

/**
 * Validate budget object
 */
export const validateBudget = (budget) => {
  const errors = [];
  if (!budget.amount || isNaN(parseFloat(budget.amount))) {
    errors.push('Invalid budget amount');
  }
  if (parseFloat(budget.amount) <= 0) {
    errors.push('Budget must be positive');
  }
  if (!budget.category || budget.category.trim() === '') {
    errors.push('Category is required');
  }
  return { isValid: errors.length === 0, errors };
};

// ==================== CHART DATA PREPARATION ====================

/**
 * Prepare data for pie chart
 */
export const preparePieChartData = (expenses) => {
  const distribution = calculateCategoryDistribution(expenses);
  return distribution.map(item => ({
    name: item.category,
    value: item.amount,
    percentage: item.percentage.toFixed(1),
  }));
};

/**
 * Prepare data for line chart (monthly trend)
 */
export const prepareLineChartData = (expenses, months = 6) => {
  const grouped = groupExpensesByMonth(expenses);
  const sortedMonths = Object.keys(grouped).sort().slice(-months);
  return sortedMonths.map(month => ({
    month: getMonthName(new Date(month + '-01'), 'short'),
    amount: grouped[month].total,
    count: grouped[month].count,
  }));
};

/**
 * Prepare data for bar chart (category comparison)
 */
export const prepareBarChartData = (expenses) => {
  const grouped = groupExpensesByCategory(expenses);
  return Object.entries(grouped)
    .sort((a, b) => b[1].total - a[1].total)
    .map(([category, data]) => ({
      category,
      amount: data.total,
      count: data.count,
    }));
};

// ==================== EXPORT/IMPORT UTILITIES ====================

/**
 * Export expenses to CSV
 */
export const exportToCSV = (expenses) => {
  const headers = ['Date', 'Category', 'Amount', 'Description', 'Payment Method'];
  const rows = expenses.map(expense => [
    formatDate(expense.date),
    expense.category,
    expense.amount,
    expense.description || '',
    expense.paymentMethod || '',
  ]);
  const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
  return csv;
};

/**
 * Download CSV file
 */
export const downloadCSV = (expenses, filename = 'expenses.csv') => {
  const csv = exportToCSV(expenses);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
};

/**
 * Export expenses to JSON
 */
export const exportToJSON = (expenses) => {
  return JSON.stringify(expenses, null, 2);
};

/**
 * Download JSON file
 */
export const downloadJSON = (expenses, filename = 'expenses.json') => {
  const json = exportToJSON(expenses);
  const blob = new Blob([json], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
};

// ==================== SEARCH & FILTER ====================

/**
 * Search expenses by keyword
 */
export const searchExpenses = (expenses, keyword) => {
  const lowerKeyword = keyword.toLowerCase();
  return expenses.filter(expense => 
    expense.description?.toLowerCase().includes(lowerKeyword) ||
    expense.category?.toLowerCase().includes(lowerKeyword) ||
    expense.amount?.toString().includes(keyword)
  );
};

/**
 * Sort expenses
 */
export const sortExpenses = (expenses, sortBy = 'date', order = 'desc') => {
  const sorted = [...expenses].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.date) - new Date(b.date);
        break;
      case 'amount':
        comparison = parseFloat(a.amount) - parseFloat(b.amount);
        break;
      case 'category':
        comparison = a.category.localeCompare(b.category);
        break;
      default:
        comparison = 0;
    }
    return order === 'desc' ? -comparison : comparison;
  });
  return sorted;
};

// ==================== RECURRING EXPENSES ====================

/**
 * Identify potential recurring expenses
 */
export const identifyRecurringExpenses = (expenses, threshold = 3) => {
  const grouped = expenses.reduce((acc, expense) => {
    const key = `${expense.category}-${expense.amount}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(expense);
    return acc;
  }, {});

  return Object.entries(grouped)
    .filter(([_, items]) => items.length >= threshold)
    .map(([key, items]) => ({
      category: items[0].category,
      amount: items[0].amount,
      frequency: items.length,
      expenses: items,
    }));
};

// ==================== SAVINGS CALCULATIONS ====================

/**
 * Calculate savings rate
 */
export const calculateSavingsRate = (income, expenses) => {
  if (income === 0) return 0;
  const savings = income - expenses;
  return (savings / income) * 100;
};

/**
 * Calculate projected savings
 */
export const calculateProjectedSavings = (monthlyIncome, monthlyExpenses, months = 12) => {
  const monthlySavings = monthlyIncome - monthlyExpenses;
  return monthlySavings * months;
};

/**
 * Calculate time to savings goal
 */
export const calculateTimeToGoal = (currentSavings, goal, monthlySavings) => {
  if (monthlySavings <= 0) return Infinity;
  const remaining = goal - currentSavings;
  return Math.ceil(remaining / monthlySavings);
};

// ==================== UTILITY HELPERS ====================

/**
 * Generate unique ID
 */
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Deep clone object
 */
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

/**
 * Debounce function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// ==================== COLOR UTILITIES ====================

/**
 * Get color for budget status
 */
export const getBudgetStatusColor = (status) => {
  const colors = {
    healthy: '#10b981',
    caution: '#f59e0b',
    warning: '#ef4444',
    exceeded: '#dc2626',
  };
  return colors[status] || colors.healthy;
};

/**
 * Generate category colors
 */
export const generateCategoryColors = (categories) => {
  const colors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#84cc16',
  ];
  return categories.reduce((acc, category, index) => {
    acc[category] = colors[index % colors.length];
    return acc;
  }, {});
};

export default {
  formatCurrency,
  parseCurrency,
  formatCompactCurrency,
  getCurrentMonthRange,
  getLastNDaysRange,
  formatDate,
  getMonthName,
  isCurrentMonth,
  calculateTotalExpenses,
  groupExpensesByCategory,
  groupExpensesByDate,
  groupExpensesByMonth,
  filterExpensesByDateRange,
  filterExpensesByCategory,
  getTopCategories,
  calculateBudgetUtilization,
  calculateRemainingBudget,
  isBudgetExceeded,
  getBudgetStatus,
  calculateDailyAllowance,
  calculateAverageExpense,
  calculateMedianExpense,
  findLargestExpense,
  findSmallestExpense,
  calculateSpendingTrend,
  calculateCategoryDistribution,
  validateExpense,
  validateBudget,
  preparePieChartData,
  prepareLineChartData,
  prepareBarChartData,
  exportToCSV,
  downloadCSV,
  exportToJSON,
  downloadJSON,
  searchExpenses,
  sortExpenses,
  identifyRecurringExpenses,
  calculateSavingsRate,
  calculateProjectedSavings,
  calculateTimeToGoal,
  generateId,
  deepClone,
  debounce,
  throttle,
  getBudgetStatusColor,
  generateCategoryColors,
};