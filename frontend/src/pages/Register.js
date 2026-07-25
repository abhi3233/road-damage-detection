import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./css/Register.css";

function Register() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const registerUser = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("username", username);
    formData.append("email", email);
    formData.append("password", password);

    try {
      const response = await fetch("http://127.0.0.1:8000/register", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        alert("Registration successful! Please login.");
        navigate("/");
      } else {
        alert(data.detail || "Registration failed");
      }
    } catch (error) {
      console.error(error);
      alert("Cannot connect to the backend.");
    }
  };

  return (
    <div className="registerPage">

      <div className="registerMain">

        <h1 className="registerTitle">
          Road Damage Detection System
        </h1>

        <h2 className="registerSubtitle">
          Create Account
        </h2>

        <form className="registerForm" onSubmit={registerUser}>

          <input
            className="registerInput"
            type="text"
            placeholder="Enter Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />

          <input
            className="registerInput"
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="registerInput"
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="registerButtonContainer">

            <button
              className="registerBtn"
              type="submit"
            >
              Register
            </button>

            <button
              className="backBtn"
              type="button"
              onClick={() => navigate("/")}
            >
              Back to Login
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default Register;