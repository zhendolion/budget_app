// static/js/analysis.js
document.addEventListener('DOMContentLoaded', function() {
    // Example chart initialization using Chart.js
    function initializeCharts() {
        // Expense Chart
        const expenseCtx = document.getElementById('expenseChart');
        if (expenseCtx) {
            new Chart(expenseCtx, {
                type: 'pie',
                data: {
                    labels: [],
                    datasets: [{
                        data: [],
                        backgroundColor: []
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        }

        // Income Chart
        const incomeCtx = document.getElementById('incomeChart');
        if (incomeCtx) {
            new Chart(incomeCtx, {
                type: 'bar',
                data: {
                    labels: [],
                    datasets: [{
                        label: 'Income',
                        data: [],
                        backgroundColor: 'rgba(46, 204, 113, 0.5)'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false
                }
            });
        }
    }

    initializeCharts();
});
