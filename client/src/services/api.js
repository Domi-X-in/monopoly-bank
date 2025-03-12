// client/src/services/api.js
import axios from "axios";

// Create an axios instance with default configuration
const api = axios.create({
  baseURL: "/api",
  headers: {
    "Cache-Control": "no-cache, no-store, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  },
});

// Game related API calls with cache busting
export const createGame = (data) => api.post("/games", data);

export const getGames = () => {
  // Add timestamp parameter to prevent caching
  const timestamp = new Date().getTime();
  return api.get(`/games?_=${timestamp}`);
};

export const getGame = (id) => {
  const timestamp = new Date().getTime();
  return api.get(`/games/${id}?_=${timestamp}`);
};

export const endGame = (playerId) => api.put("/games/end", { playerId });

// Player related API calls
export const createPlayer = (data) => api.post("/players", data);

export const getPlayers = (gameId) => {
  const timestamp = new Date().getTime();
  return api.get(`/players/game/${gameId}?_=${timestamp}`);
};

export const getPlayer = (id) => {
  const timestamp = new Date().getTime();
  return api.get(`/players/${id}?_=${timestamp}`);
};

// Transaction related API calls
export const createTransaction = (data) => api.post("/transactions", data);

export const getTransactions = (gameId) => {
  const timestamp = new Date().getTime();
  return api.get(`/transactions/game/${gameId}?_=${timestamp}`);
};

export default api;
