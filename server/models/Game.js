// server/models/Game.js
const mongoose = require("mongoose");

const GameSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  initialPlayerBalance: {
    type: Number,
    default: 1500, // Default is $1500 if not specified
    min: 0,
  },
  status: {
    type: String,
    enum: ["active", "ended"],
    default: "active",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Game", GameSchema);
