// client/src/components/Game/JoinGameForm.js
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../../contexts/SocketContext";
import { FormGroup } from "../UI/FormGroup";
import { Input } from "../UI/Input";
import { Select } from "../UI/Select";
import { Button } from "../UI/Button";
import { Card } from "../Layout/Card";
import * as api from "../../services/api";

const FormTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSizes.xlarge};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  text-align: center;
  color: ${({ theme }) => theme.colors.primary};
`;

const JoinOptions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.lg};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    flex-direction: column;
  }
`;

const PlayerButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.lg}`};
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  transition: all ${({ theme }) => theme.transitions.default};
  font-size: ${({ theme }) => theme.typography.fontSizes.medium};
  box-shadow: ${({ theme }) => theme.shadows.small};
  width: 100%;
  cursor: pointer;
  border: none;
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.secondary};

  &:hover:not(:disabled),
  &:focus:not(:disabled) {
    background-color: #c01712;
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.medium};
  }

  &:disabled {
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
    opacity: 0.6;
    background-color: #cccccc !important;
    color: #666666 !important;
  }
`;

const BankButton = styled.button`
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  transition: all ${({ theme }) => theme.transitions.default};
  font-size: ${({ theme }) => theme.typography.fontSizes.medium};
  box-shadow: ${({ theme }) => theme.shadows.small};
  width: 100%;
  cursor: pointer;
  border: none;
  line-height: 1.2;
  background-color: ${({ bankExists, theme }) =>
    bankExists ? "#cccccc" : theme.colors.bank};
  color: ${({ bankExists, theme }) =>
    bankExists ? "#666666" : theme.colors.tertiary};

  .exists-text {
    font-size: ${({ theme }) => theme.typography.fontSizes.small};
    margin-top: ${({ theme }) => theme.spacing.xs};
  }

  &:hover:not(:disabled),
  &:focus:not(:disabled) {
    background-color: ${({ bankExists }) =>
      bankExists ? "#cccccc" : "#e6b800"};
    transform: ${({ bankExists }) =>
      bankExists ? "none" : "translateY(-2px)"};
    box-shadow: ${({ bankExists, theme }) =>
      bankExists ? "none" : theme.shadows.medium};
  }

  &:disabled {
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
    opacity: 0.6;
    background-color: #cccccc !important;
    color: #666666 !important;
  }
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.danger};
  background-color: #ffeeee;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 15px;
  font-size: 14px;
`;

const LoadingIndicator = styled.div`
  text-align: center;
  padding: 10px;
  color: ${({ theme }) => theme.colors.textLight};
`;

