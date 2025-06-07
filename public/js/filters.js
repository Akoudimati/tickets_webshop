// Global variables to store all tickets and current filtered tickets
let allTickets = [];
let filteredTickets = [];
let filtersVisible = false;

// Initialize filters when the page loads
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname === '/tickets.html') {
        // Load categories for filters first, then set up everything else
        loadCategoriesForFilters().then(() => {
            // Set up event listeners for filters
            setupFilterEventListeners();
            
            // Load all tickets initially
            loadAllTicketsWithFilters();
        });
    }
});

async function loadCategoriesForFilters() {
    try {
        const response = await fetch('/api/categories');
        if (!response.ok) {
            throw new Error('Failed to fetch categories');
        }
        
        const categories = await response.json();
        const categoryFiltersContainer = document.querySelector('.category-filters');
        
        if (!categoryFiltersContainer) return;
        
        // Create the filter HTML
        let filtersHTML = `
            <div class="form-check form-check-inline">
                <input class="form-check-input category-filter" type="checkbox" value="all" id="category-all" checked>
                <label class="form-check-label" for="category-all">All Categories</label>
            </div>
        `;
        
        categories.forEach(category => {
            const categoryId = `category-${category.name.toLowerCase().replace(/\s+/g, '-')}`;
            filtersHTML += `
                <div class="form-check form-check-inline">
                    <input class="form-check-input category-filter" type="checkbox" value="${category.name}" id="${categoryId}">
                    <label class="form-check-label" for="${categoryId}">${category.name}</label>
                </div>
            `;
        });
        
        categoryFiltersContainer.innerHTML = filtersHTML;
        
    } catch (error) {
        console.error('Error loading categories for filters:', error);
        // Fallback to default categories if API fails
        console.log('Using fallback categories');
    }
}

function setupFilterEventListeners() {
    // Category filter checkboxes
    const categoryFilters = document.querySelectorAll('.category-filter');
    categoryFilters.forEach(filter => {
        filter.addEventListener('change', handleCategoryFilterChange);
    });

    // Price sorting radio buttons
    const priceSortOptions = document.querySelectorAll('.price-sort');
    priceSortOptions.forEach(option => {
        option.addEventListener('change', applyFilters);
    });
}

function toggleFilters() {
    const filtersSection = document.getElementById('filters-section');
    const toggleBtn = document.getElementById('filter-toggle-btn');
    
    if (!filtersSection || !toggleBtn) return;
    
    filtersVisible = !filtersVisible;
    
    if (filtersVisible) {
        filtersSection.style.display = 'block';
        toggleBtn.innerHTML = '<i class="fas fa-filter me-2"></i>Hide Filters';
        toggleBtn.classList.remove('btn-primary');
        toggleBtn.classList.add('btn-secondary');
        
        // Add smooth fade-in animation
        filtersSection.style.opacity = '0';
        setTimeout(() => {
            filtersSection.style.transition = 'opacity 0.3s ease';
            filtersSection.style.opacity = '1';
        }, 10);
    } else {
        filtersSection.style.display = 'none';
        toggleBtn.innerHTML = '<i class="fas fa-filter me-2"></i>Show Filters';
        toggleBtn.classList.remove('btn-secondary');
        toggleBtn.classList.add('btn-primary');
    }
}

function handleCategoryFilterChange(event) {
    const checkbox = event.target;
    const isAllCategories = checkbox.value === 'all';
    
    if (isAllCategories && checkbox.checked) {
        // If "All Categories" is checked, uncheck all other categories
        const otherFilters = document.querySelectorAll('.category-filter:not([value="all"])');
        otherFilters.forEach(filter => {
            filter.checked = false;
        });
    } else if (!isAllCategories && checkbox.checked) {
        // If any specific category is checked, uncheck "All Categories"
        const allCategoriesFilter = document.querySelector('.category-filter[value="all"]');
        if (allCategoriesFilter) {
            allCategoriesFilter.checked = false;
        }
    } else if (!isAllCategories && !checkbox.checked) {
        // If unchecking a specific category, check if no categories are selected
        const checkedCategories = document.querySelectorAll('.category-filter:not([value="all"]):checked');
        if (checkedCategories.length === 0) {
            // If no specific categories are selected, check "All Categories"
            const allCategoriesFilter = document.querySelector('.category-filter[value="all"]');
            if (allCategoriesFilter) {
                allCategoriesFilter.checked = true;
            }
        }
    }
    
    // Apply filters after category change
    applyFilters();
}

