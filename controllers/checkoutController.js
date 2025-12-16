const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');

// 1. Initiate Checkout (Redirects to Stripe)
exports.checkout = async (req, res) => {
    if (!req.session.cart || req.session.cart.items.length === 0) {
        return res.redirect('/cart');
    }

    const cart = req.session.cart;

    try {
        // Create line items for Stripe
        const lineItems = cart.items.map(item => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.name,
                },
                unit_amount: Math.round(item.price * 100), // Stripe expects cents
            },
            quantity: item.qty,
        }));

        // Create Stripe Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${req.protocol}://${req.get('host')}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.protocol}://${req.get('host')}/cart`,
            customer_email: req.session.user ? req.session.user.email : undefined,
        });

        res.redirect(303, session.url);
    } catch (err) {
        console.log(err);
        req.flash('error_msg', 'Error processing payment');
        res.redirect('/cart');
    }
};

// 2. Handle Success (Save Order & Clear Cart)
exports.checkoutSuccess = async (req, res) => {
    const sessionId = req.query.session_id;
    const cart = req.session.cart;

    if (!cart) {
        return res.redirect('/');
    }

    try {
        // Save Order to Database
        const newOrder = new Order({
            user: req.session.user ? req.session.user.id : null, // Handles guest checkout if needed
            items: cart.items,
            totalAmount: cart.totalPrice,
            paymentId: sessionId,
            status: 'Paid'
        });

        await newOrder.save();

        // Clear Cart
        req.session.cart = { items: [], totalPrice: 0 };
        
        res.render('success', { title: 'Payment Successful' });
    } catch (err) {
        console.log(err);
        res.redirect('/');
    }
};