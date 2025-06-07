# Sports Ticket System - Shopping Cart & Order Management

## New Features Added

### 1. Shopping Cart System
- **Add to Cart**: Users can add tickets to their cart before purchasing
- **Cart Management**: View, modify quantities, and remove items from cart
- **Cart Persistence**: Cart items are saved in localStorage and persist across sessions
- **Cart Counter**: Navigation shows the number of items in cart with a badge

### 2. Two-Step Purchase Process
- **Step 1**: Add tickets to cart from any ticket detail page
- **Step 2**: Proceed to checkout with customer information form
- **Order Review**: Users can review all items before completing purchase

### 3. Complete Order System
- **Customer Information Form**: Full customer details collection including first name, last name, email, phone, and delivery address
- **Order Summary**: Real-time calculation of total price based on cart contents
- **Order Notes**: Optional field for special instructions
- **Inventory Management**: Automatic ticket quantity reduction when orders are placed

### 4. Orders Management
- **My Orders**: Users can view all their orders with complete details
- **Order Status**: Visual status indicators (Processing, Complete, Cancelled)
- **Order Items**: Detailed view of purchased tickets with images
- **Customer Information**: Display of delivery and contact information

## User Journey

### 1. Browse & Add to Cart
1. Users browse tickets on any ticket detail page
2. Select quantity and click "Add to Cart"
3. Cart counter in navigation updates automatically
4. Users can continue shopping or proceed to cart

### 2. Cart Management
1. Access cart via navigation link
2. Review all selected tickets
3. Modify quantities or remove items
4. See real-time total calculations
5. Proceed to checkout when ready

### 3. Checkout Process
1. Login required to proceed to checkout
2. Fill in complete customer information
3. Review order summary with all items
4. Complete order with one click
5. Automatic redirect to orders page

## Database Changes

### New Fields Added to `orders` Table:
- `guest_first_name` - Customer's first name
- `guest_last_name` - Customer's last name  
- `guest_email` - Customer's email address
- `guest_phone` - Customer's phone number
- `guest_city` - Delivery city
- `order_notes` - Optional order notes

### New Fields Added to `tickets` Table:
- `quantity_available` - Number of tickets available for purchase

## Setup Instructions

### 1. Database Update
Your database schema in `LoginSystem/backup/sport_tickets.sql` has been updated with all the new fields. Simply import this file to your database:

**Option 1: Using phpMyAdmin**
1. Go to phpMyAdmin
2. Select your `sport_tickets` database
3. Go to "Import" tab
4. Choose the `LoginSystem/backup/sport_tickets.sql` file
5. Click "Go"

**Option 2: Using MySQL Command Line**
```bash
mysql -u your_username -p sport_tickets < LoginSystem/backup/sport_tickets.sql
```

**⚠️ Important**: The updated SQL file preserves all your existing data while adding the new fields. Your existing tickets, users, and any existing orders will remain intact.

### 2. File Structure
The following new files have been added:
- `public/cart.html` - Shopping cart page
- `public/checkout.html` - Checkout page with customer information form
- `public/orders.html` - Orders page template
- `public/js/cart.js` - Cart management functionality
- `public/js/checkout.js` - Checkout process functionality
- `public/js/orders.js` - Orders page functionality

### 3. Updated Files
- `public/js/main.js` - Updated with "Add to Cart" functionality (replaced immediate purchase)
- `public/js/auth.js` - Added cart link with counter to navigation
- `routes/orders.js` - Updated to handle new customer fields
- `index.js` - Added cart and checkout page routes
- `LoginSystem/backup/sport_tickets.sql` - Updated with new database schema

## Usage Guide

### For Users:
1. **Browse Tickets**: Visit any ticket detail page
2. **Add to Cart**: Select quantity and click "Add to Cart"
3. **Manage Cart**: Use cart page to review, modify, or remove items
4. **Checkout Process**:
   - Click "Proceed to Checkout" from cart
   - Fill in customer information (all required fields marked with *)
   - Add delivery address
   - Optional: Add order notes
   - Review order summary
   - Click "Complete Order"
5. **View Orders**: Access "My Orders" from the user dropdown menu

### For Administrators:
- All existing admin functionality remains unchanged
- Orders can be viewed and managed through the existing admin panel
- New order fields are automatically included in order management

## Order Status Values:
- `in behandeling` - Order is being processed
- `compleet` - Order has been completed
- `geannuleerd` - Order has been cancelled

## Features:
- ✅ Shopping cart with persistent storage
- ✅ Cart counter in navigation
- ✅ Two-step purchase process (cart → checkout)
- ✅ Real-time inventory tracking
- ✅ Complete customer information collection
- ✅ Order history and management
- ✅ Responsive design for all devices
- ✅ User authentication integration
- ✅ Automatic total calculation
- ✅ Form validation
- ✅ Error handling and user feedback

## Security:
- Cart data stored locally (no sensitive information)
- Order completion requires user authentication
- Input validation on both client and server side
- SQL injection protection through parameterized queries
- XSS protection through proper data escaping

## Testing:
1. Create a user account and log in
2. Navigate to any ticket detail page
3. Add tickets to cart (try different quantities)
4. Check cart counter in navigation
5. Go to cart page and modify items
6. Proceed to checkout and fill form
7. Complete the order
8. Check "My Orders" to see the order
9. Verify inventory was reduced on the tickets

Your shopping cart and order system is now fully functional with a user-friendly two-step purchase process! 