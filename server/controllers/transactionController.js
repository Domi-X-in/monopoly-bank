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

exports.updateTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { fromPlayerId, toPlayerId, amount } = req.body;

    if (!fromPlayerId || !toPlayerId || !amount) {
      return res
        .status(400)
        .json({ message: "Player IDs and amount are required" });
    }

    if (amount <= 0) {
      return res.status(400).json({ message: "Amount must be positive" });
    }

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    const oldFrom = await Player.findById(transaction.fromPlayerId);
    const oldTo = await Player.findById(transaction.toPlayerId);

    if (!oldFrom || !oldTo) {
      return res
        .status(404)
        .json({ message: "One or both original players not found" });
    }

    // Revert original balances
    if (!oldFrom.isBank) {
      oldFrom.balance += transaction.amount;
      await oldFrom.save();
    }

    if (!oldTo.isBank) {
      oldTo.balance -= transaction.amount;
      await oldTo.save();
    }

    const newFrom = await Player.findById(fromPlayerId);
    const newTo = await Player.findById(toPlayerId);

    if (!newFrom || !newTo) {
      return res
        .status(404)
        .json({ message: "One or both players not found" });
    }

    if (!newFrom.isBank && newFrom.balance < amount) {
      return res.status(400).json({ message: "Insufficient funds" });
    }

    if (!newFrom.isBank) {
      newFrom.balance -= amount;
      await newFrom.save();
    }

    if (!newTo.isBank) {
      newTo.balance += amount;
      await newTo.save();
    }

    transaction.fromPlayerId = fromPlayerId;
    transaction.toPlayerId = toPlayerId;
    transaction.amount = amount;
    await transaction.save();

    req.io
      .to(transaction.gameId.toString())
      .emit("transactionUpdated", { transaction, fromPlayer: newFrom, toPlayer: newTo });

    res.json({ transaction, fromPlayer: newFrom, toPlayer: newTo });
  } catch (error) {
    console.error("Error updating transaction:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    const fromPlayer = await Player.findById(transaction.fromPlayerId);
    const toPlayer = await Player.findById(transaction.toPlayerId);

    if (fromPlayer && !fromPlayer.isBank) {
      fromPlayer.balance += transaction.amount;
      await fromPlayer.save();
    }

    if (toPlayer && !toPlayer.isBank) {
      toPlayer.balance -= transaction.amount;
      await toPlayer.save();
    }

    await transaction.remove();

    req.io
      .to(transaction.gameId.toString())
      .emit("transactionDeleted", { transactionId });

    res.json({ message: "Transaction deleted" });
  } catch (error) {
    console.error("Error deleting transaction:", error);
    res.status(500).json({ message: "Server error" });
  }
};
