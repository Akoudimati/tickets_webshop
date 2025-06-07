// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check which page we're on and load the appropriate data
    const currentPath = window.location.pathname;
    
    // Add click-to-pause functionality to the hero video
    const heroVideo = document.querySelector('.hero-video');
    if (heroVideo) {
        heroVideo.addEventListener('click', function() {
            if (this.paused) {
                this.play();
            } else {
                this.pause();
            }
        });
    }
    
    if (currentPath === '/' || currentPath === '/index.html') {
        // Home page - load only featured categories
        loadCategories();
    } else if (currentPath === '/categories.html') {
        // Categories page
        loadAllCategories();
    } else if (currentPath === '/tickets.html') {
        // All tickets page - now handled by filters.js
        // Check if filters.js is loaded by looking for the filter elements
        const filtersSection = document.querySelector('.filters-section');
        if (!filtersSection) {
            // Fallback to old method if filters are not present
            loadAllTickets();
        }
        // Otherwise, filters.js will handle the loading
    } else if (currentPath.includes('/category/')) {
        // Category detail page - extract the ID more carefully
        const pathParts = currentPath.split('/');
        const categoryId = pathParts[pathParts.length - 1]; // Get the last part of the URL
        loadCategoryTickets(categoryId);
    } else if (currentPath.includes('/ticket/')) {
        // Ticket detail page - extract the ID more carefully
        const pathParts = currentPath.split('/');
        const ticketId = pathParts[pathParts.length - 1]; // Get the last part of the URL
        loadTicketDetails(ticketId);
    }
});

// Fetch all categories and display them on the homepage
function loadCategories() {
    const categoriesContainer = document.getElementById('categories-container');
    if (!categoriesContainer) return;
    
    categoriesContainer.innerHTML = '<div class="loading-message">Loading categories...</div>';
    
    fetch('/api/categories')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(categories => {
            if (categories.length === 0) {
                categoriesContainer.innerHTML = '<div class="no-categories">No categories found.</div>';
                return;
            }
            
            let html = '';
            
            categories.forEach(category => {
                const imageUrl = category.img_url || 'https://via.placeholder.com/300x200/28a745/ffffff?text=' + encodeURIComponent(category.name);
                
                html += `
                    <div class="category-card">
                        <div class="category-image">
                            <img src="${imageUrl}" alt="${category.name}" onerror="this.src='https://via.placeholder.com/300x200/28a745/ffffff?text=${encodeURIComponent(category.name)}'">
                        </div>
                        <div class="category-content">
                            <h3 class="category-title">${category.name}</h3>
                            <a href="/category/${category.id}" class="category-btn">View Tickets</a>
                        </div>
                    </div>
                `;
            });
            
            categoriesContainer.innerHTML = html;
        })
        .catch(error => {
            console.error('Error fetching categories:', error);
            categoriesContainer.innerHTML = '<div class="error-message">Error loading categories. Please try again later.</div>';
        });
}

// Fetch the latest tickets for the homepage
function loadLatestTickets() {
    const ticketsContainer = document.getElementById('tickets-container');
    if (!ticketsContainer) return;
    
    ticketsContainer.innerHTML = '<div class="spinner-container"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';
    
    fetch('/api/tickets')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch tickets: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(tickets => {
            
            if (tickets.length === 0) {
                ticketsContainer.innerHTML = '<p>No tickets found.</p>';
                return;
            }
            
            let html = '';
            // Only show up to 6 tickets on the homepage
            const latestTickets = tickets.slice(0, 6);
            
            latestTickets.forEach(ticket => {
                // Determine availability class based on quantity available
                let availabilityClass = 'sold-out';
                let availabilityText = 'Sold Out';
                
                if (ticket.quantity_available > 10) {
                    availabilityClass = 'available';
                    availabilityText = 'Available';
                } else if (ticket.quantity_available > 0) {
                    availabilityClass = 'limited';
                    availabilityText = 'Limited';
                }
                
                // Use ticket image if available
                const imageUrl = ticket.img_url || 'https://via.placeholder.com/300x200?text=No+Image';
                
                html += `
                <div class="col-md-4 col-sm-6 mb-4">
                    <div class="card">
                        <img src="${imageUrl}" class="card-img-top" alt="${ticket.title}">
                        <div class="card-body">
                            <h5 class="card-title">${ticket.title || 'Event'}</h5>
                            <h6 class="card-subtitle mb-2 text-muted">${ticket.category_name}</h6>
                            <p class="card-text">${ticket.description || 'No description available'}</p>
                            <p class="price-tag">€${formatPrice(ticket.price)}</p>
                            <span class="availability ${availabilityClass}">${availabilityText}</span>
                            <div class="mt-3">
                                <a href="/ticket/${ticket.id}" class="btn btn-primary">View Details</a>
                            </div>
                        </div>
                    </div>
                </div>
                `;
            });
            
            ticketsContainer.innerHTML = html;
        })
        .catch(error => {
            console.error('Error fetching tickets:', error);
            ticketsContainer.innerHTML = '<div class="alert alert-danger">Error loading tickets. Please try again later.</div>';
        });
}

