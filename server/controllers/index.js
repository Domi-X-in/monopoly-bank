// server/controllers/index.js
const gameController = require("./gameController");
const playerController = require("./playerController");
const transactionController = require("./transactionController");

module.exports = {
  gameController,
  playerController,
  transactionController,
};
