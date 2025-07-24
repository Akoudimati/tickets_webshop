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
    
    // Always show admin link, but handle access differently
    const existingAdminLink = leftNav.querySelector('a[data-admin-link="true"]');
    if (!existingAdminLink) {
        const adminItem = document.createElement('li');
        adminItem.className = 'nav-item';
        
        if (isLoggedIn() && isAdmin()) {
            // Allow access for admin users
            adminItem.innerHTML = '<a class="nav-link admin-btn" href="/admin.html" data-admin-link="true"><i class="fas fa-cogs me-1"></i>Admin</a>';
        } else {
            // Show admin button but restrict access for non-admin users
            adminItem.innerHTML = '<a class="nav-link admin-btn" href="#" data-admin-link="true" onclick="showAdminAccessAlert()"><i class="fas fa-cogs me-1"></i>Admin</a>';
        }
        
        leftNav.appendChild(adminItem);
    } else {
        // Update existing admin link based on user status
        if (isLoggedIn() && isAdmin()) {
            existingAdminLink.href = '/admin.html';
            existingAdminLink.onclick = null;
        } else {
            existingAdminLink.href = '#';
            existingAdminLink.onclick = showAdminAccessAlert;
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
        
        // Create user dropdown with profile image
        const userDropdown = document.createElement('li');
        userDropdown.className = 'nav-item dropdown';
        
        // Get user's first letter for avatar fallback
        const userInitial = (user.name || 'U').charAt(0).toUpperCase();
        
        // Use profile image if available, otherwise show initial avatar
        let profileHtml = '';
        if (user.profile_img && user.profile_img.trim() !== '') {
            // Show only the profile image
            profileHtml = `<img src="${user.profile_img}" alt="Profile" class="profile-img-nav me-2">`;
        } else {
            // Show initial avatar only when no profile image is available
            profileHtml = `
                <div class="profile-avatar-nav me-2">
                    ${userInitial}
                </div>
            `;
        }
        
        userDropdown.innerHTML = `
            <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                ${profileHtml}
                <span>${user.name || 'User'}</span>
            </a>
            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                <li><a class="dropdown-item" href="/profile.html"><i class="bi bi-person me-2"></i>My Profile</a></li>
                <li><a class="dropdown-item" href="/orders.html"><i class="bi bi-cart-check me-2"></i>My Orders</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item" href="#" id="logout-button"><i class="bi bi-box-arrow-right me-2"></i>Logout</a></li>
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

// Show admin access alert for non-admin users
function showAdminAccessAlert() {
    const alertHtml = `
        <div class="modal fade" id="adminAccessModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header bg-warning text-dark">
                        <h5 class="modal-title">
                            <i class="fas fa-shield-alt me-2"></i>Admin Access Required
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body text-center">
                        <div class="mb-3">
                            <i class="fas fa-user-shield fa-3x text-warning mb-3"></i>
                        </div>
                        <h6>Admin Panel </h6>
                        <p class="mb-3"></p>
                        <div class="alert alert-info">
                            <strong>Access Restricted:</strong>
                        </div>
                        <p>log in to see the admin page</small></p>
                    </div>
                    <div class="modal-footer justify-content-center">
                        <a href="/login.html" class="btn btn-primary">
                            <i class="fas fa-sign-in-alt me-2"></i>Login as Admin
                        </a>
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('adminAccessModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', alertHtml);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('adminAccessModal'));
    modal.show();
} 