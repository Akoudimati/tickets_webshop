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
                            <div class="d-flex gap-2 align-items-center">
                                <span class="badge ${statusClass}">${statusText}</span>
                                <button class="btn btn-danger btn-sm" onclick="deleteUserOrder(${order.id})" title="Delete Order">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
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
                                            <p><strong>Name:</strong> ${order.guest_name || 'N/A'}</p>
                                        </div>
                                        <div class="col-md-6">
                                            <h6>Delivery Address</h6>
                                            <p><strong>Address:</strong> ${order.guest_street || 'N/A'} ${order.guest_housenumber || ''}</p>
                                            <p><strong>Postal Code:</strong> ${order.guest_postcode || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <h6>Order Items</h6>
                                    <div class="order-items">
                                        ${order.items && order.items.length > 0 ? renderOrderItems(order.items) : 'No items found'}
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
            <div class="order-item mb-3 p-3 border rounded shadow-sm">
                <div class="d-flex">
                    <img src="${imageUrl}" alt="${item.title}" class="order-item-image me-3 rounded" style="width: 100px; height: 80px; object-fit: cover; border: 2px solid #dee2e6;">
                    <div class="flex-grow-1">
                        <h6 class="mb-1 text-primary">${item.title}</h6>
                        <p class="mb-1 text-muted">Quantity: ${item.quantity}</p>
                        <p class="mb-0"><strong class="text-success">€${formatPrice(item.price)}</strong></p>
                    </div>
                </div>
            </div>
        `;
    });
    
    return html;
}

// Get status class for badge styling
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

// Helper function to format price
function formatPrice(price) {
    if (!price) return '0.00';
    return parseFloat(price).toFixed(2);
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

// Delete user order function
async function deleteUserOrder(orderId) {
    if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/orders/${orderId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to delete order');
        }
        
        // Show success message
        const ordersContainer = document.getElementById('orders-container');
        const successAlert = document.createElement('div');
        successAlert.className = 'alert alert-success alert-dismissible fade show';
        successAlert.innerHTML = `
            <strong>Success!</strong> Order #${orderId} has been deleted successfully.
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        ordersContainer.insertBefore(successAlert, ordersContainer.firstChild);
        
        // Reload orders to refresh the page
        const currentUser = getCurrentUser();
        if (currentUser) {
            loadUserOrders(currentUser.id);
        }
        
    } catch (error) {
        console.error('Error deleting order:', error);
        
        // Show error message
        const ordersContainer = document.getElementById('orders-container');
        const errorAlert = document.createElement('div');
        errorAlert.className = 'alert alert-danger alert-dismissible fade show';
        errorAlert.innerHTML = `
            <strong>Error!</strong> Failed to delete order: ${error.message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        ordersContainer.insertBefore(errorAlert, ordersContainer.firstChild);
    }
} 