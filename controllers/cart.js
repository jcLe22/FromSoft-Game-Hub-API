const mongoose = require('mongoose');
const User = require('../models/User');
const Game = require('../models/Game');
const Cart = require('../models/Cart');

module.exports.addToCart = async (req, res) => {
    try {

        const userId = req.params.userId;

        if (req.user.id !== userId) {
            return res.status(403).send("You are not authorized to access this user's cart.");
        }

        if(req.user.isAdmin) {
            return res.status(403).send(`It appears that you are logged in to your Admin Account, ${req.user.username}. Please use a valid Customer Account.`);
        }

        const {productId, quantity} = req.body;

        const game = await Game.findById(productId);

        if(!game) {
            return res.status(404).send("Game product not available.")
        }

        if(!game.isActive) {
            return res.status(403).send(`${game.title} is not yet available for purchase. Sorry for the inconvenience.`)
        }

        const totalAmount = game.price * quantity;

        let userCart = await Cart.findOne({user: userId});

        if(!userCart) {
            userCart = new Cart ({
                user: userId,
                items: []
            })
        }

        const cartItem = {
            productId: game._id,
            productName: game.title,
            quantity: quantity,
            subtotal: totalAmount
        };

        userCart.items.push(cartItem);
        console.log(cartItem);

        await userCart.save();

        return res.status(201).send(`${quantity} ${game.title} product/s has been added to your cart.`)
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};


module.exports.changeQuantity = async (req, res) => {
    try {
        const userId = req.params.userId;

        if (req.user.id !== userId) {
            return res.status(403).send("You are not authorized to change quantities for this user's cart.");
        }

        if(req.user.isAdmin) {
            return res.status(403).send(`It appears that you are logged in to your Admin Account, ${req.user.username}. Please use a valid Customer Account.`);
        }

        const { productId, newQuantity } = req.body;

        const userCart = await Cart.findOne({ user: userId });

        if (!userCart) {
            return res.status(404).send("Cart not found for the user.");
        }

        const cartItem = userCart.items.find(item => item.productId.toString() === productId);

        if (!cartItem) {
            return res.status(404).send("Product not found in the cart.");
        }

        const productIndex = userCart.items.indexOf(cartItem);

        const game = await Game.findById(productId);

        // Update quantity and subtotal
        userCart.items[productIndex].quantity = newQuantity;
        userCart.items[productIndex].subtotal = userCart.items[productIndex].quantity * game.price;

        await userCart.save();

        return res.status(200).send("Quantity updated successfully.");
    } catch (error) {
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            return res.status(400).send("Invalid product ID format.");
        }

        console.error(error);
        return res.status(500).send("Internal Server Error");
    }
};

module.exports.removeProductFromCart = async (req, res) => {
    try {
        const userId = req.params.userId;

        if (req.user.id !== userId) {
            return res.status(403).send("You are not authorized to remove products from this user's cart.");
        }

        if(req.user.isAdmin) {
            return res.status(403).send(`It appears that you are logged in to your Admin Account, ${req.user.username}. Please use a valid Customer Account.`);
        }

        const { productId } = req.body;

        const userCart = await Cart.findOne({ user: userId });

        if (!userCart) {
            return res.status(404).send("Cart not found for the user.");
        }

        const cartItem = userCart.items.find(item => item.productId.toString() === productId);

        const game = await Game.findById(productId);

        if (!cartItem) {
            return res.status(404).send(`${game.title} not found in the cart.`);
        }

        // Remove the cart item
        userCart.items = userCart.items.filter(item => item.productId.toString() !== productId);

        await userCart.save();

        return res.status(200).send(`${game.title} removed from the cart successfully.`);
    } catch (error) {
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            // Handle CastError by sending a custom error message
            return res.status(400).send("Invalid product ID format.");
        }

        console.error(error);
        return res.status(500).send("Internal Server Error");
    }
};

module.exports.submitOrder = async (req, res) => {
    try {
        const userId = req.params.userId;
        const cartId = req.params.cartId;

        if (req.user.id !== userId) {
            return res.status(403).send("You are not authorized to submit orders for this user.");
        }

        if(req.user.isAdmin) {
            return res.status(403).send(`It appears that you are logged in to your Admin Account, ${req.user.username}. Please use a valid Customer Account.`);
        }

        const userCart = await Cart.findOne({ _id: cartId, user: userId, isSubmitted: false });

        if (!userCart) {
            return res.status(404).send("Cart not found for the user or already submitted.");
        }

        // Check if the cart is empty
        if (userCart.items.length === 0) {
            // Remove the empty cart from the database
            await Cart.deleteOne({ _id: cartId, user: userId, isSubmitted: false });
            return res.status(404).send("Cart is empty. Removed from the database.");
        }

        // Create a new order from the cart
        const order = {
            products: userCart.items.map(item => ({
                productId: item.productId,
                productName: item.productName,
                quantity: item.quantity,
            })),
            totalAmount: userCart.items.reduce((total, item) => total + item.subtotal, 0),
            orderId: new mongoose.Types.ObjectId(),
        };

        // Update user's orderedProduct
        const user = await User.findById(userId);
        user.orderedProduct.push(order);
        await user.save();

        // Update game product info and remove from user's cart
        for (const item of userCart.items) {
            const game = await Game.findById(item.productId);

            if (!game) {
                return res.status(404).send(`Game with ID ${item.productId} not found.`);
            }

            // Update game's userOrders
            game.userOrders.push({
                userId: user._id,
                orderId: order.orderId,
            });

            // Subtract the purchased quantity from the game's stock or perform other updates as needed
            // For simplicity, assuming the game has a `stock` field
            game.stock -= item.quantity;

            await game.save();
        }

        // Remove the cart from the database
        await Cart.deleteOne({ _id: cartId, user: userId, isSubmitted: false });

        return res.status(201).send("Order submitted successfully. Cart removed.");
    } catch (error) {
        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            // Handle CastError by sending a custom error message
            return res.status(400).send("Invalid user ID or cart ID format.");
        }

        console.error(error);
        return res.status(500).send("Internal Server Error");
    }
};
