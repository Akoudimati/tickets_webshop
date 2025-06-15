// Admin Panel JavaScript
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in and is admin
    if (!isLoggedIn()) {
        alert('You must be logged in to access the admin panel.');
        window.location.href = '/login.html';
        return;
    }
    
    const user = getCurrentUser();
    
    if (!user || user.role_id !== 1) {
        alert('Access denied. Admin privileges required.');
        window.location.href = '/';
        return;
    }
    
    // Load initial data
    loadAdminTickets();
    loadAdminCategories();
    loadAdminOrders();
    loadAdminUsers();
    
    // Set up tab change listeners
    document.getElementById('tickets-tab').addEventListener('click', loadAdminTickets);
    document.getElementById('categories-tab').addEventListener('click', loadAdminCategories);
    document.getElementById('orders-tab').addEventListener('click', loadAdminOrders);
    document.getElementById('users-tab').addEventListener('click', loadAdminUsers);
});

// Helper functions from auth.js (in case they're not available)
function isLoggedIn() {
    return localStorage.getItem('user') !== null;
}

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

// Global variables
let currentTickets = [];
let currentCategories = [];
let currentOrders = [];
let currentUsers = [];

// Utility functions
function showSuccessMessage(message) {
    const successDiv = document.getElementById('success-message');
    successDiv.textContent = message;
    successDiv.classList.remove('d-none');
    setTimeout(() => successDiv.classList.add('d-none'), 5000);
}

function showErrorMessage(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = message;
    errorDiv.classList.remove('d-none');
    setTimeout(() => errorDiv.classList.add('d-none'), 5000);
}

function hideMessages() {
    document.getElementById('success-message').classList.add('d-none');
    document.getElementById('error-message').classList.add('d-none');
}

