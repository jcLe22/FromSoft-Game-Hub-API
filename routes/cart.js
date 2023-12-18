const express = require('express');
const cartController = require('../controllers/cart');
const auth = require('../auth');

const {verify, verifyAdmin} = auth;

const router = express.Router();

// Add to cart
router.post('/:userId/add-to-cart', verify, cartController.addToCart);

// Change product quantity in the cart
router.put('/:userId/change-quantity', verify, cartController.changeQuantity);

// Remove products from the cart
router.delete('/:userId/remove-product', verify, cartController.removeProductFromCart);

// Submit order
router.post('/:userId/:cartId/submit-order', verify, cartController.submitOrder);

module.exports = router;