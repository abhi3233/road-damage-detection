import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./pages/css/Dashboard.css";

function Dashboard() {
  const [myReports, setMyReports] = useState([]);
  const [publicReports, setPublicReports] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [view, setView] = useState("my");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const username = localStorage.getItem("username");

  const fetchData = async () => {
    setLoading(true);

    try {
      // ---------------- My Reports ----------------
      const myRes = await fetch(
        `http://127.0.0.1:8000/myreports/${username}`
      );

      const myData = await myRes.json();

      console.log("========== MY REPORTS ==========");
      console.log(myData);

      // ---------------- Public Reports ----------------
      const publicRes = await fetch(
        "http://127.0.0.1:8000/publicreports"
      );

      const publicData = await publicRes.json();

      console.log("========== PUBLIC REPORTS ==========");
      console.log(publicData);

      // ---------------- Leaderboard ----------------
      const leaderRes = await fetch(
        "http://127.0.0.1:8000/leaderboard"
      );

      const leaderData = await leaderRes.json();

      console.log("========== LEADERBOARD ==========");
      console.log(leaderData);

      setMyReports(myData);
      setPublicReports(publicData);
      setLeaderboard(leaderData);

    } catch (error) {

      console.error("Dashboard Error:", error);

    } finally {

      setLoading(false);

    }
  };

  useEffect(() => {

    fetchData();

  }, []);

  const getImageUrl = (path) => {

    if (!path) return "";

    if (path.startsWith("http")) return path;

    if (path.startsWith("/"))
      return `http://127.0.0.1:8000${path}`;

    return `http://127.0.0.1:8000/${path}`;
  };

  const reports =
    view === "my"
      ? myReports
      : publicReports;

  const totalScore = myReports.reduce(
    (sum, report) => sum + Number(report.points || 0),
    0
  );

  console.log("Total Score =", totalScore);

  return (
    <div className="dashboard">

      {/* Header */}

      <header className="dashboardHeader">

        <div>

          <h1>Road Damage Detection System</h1>

          <p>
            Welcome,
            <strong> {username}</strong>
          </p>

        </div>

        <div className="headerButtons">

          <button
            className="uploadButton"
            onClick={() => navigate("/upload")}
          >
            Upload Image
          </button>

          <button
            className="refreshButton"
            onClick={fetchData}
          >
            Refresh
          </button>

        </div>

      </header>

      {/* Leaderboard */}

      <section className="leaderboardSection">

        <h2>🏆 Top Contributors</h2>

        <div className="leaderboardCards">

          {leaderboard.slice(0, 3).map((user, index) => (

            <div
              className="leaderCard"
              key={index}
            >

              <div className="leaderRank">

                {index === 0 && "🥇"}
                {index === 1 && "🥈"}
                {index === 2 && "🥉"}

              </div>

              <h3>{user.username}</h3>

              <p>{user.score} Points</p>

            </div>

          ))}

        </div>

      </section>

      {/* Toolbar */}

      <section className="toolbar">

        <div className="tabButtons">

          <button
            className={view === "my" ? "activeTab" : ""}
            onClick={() => setView("my")}
          >
            My Reports
          </button>

          <button
            className={view === "public" ? "activeTab" : ""}
            onClick={() => setView("public")}
          >
            Public Reports
          </button>

        </div>

        {view === "my" && (

          <div className="scoreCard">

            <span>Total Score</span>

            <h2>{totalScore}</h2>

          </div>

        )}

      </section>

      {/* Loading */}

      {loading && (

        <div className="loading">

          Loading reports...

        </div>

      )}

      {!loading && reports.length === 0 && (

        <div className="loading">

          No reports available.

        </div>

      )}

      {/* Reports */}

      <section className="reportGrid">

        {reports.map((r) => (

          <div
            className="reportCard"
            key={r.id}
          >

            <img
              className="reportImage"
              src={getImageUrl(r.image_path)}
              alt="Road Damage"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />

            <div className="reportBody">

              <h3>{r.damage_type}</h3>

              <p>

                <strong>User:</strong> {r.username}

              </p>

              <p>

                <strong>Confidence:</strong>{" "}

                {r.confidence
                  ? (Number(r.confidence) * 100).toFixed(1)
                  : 0}%

              </p>

              <p>

                <strong>Latitude:</strong>{" "}

                {r.latitude ?? "--"}

              </p>

              <p>

                <strong>Longitude:</strong>{" "}

                {r.longitude ?? "--"}

              </p>

              {view === "my" && (

                <p>

                  <strong>Points:</strong> {r.points}

                </p>

              )}

              <p>

                <strong>Reported:</strong>{" "}

                {r.timestamp
                  ? new Date(r.timestamp).toLocaleString()
                  : "--"}

              </p>

            </div>

          </div>

        ))}

      </section>

    </div>
  );
}

export default Dashboard;