// Fetch all categories for the categories page
function loadAllCategories() {
    const categoriesContainer = document.getElementById('all-categories-container');
    if (!categoriesContainer) return;
    
    categoriesContainer.innerHTML = '<div class="spinner-container"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';
    
    fetch('/api/categories')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(categories => {
            if (categories.length === 0) {
                categoriesContainer.innerHTML = '<p>No categories found.</p>';
                return;
            }
            
            let html = '';
            
            categories.forEach(category => {
                html += `
                <div class="col-md-4 col-sm-6 mb-4">
                    <div class="card category-card">
                        <div class="card-body">
                            <h5 class="card-title">${category.name}</h5>
                            <p class="card-text">${category.description || 'No description available'}</p>
                            <a href="/category/${category.id}" class="btn btn-primary w-100">View Tickets</a>
                        </div>
                    </div>
                </div>
                `;
            });
            
            categoriesContainer.innerHTML = html;
        })
        .catch(error => {
            console.error('Error fetching categories:', error);
            categoriesContainer.innerHTML = '<div class="alert alert-danger">Error loading categories. Please try again later.</div>';
        });
}

// Fetch all tickets for the all tickets page
function loadAllTickets() {
    const ticketsContainer = document.getElementById('all-tickets-container');
    if (!ticketsContainer) return;
    
    ticketsContainer.innerHTML = '<div class="spinner-container"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';
    
    fetch('/api/tickets')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(tickets => {
            if (tickets.length === 0) {
                ticketsContainer.innerHTML = '<p>No tickets found.</p>';
                return;
            }
            
            let html = '';
            
            tickets.forEach(ticket => {
                // Determine availability class based on quantity available
                let availabilityClass = 'sold-out';
                let availabilityText = 'Sold Out';
                
                if (ticket.quantity_available > 10) {
                    availabilityClass = 'available';
                    availabilityText = 'Available';
                } else if (ticket.quantity_available > 0) {
                    availabilityClass = 'limited';
                    availabilityText = 'Limited';
                }
                
                // Use ticket image if available
                const imageUrl = ticket.img_url || 'https://via.placeholder.com/300x200?text=No+Image';
                
                html += `
                <div class="col-md-4 col-sm-6 mb-4">
                    <div class="card">
                        <img src="${imageUrl}" class="card-img-top" alt="${ticket.title}">
                        <div class="card-body">
                            <h5 class="card-title">${ticket.title || 'Event'}</h5>
                            <h6 class="card-subtitle mb-2 text-muted">${ticket.category_name}</h6>
                            <p class="card-text">${ticket.description || 'No description available'}</p>
                            <p class="price-tag">€${formatPrice(ticket.price)}</p>
                            <span class="availability ${availabilityClass}">${availabilityText}</span>
                            <div class="mt-3">
                                <a href="/ticket/${ticket.id}" class="btn btn-primary">View Details</a>
                            </div>
                        </div>
                    </div>
                </div>
                `;
            });
            
            ticketsContainer.innerHTML = html;
        })
        .catch(error => {
            console.error('Error fetching tickets:', error);
            ticketsContainer.innerHTML = '<div class="alert alert-danger">Error loading tickets. Please try again later.</div>';
        });
}

