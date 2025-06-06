// client/src/contexts/SocketContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connectionError, setConnectionError] = useState(null);
  const [connecting, setConnecting] = useState(true);

  useEffect(() => {
    try {
      // Connect to the server using env var when provided
      const serverUrl = process.env.REACT_APP_SERVER_URL || window.location.origin;
      const newSocket = io(serverUrl, {
        reconnectionAttempts: 5,
        timeout: 10000,
        transports: ["websocket", "polling"], // Try websocket first, fallback to polling
      });

      console.log("Attempting socket connection to:", serverUrl);

      // Set up event handlers
      newSocket.on("connect_error", (err) => {
        console.error("Socket connection error:", err);
        setConnectionError(err.message);
        setConnecting(false);
      });

      newSocket.on("connect", () => {
        console.log("Socket connected successfully");
        setConnectionError(null);
        setConnecting(false);
      });

      newSocket.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
      });

      setSocket(newSocket);

      // Cleanup on unmount
      return () => {
        console.log("Cleaning up socket connection");
        newSocket.disconnect();
      };
    } catch (err) {
      console.error("Error initializing socket:", err);
      setConnectionError(err.message);
      setConnecting(false);
    }
  }, []);

  // Show a more graceful error message
  if (connectionError) {
    return (
      <div style={{ padding: "20px", textAlign: "center", color: "#e31a16" }}>
        <h2>Connection Error</h2>
        <p>Unable to connect to the server: {connectionError}</p>
        <p>Please try refreshing the page or check your network connection.</p>
      </div>
    );
  }

  // Show loading state while connecting
  if (connecting) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        Connecting to server...
      </div>
    );
  }

  // Only render children once socket is initialized successfully
  if (!socket)
    return <div>Failed to initialize connection. Please refresh the page.</div>;

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
