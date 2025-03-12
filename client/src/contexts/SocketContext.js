// client/src/contexts/SocketContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Connect to the server
    //   const newSocket = io('http://localhost:5002');
    const newSocket = io(window.location.origin);
    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Only render children once socket is initialized
  if (!socket) return <div>Connecting...</div>;

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