// Modified loadCategoryTickets function with better error handling and logging
function loadCategoryTickets(categoryId) {
    const categoryTitleElement = document.getElementById('category-title');
    const ticketsContainer = document.getElementById('category-tickets-container');
    
    if (!ticketsContainer) {
        console.error('Category tickets container not found on page');
        return;
    }
    
    ticketsContainer.innerHTML = '<div class="spinner-container"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';
    
    // First fetch the category details
    console.log(`Fetching category details from: /api/categories/${categoryId}`);
    fetch(`/api/categories/${categoryId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch category: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(category => {
            
            if (categoryTitleElement) {
                categoryTitleElement.textContent = category.name || 'Category';
                // Update all elements with category-title ID (there might be multiple)
                document.querySelectorAll('#category-title').forEach(el => {
                    el.textContent = category.name || 'Category';
                });
            }
            
            // Then fetch the tickets for this category
            return fetch(`/api/categories/${categoryId}/tickets`);
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch tickets: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(tickets => {
            
            if (tickets.length === 0) {
                ticketsContainer.innerHTML = '<div class="alert alert-info">No tickets found for this category.</div>';
                return;
            }
            
            let html = '';
            
            tickets.forEach(ticket => {
                // Determine availability class based on quantity available
                let availabilityClass = 'sold-out';
                let availabilityText = 'Sold Out';
                
                if (ticket.quantity_available > 10) {
                    availabilityClass = 'available';
                    availabilityText = 'Available';
                } else if (ticket.quantity_available > 0) {
                    availabilityClass = 'limited';
                    availabilityText = 'Limited';
                }
                
                // Use ticket image if available
                const imageUrl = ticket.img_url || 'https://via.placeholder.com/300x200?text=No+Image';
                
                html += `
                <div class="col-md-4 col-sm-6 mb-4">
                    <div class="card">
                        <img src="${imageUrl}" class="card-img-top" alt="${ticket.title}">
                        <div class="card-body">
                            <h5 class="card-title">${ticket.title || 'Event'}</h5>
                            <p class="card-text">${ticket.description || 'No description available'}</p>
                            <p class="price-tag">€${formatPrice(ticket.price)}</p>
                            <span class="availability ${availabilityClass}">${availabilityText}</span>
                            <div class="mt-3">
                                <a href="/ticket/${ticket.id}" class="btn btn-primary">View Details</a>
                            </div>
                        </div>
                    </div>
                </div>
                `;
            });
            
            ticketsContainer.innerHTML = html;
        })
        .catch(error => {
            console.error('Error in category/tickets fetch chain:', error);
            ticketsContainer.innerHTML = `
                <div class="alert alert-danger">
                    <strong>Error loading tickets:</strong> ${error.message}
                    <p>Please try refreshing the page or contact support if the problem persists.</p>
                </div>`;
        });
}

// Fetch details for a specific ticket
function loadTicketDetails(ticketId) {
    const ticketDetailsContainer = document.getElementById('ticket-details-container');
    if (!ticketDetailsContainer) return;
    
    ticketDetailsContainer.innerHTML = '<div class="spinner-container"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';
    
    fetch(`/api/tickets/${ticketId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch ticket details: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(ticket => {
            
            // Determine availability class based on quantity available
            let availabilityClass = 'sold-out';
            let availabilityText = 'Sold Out';
            let canPurchase = false;
            
            if (ticket.quantity_available > 10) {
                availabilityClass = 'available';
                availabilityText = 'Available';
                canPurchase = true;
            } else if (ticket.quantity_available > 0) {
                availabilityClass = 'limited';
                availabilityText = `Limited (${ticket.quantity_available} left)`;
                canPurchase = true;
            }
            
            // Get image URL (use placeholder if not available)
            const imageUrl = ticket.img_url || 'https://via.placeholder.com/600x400?text=No+Image';
            
            const html = `
                <div class="row">
                    <div class="col-md-6">
                        <div class="card">
                            <img src="${imageUrl}" class="card-img-top" alt="${ticket.title}">
                            <div class="card-body">
                                <h2 class="card-title">${ticket.title}</h2>
                                <h4 class="card-subtitle mb-2 text-muted">${ticket.category_name}</h4>
                                <hr>
                                <p>${ticket.description || 'No description available'}</p>
                                <p class="price-tag fs-3">€${formatPrice(ticket.price)}</p>
                                <p><span class="availability ${availabilityClass}">${availabilityText}</span></p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-6">
                        ${canPurchase ? `
                            <div class="card">
                                <div class="card-header">
                                    <h4>Add to Cart</h4>
                                </div>
                                <div class="card-body">
                                    <div class="mb-3">
                                        <label for="quantity" class="form-label">Quantity</label>
                                        <input type="number" class="form-control" id="quantity" min="1" max="${ticket.quantity_available}" value="1" style="max-width: 120px;">
                                    </div>
                                    
                                    <div class="mb-3">
                                        <div class="d-flex justify-content-between">
                                            <span>Price per ticket:</span>
                                            <span>€${formatPrice(ticket.price)}</span>
                                        </div>
                                        <div class="d-flex justify-content-between">
                                            <span>Quantity:</span>
                                            <span id="display-quantity">1</span>
                                        </div>
                                        <hr>
                                        <div class="d-flex justify-content-between fw-bold">
                                            <span>Total:</span>
                                            <span id="display-total">€${formatPrice(ticket.price)}</span>
                                        </div>
                                    </div>
                                    
                                    <button id="add-to-cart-btn" class="btn btn-primary btn-lg w-100 mb-2">Add to Cart</button>
                                    <a href="/cart.html" class="btn btn-outline-success w-100">View Cart</a>
                                    
                                    <div class="mt-3">
                                        <small class="text-muted">
                                            You can review your order and add customer information in the cart before checkout.
                                        </small>
                                    </div>
                                </div>
                            </div>
                        ` : `
                            <div class="card">
                                <div class="card-body">
                                    <div class="alert alert-warning">
                                        <h4>Sorry, tickets are currently not available for purchase.</h4>
                                        <p>This event is sold out or tickets are no longer available.</p>
                                    </div>
                                </div>
                            </div>
                        `}
                    </div>
                </div>
            `;
            
            ticketDetailsContainer.innerHTML = html;
            
            // Add event listeners after the form is rendered
            if (canPurchase) {
                setupAddToCartForm(ticket);
            }
        })
        .catch(error => {
            console.error('Error fetching ticket details:', error);
            ticketDetailsContainer.innerHTML = '<div class="alert alert-danger">Error loading ticket details. Please try again later.</div>';
        });
}

// Setup add to cart form event listeners
function setupAddToCartForm(ticket) {
    const quantityInput = document.getElementById('quantity');
    const displayQuantity = document.getElementById('display-quantity');
    const displayTotal = document.getElementById('display-total');
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    
    // Update totals when quantity changes
    if (quantityInput && displayQuantity && displayTotal) {
        quantityInput.addEventListener('input', function() {
            const quantity = parseInt(this.value) || 1;
            const total = quantity * parseFloat(ticket.price);
            
            displayQuantity.textContent = quantity;
            displayTotal.textContent = `€${formatPrice(total)}`;
        });
    }
    
    // Handle add to cart button click
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function() {
            const quantity = parseInt(document.getElementById('quantity').value) || 1;
            
            // Load cart manager if not already loaded
            if (!window.cartManager) {
                // Load cart functionality
                const script = document.createElement('script');
                script.src = '/js/cart.js';
                script.onload = function() {
                    addTicketToCart(ticket, quantity);
                };
                document.head.appendChild(script);
            } else {
                addTicketToCart(ticket, quantity);
            }
        });
    }
}

