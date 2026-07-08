import React, { useEffect, useState } from "react";

function Dashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = () => {
    fetch("http://127.0.0.1:8000/reports")
      .then(res => res.json())
      .then(data => {
        console.log("API Data:", data); // 🔥 DEBUG

        if (Array.isArray(data)) {
          setReports(data);
        } else if (Array.isArray(data.reports)) {
          setReports(data.reports);
        } else {
          console.error("Unexpected format:", data);
          setReports([]);
        }

        setLoading(false);
      })
      .catch(err => {
        console.error("Fetch error:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div>
      <h2>Reports Dashboard</h2>

      {/* 🔄 Loading state */}
      {loading && <p>Loading reports...</p>}

      {/* ❌ No data */}
      {!loading && reports.length === 0 && (
        <p>No reports found. Upload an image first.</p>
      )}

      {/* ✅ Display reports */}
      {!loading &&
        reports.length > 0 &&
        reports.map((r) => (
          <div
            key={r.id}
            style={{
              border: "1px solid black",
              margin: "10px",
              padding: "10px"
            }}
          >
            {/* 🖼️ Image */}
            <img
              src={`http://127.0.0.1:8000/${r.image_path}`}
              width="200"
              alt="Report"
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/200";
              }}
            />

            {/* 📊 Data */}
            <p><b>Damage:</b> {r.damage_type}</p>
            <p><b>Confidence:</b> {r.confidence}</p>
            <p><b>Location:</b> {r.latitude}, {r.longitude}</p>
            <p><b>Time:</b> {r.timestamp}</p>
          </div>
        ))}

      {/* 🔄 Manual refresh button */}
      <button onClick={fetchReports}>Refresh Dashboard</button>
      <button onClick={() => setReports([])}>Clear Dashboard</button>
    </div>
  );
}

export default Dashboard;