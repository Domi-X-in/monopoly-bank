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

const WarningMessage = styled.div`
  color: #856404;
  background-color: #fff3cd;
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
  const [warning, setWarning] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingGames, setFetchingGames] = useState(false);
  const navigate = useNavigate();
  const socket = useSocket();

  // Log when games are received or updated
  useEffect(() => {
    if (Array.isArray(games)) {
      console.log(`JoinGameForm has ${games.length} games:`, games);

      // Check for common issues
      const activeGames = games.filter(
        (game) => game && game.status && game.status.toLowerCase() === "active"
      );
      console.log(`Active games count: ${activeGames.length}`);

      if (games.length > 0 && activeGames.length === 0) {
        setWarning(
          "Games exist but none are active. Check status field case sensitivity."
        );
      } else {
        setWarning("");
      }
    }
  }, [games]);

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

          // Use a direct fetch instead of the API service
          await handleRefresh();
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

          // Use direct fetch for players to avoid potential issues with the API service
          const baseUrl = window.location.origin;
          const response = await fetch(
            `${baseUrl}/api/players/game/${selectedGameId}?_=${new Date().getTime()}`,
            {
              headers: {
                Accept: "application/json",
                "Cache-Control": "no-cache, no-store, must-revalidate",
                Pragma: "no-cache",
                Expires: "0",
              },
            }
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const responseText = await response.text();

          // Check if response is HTML instead of JSON
          if (
            responseText.trim().startsWith("<!DOCTYPE") ||
            responseText.trim().startsWith("<html")
          ) {
            console.error("Received HTML instead of JSON from players API");
            throw new Error(
              "Server returned HTML instead of JSON. Check server configuration."
            );
          }

          let playersData;
          try {
            playersData = JSON.parse(responseText);
          } catch (e) {
            console.error("Failed to parse players JSON:", e);
            throw new Error("Invalid JSON in players response");
          }

          console.log("Players API response:", playersData);

          // Extract players data - handle different response formats
          let players;

          if (Array.isArray(playersData)) {
            players = playersData;
          } else if (
            playersData &&
            playersData.data &&
            Array.isArray(playersData.data)
          ) {
            players = playersData.data;
          } else {
            console.error("Unexpected players response format");
            players = [];
          }

          const hasBank =
            Array.isArray(players) && players.some((player) => player.isBank);

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

      // Create player with direct fetch to avoid potential issues
      const baseUrl = window.location.origin;
      const response = await fetch(`${baseUrl}/api/players`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify({
          name: playerName,
          gameId: selectedGameId,
          isBank,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const responseText = await response.text();

      // Check if response is HTML instead of JSON
      if (
        responseText.trim().startsWith("<!DOCTYPE") ||
        responseText.trim().startsWith("<html")
      ) {
        console.error("Received HTML instead of JSON from player creation API");
        throw new Error(
          "Server returned HTML instead of JSON. Check server configuration."
        );
      }

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.error("Failed to parse player creation JSON:", e);
        throw new Error("Invalid JSON in player creation response");
      }

      console.log("Player created response:", responseData);

      // Extract player data from response
      let createdPlayer;

      if (responseData && responseData.data) {
        createdPlayer = responseData.data;
      } else if (responseData && responseData._id) {
        createdPlayer = responseData;
      } else {
        console.error("Unexpected player creation response:", responseData);
        throw new Error("Invalid player creation response");
      }

      console.log("Player created:", createdPlayer);

      // Navigate to player dashboard
      navigate(`/game/${selectedGameId}/player/${createdPlayer._id}`);
    } catch (err) {
      console.error("Error joining game:", err);
      setError(
        err.response?.data?.message || `Failed to join game: ${err.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setFetchingGames(true);
      setError("");
      setGames([]); // Clear existing games

      // Clear any cached responses in the browser
      window.sessionStorage.clear();
      window.localStorage.clear();

      console.log("Refreshing games with direct fetch...");

      // Get the base URL to ensure we hit the correct API endpoint
      const baseUrl = window.location.origin;
      const apiUrl = `${baseUrl}/api/games`;

      console.log(`Making API request to: ${apiUrl}`);

      // Make direct fetch request with full URL and proper headers
      const response = await fetch(`${apiUrl}?_=${new Date().getTime()}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      });

      console.log("Fetch response status:", response.status);
      console.log("Response headers:", {
        "content-type": response.headers.get("content-type"),
        "cache-control": response.headers.get("cache-control"),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get the response text first for debugging
      const responseText = await response.text();
      console.log(
        "Raw response first 100 chars:",
        responseText.substring(0, 100)
      );

      // Check if it's HTML (which would indicate a routing issue)
      if (
        responseText.trim().startsWith("<!DOCTYPE") ||
        responseText.trim().startsWith("<html")
      ) {
        console.error(
          "Received HTML instead of JSON - API route may be incorrect"
        );
        setError(`
          Server returned HTML instead of JSON. This is likely a routing issue.
          
          The server is serving the React app for /api/games instead of the API endpoint.
          Check your server.js file to ensure API routes are registered BEFORE the static file serving.
        `);
        return;
      }

      // Parse it as JSON if not empty
      if (!responseText.trim()) {
        console.log("Empty response received");
        setGames([]);
        return;
      }

      let responseData;
      try {
        responseData = JSON.parse(responseText);
        console.log(
          "Parsed response type:",
          Array.isArray(responseData) ? "Array" : typeof responseData
        );
        console.log("Full response data:", responseData);
      } catch (e) {
        console.error("Failed to parse JSON:", e);
        setError(`Invalid JSON response from server: ${e.message}`);
        return;
      }

      // Extract games data from the response
      let gamesData;

      if (Array.isArray(responseData)) {
        // Direct array response
        gamesData = responseData;
      } else if (responseData && typeof responseData === "object") {
        // Object response - check for common wrapper patterns
        const potentialArrayProps = ["data", "games", "results", "items"];
        let foundArray = false;

        for (const prop of potentialArrayProps) {
          if (Array.isArray(responseData[prop])) {
            gamesData = responseData[prop];
            console.log(`Found games array in responseData.${prop}`);
            foundArray = true;
            break;
          }
        }

        if (!foundArray) {
          // As a last resort, check if the object itself has game-like properties
          if (responseData._id && responseData.name) {
            gamesData = [responseData]; // Single game object
            console.log("Found a single game object in response");
          } else {
            console.log("Object properties:", Object.keys(responseData));
            setError("Could not find games data in response");
            return;
          }
        }
      } else {
        console.error("Unexpected response data type:", typeof responseData);
        setError("Unexpected data format received from server");
        return;
      }

      // Use the extracted games data
      if (Array.isArray(gamesData)) {
        console.log(`Got ${gamesData.length} games from refresh`);

        // Filter for active games if status field is present
        const activeGames = gamesData.filter(
          (game) => !game.status || game.status.toLowerCase() === "active"
        );

        console.log(`Active games: ${activeGames.length}`);

        // Set all games since filtering might happen on the server
        setGames(gamesData);

        if (gamesData.length > 0) {
          // Log first game details for debugging
          console.log("Sample game:", gamesData[0]);
        }
      } else {
        console.error("Failed to extract games array");
        setError("Unexpected data format received from server");
      }
    } catch (err) {
      console.error("Error in handleRefresh:", err);
      setError(`Error refreshing games: ${err.message}`);
    } finally {
      setFetchingGames(false);
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
      {warning && <WarningMessage>{warning}</WarningMessage>}

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

      {/* Debug info */}
      <div style={{ marginTop: "20px", fontSize: "12px", color: "#777" }}>
        <div>Games count: {games ? games.length : 0}</div>
        <div>Selected game: {selectedGameId || "None"}</div>
        <div>Socket connected: {socket ? "Yes" : "No"}</div>
        <div>Bank exists: {bankExists ? "Yes" : "No"}</div>
        <div>API URL: {window.location.origin}/api/games</div>
      </div>
    </Card>
  );
};