// Add ticket to cart
function addTicketToCart(ticket, quantity) {
    try {
        // Simple check for logged in user (directly check localStorage)
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            showToastNotification('Please log in to add items to cart.', 'error');
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 2000);
            return;
        }
        
        let user;
        try {
            user = JSON.parse(userStr);
        } catch (e) {
            console.error('Error parsing user data:', e);
            showToastNotification('Please log in again.', 'error');
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 2000);
            return;
        }
        
        if (!user || !user.id) {
            showToastNotification('Please log in to add items to cart.', 'error');
            setTimeout(() => {
                window.location.href = '/login.html';
            }, 1500);
            return;
        }
        
        // Validate ticket data
        if (!ticket || !ticket.id || !ticket.title || !ticket.price) {
            showToastNotification('Invalid ticket data. Please try again.', 'error');
            return;
        }
        
        // Manual cart management with user-specific key
        const cartKey = `shoppingCart_user_${user.id}`;
        let existingCart;
        
        try {
            existingCart = JSON.parse(localStorage.getItem(cartKey) || '[]');
        } catch (e) {
            console.error('Error parsing cart data:', e);
            existingCart = [];
        }
        
        // Check if ticket already exists in cart
        const existingItem = existingCart.find(item => 
            item && item.ticket && item.ticket.id === ticket.id
        );
        
        if (existingItem) {
            existingItem.quantity = (existingItem.quantity || 0) + quantity;
        } else {
            existingCart.push({
                ticket: {
                    id: ticket.id,
                    title: ticket.title,
                    price: parseFloat(ticket.price),
                    category_name: ticket.category_name || '',
                    description: ticket.description || '',
                    img_url: ticket.img_url || '',
                    quantity_available: ticket.quantity_available || 0
                },
                quantity: quantity,
                addedAt: new Date().toISOString()
            });
        }
        
        // Save updated cart
        localStorage.setItem(cartKey, JSON.stringify(existingCart));
        
        // Update cart count in navigation
        updateCartCountSimple(existingCart);
        
        // Show success message
        const successMsg = `${quantity} ${ticket.title} ticket(s) added to cart!`;
        showToastNotification(successMsg, 'success');
        
    } catch (error) {
        console.error('Error adding to cart:', error);
        showToastNotification('Error adding ticket to cart. Please try again.', 'error');
    }
}