export const JoinGameForm = ({ selectedGame, allGames, onRefreshGames }) => {
  const [games, setGames] = useState(allGames || []);
  const [selectedGameId, setSelectedGameId] = useState(selectedGame?._id || "");
  const [playerName, setPlayerName] = useState("");
  const [bankExists, setBankExists] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingGames, setFetchingGames] = useState(false);
  const navigate = useNavigate();
  const socket = useSocket();

  // Update games if the allGames prop changes
  useEffect(() => {
    if (Array.isArray(allGames)) {
      setGames(allGames);
      console.log("Games updated from props:", allGames);
    }
  }, [allGames]);

  // Fetch games if not provided via props
  useEffect(() => {
    if (!Array.isArray(allGames) || allGames.length === 0) {
      const fetchGames = async () => {
        try {
          setFetchingGames(true);
          console.log("Fetching games from JoinGameForm...");
          const response = await api.getGames();
          console.log("Games API response in JoinGameForm:", response);

          if (response && response.data) {
            setGames(response.data);

            // Set first game as default if none is selected
            if (!selectedGameId && response.data.length > 0) {
              setSelectedGameId(response.data[0]._id);
            }
          } else {
            console.error("Invalid response from getGames:", response);
            setError("Failed to fetch games data");
          }
        } catch (err) {
          console.error("Failed to fetch games:", err);
          setError(`Error fetching games: ${err.message}`);
        } finally {
          setFetchingGames(false);
        }
      };

      fetchGames();
    }
  }, [allGames, selectedGameId]);

  // Subscribe to socket events
  useEffect(() => {
    if (socket) {
      console.log("Setting up socket listeners in JoinGameForm");

      // Listen for new games
      socket.on("gameCreated", (game) => {
        console.log("New game received via socket:", game);
        if (game) {
          setGames((prevGames) => {
            // Ensure prevGames is an array
            const currentGames = Array.isArray(prevGames) ? prevGames : [];
            return [...currentGames, game];
          });
        }
      });

      return () => {
        socket.off("gameCreated");
      };
    }
  }, [socket]);

  // Check if bank exists for selected game
  useEffect(() => {
    if (selectedGameId) {
      const checkBankExists = async () => {
        try {
          console.log("Checking if bank exists for game:", selectedGameId);
          const response = await api.getPlayers(selectedGameId);
          console.log("Players API response:", response);

          const hasBank =
            response.data &&
            Array.isArray(response.data) &&
            response.data.some((player) => player.isBank);

          console.log("Bank exists:", hasBank);
          setBankExists(hasBank);

          // Join the game room for real-time updates
          if (socket) {
            socket.emit("joinGame", selectedGameId);

            // Listen for player joined events
            socket.on("playerJoined", (player) => {
              console.log("Player joined:", player);
              if (player && player.gameId === selectedGameId && player.isBank) {
                setBankExists(true);
              }
            });

            return () => {
              socket.off("playerJoined");
            };
          }
        } catch (err) {
          console.error("Failed to check if bank exists:", err);
          setError(`Failed to check bank status: ${err.message}`);
        }
      };

      checkBankExists();
    }
  }, [selectedGameId, socket]);

  const handleJoin = async (isBank) => {
    if (!selectedGameId) {
      setError("Please select a game");
      return;
    }

    if (!playerName.trim()) {
      setError("Player name is required");
      return;
    }

    if (isBank && bankExists) {
      setError("This game already has a bank");
      return;
    }

    try {
      setLoading(true);
      setError("");

      console.log("Creating player:", {
        name: playerName,
        gameId: selectedGameId,
        isBank,
      });

      // Create player
      const playerData = {
        name: playerName,
        gameId: selectedGameId,
        isBank,
      };

      const response = await api.createPlayer(playerData);
      console.log("Player created:", response.data);

      // Navigate to player dashboard
      navigate(`/game/${selectedGameId}/player/${response.data._id}`);
    } catch (err) {
      console.error("Error joining game:", err);
      setError(
        err.response?.data?.message || `Failed to join game: ${err.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    setGames([]); // Clear any local state that might be caching the games
    // Clear any cached responses in the browser
    window.sessionStorage.clear();
    window.localStorage.clear();

    if (onRefreshGames) {
      onRefreshGames();
    } else {
      // Fetch games directly if no refresh callback provided
      const fetchGames = async () => {
        try {
          setFetchingGames(true);
          // Add timestamp to URL to force a fresh request
          const timestamp = new Date().getTime();
          const response = await api.getGames();

          if (response && response.data) {
            console.log("Fetched games data:", response.data);
            setGames(response.data);

            // If games are received but not displayed, log more details
            if (Array.isArray(response.data) && response.data.length > 0) {
              console.log(
                "Games received but not displaying. Game details:",
                response.data.map((g) => ({
                  id: g._id,
                  name: g.name,
                  status: g.status,
                }))
              );
            }
          } else {
            console.error("Invalid or empty response:", response);
            setError("No games data returned from server");
          }
        } catch (err) {
          console.error("Failed to refresh games:", err);
          setError(`Error refreshing games: ${err.message}`);
        } finally {
          setFetchingGames(false);
        }
      };

      fetchGames();
    }
  };
  if (fetchingGames) {
    return (
      <Card>
        <FormTitle>Join Game</FormTitle>
        <LoadingIndicator>Loading games...</LoadingIndicator>
      </Card>
    );
  }

  // Check if we have any games to display
  const hasGames = Array.isArray(games) && games.length > 0;

  return (
    <Card>
      <FormTitle>Join Game</FormTitle>

      {error && <ErrorMessage>{error}</ErrorMessage>}

      {!hasGames ? (
        <div>
          <p>No active games available. Please create a new game.</p>
          <Button
            variant="primary"
            onClick={handleRefresh}
            fullWidth
            style={{ marginTop: "15px" }}
          >
            Refresh Games
          </Button>
        </div>
      ) : (
        <div>
          <FormGroup>
            <label htmlFor="gameSelect">Select Game</label>
            <Select
              id="gameSelect"
              value={selectedGameId}
              onChange={(e) => setSelectedGameId(e.target.value)}
              required
            >
              <option value="">-- Select a game --</option>
              {games.map((game) => (
                <option key={game._id} value={game._id}>
                  {game.name}
                </option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup>
            <label htmlFor="playerName">Your Name</label>
            <Input
              id="playerName"
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              required
            />
          </FormGroup>

          <JoinOptions>
            <PlayerButton
              onClick={() => handleJoin(false)}
              disabled={loading || !selectedGameId || !playerName.trim()}
            >
              Join as Player
            </PlayerButton>

            <BankButton
              onClick={() => handleJoin(true)}
              disabled={
                loading || bankExists || !selectedGameId || !playerName.trim()
              }
              bankExists={bankExists}
            >
              Join as Bank
              {bankExists && (
                <span className="exists-text">(Already Exists)</span>
              )}
            </BankButton>
          </JoinOptions>

          <div style={{ marginTop: "15px", textAlign: "center" }}>
            <Button
              variant="secondary"
              onClick={handleRefresh}
              disabled={loading || fetchingGames}
            >
              Refresh Games
            </Button>
          </div>
        </div>
      )}

      {/* Optional debug info for development */}
      {process.env.NODE_ENV !== "production" && (
        <div style={{ marginTop: "20px", fontSize: "12px", color: "#777" }}>
          <div>Games count: {games ? games.length : 0}</div>
          <div>Selected game: {selectedGameId || "None"}</div>
          <div>Socket connected: {socket ? "Yes" : "No"}</div>
          <div>Bank exists: {bankExists ? "Yes" : "No"}</div>
        </div>
      )}
    </Card>
  );
};
