import React, { useContext, useState, useEffect } from "react";
import { SocketContext } from "../context/SocketContext";
import Navbar from "./Navbar";
import { toast } from "react-hot-toast";

const Home = () => {
  const socket = useContext(SocketContext);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState("");
  const [name, setName] = useState("");
  const [key, setKey] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [ongoing, setOngoing] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [past, setPast] = useState([]);
  const [DBUser, setDBUser] = useState({});

  const arrayBufferToBase64 = (buffer) => {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
  };

  const base64ToArrayBuffer = (base64) => {
    return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  };

  const handleButtons = (type) => {
    setActive(type);

    if (type === "view") {
      socket.emit("live");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const firstname = localStorage.getItem("name");
    setName(firstname);

    if (!token) {
      localStorage.clear();
      window.location.href = "/auth";
      return;
    }

    if (token && role === "admin") {
      toast.error("Admins are not allowed to cast votes!");
      setTimeout(() => {
        localStorage.clear();
        window.location.href = "/auth";
      }, 4000);
    } else {
      setLoading(false);
    }

    socket.on("key", async (keyBase64) => {
      const keyBuffer = base64ToArrayBuffer(keyBase64);
      const cryptoKey = await window.crypto.subtle.importKey(
        "raw",
        keyBuffer,
        { name: "AES-CBC" },
        false,
        ["encrypt", "decrypt"]
      );
      setKey(cryptoKey);
    });

    const intervalId = setInterval(() => {
      socket.emit("live");
    }, 60000);

    socket.emit("getCandidates", localStorage.getItem("userId"));

    socket.on("candidates", (candidates) => {
      setCandidates(candidates);
    });

    socket.on("db_user", (user) => {
      console.log("DB User", user);
      setDBUser(user);
    });

    socket.on("error", (error) => {
      toast.error(error.message);
    });

    socket.on("ongoing", (ongoing) => {
      console.log("Ongoing", ongoing);
      setOngoing(ongoing);
    });

    socket.on("upcoming", (upcoming) => {
      console.log("upcoming", upcoming);
      setUpcoming(upcoming);
    });

    socket.on("past", (past) => {
      console.log("past", past);
      setPast(past);
    });

    socket.on("success", (message) => {
      toast.success(message.message);
    });

    return () => {
      socket.off("key");
      socket.off("candidates");
      socket.off("db_user");
      socket.off("error");
      socket.off("ongoing");
      socket.off("upcoming");
      socket.off("past");
      socket.off("success");
      clearInterval(intervalId);
    };
  }, [socket]);

  if (loading) {
    return (
      <div className="flex mx-auto justify-center items-center h-screen">
        <p className="bg-black text-white rounded-full px-4 py-2 text-3xl font-black animate-pulse">
          V
        </p>
      </div>
    );
  }

  const handleVote = async (candidate) => {
    if (!key) {
      toast.error("Encryption key not available. kindly refresh the page.");
      window.location.reload();
      setActive("vote");
      return;
    }

    const vote = {
      candidateId: candidate._id,
      category: candidate.voteCategory,
      userId: localStorage.getItem("userId"),
      userEmail: localStorage.getItem("email"),
      firstname: localStorage.getItem("name"),
    };
    const iv = window.crypto.getRandomValues(new Uint8Array(16));
    try {
      const encryptedVote = await window.crypto.subtle.encrypt(
        {
          name: "AES-CBC",
          iv,
        },
        key,
        new TextEncoder().encode(JSON.stringify(vote))
      );
      const encryptedVoteBase64 = arrayBufferToBase64(encryptedVote);
      const ivBase64 = arrayBufferToBase64(iv);
      socket.emit("vote", encryptedVoteBase64, ivBase64);
      socket.emit("getCandidates", localStorage.getItem("userId"));

      setTimeout(() => {
        window.location.reload();
      }, 2000);
      setActive("vote");
    } catch (error) {
      console.error("Encryption error:", error);
      toast.error("Failed to encrypt vote. Please try again.");
    }
  };

  // Sort candidates by voteCategory
  const sortedCandidates = candidates.sort((a, b) =>
    a.voteCategory.localeCompare(b.voteCategory)
  );

  // Group candidates by voteCategory
  const candidatesByCategory = sortedCandidates.reduce((acc, candidate) => {
    if (!acc[candidate.voteCategory]) {
      acc[candidate.voteCategory] = [];
    }
    acc[candidate.voteCategory].push(candidate);
    return acc;
  }, {});

  return (
    <div>
      <Navbar />
      <h2 className="text-center text-2xl md:text-6xl font-bold my-2">
        Welcome, {name} 👋
      </h2>
      <p className="text-center text-lg">What do you want to do today?</p>
      <div className="flex flex-row flex-wrap gap-3 justify-center mt-10 mx-2">
        <button
          onClick={() => handleButtons("vote")}
          className={`p-8 rounded-lg border text-center md:text-2xl md:p-12 border-gray-300 shadow-md shadow-black outline-none ${
            active === "vote"
              ? "bg-black text-white shadow-gray-400"
              : "bg-white text-black"
          }`}
        >
          Cast your <br />
          Votes
        </button>
        <button
          onClick={() => handleButtons("view")}
          className={`p-8 rounded-lg border text-center md:text-2xl md:p-12 border-gray-300 shadow-md shadow-black outline-none ${
            active === "view"
              ? "bg-black text-white shadow-gray-400"
              : "bg-white text-black"
          }`}
        >
          View Live
          <br /> Vote Count
        </button>
      </div>
      <hr className="mt-20 h-1 bg-black rounded-full" />
      <div>
        {active === "vote" ? (
          <div className="flex justify-center items-center flex-col my-8">
            <h2 className="text-2xl font-bold mb-10 text-center mx-4">
              Cast your Votes
            </h2>
            {Object.keys(candidatesByCategory).length > 0 ? (
              Object.keys(candidatesByCategory).map((category) => (
                <div key={category} className="mb-10">
                  <h3 className="text-xl font-semibold mb-4 capitalize">
                    {category}
                  </h3>
                  <div className="flex flex-col border border-gray-200 shadow-md shadow-black rounded-lg p-5 md:w-96 md:mx-auto">
                    {candidatesByCategory[category].map((candidate) => (
                      <div
                        key={candidate._id}
                        className="flex flex-row justify-between items-center mb-6 pb-6 border-b-black border-b-2"
                      >
                        <div className="flex flex-col">
                          <p className="text-base capitalize">
                            <span className="font-bold">Candidate Name: </span>
                            {candidate.candidateName}
                          </p>
                          <p className="text-base uppercase">
                            <span className="capitalize font-bold">
                              Candidate Party:{" "}
                            </span>{" "}
                            {candidate.candidateParty}{" "}
                          </p>
                          <p className="text-base capitalize">
                            <span className="font-bold">Position: </span>{" "}
                            {candidate.voteCategory}{" "}
                          </p>
                          <p className="text-base capitalize">
                            <span className="font-bold">Voting Starts: </span>{" "}
                            {candidate.startDate.toLocaleString()}{" "}
                          </p>
                          <p className="text-base capitalize">
                            <span className="font-bold">Voting ends: </span>{" "}
                            {candidate.endDate.toLocaleString()}{" "}
                          </p>
                        </div>
                        <button
                          onClick={() => handleVote(candidate)}
                          className={`bg-black text-white p-2 rounded-lg ${
                            DBUser.votes.some(
                              (vote) => vote.category === candidate.voteCategory
                            )
                              ? "bg-gray-400 pointer-events-none"
                              : new Date(candidate.endDate) < new Date()
                              ? "bg-gray-400 pointer-events-none"
                              : "bg-black"
                          }`}
                          disabled={DBUser.votes.some(
                            (vote) => vote.category === candidate.voteCategory
                          )}
                        >
                          {DBUser.votes.some(
                            (vote) => vote.category === candidate.voteCategory
                          )
                            ? "Voted"
                            : new Date(candidate.endDate) < new Date()
                            ? "Ended"
                            : "Vote"}
                        </button>
                        <hr className="h-2 bg-black" />
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center">No candidates available</p>
            )}
          </div>
        ) : active === "view" ? (
          <div className="flex justify-center items-center flex-col my-8">
            <h2 className="text-xl mb-10 text-center mx-4">View Candidates</h2>
            <div className="mb-10">
              <h3 className="text-xl font-semibold mb-4 capitalize">
                Ongoing Votes
              </h3>
              <div className="flex flex-col border border-gray-200 shadow-md shadow-black rounded-lg p-5 md:w-96 md:mx-auto">
                {ongoing.length > 0 ? (
                  ongoing.map((candidate) => (
                    <div
                      key={candidate._id}
                      className="flex flex-row justify-between items-center mb-6"
                    >
                      <div className="flex flex-col">
                        <p className="text-base capitalize">
                          <span className="font-bold">Candidate Name: </span>
                          {candidate.candidateName}
                        </p>
                        <p className="text-base uppercase">
                          <span className="capitalize font-bold">
                            Candidate Party:{" "}
                          </span>
                          {candidate.candidateParty}
                        </p>
                        <p className="text-base capitalize">
                          <span className="font-bold">Position: </span>
                          {candidate.voteCategory}
                        </p>
                      </div>
                      <button
                        className={`bg-black text-white p-2 rounded-lg pointer-events-none`}
                      >
                        {candidate.voteCount} vote
                        {candidate.voteCount >= 2 ? "s" : ""}
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-center">
                    No ongoing votes, check back later.
                  </p>
                )}
              </div>
            </div>
            <div className="mb-10">
              <h3 className="text-xl font-semibold mb-4 capitalize">
                Upcoming Votes
              </h3>
              <div className="flex flex-col border border-gray-200 shadow-md shadow-black rounded-lg p-5 md:w-96 md:mx-auto">
                {upcoming.length > 0 ? (
                  upcoming.map((candidate) => (
                    <div
                      key={candidate._id}
                      className="flex flex-row justify-between items-center mb-6"
                    >
                      <div className="flex flex-col">
                        <p className="text-base capitalize">
                          <span className="font-bold">Candidate Name: </span>
                          {candidate.candidateName}
                        </p>
                        <p className="text-base uppercase">
                          <span className="capitalize font-bold">
                            Candidate Party:{" "}
                          </span>
                          {candidate.candidateParty}
                        </p>
                        <p className="text-base capitalize">
                          <span className="font-bold">Position: </span>
                          {candidate.voteCategory}
                        </p>
                      </div>
                      <button
                        className={`bg-black text-white p-2 rounded-lg pointer-events-none`}
                      >
                        {candidate.voteCount} vote
                        {candidate.voteCount >= 2 ? "s" : ""}
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-center">
                    No upcoming votes, check back later.
                  </p>
                )}
              </div>
            </div>
            <div className="mb-10">
              <h3 className="text-xl font-semibold mb-4 capitalize">
                Past Votes
              </h3>
              <div className="flex flex-col border border-gray-200 shadow-md shadow-black rounded-lg p-5 md:w-96 md:mx-auto">
                {past.length > 0 ? (
                  past.map((candidate) => (
                    <div
                      key={candidate._id}
                      className="flex flex-row justify-between items-center mb-6"
                    >
                      <div className="flex flex-col">
                        <p className="text-base capitalize">
                          <span className="font-bold">Candidate Name: </span>
                          {candidate.candidateName}
                        </p>
                        <p className="text-base uppercase">
                          <span className="capitalize font-bold">
                            Candidate Party:{" "}
                          </span>
                          {candidate.candidateParty}
                        </p>
                        <p className="text-base capitalize">
                          <span className="font-bold">Position: </span>
                          {candidate.voteCategory}
                        </p>
                      </div>
                      <button
                        className={`bg-black text-white p-2 rounded-lg pointer-events-none`}
                      >
                        {candidate.voteCount} vote
                        {candidate.voteCount >= 2 ? "s" : ""}
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-center">
                    No past votes, check back later.
                  </p>
                )}
              </div>
            </div>
            {/* <div className="flex flex-col border border-gray-200 shadow-md shadow-black rounded-lg p-5 md:w-96 md:mx-auto">
              {candidates.map((candidate) => (
                <div
                  key={candidate._id}
                  className="flex flex-row justify-between mb-2"
                >
                  <p className="text-sm">{candidate.candidateName}</p>
                  <p className="text-sm">{candidate.voteCategory}</p>
                </div>
              ))}
            </div> */}
          </div>
        ) : (
          <div className="flex justify-center items-center flex-col h-[50vh]">
            <p className="text-center">
              Kindly select an option from the buttons above
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