function loadAllTicketsWithFilters() {
    const ticketsContainer = document.getElementById('all-tickets-container');
    const resultsCount = document.getElementById('results-count');
    
    if (!ticketsContainer) return;
    
    ticketsContainer.innerHTML = '<div class="spinner-container"><div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div></div>';
    if (resultsCount) resultsCount.textContent = 'Loading tickets...';
    
    fetch('/api/tickets')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(tickets => {
            allTickets = tickets;
            filteredTickets = [...tickets]; // Initially show all tickets
            applyFilters(); // Apply any existing filters
        })
        .catch(error => {
            console.error('Error fetching tickets:', error);
            ticketsContainer.innerHTML = '<div class="alert alert-danger">Error loading tickets. Please try again later.</div>';
            if (resultsCount) resultsCount.textContent = 'Error loading tickets';
        });
}

function applyFilters() {
    // Get selected categories
    const selectedCategories = getSelectedCategories();
    
    // Get price sorting option
    const priceSorting = getPriceSorting();
    
    // Filter tickets by category
    filteredTickets = allTickets.filter(ticket => {
        // Category filter
        const categoryMatch = selectedCategories.length === 0 || 
                             selectedCategories.includes('all') || 
                             selectedCategories.includes(ticket.category_name);
        
        return categoryMatch;
    });
    
    // Sort tickets by price if needed
    if (priceSorting === 'low-to-high') {
        filteredTickets.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (priceSorting === 'high-to-low') {
        filteredTickets.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    }
    // If 'default', keep original order (no sorting)
    
    // Display filtered tickets
    displayFilteredTickets();
    updateResultsCount();
}

function getSelectedCategories() {
    const checkedCategories = [];
    const categoryFilters = document.querySelectorAll('.category-filter:checked');
    
    categoryFilters.forEach(filter => {
        checkedCategories.push(filter.value);
    });
    
    return checkedCategories;
}

function getPriceSorting() {
    const selectedSort = document.querySelector('.price-sort:checked');
    return selectedSort ? selectedSort.value : 'default';
}

function displayFilteredTickets() {
    const ticketsContainer = document.getElementById('all-tickets-container');
    if (!ticketsContainer) return;
    
    if (filteredTickets.length === 0) {
        ticketsContainer.innerHTML = '<div class="col-12"><div class="alert alert-info">No tickets found matching your filters.</div></div>';
        return;
    }
    
    let html = '';
    
    filteredTickets.forEach(ticket => {
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
}

function updateResultsCount() {
    const resultsCount = document.getElementById('results-count');
    if (!resultsCount) return;
    
    const total = allTickets.length;
    const filtered = filteredTickets.length;
    
    if (filtered === total) {
        resultsCount.textContent = `Showing all ${total} tickets`;
    } else {
        resultsCount.textContent = `Showing ${filtered} of ${total} tickets`;
    }
}

function clearAllFilters() {
    // Reset category filters to "All Categories"
    const categoryFilters = document.querySelectorAll('.category-filter');
    categoryFilters.forEach(filter => {
        filter.checked = filter.value === 'all';
    });
    
    // Reset price sorting to default
    const defaultSort = document.getElementById('price-default');
    if (defaultSort) {
        defaultSort.checked = true;
    }
    
    applyFilters();
}

// Format price function (reused from main.js)
function formatPrice(price) {
    if (typeof price === 'string') {
        return parseFloat(price).toFixed(2);
    }
    return parseFloat(price || 0).toFixed(2);
} 