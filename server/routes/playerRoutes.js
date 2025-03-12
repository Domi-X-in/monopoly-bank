// server/routes/playerRoutes.js
const express = require("express");
const { playerController } = require("../controllers");

const router = express.Router();

// Route to create a new player
router.post("/", playerController.createPlayer);

// Route to get all players in a game
router.get("/game/:gameId", playerController.getPlayersByGame);

// Route to get a specific player
router.get("/:id", playerController.getPlayerById);

module.exports = router;
