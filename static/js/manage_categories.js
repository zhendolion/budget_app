document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Handle edit category modal
    const editCategoryModal = document.getElementById('editCategoryModal');
    if (editCategoryModal) {
        editCategoryModal.addEventListener('show.bs.modal', function(event) {
            const button = event.relatedTarget;
            const categoryId = button.getAttribute('data-category-id');
            const categoryName = button.getAttribute('data-category-name');
            const categoryType = button.getAttribute('data-category-type');

            const modal = this;
            modal.querySelector('#edit-category-id').value = categoryId;
            modal.querySelector('#edit-category-name').value = categoryName;
            modal.querySelector('#edit-category-type').value = categoryType;
        });
    }

    // Form validation
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(event) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            form.classList.add('was-validated');
        });
    });

    // Delete confirmation
    const deleteButtons = document.querySelectorAll('.btn-outline-danger');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            if (!confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
                event.preventDefault();
            }
        });
    });

    // Add category form handler
    const addCategoryForm = document.querySelector('form[action*="manage_categories"]');
    if (addCategoryForm) {
        addCategoryForm.addEventListener('submit', function(event) {
            const nameInput = this.querySelector('input[name="name"]');
            const typeSelect = this.querySelector('select[name="type"]');

            if (nameInput && typeSelect) {
                const name = nameInput.value.trim();
                const type = typeSelect.value;

                if (!name || !type) {
                    event.preventDefault();
                    alert('Please fill in all required fields.');
                    return;
                }
            }
        });
    }

    // Edit form handler
    const editCategoryForm = document.getElementById('editCategoryForm');
    if (editCategoryForm) {
        editCategoryForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const formData = new FormData(this);
            const submitButton = this.querySelector('button[type="submit"]');
            
            // Disable submit button and show loading state
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...';
            }

            fetch(this.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Hide modal and reload page
                    const modal = bootstrap.Modal.getInstance(editCategoryModal);
                    modal.hide();
                    window.location.reload();
                } else {
                    throw new Error(data.message || 'An error occurred');
                }
            })
            .catch(error => {
                alert(error.message);
            })
            .finally(() => {
                // Reset button state
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.innerHTML = 'Save Changes';
                }
            });
        });
    }

    // Show success messages with toast
    function showToast(message, type = 'success') {
        const toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            const container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toastElement = document.createElement('div');
        toastElement.className = `toast align-items-center text-white bg-${type}`;
        toastElement.setAttribute('role', 'alert');
        toastElement.setAttribute('aria-live', 'assertive');
        toastElement.setAttribute('aria-atomic', 'true');

        toastElement.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;

        const toastContainer = document.querySelector('.toast-container');
        toastContainer.appendChild(toastElement);

        const toast = new bootstrap.Toast(toastElement, {
            autohide: true,
            delay: 3000
        });
        toast.show();

        // Remove toast element after it's hidden
        toastElement.addEventListener('hidden.bs.toast', function() {
            this.remove();
        });
    }

    // Handle flash messages
    const flashMessages = document.querySelectorAll('.flash-message');
    flashMessages.forEach(message => {
        const type = message.classList.contains('alert-success') ? 'success' : 'danger';
        showToast(message.textContent, type);
        message.remove();
    });
});
