// server/models/Player.js
const mongoose = require("mongoose");

const PlayerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  gameId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Game",
    required: true,
  },
  isBank: {
    type: Boolean,
    default: false,
  },
  balance: {
    type: Number,
    default: 1500, // Starting money for regular players
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Player", PlayerSchema);
