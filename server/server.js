// server/server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const { gameRoutes, playerRoutes, transactionRoutes } = require("./routes");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.resolve(__dirname, "../client/build")));

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../client/build", "index.html"));
});

// Connect to MongoDB
mongoose;
//  .connect("mongodb://localhost:27017/monopolyBank", {  //For LOCAL execution only
mongoose
  .connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/monopolyBank",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Failed to connect to MongoDB:", err));

// Socket.io connection handler
io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("joinGame", (gameId) => {
    socket.join(gameId);
    console.log(`Client joined game: ${gameId}`);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Make io available to our routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use("/api/games", gameRoutes);
app.use("/api/players", playerRoutes);
app.use("/api/transactions", transactionRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static("../client/build"));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../client", "build", "index.html"));
  });
}

const PORT = process.env.PORT || 5002;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// ######################################## END SERVER.JS ############################################################
