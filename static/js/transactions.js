// static/js/transactions.js
document.addEventListener('DOMContentLoaded', function() {
    // Transaction form handling
    const transactionForm = document.getElementById('transaction-form');
    if (transactionForm) {
        transactionForm.addEventListener('submit', function(e) {
            // Add form validation here
        });
    }
document.addEventListener('DOMContentLoaded', function() {
    // Handle edit transaction modal
    const editButtons = document.querySelectorAll('.edit-transaction');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const transactionId = this.dataset.id;
            const form = document.getElementById('edit-transaction-form');
            
            // Update form action
            form.action = `/update_transaction/${transactionId}`;
            
            // Populate form fields
            document.getElementById('edit-type').value = this.dataset.type;
            document.getElementById('edit-category').value = this.dataset.category;
            document.getElementById('edit-amount').value = this.dataset.amount;
            document.getElementById('edit-description').value = this.dataset.description;
            document.getElementById('edit-date').value = this.dataset.date;
        });
    });

    // Confirm delete
    const deleteForms = document.querySelectorAll('.delete-transaction-form');
    deleteForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!confirm('Are you sure you want to delete this transaction?')) {
                e.preventDefault();
            }
        });
    });
});
/* More aggressive styling */
select.form-select,
select.form-select *,
select.form-select option,
select.form-select option:checked {
    background-color: #ffffff !important;
    color: #000000 !important;
    -webkit-appearance: menulist !important;
    -moz-appearance: menulist !important;
    appearance: menulist !important;
}

/* Fix for Firefox */
@-moz-document url-prefix() {
    select.form-select {
        color: #000000 !important;
        background-color: #ffffff !important;
    }
}

/* Fix for Chrome */
@media screen and (-webkit-min-device-pixel-ratio:0) {
    select.form-select {
        color: #000000 !important;
        background-color: #ffffff !important;
    }
}

    // Delete transaction confirmation
    const deleteButtons = document.querySelectorAll('.delete-transaction');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            if (!confirm('Are you sure you want to delete this transaction?')) {
                e.preventDefault();
            }
        });
    });

    // Edit transaction handling
    const editButtons = document.querySelectorAll('.edit-transaction');
    editButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Handle edit modal
        });
    });
});
