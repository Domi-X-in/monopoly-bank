// server/controllers/gameController.js
const { Game, Player } = require("../models");

exports.createGame = async (req, res) => {
  try {
    const { name, initialPlayerBalance } = req.body;

    console.log("Creating game:", { name, initialPlayerBalance });

    // Validate game name
    if (!name) {
      return res.status(400).json({ message: "Game name is required" });
    }

    // Create new game
    const game = new Game({
      name,
      initialPlayerBalance: initialPlayerBalance || 1500, // Use provided value or default
      status: "active", // Explicitly set status to active
    });

    await game.save();
    console.log("Game created successfully:", game);

    // Notify all clients about the new game
    if (req.io) {
      req.io.emit("gameCreated", game);
      console.log("Emitted gameCreated event");
    } else {
      console.warn("Socket.io not available, could not emit gameCreated event");
    }

    res.status(201).json(game);
  } catch (error) {
    console.error("Error creating game:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getGames = async (req, res) => {
  try {
    console.log("Getting active games");

    // Get only active games
    const games = await Game.find({ status: "active" }).sort({ createdAt: -1 });

    console.log(`Found ${games.length} active games`);

    // Log each game for debugging
    games.forEach((game, index) => {
      console.log(`Game ${index + 1}:`, {
        id: game._id,
        name: game.name,
        status: game.status,
        createdAt: game.createdAt,
      });
    });

    res.json(games);
  } catch (error) {
    console.error("Error getting games:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getGameById = async (req, res) => {
  try {
    console.log("Getting game by ID:", req.params.id);

    const game = await Game.findById(req.params.id);

    if (!game) {
      console.log("Game not found:", req.params.id);
      return res.status(404).json({ message: "Game not found" });
    }

    console.log("Game found:", game);
    res.json(game);
  } catch (error) {
    console.error("Error getting game:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.endGame = async (req, res) => {
  try {
    const { playerId } = req.body;

    console.log("Ending game, player ID:", playerId);

    // Find the player
    const player = await Player.findById(playerId);

    if (!player) {
      console.log("Player not found:", playerId);
      return res.status(404).json({ message: "Player not found" });
    }

    // Check if player is the bank
    if (!player.isBank) {
      console.log("Player is not the bank:", playerId);
      return res
        .status(403)
        .json({ message: "Only the bank can end the game" });
    }

    // End the game
    const game = await Game.findByIdAndUpdate(
      player.gameId,
      { status: "ended" },
      { new: true }
    );

    console.log("Game ended:", game);

    // Notify all clients in the game that it has ended
    if (req.io) {
      req.io.to(game._id.toString()).emit("gameEnded", game);
      console.log("Emitted gameEnded event to room:", game._id.toString());
    } else {
      console.warn("Socket.io not available, could not emit gameEnded event");
    }

    res.json(game);
  } catch (error) {
    console.error("Error ending game:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
