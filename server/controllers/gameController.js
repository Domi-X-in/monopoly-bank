// server/controllers/gameController.js
const { Game, Player } = require("../models");

exports.createGame = async (req, res) => {
  try {
    const { name, initialPlayerBalance } = req.body;

    // Validate game name
    if (!name) {
      return res.status(400).json({ message: "Game name is required" });
    }

    // Create new game
    const game = new Game({
      name,
      initialPlayerBalance: initialPlayerBalance || 1500, // Use provided value or default
    });
    await game.save();

    // Notify all clients about the new game
    req.io.emit("gameCreated", game);

    res.status(201).json(game);
  } catch (error) {
    console.error("Error creating game:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getGames = async (req, res) => {
  try {
    // Get only active games
    const games = await Game.find({ status: "active" }).sort({ createdAt: -1 });
    res.json(games);
  } catch (error) {
    console.error("Error getting games:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getGameById = async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);

    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    res.json(game);
  } catch (error) {
    console.error("Error getting game:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.endGame = async (req, res) => {
  try {
    const { playerId } = req.body;

    // Find the player
    const player = await Player.findById(playerId);

    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }

    // Check if player is the bank
    if (!player.isBank) {
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

    // Notify all clients in the game that it has ended
    req.io.to(game._id.toString()).emit("gameEnded", game);

    res.json(game);
  } catch (error) {
    console.error("Error ending game:", error);
    res.status(500).json({ message: "Server error" });
  }
};
