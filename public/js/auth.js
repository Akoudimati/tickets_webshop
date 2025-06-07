// Handle user authentication and navigation updates
document.addEventListener('DOMContentLoaded', () => {
    updateNavigation();
    
    // Load cart count on page load
    if (window.cartManager && window.cartManager.updateCartCount) {
        window.cartManager.updateCartCount();
    } else {
        // If cart manager not loaded, load it
        const script = document.createElement('script');
        script.src = '/js/cart.js';
        script.onload = function() {
            if (window.cartManager) {
                window.cartManager.updateCartCount();
            }
        };
        document.head.appendChild(script);
    }
});

// Check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('user') !== null;
}

// Get current user
function getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
        return JSON.parse(userStr);
    } catch (e) {
        console.error('Error parsing user data:', e);
        return null;
    }
}

// Check if current user is admin
function isAdmin() {
    const user = getCurrentUser();
    return user && user.role_id === 1;
}

// Update navigation based on login status
function updateNavigation() {
    const navbarNav = document.getElementById('navbarNav');
    if (!navbarNav) return;
    
    const leftNav = navbarNav.querySelector('.me-auto') || navbarNav.querySelector('.navbar-nav:first-child');
    const rightNav = navbarNav.querySelector('.ms-auto') || navbarNav.querySelector('.navbar-nav:last-child');
    if (!rightNav) return;
    
    // Add admin link to left navigation if user is admin
    if (isLoggedIn() && isAdmin()) {
        // Check if admin link already exists
        const existingAdminLink = leftNav.querySelector('a[href="/admin.html"]');
        if (!existingAdminLink) {
            const adminItem = document.createElement('li');
            adminItem.className = 'nav-item';
            adminItem.innerHTML = '<a class="nav-link admin-btn" href="/admin.html"><i class="bi bi-gear-fill me-1"></i>Admin</a>';
            leftNav.appendChild(adminItem);
        }
    } else {
        // Remove admin link if user is not admin or not logged in
        const adminItem = leftNav.querySelector('a[href="/admin.html"]');
        if (adminItem) {
            adminItem.parentElement.remove();
        }
    }
    
    if (isLoggedIn()) {
        const user = getCurrentUser();
        
        // Clear the right navigation links
        rightNav.innerHTML = '';
        
        // Add cart link
        const cartItem = document.createElement('li');
        cartItem.className = 'nav-item';
        cartItem.innerHTML = `
            <a class="nav-link position-relative" href="/cart.html">
                Cart
                <span class="cart-count badge bg-danger position-absolute top-0 start-100 translate-middle rounded-pill" style="display: none;">0</span>
            </a>
        `;
        rightNav.appendChild(cartItem);
        
        // Create user dropdown
        const userDropdown = document.createElement('li');
        userDropdown.className = 'nav-item dropdown';
        userDropdown.innerHTML = `
            <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                ${user.name || 'User'}
            </a>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                <li><a class="dropdown-item" href="/profile.html">My Profile</a></li>
                <li><a class="dropdown-item" href="/orders.html">My Orders</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item" href="#" id="logout-button">Logout</a></li>
            </ul>
        `;
        
        rightNav.appendChild(userDropdown);
        
        // Add event listener for logout
        const logoutButton = document.getElementById('logout-button');
        if (logoutButton) {
            logoutButton.addEventListener('click', (e) => {
                e.preventDefault();
                logout();
            });
        }
        
        // Show admin welcome message if user is admin (only once per session)
        if (isAdmin() && !sessionStorage.getItem('adminWelcomeShown')) {
            setTimeout(() => {
                showAdminWelcome(user.name);
                sessionStorage.setItem('adminWelcomeShown', 'true');
            }, 500);
        }
    } else {
        // Add cart link for non-logged users too
        const cartItem = document.createElement('li');
        cartItem.className = 'nav-item';
        cartItem.innerHTML = `
            <a class="nav-link position-relative" href="/cart.html">
                Cart
                <span class="cart-count badge bg-danger position-absolute top-0 start-100 translate-middle rounded-pill" style="display: none;">0</span>
            </a>
        `;
        rightNav.appendChild(cartItem);
        
        // Show register and login links for non-logged in users
        const registerItem = document.createElement('li');
        registerItem.className = 'nav-item';
        registerItem.innerHTML = '<a class="nav-link" href="/register.html">Register</a>';
        rightNav.appendChild(registerItem);
        
        const loginItem = document.createElement('li');
        loginItem.className = 'nav-item';
        loginItem.innerHTML = '<a class="nav-link" href="/login.html">Login</a>';
        rightNav.appendChild(loginItem);
    }
    
    // Set active nav item based on current page
    setActiveNavItem();
}

// Set the active navigation item based on current page
function setActiveNavItem() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        
        const href = link.getAttribute('href');
        if (href === currentPath || 
            (currentPath === '/' && href === '/index.html') ||
            (href !== '/' && currentPath.startsWith(href.split('.')[0]))) {
            link.classList.add('active');
        }
    });
}

// Show admin welcome message
function showAdminWelcome(userName) {
    // Create a stylish admin welcome modal/alert
    const welcomeModal = document.createElement('div');
    welcomeModal.className = 'admin-welcome-modal';
    welcomeModal.innerHTML = `
        <div class="admin-welcome-content">
            <div class="admin-welcome-header">
                <i class="bi bi-shield-check-fill"></i>
                <h3>Welcome, Administrator!</h3>
            </div>
            <div class="admin-welcome-body">
                <p>Hello <strong>${userName}</strong>,</p>
                <p>You are now an administrator</p>
                <p>You can access the admin panel to manage tickets, categories, and orders.</p>
            </div>
            <div class="admin-welcome-footer">
                <button class="btn btn-success" onclick="closeAdminWelcome()">
                    <i class="bi bi-check-circle me-2"></i>Got it!
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(welcomeModal);
    
    // Add fade-in animation
    setTimeout(() => {
        welcomeModal.classList.add('show');
    }, 100);
}

// Close admin welcome modal
function closeAdminWelcome() {
    const modal = document.querySelector('.admin-welcome-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

// Logout function
function logout() {
    // Clear user cart before logging out
    if (window.cartManager && window.cartManager.clearUserCart) {
        window.cartManager.clearUserCart();
    }
    
    // Clear user data
    localStorage.removeItem('user');
    
    // Clear session storage
    sessionStorage.clear();
    
    // Redirect to home page
    window.location.href = '/';
} 