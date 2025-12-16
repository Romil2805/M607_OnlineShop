const Product = require('../models/Product');

// Get All Products (For Home Page)
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.render('index', { 
            title: 'Home', 
            products: products, 
            user: req.session.user 
        });
    } catch (err) {
        console.error(err);
        res.render('index', { title: 'Home', products: [], user: req.session.user });
    }
};

// Add New Product (Admin Only)
exports.addProduct = async (req, res) => {
    const { name, price, category, image, description } = req.body;
    try {
        const newProduct = new Product({
            name,
            price,
            category,
            image, 
            description
        });
        await newProduct.save();
        req.flash('success_msg', 'Product added successfully!');
        res.redirect('/admin');
    } catch (err) {
        console.error(err);
        req.flash('error_msg', 'Error adding product');
        res.redirect('/admin');
    }
};

// Delete Product (Admin Only)
exports.deleteProduct = async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        req.flash('success_msg', 'Product deleted');
        res.redirect('/admin');
    } catch (err) {
        req.flash('error_msg', 'Error deleting product');
        res.redirect('/admin');
    }
};