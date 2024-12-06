document.addEventListener('DOMContentLoaded', function() {
    // More menu functionality
    const moreButton = document.getElementById('moreButton');
    const moreMenu = document.getElementById('moreMenu');
    let isMoreMenuOpen = false;

    if (moreButton && moreMenu) {
        moreButton.addEventListener('click', (e) => {
            e.preventDefault();
            isMoreMenuOpen = !isMoreMenuOpen;
            moreMenu.classList.toggle('active', isMoreMenuOpen);
            moreButton.classList.toggle('active', isMoreMenuOpen);
        });

        // Close more menu when clicking outside
        document.addEventListener('click', (e) => {
            if (isMoreMenuOpen && !moreMenu.contains(e.target) && !moreButton.contains(e.target)) {
                isMoreMenuOpen = false;
                moreMenu.classList.remove('active');
                moreButton.classList.remove('active');
            }
        });
    }

    // Initialize date inputs with today's date
    const dateInputs = document.querySelectorAll('input[type="date"]');
    const today = new Date().toISOString().split('T')[0];
    dateInputs.forEach(input => {
        if (!input.value) {
            input.value = today;
        }
    });

    // Form Submission Handler
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const submitButton = form.querySelector('button[type="submit"]');
            if (submitButton) {
                submitButton.disabled = true;
                const originalText = submitButton.innerHTML;
                submitButton.innerHTML = `
                    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    Processing...
                `;

                // Re-enable button after 5 seconds (failsafe)
                setTimeout(() => {
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalText;
                }, 5000);
            }
        });
    });

    // Amount input formatter
    const amountInputs = document.querySelectorAll('input[type="number"]');
    amountInputs.forEach(input => {
        input.addEventListener('input', function() {
            // Remove non-numeric characters except decimal point
            this.value = this.value.replace(/[^\d.]/g, '');
            
            // Ensure only one decimal point
            const parts = this.value.split('.');
            if (parts.length > 2) {
                this.value = parts[0] + '.' + parts.slice(1).join('');
            }
            
            // Limit decimal places to 2
            if (parts[1] && parts[1].length > 2) {
                this.value = parts[0] + '.' + parts[1].slice(0, 2);
            }
        });
    });

    // Toast notification function
    window.showToast = function(title, message, type = 'info') {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;

        const toastElement = document.createElement('div');
        toastElement.className = `toast align-items-center text-white bg-${type === 'error' ? 'danger' : 'success'} border-0`;
        toastElement.setAttribute('role', 'alert');
        toastElement.setAttribute('aria-live', 'assertive');
        toastElement.setAttribute('aria-atomic', 'true');

        toastElement.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    <strong>${title}</strong>: ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;

        toastContainer.appendChild(toastElement);
        const toast = new bootstrap.Toast(toastElement, {
            autohide: true,
            delay: 3000
        });
        toast.show();

        // Remove toast after it's hidden
        toastElement.addEventListener('hidden.bs.toast', () => {
            toastElement.remove();
        });
    };

    // Handle active navigation states
    const currentPath = window.location.pathname;
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        }
    });

    // Handle back navigation
    const backButtons = document.querySelectorAll('.back-button');
    backButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            window.history.back();
        });
    });

    // Double tap prevention
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('submit-once')) {
            if (e.target.dataset.processing === 'true') {
                e.preventDefault();
                return false;
            }
            e.target.dataset.processing = 'true';
            setTimeout(() => {
                delete e.target.dataset.processing;
            }, 1000);
        }
    }, true);

    // Scroll to top button
    const scrollButton = document.createElement('button');
    scrollButton.className = 'scroll-top-button';
    scrollButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
    document.body.appendChild(scrollButton);

    scrollButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 100) {
            scrollButton.classList.add('visible');
        } else {
            scrollButton.classList.remove('visible');
        }
    });

    // Add this CSS for the scroll to top button
    const style = document.createElement('style');
    style.textContent = `
        .scroll-top-button {
            position: fixed;
            bottom: 80px;
            right: 20px;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background-color: var(--primary-color);
            color: white;
            border: none;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
            z-index: 999;
        }

        .scroll-top-button.visible {
            opacity: 1;
            visibility: visible;
        }

        .scroll-top-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 3px 8px rgba(0,0,0,0.3);
        }
    `;
    document.head.appendChild(style);
});
