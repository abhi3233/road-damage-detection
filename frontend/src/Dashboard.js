import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {

  const [myReports, setMyReports] = useState([]);
  const [publicReports, setPublicReports] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);

  const [view, setView] = useState("my");

  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const username = localStorage.getItem("username");


  const fetchData = async () => {

    try {

      const myRes = await fetch(
        `http://127.0.0.1:8000/myreports/${username}`
      );

      const myData = await myRes.json();


      const publicRes = await fetch(
        "http://127.0.0.1:8000/publicreports"
      );

      const publicData = await fetch(
        "http://127.0.0.1:8000/publicreports"
      );

      const publicJson = await publicData.json();



      const leaderRes = await fetch(
        "http://127.0.0.1:8000/leaderboard"
      );

      const leaderData = await leaderRes.json();



      setMyReports(myData);
      setPublicReports(publicJson);
      setLeaderboard(leaderData);

      setLoading(false);


    } catch(error) {

      console.error(error);

      setLoading(false);

    }

  };



  useEffect(() => {

    fetchData();

  }, []);



  const getImageUrl = (path) => {

    if (!path) {
      return "";
    }


    if (path.startsWith("http")) {
      return path;
    }


    if (path.startsWith("/")) {
      return `http://127.0.0.1:8000${path}`;
    }


    return `http://127.0.0.1:8000/${path}`;

  };



  const totalScore = myReports.reduce(
    (total, report) => total + (report.points || 0),
    0
  );



  const reports =
    view === "my"
      ? myReports
      : publicReports;



  return (

    <div style={{padding:"20px"}}>


      <h1>
        Welcome {username}
      </h1>



      <button onClick={() => navigate("/upload")}>
        Upload Road Damage
      </button>



      <hr />


      <h2>
        🏆 Leaderboard
      </h2>


      {leaderboard.slice(0,3).map((user,index)=>(

        <p key={index}>

          {index===0 && "🥇"}
          {index===1 && "🥈"}
          {index===2 && "🥉"}

          {user.username} -
          {user.score} Points

        </p>

      ))}



      <hr />



      <button onClick={() => setView("my")}>
        My Uploads
      </button>


      <button
        onClick={() => setView("public")}
        style={{marginLeft:"10px"}}
      >
        Public Uploads
      </button>



      <hr />



      {view==="my" && (

        <h2>
          My Total Score: {totalScore}
        </h2>

      )}



      {loading && <p>Loading...</p>}



      {!loading && reports.length===0 && (

        <p>
          No uploads found
        </p>

      )}



      {reports.map((r)=>(

        <div
          key={r.id}
          style={{
            border:"1px solid black",
            margin:"10px",
            padding:"10px"
          }}
        >


          <img
            src={getImageUrl(r.image_path)}
            width="200"
            alt="road damage"
            onError={(e)=>{
              e.target.style.display="none";
              console.log("Image not found:", r.image_path);
            }}
          />



          <p>
            <b>User:</b> {r.username}
          </p>


          <p>
            <b>Damage:</b> {r.damage_type}
          </p>


          <p>
            <b>Confidence:</b> {r.confidence}
          </p>


          <p>
            <b>Latitude:</b> {r.latitude ?? "Not available"}
          </p>


          <p>
            <b>Longitude:</b> {r.longitude ?? "Not available"}
          </p>



          {view==="my" && (

            <p>
              <b>Points:</b> {r.points}
            </p>

          )}



          <p>
            <b>Time:</b> {r.timestamp}
          </p>


        </div>

      ))}



      <button onClick={fetchData}>
        Refresh
      </button>



    </div>

  );

}


export default Dashboard;