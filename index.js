// dependencies and modules
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Load environment variables from .env file
require('dotenv').config();

// port number
const port = 4003;

// routes access
const userRoute = require('./routes/user');
const gameRoute = require('./routes/game');
const cartRoute = require('./routes/cart');
// const orderRoute = require('./routes/order');

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());

// backend routes
app.use('/users', userRoute);
app.use('/products', gameRoute);
app.use('/cart', cartRoute);
// app.use('/orders', orderRoute);

// database connection
mongoose.connect(process.env.MONGODB_URI,
{
    useNewUrlParser: true,
    useUnifiedTopology: true
});
mongoose.connection.once('open', () => console.log('Now connected to MongoDB Atlas.'));

if(require.main === module){
	app.listen(process.env.PORT || port, () => {
		console.log(`API is now online on port ${ process.env.PORT || port}`)
	})
}

module.exports = {app, mongoose};