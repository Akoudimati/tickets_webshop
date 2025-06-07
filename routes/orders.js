const express = require('express');
const router = express.Router();

// Create a new order
router.post('/', async (req, res) => {
    try {
        const { 
            user_id, 
            guest_first_name,
            guest_last_name,
            guest_email,
            guest_phone,
            guest_name, 
            guest_postcode, 
            guest_street, 
            guest_housenumber,
            guest_city,
            order_notes,
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
                toNullIfEmpty(guest_first_name),
                toNullIfEmpty(guest_last_name),
                toNullIfEmpty(guest_email),
                toNullIfEmpty(guest_phone),
                toNullIfEmpty(guest_name),
                toNullIfEmpty(guest_postcode),
                toNullIfEmpty(guest_street),
                toNullIfEmpty(guest_housenumber),
                toNullIfEmpty(guest_city),
                toNullIfEmpty(order_notes),
                toNullIfEmpty(total_price)
            ];
            
            // Check for undefined values before executing query
            const hasUndefined = orderParams.some(param => param === undefined);
            if (hasUndefined) {
                throw new Error('Invalid data: contains undefined values');
            }
            
            // Create the order with new fields
            const [orderResult] = await conn.execute(
                `INSERT INTO orders 
                (user_id, guest_first_name, guest_last_name, guest_email, guest_phone, 
                 guest_name, guest_postcode, guest_street, guest_housenumber, guest_city, 
                 order_notes, total_price, status) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'in behandeling')`,
                orderParams
            );
            
            const orderId = orderResult.insertId;
            
            // Add order items and update ticket quantities
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
                
                // Update ticket quantity (decrease available quantity)
                const [updateResult] = await conn.execute(
                    'UPDATE tickets SET quantity_available = quantity_available - ? WHERE id = ? AND quantity_available >= ?',
                    [item.quantity, item.ticket_id, item.quantity]
                );
                
                if (updateResult.affectedRows === 0) {
                    throw new Error(`Insufficient tickets available for ticket ID ${item.ticket_id}`);
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
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Get all orders for a user
router.get('/user/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        
        // Get the orders
        const orders = await req.db.execute(
            'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );
        
        // Get the order items for each order
        const ordersWithItems = await Promise.all(orders.map(async (order) => {
            const items = await req.db.execute(
                `SELECT oi.*, t.title, t.img_url 
                FROM order_items oi 
                JOIN tickets t ON oi.ticket_id = t.id 
                WHERE oi.order_id = ?`,
                [order.id]
            );
            
            return {
                ...order,
                items: items
            };
        }));
        
        res.json(ordersWithItems);
    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get a specific order
router.get('/:id', async (req, res) => {
    try {
        const orderId = req.params.id;
        
        // Get the order
        const orders = await req.db.execute(
            'SELECT * FROM orders WHERE id = ?',
            [orderId]
        );
        
        if (!orders || orders.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        // Get the order items
        const items = await req.db.execute(
            `SELECT oi.*, t.title, t.img_url 
            FROM order_items oi 
            JOIN tickets t ON oi.ticket_id = t.id 
            WHERE oi.order_id = ?`,
            [orderId]
        );
        
        const orderWithItems = {
            ...orders[0],
            items: items
        };
        
        res.json(orderWithItems);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router; 