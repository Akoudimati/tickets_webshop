// Checkout functionality
document.addEventListener('DOMContentLoaded', () => {
    
    // Check if user is logged in using the auth system
    if (!isLoggedIn()) {
        alert('Please log in to proceed with checkout.');
        window.location.href = '/login.html';
        return;
    }
    
    // Load and display cart items
    loadCheckoutItems();
    
    // Setup form submission
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', handleCheckoutSubmission);
    }
});

// Load cart items for checkout display
function loadCheckoutItems() {
    // Check if user is logged in
    if (!isLoggedIn()) {
        alert('Please log in to proceed with checkout.');
        window.location.href = '/login.html';
        return;
    }
    
    const user = getCurrentUser();
    if (!user) {
        alert('Please log in to proceed with checkout.');
        window.location.href = '/login.html';
        return;
    }
    
    // Get user-specific cart
    const cartKey = `shoppingCart_user_${user.id}`;
    const cart = JSON.parse(localStorage.getItem(cartKey) || '[]');
    
    if (cart.length === 0) {
        alert('Your cart is empty. Redirecting to tickets page.');
        window.location.href = '/tickets.html';
        return;
    }
    
    displayCheckoutItems(cart);
}

// Display cart items in checkout summary
function displayCheckoutItems(cart) {
    const orderItemsContainer = document.getElementById('order-items');
    const totalItemsElement = document.getElementById('total-items');
    const totalPriceElement = document.getElementById('total-price');
    
    if (!orderItemsContainer) return;
    
    let html = '';
    let totalItems = 0;
    let totalPrice = 0;
    
    cart.forEach(item => {
        const ticket = item.ticket;
        const quantity = item.quantity;
        const itemTotal = ticket.price * quantity;
        
        totalItems += quantity;
        totalPrice += itemTotal;
        
        html += `
            <div class="checkout-item mb-2 pb-2 border-bottom">
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                        <h6 class="mb-1">${ticket.title}</h6>
                        <small class="text-muted">${ticket.category_name}</small>
                        <div class="d-flex justify-content-between mt-1">
                            <span>€${formatPrice(ticket.price)} x ${quantity}</span>
                            <strong>€${formatPrice(itemTotal)}</strong>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });
    
    orderItemsContainer.innerHTML = html;
    
    if (totalItemsElement) totalItemsElement.textContent = totalItems;
    if (totalPriceElement) totalPriceElement.textContent = `€${formatPrice(totalPrice)}`;
}

// Handle checkout form submission
function handleCheckoutSubmission(event) {
    event.preventDefault();
    
    // Get current user from auth system
    const currentUser = getCurrentUser();
    if (!currentUser) {
        alert('Please log in to complete your order.');
        window.location.href = '/login.html';
        return;
    }
    
    // Get user-specific cart
    const cartKey = `shoppingCart_user_${currentUser.id}`;
    const cart = JSON.parse(localStorage.getItem(cartKey) || '[]');
    
    if (cart.length === 0) {
        alert('Your cart is empty.');
        return;
    }
    
    // Collect form data
    const formData = {
        user_id: currentUser.id,
        guest_first_name: document.getElementById('firstName').value,
        guest_last_name: document.getElementById('lastName').value,
        guest_email: document.getElementById('email').value,
        guest_phone: document.getElementById('phone').value,
        guest_street: document.getElementById('address').value,
        guest_city: document.getElementById('city').value,
        guest_postcode: document.getElementById('postalCode').value,
        order_notes: document.getElementById('orderNotes').value,
        items: cart.map(item => ({
            ticket_id: item.ticket.id,
            quantity: item.quantity,
            price: parseFloat(item.ticket.price)
        }))
    };
    
    // Calculate total price
    formData.total_price = formData.items.reduce((total, item) => {
        return total + (item.quantity * item.price);
    }, 0);
    
    // Submit the order
    submitOrder(formData, cartKey);
}

// Submit order to the server
function submitOrder(orderData, cartKey) {
    const submitButton = document.querySelector('#checkout-form button[type="submit"]');
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Processing Order...';
    }
    

    
    fetch('/api/orders', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
    })
    .then(response => {
        
        if (!response.ok) {
            return response.text().then(text => {
                throw new Error(`Failed to create order: ${response.status} ${response.statusText} - ${text}`);
            });
        }
        return response.json();
    })
    .then(result => {
        
        // Clear the cart
        localStorage.removeItem(cartKey);
        
        // Update cart count
        if (window.cartManager) {
            window.cartManager.updateCartCount();
        }
        
        // Show success message
        alert(`Order #${result.orderId} created successfully! Redirecting to your orders page.`);
        
        // Redirect to orders page
        window.location.href = '/orders.html';
    })
    .catch(error => {
        console.error('Error creating order:', error);
        alert(`Error creating order: ${error.message}`);
        
        // Re-enable submit button
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = 'Complete Order';
        }
    });
}

// Helper function to format price
function formatPrice(price) {
    const numPrice = price ? parseFloat(price) : 0;
    return numPrice.toFixed(2);
} 