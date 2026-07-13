import { useState } from "react";
import { useNavigate } from "react-router-dom";

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

        // Go to Dashboard after login
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
    <div style={{ padding: "30px" }}>
      <h2>Road Damage Detection System</h2>

      <form onSubmit={loginUser}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <br />
        <br />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <br />
        <br />

        <button type="submit">
          Login
        </button>

        <button
          type="button"
          onClick={() => navigate("/register")}
          style={{ marginLeft: "10px" }}
        >
          Register
        </button>
      </form>
    </div>
  );
}

export default Login;