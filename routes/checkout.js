const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkoutController');

// Middleware: Ensure user is logged in before paying 
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated || req.session.user) {
        return next();
    }
    req.flash('error_msg', 'Please login to checkout');
    res.redirect('/login');
}

// Routes
// We link this to the "Proceed to Checkout" button
router.get('/checkout', ensureAuthenticated, checkoutController.checkout); 

// Stripe redirects here after payment
router.get('/checkout/success', ensureAuthenticated, checkoutController.checkoutSuccess);

module.exports = router;