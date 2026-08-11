import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserPlus, ArrowLeft, Activity } from "lucide-react";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const registerUser = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("username", username);
    formData.append("email", email);
    formData.append("password", password);

    const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        alert("Registration successful! You can now login.");
        navigate("/");
      } else {
        if (Array.isArray(data.detail)) {
          alert("Error: " + data.detail.map(e => e.msg).join(", "));
        } else {
          alert(data.detail || "Registration failed");
        }
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
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', marginBottom: '24px' }}>
              <Activity size={32} />
            </div>
            <h2 style={{ fontSize: '32px', marginBottom: '8px' }}>
              Create Account
            </h2>
            <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
              Join Road Damage Scanner today
            </p>
          </div>

          <form onSubmit={registerUser}>
            <div className="form-group delay-100 animate-fade-up">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="input-field"
                placeholder="johndoe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="form-group delay-200 animate-fade-up">
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

            <div className="form-group delay-300 animate-fade-up" style={{ marginBottom: '40px' }}>
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
              <button type="submit" className="btn btn-primary btn-full" style={{ padding: '16px', fontSize: '18px', marginBottom: '24px', background: 'linear-gradient(135deg, var(--emerald-primary), #059669)', boxShadow: '0 8px 20px rgba(16, 185, 129, 0.3)' }}>
                <UserPlus size={20} /> Sign Up
              </button>

              <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                Already have an account?{' '}
                <span 
                  onClick={() => navigate("/")}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: '600', marginLeft: '4px', cursor: 'pointer', color: 'var(--accent-primary)' }}
                >
                  <ArrowLeft size={14} /> Back to login
                </span>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default Register;