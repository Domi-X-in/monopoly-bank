// client/src/pages/PlayerDashboard.js
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useSocket } from "../contexts/SocketContext";
import { Header } from "../components/UI/Header";
import { Container } from "../components/Layout/Container";
import { Card } from "../components/Layout/Card";
import { Button } from "../components/UI/Button";
import { PlayersList } from "../components/Game/PlayersList";
import { PaymentForm } from "../components/Game/PaymentForm";
import { TransactionsList } from "../components/Game/TransactionsList";
import * as api from "../services/api";

const DashboardContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme }) => theme.spacing.lg};

  @media (min-width: ${({ theme }) => theme.breakpoints.desktop}) {
    grid-template-columns: 1fr 2fr;
  }
`;

const LeftSidebar = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
`;

const PlayerInfo = styled(Card)`
  text-align: center;
`;

const PlayerName = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSizes.xlarge};
  color: ${({ theme }) => theme.colors.tertiary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const PlayerRole = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSizes.medium};
  color: ${({ theme }) => theme.colors.textLight};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const PlayerBalance = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSizes.xxlarge};
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  color: ${({ isBank, theme }) =>
    isBank ? theme.colors.bank : theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const GameTitle = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSizes.xxlarge};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.tertiary};
`;

const EndGameButton = styled(Button)`
  margin-top: ${({ theme }) => theme.spacing.md};
`;

const PlayerDashboard = () => {
  const { gameId, playerId } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();

  const [game, setGame] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [players, setPlayers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial data
  useEffect(() => {
    if (!socket) return;
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch game
        const gameResponse = await api.getGame(gameId);
        setGame(gameResponse.data);

        if (gameResponse.data.status === "ended") {
          alert("This game has ended");
          navigate("/");
          return;
        }

        // Fetch current player
        const playerResponse = await api.getPlayer(playerId);
        setCurrentPlayer(playerResponse.data);

        // Fetch all players in the game
        const playersResponse = await api.getPlayers(gameId);
        setPlayers(playersResponse.data);

        // Fetch transactions
        const transactionsResponse = await api.getTransactions(gameId);
        setTransactions(transactionsResponse.data);

        // Join the game room for real-time updates
        socket.emit("joinGame", gameId);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        alert("Failed to load game data");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [gameId, playerId, navigate, socket]);

  // Set up socket listeners for real-time updates
  useEffect(() => {
    if (!socket) return;

    // Player joined event
    socket.on("playerJoined", (newPlayer) => {
      if (newPlayer && newPlayer.gameId === gameId) {
        setPlayers((prevPlayers) => {
          // Ensure prevPlayers is an array
          const currentPlayers = Array.isArray(prevPlayers) ? prevPlayers : [];

          // Check if player already exists (to prevent duplicates)
          const exists = currentPlayers.some((p) => p._id === newPlayer._id);
          if (exists) {
            return currentPlayers;
          }
          return [...currentPlayers, newPlayer];
        });
      }
    });

    // Transaction event
    socket.on("transaction", ({ transaction, fromPlayer, toPlayer }) => {
      if (transaction && transaction.gameId === gameId) {
        // Update transactions list with defensive check
        setTransactions((prevTransactions) => {
          const currentTransactions = Array.isArray(prevTransactions)
            ? prevTransactions
            : [];
          return [transaction, ...currentTransactions];
        });

        // Update player balances with defensive checks
        setPlayers((prevPlayers) => {
          if (!Array.isArray(prevPlayers)) return [];

          return prevPlayers.map((player) => {
            if (player._id === fromPlayer._id) {
              return { ...player, balance: fromPlayer.balance };
            }
            if (player._id === toPlayer._id) {
              return { ...player, balance: toPlayer.balance };
            }
            return player;
          });
        });

        // Update current player if affected
        if (currentPlayer) {
          if (currentPlayer._id === fromPlayer._id) {
            setCurrentPlayer({ ...currentPlayer, balance: fromPlayer.balance });
          } else if (currentPlayer._id === toPlayer._id) {
            setCurrentPlayer({ ...currentPlayer, balance: toPlayer.balance });
          }
        }
      }
    });

    // Game ended event
    socket.on("gameEnded", (endedGame) => {
      if (endedGame && endedGame._id === gameId) {
        alert("This game has been ended by the bank");
        navigate("/");
      }
    });

    return () => {
      socket.off("playerJoined");
      socket.off("transaction");
      socket.off("gameEnded");
    };
  }, [socket, gameId, currentPlayer, navigate]);

  const handleEndGame = async () => {
    if (!currentPlayer?.isBank) return;

    if (
      window.confirm(
        "Are you sure you want to end this game? This cannot be undone."
      )
    ) {
      try {
        await api.endGame(currentPlayer._id);
        alert("Game ended successfully");
        navigate("/");
      } catch (error) {
        console.error("Error ending game:", error);
        alert("Failed to end game");
      }
    }
  };

  // Handler for when payment is completed
  const handlePaymentComplete = async () => {
    try {
      // Refresh player data
      const playerResponse = await api.getPlayer(playerId);
      setCurrentPlayer(playerResponse.data);

      // Refresh all players
      const playersResponse = await api.getPlayers(gameId);
      setPlayers(playersResponse.data);

      // Refresh transactions
      const transactionsResponse = await api.getTransactions(gameId);
      setTransactions(transactionsResponse.data);
    } catch (error) {
      console.error("Error refreshing data after payment:", error);
    }
  };

  if (loading || !game || !currentPlayer) {
    return (
      <>
        <Header />
        <Container>
          <p style={{ textAlign: "center" }}>Loading game data...</p>
        </Container>
      </>
    );
  }

  return (
    <>
      <Header />
      <Container>
        <GameTitle>{game.name}</GameTitle>

        <DashboardContainer>
          <LeftSidebar>
            <PlayerInfo>
              <PlayerName>{currentPlayer.name}</PlayerName>
              <PlayerRole>
                {currentPlayer.isBank ? "Bank" : "Player"}
              </PlayerRole>
              <PlayerBalance isBank={currentPlayer.isBank}>
                {currentPlayer.isBank
                  ? "Unlimited"
                  : `$${currentPlayer.balance.toLocaleString()}`}
              </PlayerBalance>

              {currentPlayer.isBank && (
                <EndGameButton variant="bank" onClick={handleEndGame}>
                  End Game
                </EndGameButton>
              )}
            </PlayerInfo>

            <PlayersList
              players={players}
              currentPlayerId={currentPlayer._id}
            />
          </LeftSidebar>

          <MainContent>
            <PaymentForm
              gameId={gameId}
              currentPlayer={currentPlayer}
              players={players}
              onPaymentComplete={handlePaymentComplete}
            />

            <TransactionsList transactions={transactions} />
          </MainContent>
        </DashboardContainer>
      </Container>
    </>
  );
};

export default PlayerDashboard;
