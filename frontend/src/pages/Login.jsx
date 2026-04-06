import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await axios.post("/api/auth/login", { email, password });
      if (res.data.success) {
        await login(res.data.user, res.data.token);
        res.data.user.role === "admin"
          ? navigate("/admin-dashboard")
          : navigate("/customer-dashboard");
      } else {
        setError(res.data.message || "Invalid credentials");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg-animated overflow-hidden">
      {/* Background Floating Orbs */}
      <div className="bg-shape shape-1"></div>
      <div className="bg-shape shape-2"></div>

      <div className="glass-panel-pro">
        <div className="flex-col items-center text-center w-full mb-8">
          <div className="mb-4" style={{ background: 'var(--color-primary-faint)', padding: '1rem', borderRadius: '50%', display: 'inline-flex' }}>
             <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v18h18" /><path d="M18 17V9" /><path d="M13 17V5" /><path d="M8 17v-3" />
             </svg>
          </div>
          <h2 className="text-3xl font-black text-main tracking-tight">Welcome Back</h2>
          <p className="text-muted text-sm mt-2 font-medium">Log into StatFlow to continue.</p>
        </div>

        {error && (
          <div className="p-4 mb-6" style={{ backgroundColor: 'var(--color-danger-faint)', color: 'var(--color-danger)', borderLeft: '4px solid var(--color-danger)', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', fontWeight: '600' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex-col w-full relative z-10">
          <div className="auth-input-group">
            <input
              type="email"
              className="auth-input"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-input-group">
            <input
              type="password"
              className="auth-input"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="auth-btn"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-muted text-sm mt-8 relative z-10">
          Don't have an account?
          <span 
            className="text-primary font-bold ml-2 transition-fast"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate("/register")}
          >
            Create one now
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;