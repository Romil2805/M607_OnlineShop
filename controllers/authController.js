const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Register User
exports.registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            req.flash('error_msg', 'Email already registered');
            return res.redirect('/register');
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create User
        user = new User({
            name,
            email,
            password: hashedPassword
        });
        
        await user.save();
        req.flash('success_msg', 'You are now registered and can log in');
        res.redirect('/login');

    } catch (err) {
        console.error(err);
        res.redirect('/register');
    }
};

// Login User
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Match User
        const user = await User.findOne({ email });
        if (!user) {
            req.flash('error_msg', 'Email not found');
            return res.redirect('/login');
        }

        // Match Password
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
            // Create Session
            req.session.user = {
                id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin
            };
            req.flash('success_msg', 'You are logged in');
            
            // Redirect based on role
            if (user.isAdmin) {
                return res.redirect('/admin');
            } else {
                return res.redirect('/dashboard');
            }
        } else {
            req.flash('error_msg', 'Password incorrect');
            return res.redirect('/login');
        }
    } catch (err) {
        console.error(err);
        res.redirect('/login');
    }
};

// Logout
exports.logoutUser = (req, res) => {
    req.session.destroy((err) => {
        if (err) throw err;
        res.redirect('/login');
    });
};