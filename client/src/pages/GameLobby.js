// client/src/pages/GameLobby.js
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useSocket } from "../contexts/SocketContext";
import { Header } from "../components/UI/Header";
import { Container } from "../components/Layout/Container";
import { Card } from "../components/Layout/Card";
import { JoinGameForm } from "../components/Game/JoinGameForm";
import { Button } from "../components/UI/Button";
import * as api from "../services/api";

const LobbyTitle = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSizes.xxlarge};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.tertiary};
`;

const GameInfoCard = styled(Card)`
  max-width: 600px;
  margin: 0 auto ${({ theme }) => theme.spacing.xl};
`;

const GameName = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSizes.xlarge};
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const JoinFormContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
`;

const DebugInfo = styled.div`
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  padding: 10px;
  margin-top: 20px;
  border-radius: 5px;
  max-height: 200px;
  overflow: auto;
  font-family: monospace;
  font-size: 12px;
`;

const GameLobby = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const socket = useSocket();
  const [game] = useState(location.state?.createdGame || null);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState({});

  const fetchGames = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching games...");
      const response = await api.getGames();
      console.log("Games API response:", response);

      if (response.data) {
        setGames(response.data);
        setDebugInfo((prev) => ({
          ...prev,
          gamesResponse: response.data,
          gamesCount: response.data.length,
        }));
      } else {
        setGames([]);
        setError("No games data returned from server");
      }
    } catch (err) {
      console.error("Error fetching games:", err);
      setError(err.message || "Failed to fetch games");
      setDebugInfo((prev) => ({
        ...prev,
        gamesError: err.message,
        gamesErrorStack: err.stack,
      }));
      setGames([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If no game data, fetch games
    if (!game) {
      fetchGames();
    }

    // Join socket room and listen for events
    if (socket) {
      console.log("Setting up socket listeners");

      // Listen for new games
      socket.on("gameCreated", (newGame) => {
        console.log("New game created:", newGame);
        if (newGame) {
          setGames((prevGames) => {
            const validGames = Array.isArray(prevGames) ? prevGames : [];
            return [...validGames, newGame];
          });
        }
      });

      // Listen for game ended event
      socket.on("gameEnded", (endedGame) => {
        console.log("Game ended:", endedGame);
        if (game && endedGame && endedGame._id === game._id) {
          alert("This game has been ended by the bank");
          navigate("/");
        }
      });

      return () => {
        socket.off("gameCreated");
        socket.off("gameEnded");
      };
    }
  }, [game, navigate, socket]);

  const handleRefreshGames = () => {
    fetchGames();
  };

  // If loading, show loading state
  if (loading && !game) {
    return (
      <>
        <Header />
        <Container>
          <LobbyTitle>Game Lobby</LobbyTitle>
          <p style={{ textAlign: "center" }}>Loading games...</p>
        </Container>
      </>
    );
  }

  return (
    <>
      <Header />
      <Container>
        <LobbyTitle>Game Lobby</LobbyTitle>

        {game ? (
          <GameInfoCard>
            <GameName>{game.name}</GameName>
            <p>
              Join this game by entering your name and selecting your role
              below.
            </p>
          </GameInfoCard>
        ) : (
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <p>Select from available games or go back to create a new one.</p>
            <Button
              onClick={() => navigate("/")}
              variant="secondary"
              style={{ marginRight: "10px" }}
            >
              Create New Game
            </Button>
            <Button onClick={handleRefreshGames} variant="primary">
              Refresh Games
            </Button>

            {error && (
              <div style={{ color: "red", margin: "15px 0" }}>
                Error: {error}
              </div>
            )}
          </div>
        )}

        <JoinFormContainer>
          <JoinGameForm
            selectedGame={game}
            allGames={games}
            onRefreshGames={handleRefreshGames}
          />
        </JoinFormContainer>

        {process.env.NODE_ENV !== "production" && (
          <DebugInfo>
            <div>Socket Connected: {socket ? "Yes" : "No"}</div>
            <div>
              Games Count: {Array.isArray(games) ? games.length : "N/A"}
            </div>
            <div>Selected Game: {game ? game.name : "None"}</div>
            <div>Debug Info: {JSON.stringify(debugInfo, null, 2)}</div>
          </DebugInfo>
        )}
      </Container>
    </>
  );
};

export default GameLobby;
