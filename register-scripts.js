document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const fullname = document.getElementById('fullname').value.trim();
    const email = document.getElementById('email').value.trim();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();
    const terms = document.getElementById('terms').checked;
    
    const fullnameError = document.getElementById('fullnameError');
    const emailError = document.getElementById('emailError');
    const usernameError = document.getElementById('usernameError');
    const passwordError = document.getElementById('passwordError');
    const confirmPasswordError = document.getElementById('confirmPasswordError');
    const successMessage = document.getElementById('successMessage');
    
    // Reset error messages
    fullnameError.style.display = 'none';
    emailError.style.display = 'none';
    usernameError.style.display = 'none';
    passwordError.style.display = 'none';
    confirmPasswordError.style.display = 'none';
    successMessage.style.display = 'none';
    
    let isValid = true;
    
    if (!fullname) {
        fullnameError.style.display = 'block';
        isValid = false;
    }
    
    if (!email) {
        emailError.style.display = 'block';
        isValid = false;
    } else if (!isValidEmail(email)) {
        emailError.textContent = 'Please enter a valid email address';
        emailError.style.display = 'block';
        isValid = false;
    }
    
    if (!username) {
        usernameError.style.display = 'block';
        isValid = false;
    } else if (username.length < 3) {
        usernameError.textContent = 'Username must be at least 3 characters';
        usernameError.style.display = 'block';
        isValid = false;
    }
    
    if (!password) {
        passwordError.style.display = 'block';
        isValid = false;
    } else if (password.length < 6) {
        passwordError.textContent = 'Password must be at least 6 characters';
        passwordError.style.display = 'block';
        isValid = false;
    }
    
    if (!confirmPassword) {
        confirmPasswordError.style.display = 'block';
        isValid = false;
    } else if (password !== confirmPassword) {
        confirmPasswordError.style.display = 'block';
        isValid = false;
    }
    
    if (!terms) {
        alert('Please agree to the Terms & Privacy policy');
        isValid = false;
    }
    
    if (isValid) {
        // Simulate registration process
        successMessage.style.display = 'block';
        
        // Disable form inputs during registration
        document.querySelectorAll('input, button').forEach(el => {
            el.disabled = true;
        });
        
        // Simulate loading and redirect
        setTimeout(() => {
            alert('Registration successful! Welcome to your new diary, ' + fullname + '!');
            // Redirect to login page
            window.location.href = 'login.html';
        }, 2000);
    }
});

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Password strength indicator
document.getElementById('password').addEventListener('input', function() {
    const password = this.value;
    const strengthText = document.getElementById('passwordError');
    
    if (password.length === 0) {
        strengthText.textContent = 'Password must be at least 6 characters';
        strengthText.className = 'error-message';
        return;
    }
    
    if (password.length < 6) {
        strengthText.textContent = 'Password is too short';
        strengthText.className = 'error-message';
        return;
    }
    
    // Simple password strength check
    let strength = 'weak';
    if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
        strength = 'strong';
    } else if (password.length >= 6) {
        strength = 'medium';
    }
    
    const messages = {
        weak: 'Password strength: Weak',
        medium: 'Password strength: Medium',
        strong: 'Password strength: Strong'
    };
    
    strengthText.textContent = messages[strength];
    strengthText.className = `error-message ${strength}`;
});

// Add interactive effects
const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"]');
inputs.forEach(input => {
    input.addEventListener('focus', () => {
        input.parentElement.style.transform = 'scale(1.02)';
        input.parentElement.style.transition = 'transform 0.2s ease';
    });
    
    input.addEventListener('blur', () => {
        input.parentElement.style.transform = 'scale(1)';
    });
});