import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SocketProvider } from "./context/SocketContext";
// import io from "socket.io-client";
import Auth from "./components/Auth";
import Home from "./components/Home";
import Admin from "./components/Admin";
// const socket = io.connect("http://localhost:5000");

function App() {
  return (
    <SocketProvider>
      <Router>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<Home />} />
          <Route path="/admin_dash" element={<Admin />} />
          {/* <Redirect from="/" to="/home" /> */}
        </Routes>
      </Router>
    </SocketProvider>
  );
}

export default App;
