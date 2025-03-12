// client/src/services/api.js
import axios from "axios";

//const api = axios.create({
//  baseURL: "http://localhost:5002/api",
//});

const api = axios.create({
  baseURL: "/api", // Use relative path for deployed environment
});

// Game related API calls
export const createGame = (data) => api.post("/games", data);
export const getGames = () => api.get("/games");
export const getGame = (id) => api.get(`/games/${id}`);
export const endGame = (playerId) => api.put("/games/end", { playerId });

// Player related API calls
export const createPlayer = (data) => api.post("/players", data);
export const getPlayers = (gameId) => api.get(`/players/game/${gameId}`);
export const getPlayer = (id) => api.get(`/players/${id}`);

// Transaction related API calls
export const createTransaction = (data) => api.post("/transactions", data);
export const getTransactions = (gameId) =>
  api.get(`/transactions/game/${gameId}`);

export default api;
