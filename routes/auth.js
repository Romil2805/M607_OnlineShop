const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Render Pages
router.get('/login', (req, res) => res.render('login', { title: 'Login' }));
router.get('/register', (req, res) => res.render('register', { title: 'Register' }));

// Handle Forms
router.post('/register', authController.registerUser);
router.post('/login', authController.loginUser);
router.get('/logout', authController.logoutUser);

module.exports = router;