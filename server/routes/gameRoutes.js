// server/routes/gameRoutes.js
const express = require("express");
const { gameController } = require("../controllers");

const router = express.Router();

// Middleware to add no-cache headers to all responses
const noCacheMiddleware = (req, res, next) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
};

// Apply no-cache middleware to all routes
router.use(noCacheMiddleware);

// Route to create a new game
router.post("/", gameController.createGame);

// Route to get all active games
router.get("/", gameController.getGames);

// Route to get a specific game
router.get("/:id", gameController.getGameById);

// Route to end a game
router.put("/end", gameController.endGame);

module.exports = router;