// Simple function to update cart count
function updateCartCountSimple(cart) {
    try {
        const cartCount = cart.reduce((total, item) => total + (item.quantity || 0), 0);
        
        const cartBadges = document.querySelectorAll('.cart-count');
        cartBadges.forEach(badge => {
            if (cartCount > 0) {
                badge.textContent = cartCount;
                badge.style.display = 'inline';
            } else {
                badge.style.display = 'none';
            }
        });
    } catch (error) {
        console.error('Error updating cart count:', error);
    }
}

// Show toast notification
function showToastNotification(message, type = 'success') {
    // Remove any existing toast
    const existingToast = document.querySelector('.custom-toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `custom-toast ${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <div class="toast-icon">
                ${type === 'success' ? '✅' : '❌'}
            </div>
            <div class="toast-message">${message}</div>
            <button class="toast-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    // Add styles if not already added
    if (!document.querySelector('#toast-styles')) {
        const styles = document.createElement('style');
        styles.id = 'toast-styles';
        styles.textContent = `
            .custom-toast {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                min-width: 300px;
                max-width: 400px;
                background: white;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                transform: translateX(400px);
                transition: transform 0.3s ease-out;
                border-left: 4px solid #28a745;
            }
            
            .custom-toast.error {
                border-left-color: #dc3545;
            }
            
            .custom-toast.show {
                transform: translateX(0);
            }
            
            .toast-content {
                display: flex;
                align-items: center;
                padding: 16px;
                gap: 12px;
            }
            
            .toast-icon {
                font-size: 20px;
                flex-shrink: 0;
            }
            
            .toast-message {
                flex: 1;
                font-size: 14px;
                font-weight: 500;
                color: #333;
                line-height: 1.4;
            }
            
            .toast-close {
                background: none;
                border: none;
                font-size: 20px;
                color: #999;
                cursor: pointer;
                padding: 0;
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: background-color 0.2s;
            }
            
            .toast-close:hover {
                background-color: #f0f0f0;
                color: #666;
            }
            
            @media (max-width: 480px) {
                .custom-toast {
                    right: 10px;
                    left: 10px;
                    min-width: auto;
                    max-width: none;
                    transform: translateY(-100px);
                }
                
                .custom-toast.show {
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(styles);
    }
    
    // Add to page
    document.body.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.remove();
                }
            }, 300);
        }
    }, 4000);
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
    // Convert price to number if it's a string, or use 0 if it's not defined
    const numPrice = price ? parseFloat(price) : 0;
    return numPrice.toFixed(2);
} 