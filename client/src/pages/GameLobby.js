// client/src/pages/GameLobby.js
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useSocket } from "../contexts/SocketContext";
import { Header } from "../components/UI/Header";
import { Container } from "../components/Layout/Container";
import { Card } from "../components/Layout/Card";
import { JoinGameForm } from "../components/Game/JoinGameForm";
//import * as api from '../services/api';

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

const GameLobby = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const socket = useSocket();
  const [game] = useState(location.state?.createdGame || null);

  useEffect(() => {
    // If no game data, redirect back to home
    if (!game && !location.state?.createdGame) {
      navigate("/");
      return;
    }

    if (game) {
      // Join the game room for real-time updates
      socket.emit("joinGame", game._id);

      // Listen for game ended event
      socket.on("gameEnded", (endedGame) => {
        if (endedGame._id === game._id) {
          alert("This game has been ended by the bank");
          navigate("/");
        }
      });

      return () => {
        socket.off("gameEnded");
      };
    }
  }, [game, location.state, navigate, socket]);

  if (!game) {
    return null; // Will redirect to home
  }

  return (
    <>
      <Header />
      <Container>
        <LobbyTitle>Game Lobby</LobbyTitle>

        <GameInfoCard>
          <GameName>{game.name}</GameName>
          <p>
            Join this game by entering your name and selecting your role below.
          </p>
        </GameInfoCard>

        <JoinFormContainer>
          <JoinGameForm selectedGame={game} />
        </JoinFormContainer>
      </Container>
    </>
  );
};

export default GameLobby;
