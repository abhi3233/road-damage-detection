import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./css/Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const loginUser = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    try {
      const response = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("username", data.username);

        alert(`Welcome ${data.username}!`);
        navigate("/dashboard");
      } else {
        alert(data.detail || "Invalid email or password");
      }
    } catch (error) {
      console.error(error);
      alert("Cannot connect to the backend.");
    }
  };

  return (
    <div className="loginPage">
      <div className="loginMain">
        <h1 className="loginTitle">
          Road Damage Detection System
        </h1>

        <form className="loginForm" onSubmit={loginUser}>
          <input
            className="loginInput"
            type="email"
            placeholder="Enter Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="loginInput"
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="buttonContainer">
            <button className="loginBtn" type="submit">
              Login
            </button>

            <button
              className="registerBtn"
              type="button"
              onClick={() => navigate("/register")}
            >
              Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;