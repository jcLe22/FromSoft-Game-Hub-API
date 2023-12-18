const Game = require('../models/Game');
const User = require('../models/User');

// Retrieve All Games
module.exports.getAllGames = async (req, res) => {
    try {
        const games = await Game.find().select('-userOrders');
        // console.log(games.length);

        if(games.length === 0) {
            return res.status(200).send({ message: "No games found in the database."});
        }

        return res.status(200).send(games);
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: "Internal Server Error" })
    }
};

// Add Games (admin only)
module.exports.addGame = async (req, res) => {
    const { title, description, price, imgUrl, videoUrl } = req.body;

    try {
        const existingGame = await Game.findOne({title});
        if(existingGame) {
            return res.status(409).send({error: "Game already exists in the library."});
        }

        let newGame = new Game({title, description, price, imgUrl, videoUrl});
        await newGame.save();

        return res.status(201).send({message: `${newGame.title} has been added to the database.`});
    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: "Internal Server Error" })
    }
};

// Retrieve active products
// module.exports.activeGames = (req, res) => {
//     return Game.find({isActive: true}).then(result => {
//         return res.status(200).send(result);
//     })
// };


module.exports.activeGames = async (req, res) => {
    
    try {

        const activeGames = await Game.find({isActive: true});

        if(activeGames.length === 0) {
            return res.status(200).send("No active games found in the database.")
        }

        return res.status(200).send(activeGames);

    } catch (error) {
        console.error(error);
        return res.status(500).send("Internal Server Error")
    }
}
// Retrieve a single product
module.exports.singleGame = async (req, res) => {

    const gameId = req.params.gameId;

    try {

        const game = await Game.findById(gameId).select('-userOrders');

        if(!game) {
            return res.status(400).send({ error: "Game not found."})
        }

        return res.status(200).send(game);
    } catch (error) {
        console.error(error);
        return res.status(500).send({error: "Internal Server Error"});
    }
};

module.exports.updateGameInfo = async (req, res) => {
    const {title, description, price, imgUrl, videoUrl} = req.body;
    const gameId = req.params.gameId;

    try {

        const game = await Game.findById(gameId);

        if(!game) {
            return res.status(400).send({ error: "Game not found."})
        }

        game.title = title || game.title;
        game.description = description || game.description;
        game.price = price || game.price;
        game.imgUrl = imgUrl || game.imgUrl;
        game.videoUrl = videoUrl || game.videoUrl;

        await game.save();

        return res.status(200).send({message: `${game.title} information updated successfully.`});
    } catch (error) {
        console.error(error);
        return res.status(500).send({ error: "Internal Server Error" });
    }
};

module.exports.archiveGame = async (req, res) => {

    const gameId = req.params.gameId;

    try {
        const game = await Game.findById(gameId);

        if(!game) {
            return res.status(400).send({error: "Game not found."});
        }

        if(game.isActive === false) {
            return res.status(200).send({message: `${game.title} is currently in the archive.`});
        }

        game.isActive = false;

        await game.save();
        return res.status(200).send({message: `${game.title} has been archived successfully.`});
    } catch (error) {
        console.error(error);
        return res.status(500).send({error: "Internal Server Error"});
    }
};

module.exports.activateGame = async (req, res) => {
    
    const gameId = req.params.gameId;

    try {
        const game = await Game.findById(gameId);

        if(!game) {
            return res.status(400).send({error: "Game not found."});
        }

        if(game.isActive === true) {
            return res.status(200).send({message: `${game.title} is already activated.`});
        }

        game.isActive = true;

        await game.save();
        return res.status(200).send({message: `${game.title} is now open for purchase.`});
    } catch(error) {
        console.error(error);
        return res.status(500).send({error: "Internal Server Error"});
    }
};

// module.exports.viewOrders = async (req, res) => {
//     try {
//         const gamesWithUserOrders = await Game.find({ userOrders: { $exists: true, $not: { $size: 0 } } });

//         // Extracting title and userOrders from the retrieved games
//         const ordersData = gamesWithUserOrders.map(game => ({
//             title: game.title,
//             userOrders: game.userOrders
//         }));

//         res.status(200).json(ordersData);
//     } catch (error) {
//         console.error(error);
//         res.status(500).send("Internal Server Error");
//     }
// };