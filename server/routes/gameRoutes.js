// server/routes/gameRoutes.js
const express = require("express");
const { gameController } = require("../controllers");

const router = express.Router();

// Route to create a new game
router.post("/", gameController.createGame);

// Route to get all active games
router.get("/", gameController.getGames);

// Route to get a specific game
router.get("/:id", gameController.getGameById);

// Route to end a game
router.put("/end", gameController.endGame);

module.exports = router;
