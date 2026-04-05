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
      const res = await axios.post(
        "/api/auth/login",
        { email, password }
      );

      if (res.data.success) {
        await login(res.data.user, res.data.token);
        res.data.user.role === "admin"
          ? navigate("/admin-dashboard")
          : navigate("/customer-dashboard");
      } else {
        // Use the specific message from the server if success is false but status is 200
        setError(res.data.message || "Invalid credentials");
      }
    } catch (err) {
      // Use the specific message from the server for 404 or 401 errors
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen relative">
      <div className="absolute w-full h-full" style={{ background: 'linear-gradient(135deg, var(--color-primary-faint) 0%, var(--color-primary-light) 100%)', zIndex: -1 }}></div>
      <div className="card flex overflow-hidden" style={{ width: '90%', maxWidth: '1000px', height: '550px', boxShadow: 'var(--shadow-glass)' }}>
        
        {/* LEFT SIDE */}
        <div className="flex-col items-center justify-center" style={{ flex: 1, backgroundColor: 'var(--color-surface)', display: 'flex', borderRight: '1px solid var(--color-border)' }}>
          <img
            src="/login-illustration.png"
            alt="Dashboard Illustration"
            style={{ width: '80%' }}
          />
        </div>

        {/* RIGHT SIDE */}
        <div className="flex-col justify-center p-8" style={{ flex: 1, display: 'flex', backgroundColor: '#ffffff' }}>
          <div style={{ maxWidth: '400px', width: '100%', margin: '0 auto' }}>
            <h2 className="text-3xl font-black text-primary mb-2">
              StatFlow
            </h2>
            <p className="text-muted text-sm mb-8 font-medium">
              Your financial stats are always in a flow.
            </p>

            {error && (
              <div className="p-4 mb-6" style={{ backgroundColor: 'var(--color-danger-faint)', color: 'var(--color-danger)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-danger-light)', fontSize: '0.875rem', fontWeight: '500' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex-col gap-4">
              <div className="input-group">
                <label className="input-label">Email</label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label className="input-label">Password</label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full mt-4"
                style={{ padding: '1rem', fontSize: '1rem' }}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <p className="text-center text-muted text-sm mt-8">
              Don’t have an account?
              <span 
                className="text-primary font-bold ml-2"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate("/register")}
              >
                Sign up here
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;