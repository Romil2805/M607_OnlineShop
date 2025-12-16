require('dotenv').config();
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const connectDB = require('./config/db');
const Order = require('./models/Order');

// Initialize App
const app = express();

// 1. Connect Database
connectDB();

// 2. Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');

// 3. Session Configuration
app.use(session({
    secret: 'mysecretkey',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));
app.use(flash());

// 4. Global Variables (Middleware)
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.user = req.session.user || null;
    res.locals.session = req.session; 
    next();
});

// 5. Routes
app.use('/', require('./routes/auth')); 
app.use('/', require('./routes/products')); 
app.use('/', require('./routes/cart'));
app.use('/', require('./routes/checkout'));

// Admin Page Route 
app.get('/admin', async (req, res) => {
    const Product = require('./models/Product');
    
    if (!req.session.user || !req.session.user.isAdmin) {
        req.flash('error_msg', 'Not authorized');
        return res.redirect('/login');
    }

    try {
        const products = await Product.find();
        res.render('admin', { 
            title: 'Admin Panel', 
            products: products 
        });
    } catch (err) {
        console.log(err);
        res.redirect('/');
    }
});

// Dashboard Route 
app.get('/dashboard', async (req, res) => {
    if (!req.session.user) {
        req.flash('error_msg', 'Please log in');
        return res.redirect('/login');
    }

    try {
        // Find orders where 'user' matches the logged-in user's ID
        const orders = await Order.find({ user: req.session.user.id }).sort({ createdAt: -1 });
        
        res.render('dashboard', { 
            title: 'Dashboard', 
            user: req.session.user,
            orders: orders 
        });
    } catch (err) {
        console.log(err);
        res.redirect('/');
    }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on http://localhost:${PORT}`));