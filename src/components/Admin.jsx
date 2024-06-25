import React, { useState, useEffect } from "react";
import Navbar from "./Navbar";
import { toast } from "react-hot-toast";

const Admin = () => {
  const [active, setActive] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewCandidates, setViewCandidates] = useState([]);
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [party, setParty] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  let api = import.meta.env.VITE_API_ENDPOINT;

  const handleButtons = async (value) => {
    setActive(value);

    console.log(value);

    if (value === "view") {
      setLoading(true);
      try {
        const response = await fetch(`${api}/auth/get_candidates`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        if (!response.ok) {
          throw new Error(response.message);
        }

        const data = await response.json();
        console.log(data);
        setViewCandidates(data.data);
        setLoading(false);
      } catch (error) {
        console.error("Error:", error);
        toast.error("Failed to fetch data. Please try again.");
        setLoading(false);
      }
    }
  };

  console.log("Start Date", start);
  console.log("end Date", end);

  const handleCreate = async (event) => {
    event.preventDefault();

    setLoading(true);

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (startDate < new Date()) {
      toast.error("Please select a future start date and time.");
      setLoading(false);
      return;
    }

    if (endDate <= startDate) {
      toast.error("End date and time must be later than start date and time.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${api}/auth/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          name,
          party,
          category: position,
          start,
          end,
        }),
      });

      if (!response.ok) {
        throw new Error(response.message);
      }

      toast.success("Candidate created successfully!");

      setName("");
      setPosition("");
      setParty("");
      setStart("");
      setEnd("");
      setLoading(false);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to submit form data. Please try again.");
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
      localStorage.clear();
      window.location.href = "/auth";
    }

    if (token && role !== "admin") {
      toast.error("You are not authorized to access this page");
      setTimeout(() => {
        localStorage.clear();
        window.location.href = "/auth";
      }, 4000);
    } else {
      setLoading(false);
    }
  }, []);

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
    <div>
      <Navbar />
      <h2 className="text-center text-2xl md:text-6xl font-bold my-2">
        Admin Dashboard
      </h2>
      <div className="flex flex-row flex-wrap gap-3 justify-center mt-10 mx-2">
        <button
          onClick={() => handleButtons("create")}
          className={`p-8 rounded-lg border text-center md:text-2xl md:p-12 border-gray-300 shadow-md shadow-black outline-none ${
            active === "create"
              ? "bg-black text-white shadow-gray-400"
              : "bg-white text-black"
          }`}
        >
          Add Candidates <br />& Vote Details
        </button>
        <button
          onClick={() => handleButtons("view")}
          className={`p-8 rounded-lg border text-center md:text-2xl md:p-12 border-gray-300 shadow-md shadow-black outline-none ${
            active === "view"
              ? "bg-black text-white shadow-gray-400"
              : "bg-white text-black"
          }`}
        >
          View <br /> Candidates
        </button>
        {/* <button
          onClick={() => handleButtons("ongoing")}
          className={`p-8 rounded-lg border text-center md:text-2xl md:p-12 border-gray-300 shadow-md shadow-black outline-none ${
            active === "ongoing"
              ? "bg-black text-white shadow-gray-400"
              : "bg-white text-black"
          }`}
        >
          Ongoing <br /> Votes
        </button>
        <button
          onClick={() => handleButtons("all")}
          className={`p-8 rounded-lg border text-center md:text-2xl md:p-12 border-gray-300 shadow-md shadow-black outline-none ${
            active === "all"
              ? "bg-black text-white shadow-gray-400"
              : "bg-white text-black"
          }`}
        >
          All Votes
        </button> */}
      </div>
      <hr className="mt-20 h-1 bg-black rounded-full" />
      <div>
        {active === "create" ? (
          <div className="flex justify-center items-center flex-col h-[50vh] my-48">
            <h2 className="text-2xl font-bold mb-10 text-center mx-4">
              Create Candidates & Vote Details
            </h2>
            <form className="flex flex-col border border-gray-200 shadow-md shadow-black rounded-lg p-5 md:w-96 md:mx-auto">
              <label htmlFor="name" className="text-sm pb-1.5">
                Candidate Name
                <span className="text-red-500 font-bold text-sm">*</span>
              </label>
              <input
                type="text"
                name="name"
                id="name"
                placeholder="John Daniel"
                required
                onChange={(e) => setName(e.target.value)}
                className="border border-gray-400 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent mb-4 text-sm"
              />
              <label htmlFor="position" className="text-sm pb-1.5">
                Position
                <span className="text-red-500 font-bold text-sm">*</span>
              </label>
              <input
                type="text"
                name="category"
                id="position"
                placeholder="President"
                onChange={(e) => setPosition(e.target.value)}
                required
                className="border border-gray-400 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent mb-4 text-sm"
              />
              <label htmlFor="party" className="text-sm pb-1.5">
                Candidate Party
                <span className="text-red-500 font-bold text-sm">*</span>
              </label>
              <input
                type="text"
                name="party"
                id="party"
                placeholder="ANPP"
                onChange={(e) => setParty(e.target.value)}
                required
                className="border border-gray-400 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent mb-4 text-sm"
              />
              <label htmlFor="datetime" className="text-sm pb-1.5">
                Start Date and Time
                <span className="text-red-500 font-bold text-sm">*</span>
              </label>
              <input
                type="datetime-local"
                name="start"
                id="datetime"
                onChange={(e) => setStart(e.target.value)}
                required
                className="border border-gray-400 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent mb-4 text-sm"
              />
              <label htmlFor="enddate" className="text-sm pb-1.5">
                End Date and Time
                <span className="text-red-500 font-bold text-sm">*</span>
              </label>
              <input
                type="datetime-local"
                name="end"
                id="enddate"
                onChange={(e) => setEnd(e.target.value)}
                required
                className="border border-gray-400 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent mb-4 text-sm"
              />
              <button
                type="submit"
                onClick={handleCreate}
                className="py-3 px-6 bg-black rounded-md text-white text-sm font-bold mt-8 hover:bg-white hover:text-black hover:border-2 hover:border-black"
              >
                Create
              </button>
            </form>
          </div>
        ) : active === "view" ? (
          <div className="flex justify-center items-center flex-col my-8">
            <h2 className="text-2xl font-bold mb-10 text-center mx-4">
              View Candidates
            </h2>
            {viewCandidates.map((candidate, index) => (
              <div
                key={index}
                className="flex flex-col border border-gray-200 shadow-md shadow-black rounded-lg p-5 md:w-96 md:mx-auto mb-5"
              >
                <div className="flex flex-col gap-2 mb-2">
                  <p className="text-lg capitalize">
                    Candidate Name: {candidate.candidateName}
                  </p>
                  <p className="text-lg uppercase">
                    <span className="capitalize">Candidate Party: </span>{" "}
                    {candidate.candidateParty}
                  </p>
                </div>
                <div className="flex flex-col gap-2 mb-2">
                  <p className="text-lg capitalize">
                    {" "}
                    Position: {candidate.voteCategory}
                  </p>
                  <p className="text-lg">Total Votes: {candidate.voteCount}</p>
                </div>
                <div className="flex flex-col gap-2 mb-2">
                  <p className="text-lg">
                    Start Date: {new Date(candidate.startDate).toLocaleString()}
                  </p>
                  <p className="text-lg">
                    End Date: {new Date(candidate.endDate).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : active === "ongoing" ? (
          <div className="flex justify-center items-center flex-col h-[50vh]">
            <h2 className="text-xl mb-10 text-center mx-4">Ongoing Votes</h2>
            <div className="flex flex-col border border-gray-200 shadow-md shadow-black rounded-lg p-5 md:w-96 md:mx-auto">
              <div className="flex flex-row justify-between mb-2">
                <p className="text-sm">John Doe</p>
                <p className="text-sm">President</p>
              </div>
              <div className="flex flex-row justify-between mb-2">
                <p className="text-sm">Jane Doe</p>
                <p className="text-sm">Vice President</p>
              </div>
            </div>
          </div>
        ) : active === "all" ? (
          <div className="flex justify-center items-center flex-col h-[50vh]">
            <h2 className="text-xl mb-10 text-center mx-4">All Votes</h2>
            <div className="flex flex-col border border-gray-200 shadow-md shadow-black rounded-lg p-5 md:w-96 md:mx-auto">
              <div className="flex flex-row justify-between mb-2">
                <p className="text-sm">John Doe</p>
                <p className="text-sm">President</p>
              </div>
              <div className="flex flex-row justify-between mb-2">
                <p className="text-sm">Jane Doe</p>
                <p className="text-sm">Vice President</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center flex-col h-[50vh]">
            <h2 className="text-xl mb-10 text-center mx-4">
              Welcome to the Admin Dashboard
            </h2>
            <p className="text-center">
              Kindly select an option from the buttons above
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
