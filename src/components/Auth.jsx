import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Auth = () => {
  const [form, setForm] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    const api = import.meta.env.VITE_API_ENDPOINT;

    if (form === "login") {
      // make API call for login
      const response = await fetch(`${api}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch!");
      }
      const data = await response.json();
      console.log("Login data:", data);
      if (data.status === false) {
        toast.error(data.message);
        setLoading(false);
        return;
      }
      if (data.token) {
        if (data.user.userType === "admin") {
          localStorage.setItem("token", data.token);
          localStorage.setItem("role", data.user.userType);
          localStorage.setItem("userId", data.user._id);
          localStorage.setItem("name", data.user.firstname);
          localStorage.setItem("email", data.user.email);
          setLoading(false);
          navigate("/admin_dash");
        } else {
          localStorage.setItem("token", data.token);
          localStorage.setItem("role", data.user.userType);
          localStorage.setItem("userId", data.user._id);
          localStorage.setItem("name", data.user.firstname);
          localStorage.setItem("email", data.user.email);
          setLoading(false);
          navigate("/");
        }
      }
    } else if (form === "signup") {
      // make API call for signup
      const response = await fetch(`${api}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, firstname, lastname }),
      });
      const data = await response.json();
      console.log("Signup data:", data);
      if (data.status === false) return toast.error(data.message);
      if (data.token) {
        if (data.user.userType === "admin") {
          localStorage.setItem("token", data.token);
          localStorage.setItem("role", data.user.userType);
          localStorage.setItem("userId", data.user._id);
          localStorage.setItem("name", data.user.firstname);
          setLoading(false);
          navigate("/admin_dash");
        } else {
          localStorage.setItem("token", data.token);
          localStorage.setItem("role", data.user.userType);
          localStorage.setItem("userId", data.user._id);
          localStorage.setItem("name", data.user.firstname);
          setLoading(false);
          navigate("/");
        }
      }
    } else {
      toast.error("An error occurred!");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex mx-auto justify-center items-center h-screen">
        <p className="bg-black text-white rounded-full px-4 py-2 text-3xl font-black animate-pulse">
          V
        </p>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center flex-col h-[100vh]">
      <h2 className="text-xl mb-10 text-center mx-4">
        Welcome to votely, kindly {form === "login" ? "login" : "signup"} to
        continue
      </h2>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col border border-gray-200 shadow-md shadow-black rounded-lg p-5 md:w-96 md:mx-auto"
      >
        <label
          htmlFor="firstname"
          className={`text-sm pb-1.5 ${form === "login" ? "hidden" : ""}`}
        >
          Legal Firstname
          <span className="text-red-500 font-bold text-sm">*</span>
        </label>
        <input
          type="text"
          name="firstname"
          id="firstname"
          placeholder="Kyle"
          onChange={(e) => setFirstname(e.target.value)}
          required={form === "signup"}
          className={`border border-gray-400 p-2 rounded-md mb-4 text-sm ${
            form === "login"
              ? "hidden"
              : "focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          }`}
        />
        <label
          htmlFor="lastname"
          className={`text-sm pb-1.5 ${form === "login" ? "hidden" : ""}`}
        >
          Legal Lastname
          <span className="text-red-500 font-bold text-sm">*</span>
        </label>
        <input
          type="text"
          name="lastname"
          id="lastname"
          placeholder="xyz"
          onChange={(e) => setLastname(e.target.value)}
          required={form === "signup"}
          className={`border border-gray-400 p-2 rounded-md mb-4 text-sm ${
            form === "login"
              ? "hidden"
              : "focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          }`}
        />
        <label htmlFor="email" className="text-sm pb-1.5">
          Valid Email<span className="text-red-500 font-bold text-sm">*</span>
        </label>
        <input
          type="email"
          name="email"
          id="email"
          placeholder="example@domain.com"
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border border-gray-400 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent mb-4 text-sm"
        />
        <label htmlFor="password" className="text-sm pb-1.5">
          Password<span className="text-red-500 font-bold text-sm">*</span>
        </label>
        <input
          type="password"
          name="password"
          id="password"
          placeholder="**********"
          onChange={(e) => setPassword(e.target.value)}
          required
          className="border border-gray-400 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent mb-4 text-sm"
        />
        <p className="mt-5 text-base">
          {form === "login"
            ? `Don't have an account? `
            : `Already have an account? `}
          <button
            type="button"
            onClick={() => setForm(form === "login" ? "signup" : "login")}
            className="text-blue-500 underline focus:outline-none"
          >
            {form === "login" ? "Signup!" : "Login here!"}
          </button>
        </p>
        <button
          type="submit"
          className="py-3 px-6 bg-black rounded-md text-white text-sm font-bold mt-8 hover:bg-white hover:text-black hover:border-2 hover:border-black"
        >
          {form === "login" ? "Login" : "Signup"}
        </button>
      </form>
    </div>
  );
};

export default Auth;
