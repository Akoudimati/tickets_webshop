// Checkout functionality
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    if (!isLoggedIn()) {
        alert('Please log in to access the checkout page.');
        window.location.href = '/login.html';
        return;
    }

    // Get current user from auth system
    const currentUser = getCurrentUser();
    if (!currentUser) {
        window.location.href = '/login.html';
        return;
    }

    // Get user-specific cart
    const cartKey = `shoppingCart_user_${currentUser.id}`;
    const cart = JSON.parse(localStorage.getItem(cartKey) || '[]');

    if (cart.length === 0) {
        alert('Your cart is empty. Redirecting to tickets page.');
        window.location.href = '/tickets.html';
        return;
    }

    // Display cart items in checkout
    displayCheckoutItems(cart);

    // Handle form submission
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', handleCheckoutSubmission);
    }

    // Pre-fill user information if available
    if (currentUser.email) {
        const emailField = document.getElementById('email');
        if (emailField) emailField.value = currentUser.email;
    }
    if (currentUser.name) {
        const firstNameField = document.getElementById('firstName');
        if (firstNameField) firstNameField.value = currentUser.name.split(' ')[0] || '';
        const lastNameField = document.getElementById('lastName');
        if (lastNameField) lastNameField.value = currentUser.name.split(' ').slice(1).join(' ') || '';
    }
});

// Helper function to format price
function formatPrice(price) {
    return parseFloat(price).toFixed(2);
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
    
    // Collect form data - only fields that exist in database
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const guestName = `${firstName} ${lastName}`.trim();
    
    const formData = {
        user_id: currentUser.id,
        guest_name: guestName,
        guest_street: document.getElementById('address').value.trim(),
        guest_postcode: document.getElementById('postalCode').value.trim(),
        guest_housenumber: '', // You can add a house number field if needed
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
        
        // Show success popup modal
        document.getElementById('orderNumber').textContent = `#${result.orderId}`;
        const modal = new bootstrap.Modal(document.getElementById('orderSuccessModal'));
        modal.show();
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

// Navigation functions for the success modal
function goToOrders() {
    window.location.href = '/orders.html';
}

function goToCart() {
    window.location.href = '/cart.html';
} 