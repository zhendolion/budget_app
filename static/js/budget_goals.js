document.addEventListener('DOMContentLoaded', function() {
    // Initialize date inputs with today's date
    const dateInputs = document.querySelectorAll('input[type="date"]');
    const today = new Date().toISOString().split('T')[0];
    dateInputs.forEach(input => {
        if (!input.value) {
            input.value = today;
        }
    });

    // Handle Budget Goals Edit
    document.querySelectorAll('.edit-budget').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.dataset.id;
            const amount = this.dataset.amount;
            const period = this.dataset.period;
            const category = this.dataset.category;

            document.getElementById('edit-category').value = category;
            document.getElementById('edit-amount').value = amount;
            document.getElementById('edit-period').value = period;
            
            const form = document.getElementById('edit-budget-form');
            form.action = `/edit_budget_goal/${id}`;
        });
    });

    // Handle Recurring Transactions Edit
    document.querySelectorAll('.edit-recurring').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.dataset.id;
            const type = this.dataset.type;
            const category = this.dataset.category;
            const amount = this.dataset.amount;
            const frequency = this.dataset.frequency;
            const description = this.dataset.description;
            const startDate = this.dataset.startDate;
            const endDate = this.dataset.endDate;
            const isActive = this.dataset.isActive === 'true';

            document.getElementById('edit-type').value = type;
            document.getElementById('edit-category').value = category;
            document.getElementById('edit-amount').value = amount;
            document.getElementById('edit-frequency').value = frequency;
            document.getElementById('edit-description').value = description;
            document.getElementById('edit-start-date').value = startDate;
            if (endDate) {
                document.getElementById('edit-end-date').value = endDate;
            }
            document.getElementById('edit-is-active').checked = isActive;

            const form = document.getElementById('edit-recurring-form');
            form.action = `/edit-recurring-transaction/${id}`;
        });
    });

    // Form Submission Handler for Budget Goals
    const editBudgetForm = document.getElementById('edit-budget-form');
    if (editBudgetForm) {
        editBudgetForm.addEventListener('submit', handleFormSubmit);
    }

    // Form Submission Handler for Recurring Transactions
    const editRecurringForm = document.getElementById('edit-recurring-form');
    if (editRecurringForm) {
        editRecurringForm.addEventListener('submit', handleFormSubmit);
    }

    // Generic Form Submit Handler
    function handleFormSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const submitButton = form.querySelector('button[type="submit"]');
        
        // Disable submit button and show loading state
        if (submitButton) {
            submitButton.disabled = true;
            submitButton.innerHTML = `
                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Saving...
            `;
        }

        // Send form data
        fetch(form.action, {
            method: 'POST',
            body: new FormData(form),
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => {
            if (!response.ok) {
                return response.text().then(text => {
                    throw new Error(text || 'An error occurred');
                });
            }
            return response.json();
        })
        .then(data => {
            // Show success message
            showToast('Success', 'Changes saved successfully!', 'success');
            
            // Close modal if it exists
            const modal = bootstrap.Modal.getInstance(form.closest('.modal'));
            if (modal) {
                modal.hide();
            }
            
            // Reload page to show updated data
            window.location.reload();
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('Error', error.message, 'error');
        })
        .finally(() => {
            // Reset button state
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.innerHTML = 'Save Changes';
            }
        });
    }

    // Toast notification function
    function showToast(title, message, type = 'info') {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            const container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'position-fixed bottom-0 end-0 p-3';
            document.body.appendChild(container);
        }

        const toastElement = document.createElement('div');
        toastElement.className = `toast align-items-center text-white bg-${type === 'error' ? 'danger' : 'success'}`;
        toastElement.setAttribute('role', 'alert');
        toastElement.setAttribute('aria-live', 'assertive');
        toastElement.setAttribute('aria-atomic', 'true');

        toastElement.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    <strong>${title}</strong>: ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;

        document.getElementById('toast-container').appendChild(toastElement);
        const toast = new bootstrap.Toast(toastElement);
        toast.show();

        // Remove toast after it's hidden
        toastElement.addEventListener('hidden.bs.toast', () => {
            toastElement.remove();
        });
    }

    // Delete confirmation handlers
    document.querySelectorAll('.delete-budget, .delete-recurring').forEach(button => {
        button.addEventListener('click', function(e) {
            if (!confirm('Are you sure you want to delete this item?')) {
                e.preventDefault();
            }
        });
    });

    // Amount input formatter
    document.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener('input', function() {
            // Remove non-numeric characters
            this.value = this.value.replace(/[^0-9.]/g, '');
            
            // Ensure only one decimal point
            const parts = this.value.split('.');
            if (parts.length > 2) {
                this.value = parts[0] + '.' + parts.slice(1).join('');
            }
            
            // Ensure minimum value is 0
            if (parseFloat(this.value) < 0) {
                this.value = '0';
            }
        });
    });

    // Category dependent fields
    const typeSelect = document.getElementById('type');
    const categorySelect = document.getElementById('category');

    if (typeSelect && categorySelect) {
        typeSelect.addEventListener('change', function() {
            updateCategoryOptions(this.value);
        });
    }

    // Initialize category options based on initial type
    if (typeSelect && categorySelect) {
        updateCategoryOptions(typeSelect.value);
    }

    function updateCategoryOptions(type) {
        const categories = categorySelect.options;
        Array.from(categories).forEach(option => {
            const categoryType = option.getAttribute('data-type');
            if (categoryType) {
                option.style.display = categoryType === type ? '' : 'none';
            }
        });

        // Reset selection if current selection is hidden
        if (categorySelect.selectedOptions[0].style.display === 'none') {
            categorySelect.value = Array.from(categories)
                .find(option => option.style.display !== 'none')?.value || '';
        }
    }
});
