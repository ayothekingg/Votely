import React from "react";
import { useNavigate } from "react-router-dom";
import { FaPowerOff } from "react-icons/fa6";

const Navbar = () => {
  const navigate = useNavigate();
  const logout = async (e) => {
    e.preventDefault();
    await localStorage.clear();
    navigate("/auth");
  };

  return (
    <nav className="flex flex-row bg-black w-full justify-between px-1 md:justify-around">
      <a href="/" className="flex flex-row items-baseline my-1">
        <p className="bg-white text-black rounded-full w-full px-4 py-2 text-3xl font-black">
          V
        </p>
        <p className="text-white text-xl">otely</p>
      </a>
      <button
        onClick={logout}
        className="flex flex-row items-center mt-3 gap-1"
      >
        <FaPowerOff className="h-4 w-4" color="white" />
        <p className="text-white">Logout</p>
      </button>
    </nav>
  );
};

export default Navbar;
