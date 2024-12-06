// static/js/index.js
document.addEventListener('DOMContentLoaded', function() {
    // Update real-time balance
    function updateBalance() {
        fetch('/api/balance')
            .then(response => response.json())
            .then(data => {
                document.getElementById('total-balance').textContent = 
                    formatCurrency(data.balance);
            })
            .catch(error => console.error('Error:', error));
    }

    // Initialize budget progress bars
    function initializeProgressBars() {
        const progressBars = document.querySelectorAll('.progress-bar');
        progressBars.forEach(bar => {
            const percentage = bar.getAttribute('data-percentage');
            bar.style.width = `${percentage}%`;
        });
    }

    // Set up periodic updates
    if (document.getElementById('total-balance')) {
        updateBalance();
        setInterval(updateBalance, 300000); // Update every 5 minutes
    }

    initializeProgressBars();
});
