import { createContext } from "react";
import io from "socket.io-client";

const api = import.meta.env.VITE_SOCKET_URL;

const SocketContext = createContext();
const socket = io.connect(api);

const SocketProvider = ({ children }) => {
  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export { SocketContext, SocketProvider };
