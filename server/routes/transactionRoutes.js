// server/routes/transactionRoutes.js
const express = require("express");
const { transactionController } = require("../controllers");

const router = express.Router();

// Route to create a new transaction
router.post("/", transactionController.createTransaction);

// Route to get all transactions in a game
router.get("/game/:gameId", transactionController.getTransactionsByGame);

module.exports = router;
