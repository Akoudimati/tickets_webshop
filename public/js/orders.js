// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    
    // Check if user is logged in using the auth system
    if (!isLoggedIn()) {
        // Redirect to login if not logged in
        window.location.href = '/login.html';
        return;
    }
    
    // Get current user from auth system
    const currentUser = getCurrentUser();
    if (!currentUser) {
        window.location.href = '/login.html';
        return;
    }
    
    loadUserOrders(currentUser.id);
});

// Load orders for the current user
function loadUserOrders(userId) {
    const ordersContainer = document.getElementById('orders-container');
    if (!ordersContainer) return;
    
    ordersContainer.innerHTML = '<div class="loading-message">Loading orders...</div>';
    
    fetch(`/api/orders/user/${userId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch orders: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(orders => {
            
            if (orders.length === 0) {
                ordersContainer.innerHTML = `
                    <div class="alert alert-info">
                        <h4>No orders found</h4>
                        <p>You haven't placed any orders yet. <a href="/tickets.html" class="alert-link">Browse tickets</a> to make your first purchase!</p>
                    </div>
                `;
                return;
            }
            
            let html = '';
            
            orders.forEach(order => {
                const statusClass = getStatusClass(order.status);
                const statusText = getStatusText(order.status);
                
                html += `
                    <div class="card mb-4">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h5 class="mb-0">Order #${order.id}</h5>
                            <span class="badge ${statusClass}">${statusText}</span>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-8">
                                    <h6>Order Details</h6>
                                    <p><strong>Order Date:</strong> ${formatDate(order.created_at)}</p>
                                    <p><strong>Total Price:</strong> €${formatPrice(order.total_price)}</p>
                                    
                                    <div class="row mt-3">
                                        <div class="col-md-6">
                                            <h6>Customer Information</h6>
                                            <p><strong>Name:</strong> ${order.guest_first_name || order.guest_name || 'N/A'} ${order.guest_last_name || ''}</p>
                                            <p><strong>Email:</strong> ${order.guest_email || 'N/A'}</p>
                                            <p><strong>Phone:</strong> ${order.guest_phone || 'N/A'}</p>
                                        </div>
                                        <div class="col-md-6">
                                            <h6>Delivery Address</h6>
                                            <p><strong>Address:</strong> ${order.guest_street || 'N/A'} ${order.guest_housenumber || ''}</p>
                                            <p><strong>City:</strong> ${order.guest_city || 'N/A'}</p>
                                            <p><strong>Postal Code:</strong> ${order.guest_postcode || 'N/A'}</p>
                                        </div>
                                    </div>
                                    
                                    ${order.order_notes ? `
                                        <div class="mt-3">
                                            <h6>Order Notes</h6>
                                            <p>${order.order_notes}</p>
                                        </div>
                                    ` : ''}
                                </div>
                                <div class="col-md-4">
                                    <h6>Order Items</h6>
                                    <div class="order-items">
                                        ${renderOrderItems(order.items)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            ordersContainer.innerHTML = html;
        })
        .catch(error => {
            console.error('Error fetching orders:', error);
            ordersContainer.innerHTML = `
                <div class="alert alert-danger">
                    <strong>Error loading orders:</strong> ${error.message}
                    <p>Please try refreshing the page or contact support if the problem persists.</p>
                </div>
            `;
        });
}

// Render order items
function renderOrderItems(items) {
    if (!items || items.length === 0) {
        return '<p>No items found</p>';
    }
    
    let html = '';
    items.forEach(item => {
        const imageUrl = item.img_url || 'https://via.placeholder.com/80x60?text=No+Image';
        
        html += `
            <div class="order-item mb-3 p-2 border rounded">
                <div class="d-flex">
                    <img src="${imageUrl}" alt="${item.title}" class="order-item-image me-3" style="width: 80px; height: 60px; object-fit: cover;">
                    <div class="flex-grow-1">
                        <h6 class="mb-1">${item.title}</h6>
                        <p class="mb-1">Quantity: ${item.quantity}</p>
                        <p class="mb-0"><strong>€${formatPrice(item.price)}</strong></p>
                    </div>
                </div>
            </div>
        `;
    });
    
    return html;
}

// Get status class for badge
function getStatusClass(status) {
    switch (status) {
        case 'compleet':
            return 'bg-success';
        case 'in behandeling':
            return 'bg-warning text-dark';
        case 'geannuleerd':
            return 'bg-danger';
        default:
            return 'bg-secondary';
    }
}

// Get status text for display
function getStatusText(status) {
    switch (status) {
        case 'compleet':
            return 'Complete';
        case 'in behandeling':
            return 'Processing';
        case 'geannuleerd':
            return 'Cancelled';
        default:
            return status;
    }
}

// Helper function to format dates
function formatDate(dateString) {
    if (!dateString) return 'Date not available';
    
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', options);
    } catch (error) {
        console.error('Error formatting date:', error);
        return dateString;
    }
}

// Helper function to safely format price
function formatPrice(price) {
    const numPrice = price ? parseFloat(price) : 0;
    return numPrice.toFixed(2);
} 