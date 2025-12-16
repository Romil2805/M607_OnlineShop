const Product = require('../models/Product');

// View Cart
exports.getCart = (req, res) => {
    if (!req.session.cart) {
        return res.render('cart', { 
            title: 'Your Cart', 
            products: [], 
            totalPrice: 0 
        });
    }
    res.render('cart', { 
        title: 'Your Cart', 
        products: req.session.cart.items, 
        totalPrice: req.session.cart.totalPrice 
    });
};

// Add to Cart
exports.addToCart = async (req, res) => {
    const productId = req.body.product_id;
    
    // Initialize cart if it doesn't exist
    if (!req.session.cart) {
        req.session.cart = { items: [], totalPrice: 0 };
    }
    const cart = req.session.cart;

    try {
        const product = await Product.findById(productId);
        
        // Check if item already exists in cart
        const existingItemIndex = cart.items.findIndex(item => item._id == productId);

        if (existingItemIndex >= 0) {
            cart.items[existingItemIndex].qty++;
        } else {
            cart.items.push({
                _id: product._id,
                name: product.name,
                price: product.price,
                image: product.image,
                qty: 1
            });
        }

        // Update Total Price
        cart.totalPrice += product.price;
        
        req.flash('success_msg', 'Item added to cart');
        res.redirect('/'); // Redirect back to shop
    } catch (err) {
        console.log(err);
        res.redirect('/');
    }
};

// Remove from Cart
exports.removeFromCart = (req, res) => {
    const productId = req.params.id;
    const cart = req.session.cart;

    const itemIndex = cart.items.findIndex(item => item._id == productId);
    
    if (itemIndex >= 0) {
        cart.totalPrice -= cart.items[itemIndex].price * cart.items[itemIndex].qty;
        cart.items.splice(itemIndex, 1);
    }

    res.redirect('/cart');
};