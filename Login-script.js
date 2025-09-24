document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const usernameError = document.getElementById('usernameError');
    const passwordError = document.getElementById('passwordError');
    const successMessage = document.getElementById('successMessage');
    
    // Reset error messages
    usernameError.style.display = 'none';
    passwordError.style.display = 'none';
    successMessage.style.display = 'none';
    
    let isValid = true;
    
    if (!username) {
        usernameError.style.display = 'block';
        isValid = false;
    }
    
    if (!password) {
        passwordError.style.display = 'block';
        isValid = false;
    }
    
    if (isValid) {
        // Simulate login process
        successMessage.style.display = 'block';
        
        // Disable form inputs during "login"
        document.querySelectorAll('input, button').forEach(el => {
            el.disabled = true;
        });
        
        // Simulate loading and redirect (in real app, this would be an API call)
        setTimeout(() => {
            alert('Login successful! Welcome to your diary, ' + username + '!');
            // In a real app: window.location.href = '/diary.html';
        }, 1500);
    }
});

// Add some interactive effects
const inputs = document.querySelectorAll('input[type="text"], input[type="password"]');
inputs.forEach(input => {
    input.addEventListener('focus', () => {
        input.parentElement.style.transform = 'scale(1.02)';
        input.parentElement.style.transition = 'transform 0.2s ease';
    });
    
    input.addEventListener('blur', () => {
        input.parentElement.style.transform = 'scale(1)';
    });
});