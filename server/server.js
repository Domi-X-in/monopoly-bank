// server/server.js
// Update the order of middleware in your server.js file

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const socketIo = require("socket.io");
const path = require("path");
const { gameRoutes, playerRoutes, transactionRoutes } = require("./routes");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// IMPORTANT: Order of middleware matters!
// 1. Basic middleware first
app.use(cors());
app.use(express.json());

// 2. Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`Request: ${req.method} ${req.url}`);
  next();
});

// 3. Make io available to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// 4. API routes - MAKE SURE THESE COME BEFORE THE STATIC FILE SERVING
app.use("/api/games", gameRoutes);
app.use("/api/players", playerRoutes);
app.use("/api/transactions", transactionRoutes);

// 5. AFTER API routes, serve static assets
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/build")));

  // This should be AFTER API routes
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/build", "index.html"));
  });
}

// Connect to MongoDB
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

const PORT = process.env.PORT || 5002;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
