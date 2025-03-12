// server/routes/index.js
const gameRoutes = require("./gameRoutes");
const playerRoutes = require("./playerRoutes");
const transactionRoutes = require("./transactionRoutes");

module.exports = {
  gameRoutes,
  playerRoutes,
  transactionRoutes,
};
