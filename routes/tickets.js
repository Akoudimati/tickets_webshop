const express = require('express');
const router = express.Router();

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

// Get a specific category
router.get('/categories/:id', async (req, res) => {
    const categoryId = req.params.id;
    try {
        const categories = await req.db.execute(
            'SELECT * FROM categories WHERE id = ?',
            [categoryId]
        );
        
        if (!categories || categories.length === 0) {
            return res.status(404).json({ error: 'Category not found' });
        }
        
        res.json(categories[0]);
    } catch (error) {
        console.error(`Error fetching category ${categoryId}:`, error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all tickets for a category
router.get('/categories/:id/tickets', async (req, res) => {
    const categoryId = req.params.id;
    try {
        const tickets = await req.db.execute(
            'SELECT *, 100 as quantity_available FROM tickets WHERE category_id = ?',
            [categoryId]
        );
        
        // Format ticket data
        const formattedTickets = tickets.map(ticket => ({
            ...ticket,
            price: ticket.price // Keep as string, will be parsed in frontend
        }));
        
        res.json(formattedTickets);
    } catch (error) {
        console.error(`Error fetching tickets for category ${categoryId}:`, error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all tickets
router.get('/tickets', async (req, res) => {
    try {
        const tickets = await req.db.execute(
            'SELECT t.*, c.name as category_name, 100 as quantity_available FROM tickets t JOIN categories c ON t.category_id = c.id'
        );
        
        // Format ticket data
        const formattedTickets = tickets.map(ticket => ({
            ...ticket,
            price: ticket.price // Keep as string, will be parsed in frontend
        }));
        
        res.json(formattedTickets);
    } catch (error) {
        console.error('Error fetching tickets:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get a specific ticket
router.get('/tickets/:id', async (req, res) => {
    const ticketId = req.params.id;
    try {
        const tickets = await req.db.execute(
            'SELECT t.*, c.name as category_name, 100 as quantity_available FROM tickets t JOIN categories c ON t.category_id = c.id WHERE t.id = ?',
            [ticketId]
        );
        
        if (!tickets || tickets.length === 0) {
            return res.status(404).json({ error: 'Ticket not found' });
        }
        
        // Format ticket data
        const ticket = {
            ...tickets[0],
            price: tickets[0].price // Keep as string, will be parsed in frontend
        };
        
        res.json(ticket);
    } catch (error) {
        console.error(`Error fetching ticket ${ticketId}:`, error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router; 