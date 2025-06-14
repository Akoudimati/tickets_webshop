const express = require('express');
const router = express.Router();

// Create a new order
router.post('/', async (req, res) => {
    try {
        const { 
            user_id, 
            guest_name, 
            guest_postcode, 
            guest_street, 
            guest_housenumber,
            total_price, 
            items 
        } = req.body;
        
        // Helper function to convert undefined/empty to null
        const toNullIfEmpty = (value) => {
            if (value === undefined || value === null || value === '') {
                return null;
            }
            return value;
        };
        
        // Validate required fields
        if (!user_id) {
            return res.status(400).json({ error: 'User ID is required' });
        }
        
        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'Order items are required' });
        }
        
        if (!total_price) {
            return res.status(400).json({ error: 'Total price is required' });
        }
        
        // Start a transaction
        const pool = req.db.getPool();
        const conn = await pool.promise().getConnection();
        
        try {
            await conn.beginTransaction();
            
            // Prepare parameters, converting undefined/empty to null
            const orderParams = [
                toNullIfEmpty(user_id),
                toNullIfEmpty(guest_name),
                toNullIfEmpty(guest_postcode),
                toNullIfEmpty(guest_street),
                toNullIfEmpty(guest_housenumber),
                toNullIfEmpty(total_price)
            ];
            
            // Check for undefined values before executing query
            const hasUndefined = orderParams.some(param => param === undefined);
            if (hasUndefined) {
                throw new Error('Invalid data: contains undefined values');
            }
            
            // Create the order with existing database columns
            const [orderResult] = await conn.execute(
                `INSERT INTO orders 
                (user_id, guest_name, guest_postcode, guest_street, guest_housenumber, total_price, status) 
                VALUES (?, ?, ?, ?, ?, ?, 'in behandeling')`,
                orderParams
            );
            
            const orderId = orderResult.insertId;
            
            // Add order items
            for (const item of items) {
                // Ensure item properties are not undefined
                const itemParams = [
                    toNullIfEmpty(orderId), 
                    toNullIfEmpty(item.ticket_id), 
                    toNullIfEmpty(item.quantity), 
                    toNullIfEmpty(item.price)
                ];
                
                // Check for undefined values in item parameters
                const itemHasUndefined = itemParams.some(param => param === undefined);
                if (itemHasUndefined) {
                    throw new Error(`Invalid item data: contains undefined values`);
                }
                
                // Add order item
                await conn.execute(
                    'INSERT INTO order_items (order_id, ticket_id, quantity, price) VALUES (?, ?, ?, ?)',
                    itemParams
                );
            }
            
            await conn.commit();
            
            res.status(201).json({
                message: 'Order created successfully',
                orderId: orderId
            });
        } catch (err) {
            await conn.rollback();
            throw err;
        } finally {
            conn.release();
        }
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ 
            error: 'Server error',
            details: error.message 
        });
    }
});

// Get all orders for a user
router.get('/user/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        
        const orders = await req.db.execute(`
            SELECT o.*, 
                   GROUP_CONCAT(
                       CONCAT(t.title, ' (', oi.quantity, 'x)')
                       SEPARATOR ', '
                   ) as items
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            LEFT JOIN tickets t ON oi.ticket_id = t.id
            WHERE o.user_id = ?
            GROUP BY o.id
            ORDER BY o.created_at DESC
        `, [userId]);
        
        res.json(orders);
    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get order details
router.get('/:orderId', async (req, res) => {
    try {
        const orderId = req.params.orderId;
        
        // Get order details
        const orders = await req.db.execute(`
            SELECT o.*, u.name as user_name, u.email as user_email
            FROM orders o
            LEFT JOIN users u ON o.user_id = u.id
            WHERE o.id = ?
        `, [orderId]);
        
        if (!orders || orders.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        // Get order items
        const orderItems = await req.db.execute(`
            SELECT oi.*, t.title, t.description, t.img_url
            FROM order_items oi
            JOIN tickets t ON oi.ticket_id = t.id
            WHERE oi.order_id = ?
        `, [orderId]);
        
        const order = orders[0];
        order.items = orderItems;
        
        res.json(order);
    } catch (error) {
        console.error('Error fetching order details:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router; 