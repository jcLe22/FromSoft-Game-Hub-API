const express = require('express');
const userController = require('../controllers/user');
const auth = require('../auth');

const {verify, verifyAdmin} = auth;

const router = express.Router();

// Registration
router.post('/register', userController.registerUser);

// Login
router.post('/login', userController.loginUser);

// Profile
router.get('/details', verify, userController.profile);

// Create Order
router.post('/create-order', verify, userController.createOrder);

// Set another user as admin (admin only)
router.put('/assign-admin', verify, verifyAdmin, userController.assignAdmin);

// Retrieve user's orders
router.get('/:userId/orders', verify, userController.getOrders);

// Retrieve all game orders
router.get('/admin/view-orders', verify, verifyAdmin, userController.viewOrders);

module.exports = router;