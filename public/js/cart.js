// Shopping Cart Management
let cart = [];

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    loadCart();
    displayCart();
    
    // Add event listeners
    const clearCartBtn = document.getElementById('clear-cart-btn');
    const proceedCheckoutBtn = document.getElementById('proceed-checkout-btn');
    
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', clearCart);
    }
    
    if (proceedCheckoutBtn) {
        proceedCheckoutBtn.addEventListener('click', proceedToCheckout);
    }
});

// Get user-specific cart key
function getUserCartKey() {
    if (!isLoggedIn()) {
        return null;
    }
    const user = getCurrentUser();
    return user ? `shoppingCart_user_${user.id}` : null;
}

// Load cart from localStorage (user-specific)
function loadCart() {
    const cartKey = getUserCartKey();
    if (!cartKey) {
        cart = [];
        return;
    }
    
    const savedCart = localStorage.getItem(cartKey);
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
        } catch (error) {
            console.error('Error loading cart:', error);
            cart = [];
        }
    }
}

// Save cart to localStorage (user-specific)
function saveCart() {
    const cartKey = getUserCartKey();
    if (!cartKey) {
        console.warn('Cannot save cart: user not logged in');
        return;
    }
    
    localStorage.setItem(cartKey, JSON.stringify(cart));
    updateCartCount();
}

// Clear cart when user logs out
function clearUserCart() {
    const cartKey = getUserCartKey();
    if (cartKey) {
        localStorage.removeItem(cartKey);
    }
    cart = [];
    updateCartCount();
}

// Add item to cart
function addToCart(ticket, quantity) {
    if (!isLoggedIn()) {
        alert('Please log in to add items to cart.');
        window.location.href = '/login.html';
        return false;
    }
    
    const existingItem = cart.find(item => item.ticket.id === ticket.id);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            ticket: ticket,
            quantity: quantity,
            addedAt: new Date().toISOString()
        });
    }
    
    saveCart();
    return true;
}

// Remove item from cart
function removeFromCart(ticketId) {
    cart = cart.filter(item => item.ticket.id !== ticketId);
    saveCart();
    displayCart();
}

// Update quantity in cart
function updateCartItemQuantity(ticketId, newQuantity) {
    const item = cart.find(item => item.ticket.id === ticketId);
    if (item) {
        if (newQuantity <= 0) {
            removeFromCart(ticketId);
        } else {
            item.quantity = newQuantity;
            saveCart();
            displayCart();
        }
    }
}

// Clear entire cart
function clearCart() {
    if (confirm('Are you sure you want to clear your cart?')) {
        cart = [];
        saveCart();
        displayCart();
    }
}

// Display cart items
function displayCart() {
    const cartContainer = document.getElementById('cart-container');
    const cartSummary = document.getElementById('cart-summary');
    
    if (!cartContainer) return;
    
    // Check if user is logged in
    if (!isLoggedIn()) {
        cartContainer.innerHTML = `
            <div class="alert alert-warning text-center">
                <h4>Please log in to view your cart</h4>
                <p>You need to be logged in to add items to cart and make purchases.</p>
                <a href="/login.html" class="btn btn-primary">Log In</a>
            </div>
        `;
        if (cartSummary) cartSummary.style.display = 'none';
        return;
    }
    
    if (cart.length === 0) {
        cartContainer.innerHTML = `
            <div class="alert alert-info text-center">
                <h4>Your cart is empty</h4>
                <p>Start adding tickets to your cart to see them here.</p>
                <a href="/tickets.html" class="btn btn-primary">Browse Tickets</a>
            </div>
        `;
        if (cartSummary) cartSummary.style.display = 'none';
        return;
    }
    
    let html = '';
    let totalItems = 0;
    let totalPrice = 0;
    
    cart.forEach(item => {
        const ticket = item.ticket;
        const quantity = item.quantity;
        const itemTotal = ticket.price * quantity;
        
        totalItems += quantity;
        totalPrice += itemTotal;
        
        const imageUrl = ticket.img_url || 'https://via.placeholder.com/150x100?text=No+Image';
        
        html += `
            <div class="card mb-3" data-ticket-id="${ticket.id}">
                <div class="card-body">
                    <div class="row align-items-center">
                        <div class="col-md-2">
                            <img src="${imageUrl}" alt="${ticket.title}" class="img-fluid rounded" style="max-height: 100px; object-fit: cover;">
                        </div>
                        <div class="col-md-4">
                            <h5 class="card-title">${ticket.title}</h5>
                            <p class="text-muted">${ticket.category_name}</p>
                            <p class="card-text">${ticket.description ? ticket.description.substring(0, 100) + '...' : ''}</p>
                        </div>
                        <div class="col-md-2 text-center">
                            <p class="mb-0"><strong>€${formatPrice(ticket.price)}</strong></p>
                            <small class="text-muted">per ticket</small>
                        </div>
                        <div class="col-md-2 text-center">
                            <div class="quantity-controls">
                                <div class="input-group">
                                    <button class="btn btn-outline-secondary btn-sm" type="button" onclick="updateCartItemQuantity(${ticket.id}, ${quantity - 1})">-</button>
                                    <input type="number" class="form-control form-control-sm text-center" value="${quantity}" min="1" max="${ticket.quantity_available || 100}" 
                                           onchange="updateCartItemQuantity(${ticket.id}, parseInt(this.value))" style="max-width: 60px;">
                                    <button class="btn btn-outline-secondary btn-sm" type="button" onclick="updateCartItemQuantity(${ticket.id}, ${quantity + 1})">+</button>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-1 text-center">
                            <p class="mb-0"><strong>€${formatPrice(itemTotal)}</strong></p>
                        </div>
                        <div class="col-md-1 text-center">
                            <button class="btn btn-outline-danger btn-sm" onclick="removeFromCart(${ticket.id})" title="Remove from cart">
                                ✕
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    cartContainer.innerHTML = html;
    
    // Update summary
    const totalItemsElement = document.getElementById('total-items');
    const totalPriceElement = document.getElementById('total-price');
    
    if (totalItemsElement) totalItemsElement.textContent = totalItems;
    if (totalPriceElement) totalPriceElement.textContent = `€${formatPrice(totalPrice)}`;
    
    if (cartSummary) cartSummary.style.display = 'block';
}

// Proceed to checkout
function proceedToCheckout() {
    // Check if user is logged in using the auth system
    if (!isLoggedIn()) {
        alert('Please log in to proceed to checkout.');
        window.location.href = '/login.html';
        return;
    }
    
    if (cart.length === 0) {
        alert('Your cart is empty. Add some tickets before proceeding to checkout.');
        return;
    }
    
    // Redirect to checkout page
    window.location.href = '/checkout.html';
}

// Get cart count for navigation
function getCartCount() {
    if (!isLoggedIn()) {
        return 0;
    }
    loadCart();
    return cart.reduce((total, item) => total + item.quantity, 0);
}

// Update cart count in navigation (called from other pages)
function updateCartCount() {
    const cartCount = getCartCount();
    const cartBadges = document.querySelectorAll('.cart-count');
    
    cartBadges.forEach(badge => {
        if (cartCount > 0) {
            badge.textContent = cartCount;
            badge.style.display = 'inline';
        } else {
            badge.style.display = 'none';
        }
    });
}

// Helper function to format price
function formatPrice(price) {
    const numPrice = price ? parseFloat(price) : 0;
    return numPrice.toFixed(2);
}

// Export functions for use in other files
window.cartManager = {
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    clearUserCart,
    getCartCount,
    updateCartCount,
    loadCart,
    saveCart
}; 