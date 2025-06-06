// client/src/App.js
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { SocketProvider } from "./contexts/SocketContext";
import { GlobalStyles } from "./styles/GlobalStyles";
import { theme } from "./styles/theme";
import WelcomePage from "./pages/WelcomePage";
import GameLobby from "./pages/GameLobby";
import PlayerDashboard from "./pages/PlayerDashboard";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <ErrorBoundary>
        <SocketProvider>
          <Routes>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/games" element={<GameLobby />} />
            <Route
              path="/game/:gameId/player/:playerId"
              element={<PlayerDashboard />}
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </SocketProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
