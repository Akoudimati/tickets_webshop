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
            
            // Add order items with manual ID generation to avoid AUTO_INCREMENT issues
            for (const item of items) {
                // Ensure item properties are not undefined
                const itemParams = [
                    toNullIfEmpty(item.ticket_id), 
                    toNullIfEmpty(item.quantity), 
                    toNullIfEmpty(item.price)
                ];
                
                // Check for undefined values in item parameters
                const itemHasUndefined = itemParams.some(param => param === undefined);
                if (itemHasUndefined) {
                    throw new Error(`Invalid item data: contains undefined values`);
                }
                
                // Generate a unique ID manually to avoid AUTO_INCREMENT problems
                let uniqueId;
                let maxAttempts = 10;
                let attempts = 0;
                
                while (attempts < maxAttempts) {
                    try {
                        // Get the next available ID
                        const [maxResult] = await conn.execute('SELECT IFNULL(MAX(id), 0) + 1 as next_id FROM order_items');
                        uniqueId = maxResult[0].next_id;
                        
                        // Insert with explicit ID
                        await conn.execute(
                            'INSERT INTO order_items (id, order_id, ticket_id, quantity, price) VALUES (?, ?, ?, ?, ?)',
                            [uniqueId, orderId, ...itemParams]
                        );
                        
                        console.log(`✅ Successfully added order item with ID: ${uniqueId}`);
                        break; // Success, exit the retry loop
                        
                    } catch (insertError) {
                        attempts++;
                        if (insertError.code === 'ER_DUP_ENTRY' && attempts < maxAttempts) {
                            console.log(`⚠️ ID ${uniqueId} already exists, retrying... (attempt ${attempts}/${maxAttempts})`);
                            // Wait a bit and retry with a new ID
                            await new Promise(resolve => setTimeout(resolve, 100));
                            continue;
                        } else {
                            throw insertError;
                        }
                    }
                }
                
                if (attempts >= maxAttempts) {
                    throw new Error('Failed to generate unique ID for order item after multiple attempts');
                }
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
        
        // Get all orders for the user
        const orders = await req.db.execute(`
            SELECT o.*
            FROM orders o
            WHERE o.user_id = ?
            ORDER BY o.created_at DESC
        `, [userId]);
        
        // For each order, get the detailed order items with images
        for (let order of orders) {
            const orderItems = await req.db.execute(`
                SELECT oi.*, t.title, t.description, t.img_url, t.category_id
                FROM order_items oi
                JOIN tickets t ON oi.ticket_id = t.id
                WHERE oi.order_id = ?
            `, [order.id]);
            
            order.items = orderItems;
        }
        
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

// Delete an order
router.delete('/:orderId', async (req, res) => {
    try {
        const orderId = req.params.orderId;
        
        // Start a transaction to delete order and its items
        const pool = req.db.getPool();
        const conn = await pool.promise().getConnection();
        
        try {
            await conn.beginTransaction();
            
            // First delete order items
            await conn.execute('DELETE FROM order_items WHERE order_id = ?', [orderId]);
            
            // Then delete the order
            const [result] = await conn.execute('DELETE FROM orders WHERE id = ?', [orderId]);
            
            if (result.affectedRows === 0) {
                await conn.rollback();
                return res.status(404).json({ error: 'Order not found' });
            }
            
            await conn.commit();
            
            res.json({ message: 'Order deleted successfully' });
        } catch (err) {
            await conn.rollback();
            throw err;
        } finally {
            conn.release();
        }
    } catch (error) {
        console.error('Error deleting order:', error);
        res.status(500).json({ 
            error: 'Server error',
            details: error.message 
        });
    }
});

module.exports = router; 