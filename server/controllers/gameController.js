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

    // Set no-cache headers
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    res.status(201).json(game);
  } catch (error) {
    console.error("Error creating game:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getGames = async (req, res) => {
  try {
    console.log("Getting games with improved query");

    // Set no-cache headers to prevent browser caching
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    // First, count total games to see what's available
    const totalGames = await Game.countDocuments({});
    console.log(`Total games in database: ${totalGames}`);

    // Get all games to check their status
    const allGames = await Game.find({}).sort({ createdAt: -1 });
    console.log(`Retrieved ${allGames.length} total games`);

    // Log all games with their status
    allGames.forEach((game, index) => {
      console.log(
        `Game ${index + 1}: id=${game._id}, name=${game.name}, status="${
          game.status
        }", createdAt=${game.createdAt}`
      );
    });

    // Find games with status matching 'active' in a case-insensitive way
    // This handles variations like 'active', 'Active', 'ACTIVE', etc.
    const games = await Game.find({
      status: { $regex: new RegExp("^active$", "i") },
    }).sort({ createdAt: -1 });

    console.log(
      `Found ${games.length} active games using case-insensitive match`
    );

    // If no games found with regex match, try direct query with different case variations
    if (games.length === 0 && totalGames > 0) {
      console.log(
        "No games found with regex match, trying direct status values"
      );

      // Try all possible status variations
      const possibleStatuses = ["active", "Active", "ACTIVE"];
      let statusGames = [];

      for (const status of possibleStatuses) {
        const found = await Game.find({ status }).sort({ createdAt: -1 });
        console.log(`Status "${status}" returned ${found.length} games`);
        if (found.length > 0) {
          statusGames = found;
          break;
        }
      }

      // If found games with different case, return them
      if (statusGames.length > 0) {
        console.log(
          `Returning ${statusGames.length} games found with direct status check`
        );
        return res.json(statusGames);
      }

      // As a last resort, just return all non-ended games
      const nonEndedGames = await Game.find({
        status: { $ne: "ended" },
      }).sort({ createdAt: -1 });

      console.log(`Found ${nonEndedGames.length} non-ended games as fallback`);
      return res.json(nonEndedGames);
    }

    // Add debug headers
    res.setHeader("X-Debug-Total-Games", totalGames);
    res.setHeader("X-Debug-Active-Games", games.length);

    // Return the array of active games directly
    return res.json(games);
  } catch (error) {
    console.error("Error getting games:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

exports.getGameById = async (req, res) => {
  try {
    console.log("Getting game by ID:", req.params.id);

    // Set no-cache headers
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    const game = await Game.findById(req.params.id);

    if (!game) {
      console.log("Game not found:", req.params.id);
      return res.status(404).json({ message: "Game not found" });
    }

    console.log("Game found:", game);
    return res.json(game);
  } catch (error) {
    console.error("Error getting game:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
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

    // Set no-cache headers
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    return res.json(game);
  } catch (error) {
    console.error("Error ending game:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
