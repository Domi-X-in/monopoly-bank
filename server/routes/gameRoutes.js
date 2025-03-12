// server/routes/gameRoutes.js
const express = require("express");
const { gameController } = require("../controllers");

const router = express.Router();

// Middleware to add no-cache headers and debug info
const routeDebugMiddleware = (req, res, next) => {
  // Add debugging info
  console.log(`Game route hit: ${req.method} ${req.path}`);
  console.log(`Query params:`, req.query);

  // Set CORS headers
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Accept");

  // Set no-cache headers
  res.header("Cache-Control", "no-cache, no-store, must-revalidate");
  res.header("Pragma", "no-cache");
  res.header("Expires", "0");

  // No HTML responses for API routes
  res.header("Content-Type", "application/json");

  next();
};

// Apply debug middleware to all routes
router.use(routeDebugMiddleware);

// Test route to check if API is accessible
router.get("/test", (req, res) => {
  res.json({ success: true, message: "Games API is working" });
});

// Route to create a new game
router.post("/", gameController.createGame);

// Route to get all active games
router.get(
  "/",
  (req, res, next) => {
    console.log("GET /api/games route triggered");
    // Add route-specific debugging
    next();
  },
  gameController.getGames
);

// Route to get a specific game
router.get("/:id", gameController.getGameById);

// Route to end a game
router.put("/end", gameController.endGame);

// Error handling middleware for this router
router.use((err, req, res, next) => {
  console.error("Game routes error:", err);
  res.status(500).json({
    error: true,
    message: "Server error in game routes",
    details: err.message,
  });
});

module.exports = router;
