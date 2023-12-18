const express = require('express');
const gameController = require('../controllers/game');
const auth = require('../auth');

const {verify, verifyAdmin} = auth;

const router = express.Router();

// Get all games
router.get('/all', gameController.getAllGames);

// Add game (admin only)
router.post('/add-game', verify, verifyAdmin, gameController.addGame);

// Retrieve active games (admin only)
router.get('/', gameController.activeGames);

// Retrieve a single game
router.get('/:gameId', gameController.singleGame);

// Update game info (admin only)
router.put('/:gameId/update', verify, verifyAdmin, gameController.updateGameInfo);

// Archive Game (admin only)
router.patch('/:gameId/archive', verify, verifyAdmin, gameController.archiveGame);

// Activate Game (admin only)
router.patch('/:gameId/activate', verify, verifyAdmin, gameController.activateGame);

// // Retrieve all game orders
// router.get('/admin/view-orders', verify, verifyAdmin, gameController.viewOrders);

module.exports = router;