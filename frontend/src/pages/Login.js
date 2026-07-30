import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, ArrowRight, Activity } from "lucide-react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const loginUser = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("username", data.username);

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
    <>
      <div className="app-background"></div>
      <div className="centered-page animate-fade-up">
        <div className="glass-card hover-lift" style={{ width: '100%', maxWidth: '440px', padding: '48px 40px' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(59, 130, 246, 0.1)', color: 'var(--accent-primary)', marginBottom: '24px' }}>
              <Activity size={32} />
            </div>
            <h2 style={{ fontSize: '32px', marginBottom: '8px' }}>
              Welcome Back
            </h2>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
              Sign in to Road Damage Scanner
            </p>
          </div>

          <form onSubmit={loginUser}>
            <div className="form-group delay-100 animate-fade-up">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="input-field"
                placeholder="hello@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group delay-200 animate-fade-up" style={{ marginBottom: '40px' }}>
              <label className="form-label">Password</label>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="delay-300 animate-fade-up">
              <button type="submit" className="btn btn-primary btn-full" style={{ padding: '16px', fontSize: '18px', marginBottom: '24px' }}>
                <LogIn size={20} /> Sign In
              </button>

              <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                Don't have an account?{' '}
                <span 
                  onClick={() => navigate("/register")}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '600', marginLeft: '4px', cursor: 'pointer', color: 'var(--accent-primary)' }}
                >
                  Create one <ArrowRight size={14} />
                </span>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default Login;