// TICKETS MANAGEMENT
async function loadAdminTickets() {
    const tableBody = document.getElementById('tickets-table-body');
    tableBody.innerHTML = '<tr><td colspan="6" class="text-center">Loading tickets...</td></tr>';
    
    try {
        const response = await fetch('/api/admin/tickets', {
            headers: {
                'user-id': getCurrentUser().id
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch tickets');
        }
        
        currentTickets = await response.json();
        displayTicketsTable();
        
        // Also load categories for the dropdown
        await loadCategoriesForDropdown();
        
    } catch (error) {
        console.error('Error loading tickets:', error);
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Error loading tickets</td></tr>';
    }
}

function displayTicketsTable() {
    const tableBody = document.getElementById('tickets-table-body');
    
    if (currentTickets.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No tickets found</td></tr>';
        return;
    }
    
    let html = '';
    currentTickets.forEach(ticket => {
        const imagePreview = ticket.img_url ? 
            `<img src="${ticket.img_url}" alt="Ticket" style="width: 50px; height: 50px; object-fit: cover;" class="rounded">` : 
            '<span class="text-muted">No image</span>';
            
        html += `
            <tr>
                <td>${ticket.id}</td>
                <td>${ticket.title}</td>
                <td>${ticket.category_name}</td>
                <td>€${parseFloat(ticket.price).toFixed(2)}</td>
                <td>${imagePreview}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="editTicket(${ticket.id})" title="Edit">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteTicket(${ticket.id})" title="Delete">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
}

async function loadCategoriesForDropdown() {
    try {
        const response = await fetch('/api/categories');
        const categories = await response.json();
        
        const select = document.getElementById('ticket-category');
        select.innerHTML = '<option value="">Select a category</option>';
        
        categories.forEach(category => {
            select.innerHTML += `<option value="${category.id}">${category.name}</option>`;
        });
    } catch (error) {
        console.error('Error loading categories for dropdown:', error);
    }
}

function openTicketModal(ticketId = null) {
    const modal = document.getElementById('ticketModal');
    const modalTitle = document.getElementById('ticketModalLabel');
    const form = document.getElementById('ticket-form');
    
    // Reset form
    form.reset();
    document.getElementById('ticket-id').value = '';
    
    if (ticketId) {
        // Edit mode
        modalTitle.textContent = 'Edit Ticket';
        const ticket = currentTickets.find(t => t.id === ticketId);
        if (ticket) {
            document.getElementById('ticket-id').value = ticket.id;
            document.getElementById('ticket-title').value = ticket.title;
            document.getElementById('ticket-category').value = ticket.category_id;
            document.getElementById('ticket-price').value = ticket.price;
            document.getElementById('ticket-image').value = ticket.img_url || '';
            document.getElementById('ticket-description').value = ticket.description || '';
        }
    } else {
        // Add mode
        modalTitle.textContent = 'Add New Ticket';
    }
}

function editTicket(ticketId) {
    openTicketModal(ticketId);
    const modal = new bootstrap.Modal(document.getElementById('ticketModal'));
    modal.show();
}

async function saveTicket() {
    hideMessages();
    
    const form = document.getElementById('ticket-form');
    const formData = new FormData(form);
    const ticketId = document.getElementById('ticket-id').value;
    
    const ticketData = {
        title: formData.get('title'),
        category_id: parseInt(formData.get('category_id')),
        price: parseFloat(formData.get('price')),
        img_url: formData.get('img_url'),
        description: formData.get('description')
    };
    
    try {
        const url = ticketId ? `/api/admin/tickets/${ticketId}` : '/api/admin/tickets';
        const method = ticketId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'user-id': getCurrentUser().id
            },
            body: JSON.stringify(ticketData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to save ticket');
        }
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('ticketModal'));
        modal.hide();
        
        // Reload tickets
        await loadAdminTickets();
        
        showSuccessMessage(ticketId ? 'Ticket updated successfully!' : 'Ticket created successfully!');
        
    } catch (error) {
        console.error('Error saving ticket:', error);
        showErrorMessage(error.message);
    }
}

async function deleteTicket(ticketId) {
    if (!confirm('Are you sure you want to delete this ticket?')) {
        return;
    }
    
    hideMessages();
    
    try {
        const response = await fetch(`/api/admin/tickets/${ticketId}`, {
            method: 'DELETE',
            headers: {
                'user-id': getCurrentUser().id
            }
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to delete ticket');
        }
        
        await loadAdminTickets();
        showSuccessMessage('Ticket deleted successfully!');
        
    } catch (error) {
        console.error('Error deleting ticket:', error);
        showErrorMessage(error.message);
    }
}

// CATEGORIES MANAGEMENT
async function loadAdminCategories() {
    const tableBody = document.getElementById('categories-table-body');
    tableBody.innerHTML = '<tr><td colspan="4" class="text-center">Loading categories...</td></tr>';
    
    try {
        const response = await fetch('/api/admin/categories', {
            headers: {
                'user-id': getCurrentUser().id
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch categories');
        }
        
        currentCategories = await response.json();
        displayCategoriesTable();
        
    } catch (error) {
        console.error('Error loading categories:', error);
        tableBody.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Error loading categories</td></tr>';
    }
}

function displayCategoriesTable() {
    const tableBody = document.getElementById('categories-table-body');
    
    if (currentCategories.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" class="text-center">No categories found</td></tr>';
        return;
    }
    
    let html = '';
    currentCategories.forEach(category => {
        const imagePreview = category.img_url ? 
            `<img src="${category.img_url}" alt="${category.name}" style="width: 60px; height: 40px; object-fit: cover;" class="rounded" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';">
             <span style="display: none;" class="text-muted">No image</span>` : 
            '<span class="text-muted">No image</span>';
            
        html += `
            <tr>
                <td>${category.id}</td>
                <td>${category.name}</td>
                <td>${imagePreview}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="editCategory(${category.id})" title="Edit">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteCategory(${category.id})" title="Delete">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
}

function openCategoryModal(categoryId = null) {
    const modal = document.getElementById('categoryModal');
    const modalTitle = document.getElementById('categoryModalLabel');
    const form = document.getElementById('category-form');
    
    // Reset form
    form.reset();
    document.getElementById('category-id').value = '';
    
    // Hide image preview
    document.getElementById('category-image-preview').style.display = 'none';
    
    if (categoryId) {
        // Edit mode
        modalTitle.textContent = 'Edit Category';
        const category = currentCategories.find(c => c.id === categoryId);
        if (category) {
            document.getElementById('category-id').value = category.id;
            document.getElementById('category-name').value = category.name;
            document.getElementById('category-image').value = category.img_url || '';
            
            // Show image preview if URL exists
            if (category.img_url) {
                previewCategoryImage();
            }
        }
    } else {
        // Add mode
        modalTitle.textContent = 'Add New Category';
    }
}

// Preview category image
function previewCategoryImage() {
    const imageUrl = document.getElementById('category-image').value;
    const previewDiv = document.getElementById('category-image-preview');
    const previewImg = document.getElementById('category-preview-img');
    
    if (imageUrl && imageUrl.trim() !== '') {
        previewImg.src = imageUrl;
        previewImg.onload = function() {
            previewDiv.style.display = 'block';
        };
        previewImg.onerror = function() {
            previewDiv.style.display = 'none';
        };
    } else {
        previewDiv.style.display = 'none';
    }
}

function editCategory(categoryId) {
    openCategoryModal(categoryId);
    const modal = new bootstrap.Modal(document.getElementById('categoryModal'));
    modal.show();
}

async function saveCategory() {
    hideMessages();
    
    const form = document.getElementById('category-form');
    const formData = new FormData(form);
    const categoryId = document.getElementById('category-id').value;
    
    const categoryData = {
        name: formData.get('name'),
        img_url: formData.get('img_url')
    };
    
    try {
        const url = categoryId ? `/api/admin/categories/${categoryId}` : '/api/admin/categories';
        const method = categoryId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'user-id': getCurrentUser().id
            },
            body: JSON.stringify(categoryData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to save category');
        }
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('categoryModal'));
        modal.hide();
        
        // Reload categories
        await loadAdminCategories();
        
        showSuccessMessage(categoryId ? 'Category updated successfully!' : 'Category created successfully!');
        
    } catch (error) {
        console.error('Error saving category:', error);
        showErrorMessage(error.message);
    }
}

async function deleteCategory(categoryId) {
    if (!confirm('Are you sure you want to delete this category? This will also affect related tickets.')) {
        return;
    }
    
    hideMessages();
    
    try {
        const response = await fetch(`/api/admin/categories/${categoryId}`, {
            method: 'DELETE',
            headers: {
                'user-id': getCurrentUser().id
            }
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to delete category');
        }
        
        await loadAdminCategories();
        showSuccessMessage('Category deleted successfully!');
        
    } catch (error) {
        console.error('Error deleting category:', error);
        showErrorMessage(error.message);
    }
}

// ORDERS MANAGEMENT
async function loadAdminOrders() {
    const tableBody = document.getElementById('orders-table-body');
    tableBody.innerHTML = '<tr><td colspan="6" class="text-center">Loading orders...</td></tr>';
    
    try {
        const response = await fetch('/api/admin/orders', {
            headers: {
                'user-id': getCurrentUser().id
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch orders');
        }
        
        currentOrders = await response.json();
        displayOrdersTable();
        
    } catch (error) {
        console.error('Error loading orders:', error);
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Error loading orders</td></tr>';
    }
}

function displayOrdersTable() {
    const tableBody = document.getElementById('orders-table-body');
    
    if (currentOrders.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" class="text-center">No orders found</td></tr>';
        return;
    }
    
    let html = '';
    currentOrders.forEach(order => {
        const statusBadge = getStatusBadge(order.status);
        const orderDate = new Date(order.created_at).toLocaleDateString();
        
        html += `
            <tr>
                <td>#${order.id}</td>
                <td>${order.customer_name || 'Guest'}</td>
                <td>€${parseFloat(order.total_price || 0).toFixed(2)}</td>
                <td>${statusBadge}</td>
                <td>${orderDate}</td>
                <td>
                    <div class="d-flex gap-2">
                        <select class="form-select form-select-sm" onchange="updateOrderStatus(${order.id}, this.value)">
                            <option value="in behandeling" ${order.status === 'in behandeling' ? 'selected' : ''}>In behandeling</option>
                            <option value="compleet" ${order.status === 'compleet' ? 'selected' : ''}>Compleet</option>
                            <option value="geannuleerd" ${order.status === 'geannuleerd' ? 'selected' : ''}>Geannuleerd</option>
                        </select>
                        <button class="btn btn-danger btn-sm" onclick="deleteOrder(${order.id})" title="Delete Order">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
    
    tableBody.innerHTML = html;
}

function getStatusBadge(status) {
    switch (status) {
        case 'compleet':
            return '<span class="badge bg-success">Compleet</span>';
        case 'geannuleerd':
            return '<span class="badge bg-danger">Geannuleerd</span>';
        case 'in behandeling':
        default:
            return '<span class="badge bg-warning">In behandeling</span>';
    }
}

async function updateOrderStatus(orderId, newStatus) {
    hideMessages();
    
    try {
        const response = await fetch(`/api/admin/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'user-id': getCurrentUser().id
            },
            body: JSON.stringify({ status: newStatus })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to update order status');
        }
        
        // Update the order in our current list
        const orderIndex = currentOrders.findIndex(o => o.id === orderId);
        if (orderIndex !== -1) {
            currentOrders[orderIndex].status = newStatus;
            displayOrdersTable();
        }
        
        showSuccessMessage('Order status updated successfully!');
        
    } catch (error) {
        console.error('Error updating order status:', error);
        showErrorMessage(error.message);
        // Reload orders to reset the dropdown
        loadAdminOrders();
    }
}

async function deleteOrder(orderId) {
    if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
        return;
    }
    
    hideMessages();
    
    try {
        const response = await fetch(`/api/orders/${orderId}`, {
            method: 'DELETE',
            headers: {
                'user-id': getCurrentUser().id
            }
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to delete order');
        }
        
        // Remove the order from current list and refresh table
        currentOrders = currentOrders.filter(order => order.id !== orderId);
        displayOrdersTable();
        
        showSuccessMessage('Order deleted successfully!');
        
    } catch (error) {
        console.error('Error deleting order:', error);
        showErrorMessage(error.message);
    }
}

// USERS MANAGEMENT
async function loadAdminUsers() {
    const tableBody = document.getElementById('users-table-body');
    tableBody.innerHTML = '<tr><td colspan="5" class="text-center">Loading users...</td></tr>';
    
    try {
        const response = await fetch('/api/admin/users', {
            headers: {
                'user-id': getCurrentUser().id
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch users');
        }
        
        currentUsers = await response.json();
        displayUsersTable();
        
    } catch (error) {
        console.error('Error loading users:', error);
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Error loading users</td></tr>';
    }
}

function displayUsersTable() {
    const tableBody = document.getElementById('users-table-body');
    const currentUserId = getCurrentUser().id;
    
    if (currentUsers.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center">No users found</td></tr>';
        return;
    }
    
    let html = '';
    currentUsers.forEach(user => {
        // Skip current admin user
        if (user.id === currentUserId) {
            return;
        }
        
        const roleBadge = getRoleBadge(user.role_name);
        
        html += `
            <tr>
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${roleBadge}</td>
                <td>
                    <select class="form-select form-select-sm me-2" onchange="updateUserRole(${user.id}, this.value)" style="width: auto; display: inline-block;">
                        <option value="3" ${user.role_id === 3 ? 'selected' : ''}>User</option>
                        <option value="2" ${user.role_id === 2 ? 'selected' : ''}>Moderator</option>
                        <option value="1" ${user.role_id === 1 ? 'selected' : ''}>Admin</option>
                    </select>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteUser(${user.id})" title="Delete User">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    if (html === '') {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center">No other users found</td></tr>';
    } else {
        tableBody.innerHTML = html;
    }
}

function getRoleBadge(roleName) {
    switch (roleName) {
        case 'admin':
            return '<span class="badge bg-danger">Admin</span>';
        case 'moderator':
            return '<span class="badge bg-warning">Moderator</span>';
        case 'user':
        default:
            return '<span class="badge bg-primary">User</span>';
    }
}

async function updateUserRole(userId, newRoleId) {
    hideMessages();
    
    try {
        const response = await fetch(`/api/admin/users/${userId}/role`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'user-id': getCurrentUser().id
            },
            body: JSON.stringify({ role_id: parseInt(newRoleId) })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to update user role');
        }
        
        // Update the user in our current list
        const userIndex = currentUsers.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            const roleNames = { 1: 'admin', 2: 'moderator', 3: 'user' };
            currentUsers[userIndex].role_id = parseInt(newRoleId);
            currentUsers[userIndex].role_name = roleNames[newRoleId];
            displayUsersTable();
        }
        
        showSuccessMessage('User role updated successfully!');
        
    } catch (error) {
        console.error('Error updating user role:', error);
        showErrorMessage(error.message);
        // Reload users to reset the dropdown
        loadAdminUsers();
    }
}

async function deleteUser(userId) {
    const user = currentUsers.find(u => u.id === userId);
    if (!user) return;
    
    if (!confirm(`Are you sure you want to delete user "${user.name}"? This action cannot be undone.`)) {
        return;
    }
    
    hideMessages();
    
    try {
        const response = await fetch(`/api/admin/users/${userId}`, {
            method: 'DELETE',
            headers: {
                'user-id': getCurrentUser().id
            }
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to delete user');
        }
        
        await loadAdminUsers();
        showSuccessMessage('User deleted successfully!');
        
    } catch (error) {
        console.error('Error deleting user:', error);
        showErrorMessage(error.message);
    }
} 