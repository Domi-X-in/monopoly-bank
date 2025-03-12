// server/controllers/playerController.js
const { Player, Game } = require("../models");

exports.createPlayer = async (req, res) => {
  try {
    const { name, gameId, isBank } = req.body;

    // Validate inputs
    if (!name || !gameId) {
      return res
        .status(400)
        .json({ message: "Player name and game ID are required" });
    }

    // Check if game exists
    const game = await Game.findById(gameId);

    if (!game) {
      return res.status(404).json({ message: "Game not found" });
    }

    if (game.status !== "active") {
      return res.status(400).json({ message: "Cannot join an ended game" });
    }

    // If player is joining as bank, check if a bank already exists
    if (isBank) {
      const existingBank = await Player.findOne({ gameId, isBank: true });

      if (existingBank) {
        return res
          .status(400)
          .json({ message: "This game already has a bank" });
      }
    }

    // Create the player
    const player = new Player({
      name,
      gameId,
      isBank,
      // Bank has unlimited money, normal players get the game's initialPlayerBalance
      balance: isBank ? Number.MAX_SAFE_INTEGER : game.initialPlayerBalance,
    });

    await player.save();

    // Notify all clients about the new player
    req.io.to(gameId).emit("playerJoined", player);

    res.status(201).json(player);
  } catch (error) {
    console.error("Error creating player:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getPlayersByGame = async (req, res) => {
  try {
    const { gameId } = req.params;

    const players = await Player.find({ gameId }).sort({ isBank: -1, name: 1 });

    res.json(players);
  } catch (error) {
    console.error("Error getting players:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getPlayerById = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);

    if (!player) {
      return res.status(404).json({ message: "Player not found" });
    }

    res.json(player);
  } catch (error) {
    console.error("Error getting player:", error);
    res.status(500).json({ message: "Server error" });
  }
};
