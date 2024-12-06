// Password strength checker
document.getElementById('new_password')?.addEventListener('input', function() {
    const password = this.value;
    const requirements = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        lowercase: /[a-z]/.test(password),
        number: /[0-9]/.test(password)
    };
    
    // Update requirement indicators
    Object.entries(requirements).forEach(([key, valid]) => {
        const element = document.getElementById(key);
        if (element) {
            element.classList.toggle('valid', valid);
        }
    });
    
    // Update progress bar
    const strength = Object.values(requirements).filter(Boolean).length;
    const progressBar = document.querySelector('.progress-bar');
    if (progressBar) {
        progressBar.style.width = `${(strength / 4) * 100}%`;
        progressBar.className = 'progress-bar';
        if (strength <= 2) progressBar.classList.add('bg-danger');
        else if (strength === 3) progressBar.classList.add('bg-warning');
        else progressBar.classList.add('bg-success');
    }
});

// Password confirmation check
document.getElementById('passwordForm')?.addEventListener('submit', function(e) {
    const newPassword = document.getElementById('new_password').value;
    const confirmPassword = document.getElementById('confirm_password').value;
    
    if (newPassword !== confirmPassword) {
        e.preventDefault();
        alert('Passwords do not match!');
    }
});

// Data reset confirmation
function confirmReset() {
    return confirm('Are you sure you want to reset all your data? This action cannot be undone!');
}

// File upload name display
document.querySelector('input[type="file"]')?.addEventListener('change', function() {
    const fileName = this.files[0]?.name;
    if (fileName) {
        this.nextElementSibling?.textContent = fileName;
    }
});

// Initialize Bootstrap tooltips
document.addEventListener('DOMContentLoaded', function() {
    const tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltips.forEach(tooltip => {
        new bootstrap.Tooltip(tooltip);
    });
});
