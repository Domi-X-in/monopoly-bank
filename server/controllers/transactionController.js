const { Transaction, Player } = require("../models");

exports.createTransaction = async (req, res) => {
  try {
    const { gameId, fromPlayerId, toPlayerId, amount } = req.body;

    // Validate inputs
    if (!gameId || !fromPlayerId || !toPlayerId || !amount) {
      return res
        .status(400)
        .json({ message: "Game ID, player IDs, and amount are required" });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: "Amount must be positive" });
    }

    // Get both players
    const fromPlayer = await Player.findById(fromPlayerId);
    const toPlayer = await Player.findById(toPlayerId);

    if (!fromPlayer || !toPlayer) {
      return res.status(404).json({ message: "One or both players not found" });
    }

    // Check if the payer has enough money (skip for bank as it has unlimited money)
    if (!fromPlayer.isBank && fromPlayer.balance < amount) {
      return res.status(400).json({ message: "Insufficient funds" });
    }

    // Create the transaction
    const transaction = new Transaction({
      gameId,
      fromPlayerId,
      toPlayerId,
      amount,
    });

    await transaction.save();

    // Update player balances (bank balance doesn't change)
    if (!fromPlayer.isBank) {
      fromPlayer.balance -= amount;
      await fromPlayer.save();
    }

    if (!toPlayer.isBank) {
      toPlayer.balance += amount;
      await toPlayer.save();
    }

    // Notify all clients about the transaction
    req.io.to(gameId).emit("transaction", {
      transaction,
      fromPlayer,
      toPlayer,
    });

    res.status(201).json({
      transaction,
      fromPlayer,
      toPlayer,
    });
  } catch (error) {
    console.error("Error creating transaction:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getTransactionsByGame = async (req, res) => {
  try {
    const { gameId } = req.params;

    const transactions = await Transaction.find({ gameId })
      .sort({ createdAt: -1 })
      .populate("fromPlayerId", "name isBank")
      .populate("toPlayerId", "name isBank");

    res.json(transactions);
  } catch (error) {
    console.error("Error getting transactions:", error);
    res.status(500).json({ message: "Server error" });
  }
};
