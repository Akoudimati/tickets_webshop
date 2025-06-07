require('dotenv').config();
const express = require('express');
const db = require('./db');
const app = express();
const port = process.env.PORT || 3002;
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const ticketRoutes = require('./routes/tickets');
const orderRoutes = require('./routes/orders');

// Middleware for JSON & URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make db accessible to our router
app.use((req, res, next) => {
    req.db = db;
    next();
});

// Static files - serve these first
app.use(express.static('public'));

// Root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

// HTML pages - explicit routes for static HTML files
app.get('/categories.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/categories.html'));
});

app.get('/tickets.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/tickets.html'));
});

app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/login.html'));
});

app.get('/register.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/register.html'));
});

app.get('/about.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/about.html'));
});

app.get('/contact.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/contact.html'));
});

app.get('/admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/admin.html'));
});

app.get('/profile.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/profile.html'));
});

app.get('/orders.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/orders.html'));
});

app.get('/cart.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/cart.html'));
});

app.get('/checkout.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/checkout.html'));
});

// Dynamic routes for category and ticket detail pages
app.get('/category/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/category-detail.html'));
});

app.get('/ticket/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/ticket-detail.html'));
});

// API Routes - place these after the above routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', ticketRoutes);  // tickets and categories routes
app.use('/api/orders', orderRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    // Log error details for debugging (in production, use proper logging)
    if (process.env.NODE_ENV === 'development') {
        console.error('Server error:', err);
    }
    res.status(500).send('Something went wrong on the server!');
});

// Start the server
app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
    console.log(`📱 Visit your website at: http://localhost:${port}`);
    if (process.env.NODE_ENV === 'development') {
        console.log(`🧪 Test a category page at: http://localhost:${port}/category/1`);
    }
});
