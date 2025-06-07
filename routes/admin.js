const express = require('express');
const router = express.Router();

// Middleware to check if user is admin
const isAdmin = async (req, res, next) => {
    // In production, you would verify this from session/JWT
    // For now, we'll check based on provided user ID
    try {
        const userId = req.headers['user-id'];
        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        
        const users = await req.db.execute(
            'SELECT role_id FROM users WHERE id = ?',
            [userId]
        );
        
        if (!users || users.length === 0) {
            return res.status(401).json({ error: 'User not found' });
        }
        
        // Check if user is admin (role_id = 1)
        if (users[0].role_id !== 1) {
            return res.status(403).json({ error: 'Forbidden: Admin access required' });
        }
        
        next();
    } catch (error) {
        console.error('Admin auth error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

// All admin routes use the isAdmin middleware
router.use(isAdmin);

// Get all users
router.get('/users', async (req, res) => {
    try {
        const users = await req.db.execute(
            'SELECT u.id, u.email, u.name, u.role_id, r.name as role_name, u.profile_img FROM users u JOIN roles r ON u.role_id = r.id ORDER BY u.id'
        );
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update user role
router.put('/users/:id/role', async (req, res) => {
    try {
        const userId = req.params.id;
        const { role_id } = req.body;
        
        // Prevent admin from changing their own role
        const currentUserId = req.headers['user-id'];
        if (parseInt(userId) === parseInt(currentUserId)) {
            return res.status(400).json({ error: 'Cannot change your own role' });
        }
        
        await req.db.execute(
            'UPDATE users SET role_id = ? WHERE id = ?',
            [role_id, userId]
        );
        
        res.json({ message: 'User role updated successfully' });
    } catch (error) {
        console.error('Error updating user role:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const currentUserId = req.headers['user-id'];
        
        // Prevent admin from deleting themselves
        if (parseInt(userId) === parseInt(currentUserId)) {
            return res.status(400).json({ error: 'Cannot delete your own account' });
        }
        
        await req.db.execute(
            'DELETE FROM users WHERE id = ?',
            [userId]
        );
        
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// CATEGORIES MANAGEMENT

// Get all categories
router.get('/categories', async (req, res) => {
    try {
        const categories = await req.db.execute('SELECT * FROM categories');
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create category
router.post('/categories', async (req, res) => {
    try {
        const { name, img_url } = req.body;
        
        const result = await req.db.execute(
            'INSERT INTO categories (name, img_url) VALUES (?, ?)',
            [name, img_url]
        );
        
        res.status(201).json({
            message: 'Category created successfully',
            categoryId: result.insertId
        });
    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update category
router.put('/categories/:id', async (req, res) => {
    try {
        const categoryId = req.params.id;
        const { name, img_url } = req.body;
        
        await req.db.execute(
            'UPDATE categories SET name = ?, img_url = ? WHERE id = ?',
            [name, img_url, categoryId]
        );
        
        res.json({ message: 'Category updated successfully' });
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// TICKETS MANAGEMENT

// Get all tickets
router.get('/tickets', async (req, res) => {
    try {
        const tickets = await req.db.execute(
            'SELECT t.*, c.name as category_name FROM tickets t JOIN categories c ON t.category_id = c.id'
        );
        res.json(tickets);
    } catch (error) {
        console.error('Error fetching tickets:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create ticket
router.post('/tickets', async (req, res) => {
    try {
        const { title, description, price, category_id, img_url } = req.body;
        
        const result = await req.db.execute(
            'INSERT INTO tickets (title, description, price, category_id, img_url) VALUES (?, ?, ?, ?, ?)',
            [title, description, price, category_id, img_url]
        );
        
        res.status(201).json({
            message: 'Ticket created successfully',
            ticketId: result.insertId
        });
    } catch (error) {
        console.error('Error creating ticket:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update ticket
router.put('/tickets/:id', async (req, res) => {
    try {
        const ticketId = req.params.id;
        const { title, description, price, category_id, img_url } = req.body;
        
        await req.db.execute(
            'UPDATE tickets SET title = ?, description = ?, price = ?, category_id = ?, img_url = ? WHERE id = ?',
            [title, description, price, category_id, img_url, ticketId]
        );
        
        res.json({ message: 'Ticket updated successfully' });
    } catch (error) {
        console.error('Error updating ticket:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete ticket
router.delete('/tickets/:id', async (req, res) => {
    try {
        const ticketId = req.params.id;
        
        await req.db.execute(
            'DELETE FROM tickets WHERE id = ?',
            [ticketId]
        );
        
        res.json({ message: 'Ticket deleted successfully' });
    } catch (error) {
        console.error('Error deleting ticket:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete category
router.delete('/categories/:id', async (req, res) => {
    try {
        const categoryId = req.params.id;
        
        // First check if there are tickets using this category
        const tickets = await req.db.execute(
            'SELECT COUNT(*) as count FROM tickets WHERE category_id = ?',
            [categoryId]
        );
        
        if (tickets[0].count > 0) {
            return res.status(400).json({ error: 'Cannot delete category with existing tickets' });
        }
        
        await req.db.execute(
            'DELETE FROM categories WHERE id = ?',
            [categoryId]
        );
        
        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ORDERS MANAGEMENT

// Get all orders
router.get('/orders', async (req, res) => {
    try {
        const orders = await req.db.execute(
            `SELECT o.*, 
                CASE 
                    WHEN o.user_id IS NOT NULL THEN u.name 
                    ELSE o.guest_name 
                END as customer_name 
            FROM orders o 
            LEFT JOIN users u ON o.user_id = u.id`
        );
        res.json(orders);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update order status
router.put('/orders/:id/status', async (req, res) => {
    try {
        const orderId = req.params.id;
        const { status } = req.body;
        
        if (!['compleet', 'in behandeling', 'geannuleerd'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status value' });
        }
        
        await req.db.execute(
            'UPDATE orders SET status = ? WHERE id = ?',
            [status, orderId]
        );
        
        res.json({ message: 'Order status updated successfully' });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router; 