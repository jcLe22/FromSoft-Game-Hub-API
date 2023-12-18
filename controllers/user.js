const mongoose = require('mongoose');
const User = require('../models/User');
const Game = require('../models/Game');
const bcrypt = require('bcrypt');
const auth = require('../auth');

// registration
module.exports.registerUser = async(req, res) => {
    const {username, email, password} = req.body;

    try {
        const existingUsername = await User.findOne({username});
        if(existingUsername) {
            return res.status(409).json({ message: "Username is already taken."});
        }

        const existingEmail = await User.findOne({email});
        if(existingEmail) {
            return res.status(409).json({ message: "Email already has an existing account."});
        }

        let newUser = new User({username, email, password: await bcrypt.hash(password, 10)})
        await newUser.save();

        return res.status(201).json({message: "User registration successful!"});
    } catch {
        return res.status(500).json({message: "Internal Server Error"})
    }
};

// login
module.exports.loginUser = async(req,res) => {
    const {usernameOrEmail, password} = req.body;

    try {
        const user = await User.findOne({
            $or: [{username: usernameOrEmail}, {email: usernameOrEmail}]
        });

        if(!user) {
            return res.status(401).json({ message: "Invalid username or email"});
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if(!isPasswordCorrect) {
            return res.status(401).send({ message: "Invalid password"});
        }

        const accessToken = auth.createAccessToken(user);
        let loginMessage = `Welcome to your account, ${user.username}.`;

        if(user.isAdmin) {
            loginMessage = `Welcome to your admin account, ${user.username}.`;
        }

        return res.status(200).send({message: loginMessage, access: accessToken});
        // return res.status(200).json({message: 'Login Successful', access: accessToken});
    } catch {
        return res.status(500).send({message: "Internal Server Error"})
    }
};

// profile
module.exports.profile = async (req, res) => {

    // const userId = req.params.userId;

    try {

        // if (req.user.id !== userId) {
        //     return res.status(403).send("You are not authorized to view the profile of this user.");
        // }

        const user = await User.findById(req.user.id);

        if(!user) {
            return res.status(400).send("User profile not found.");
        }

        return res.status(200).send(user);
    } catch (error) {
        console.error(error)
        res.status(500).send("Internal Server Error")
    }
}

// create order
module.exports.createOrder = async (req, res) => {

    try {

        const userId = req.user.id;

        console.log("req.user._id:", req.user.id);
        console.log("userId:", userId);

        if(req.user.isAdmin) {
            return res.status(403).send({error: `It appears that you are logged in to your Admin Account, ${req.user.username}. Please use a valid Customer Account.`});
        }

        const user = await User.findById(userId);

        const {productId, quantity} = req.body;

        const game = await Game.findById(productId);

        // check if game/product is available
        if(!game) {
            return res.status(404).send({error: "Game product not available."})
        }

        if(!game.isActive) {
            return res.status(403).send({error: `${game.title} is not yet available for purchase. Sorry for the inconvenience.`});
        }

        const totalAmount = game.price * quantity;

        const orderId = new mongoose.Types.ObjectId();

        const order = {
            products: [{
                productId: game._id,
                productName: game.title,
                quantity: quantity,
            }],
            totalAmount: totalAmount,
            orderId: orderId
        };

        if (!user.orderedProduct || !Array.isArray(user.orderedProduct)) {
            user.orderedProduct = [];
        }
        user.orderedProduct.push(order);
        // console.log(req.user);

        // update user account
        await user.save();
        
        game.userOrders.push({
            userId: user._id,
            orderId: orderId
        });
        console.log(game);
        // update game product info
        await game.save();

        return res.status(201).send({message: "Ordered successfully!"});
    } catch (error) {

        if (error.name === 'CastError' && error.kind === 'ObjectId') {
            // Handle CastError by sending a custom error message
            return res.status(400).send({error: "Invalid product ID format."});
        }

        console.error(error)
        return res.status(500).send({ error: "Internal Server Error"});
    }
};

// assign another user as admin
module.exports.assignAdmin = async (req, res) => {
    const { userId } = req.body;

    try {
        if (!userId) {
            return res.status(400).send("User ID is required in the body.");
        }

        const existingUser = await User.findById(userId);

        if (!existingUser) {
            return res.status(404).send("User not found.");
        }

        if (existingUser.isAdmin) {
            return res.status(200).send(`${existingUser.username} is already an existing admin.`);
        }

        existingUser.isAdmin = true;

        await existingUser.save();
        return res.status(200).send(`${existingUser.username} has now been set as Admin.`);
    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal Server Error");
    }
};

module.exports.getOrders = async (req, res) => {

    const userId = req.params.userId;

    try {

        if (req.user.id !== userId) {
            return res.status(403).send("You are not authorized to view the orders of this user.");
        }

        if(req.user.isAdmin) {
            return res.status(403).send(`It appears that you are logged in to your Admin Account, ${req.user.username}. Please use a valid Customer Account.`);
        }

        const user = await User.findById(userId);

        if(!user) {
            return res.status(400).send("User profile not found.")
        }

        if(user.orderedProduct.length === 0) {
            return res.status(200).send("There are no ordered products in this profile.");
        }

        return res.status(200).send(user.orderedProduct);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};

module.exports.viewOrders = async (req, res) => {
    try {
        const gamesWithUserOrders = await Game.find({ userOrders: { $exists: true, $not: { $size: 0 } } });

        // Extracting title and userOrders from the retrieved games
        const ordersData = gamesWithUserOrders.map(game => ({
            title: game.title,
            userOrders: game.userOrders
        }));

        res.status(200).json(ordersData);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
};