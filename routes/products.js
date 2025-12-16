const express = require('express');
const router = express.Router();
// Import the controller 
const productController = require('../controllers/productController');

// Middleware: Check if user is Admin
function ensureAdmin(req, res, next) {
    if (req.session.user && req.session.user.isAdmin) {
        return next();
    }
    req.flash('error_msg', 'Access Denied: Admins Only');
    res.redirect('/login');
}

// Routes
router.get('/', productController.getAllProducts); 
router.post('/admin/add-product', ensureAdmin, productController.addProduct); 
router.get('/admin/delete/:id', ensureAdmin, productController.deleteProduct); 

module.exports = router;