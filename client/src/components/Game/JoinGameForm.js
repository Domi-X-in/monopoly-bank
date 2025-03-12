// client/src/components/Game/JoinGameForm.js
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../../contexts/SocketContext";
import { FormGroup } from "../UI/FormGroup";
import { Input } from "../UI/Input";
import { Select } from "../UI/Select";
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

const Button = styled.button`
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

  &:hover:not(:disabled),
  &:focus:not(:disabled) {
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
    border-color: #cccccc !important;
  }
`;

const PlayerButton = styled(Button)`
  background-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.secondary};

  &:hover:not(:disabled),
  &:focus:not(:disabled) {
    background-color: #c01712;
  }
`;

const BankButton = styled(Button)`
  background-color: ${({ theme, bankExists }) =>
    bankExists ? "#cccccc" : theme.colors.bank};
  color: ${({ theme, bankExists }) =>
    bankExists ? "#666666" : theme.colors.tertiary};
  display: flex;
  flex-direction: column;
  line-height: 1.2;
  padding: ${({ theme }) => `${theme.spacing.md} ${theme.spacing.lg}`};

  .exists-text {
    font-size: ${({ theme }) => theme.typography.fontSizes.small};
    margin-top: ${({ theme }) => theme.spacing.xs};
  }

  &:hover:not(:disabled),
  &:focus:not(:disabled) {
    background-color: #e6b800;
  }
`;

export const JoinGameForm = ({ selectedGame }) => {
  const [games, setGames] = useState([]);
  const [selectedGameId, setSelectedGameId] = useState(selectedGame?._id || "");
  const [playerName, setPlayerName] = useState("");
  const [bankExists, setBankExists] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const socket = useSocket();

  // Fetch games
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await api.getGames();
        const gamesData = response.data || [];
        setGames(gamesData);

        // Set first game as default if none is selected
        if (!selectedGameId && gamesData.length > 0) {
          setSelectedGameId(gamesData[0]._id);
        }
      } catch (err) {
        console.error("Failed to fetch games:", err);
        setGames([]); // Set empty array on error
      }
    };

    fetchGames();

    // Listen for new games with defensive check
    if (socket) {
      socket.on("gameCreated", (game) => {
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
  }, [socket, selectedGameId]);

  // Check if bank exists for selected game
  useEffect(() => {
    if (selectedGameId && socket) {
      const checkBankExists = async () => {
        try {
          const response = await api.getPlayers(selectedGameId);
          const hasBank =
            response.data &&
            Array.isArray(response.data) &&
            response.data.some((player) => player.isBank);
          setBankExists(hasBank);
        } catch (err) {
          console.error("Failed to check if bank exists:", err);
          setBankExists(false);
        }
      };

      checkBankExists();

      // Join the game room for real-time updates
      socket.emit("joinGame", selectedGameId);

      // Listen for player joined events
      socket.on("playerJoined", (player) => {
        if (player && player.gameId === selectedGameId && player.isBank) {
          setBankExists(true);
        }
      });

      return () => {
        socket.off("playerJoined");
      };
    }
  }, [socket, selectedGameId]);

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

      // Create player
      const playerData = {
        name: playerName,
        gameId: selectedGameId,
        isBank,
      };

      const response = await api.createPlayer(playerData);

      // Navigate to player dashboard
      navigate(`/game/${selectedGameId}/player/${response.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to join game");
    } finally {
      setLoading(false);
    }
  };

  if (!Array.isArray(games) || games.length === 0) {
    return (
      <Card>
        <FormTitle>Join Game</FormTitle>
        <p>No active games available. Please create a new game.</p>
      </Card>
    );
  }

  return (
    <Card>
      <FormTitle>Join Game</FormTitle>
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

        {error && (
          <div className="error" style={{ color: "red", marginBottom: "1rem" }}>
            {error}
          </div>
        )}

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
      </div>
    </Card>
  );
};
