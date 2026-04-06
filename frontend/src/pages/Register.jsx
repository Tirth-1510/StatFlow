import React, { useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "customer",
    address: "",
    otp: "", 
  });

  const [isOtpSent, setIsOtpSent] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSendOtp = async () => {
    if (!formData.email) return setError("Please enter your email first");
    
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post("/api/auth/send-otp", { 
        email: formData.email 
      });
      if (res.data.success) {
        setIsOtpSent(true);
        // Alert replaced with smoother UI state handling below
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setLoading(false);
      return setError("Passwords do not match");
    }

    if (!formData.otp) {
      setLoading(false);
      return setError("Please enter the OTP sent to your email");
    }

    try {
      const res = await axios.post("/api/auth/register", formData);
      if (res.data.success) {
        navigate("/login");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-bg-animated overflow-hidden" style={{ overflowY: 'auto' }}>
      <div className="bg-shape shape-1"></div>
      <div className="bg-shape shape-2"></div>
      
      <div className="glass-panel-pro" style={{ maxWidth: '600px', margin: '3rem auto' }}>
        
        <div className="flex-col items-center text-center w-full mb-8">
           <div className="mb-4" style={{ background: 'var(--color-primary-faint)', padding: '1rem', borderRadius: '50%', display: 'inline-flex' }}>
             <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M19 8v6" /><path d="M22 11h-6" />
             </svg>
          </div>
          <h2 className="text-3xl font-black text-main tracking-tight">Create Account</h2>
          <p className="text-muted text-sm mt-2 font-medium">Join StatFlow and power up your metrics.</p>
        </div>

        {error && (
          <div className="p-4 mb-6" style={{ backgroundColor: 'var(--color-danger-faint)', color: 'var(--color-danger)', borderLeft: '4px solid var(--color-danger)', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', fontWeight: '600' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex-col w-full relative z-10">
          
          <div className="flex gap-4">
            <div className="auth-input-group" style={{ flex: 1 }}>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                className="auth-input"
                onChange={handleChange}
                required
              />
            </div>
            <div className="auth-input-group" style={{ flex: 1 }}>
              <select
                name="role"
                value={formData.role}
                className="auth-input"
                onChange={handleChange}
              >
                <option value="customer">Customer Account</option>
                <option value="admin">Admin Account</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 auth-input-group">
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              className="auth-input"
              style={{ flex: 1, marginBottom: 0 }}
              onChange={handleChange}
              disabled={isOtpSent}
              required
            />
            {!isOtpSent && (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading}
                className="btn btn-outline"
                style={{ whiteSpace: 'nowrap', backgroundColor: 'rgba(255,255,255,0.7)', border: '1px solid var(--color-primary-light)' }}
              >
                {loading ? "Wait..." : "Send OTP"}
              </button>
            )}
          </div>

          {isOtpSent && (
            <div className="auth-input-group animate-fade-in">
              <input
                type="text"
                name="otp"
                placeholder="Enter 6-Digit OTP"
                className="auth-input text-center font-black text-xl text-primary mt-2"
                style={{ letterSpacing: '0.6em' }}
                onChange={handleChange}
                maxLength="6"
                required
              />
              <p className="text-xs text-center text-success mt-2 font-bold">OTP sent successfully. Check your logs/email.</p>
            </div>
          )}

          <div className="flex gap-4">
            <div className="auth-input-group" style={{ flex: 1 }}>
              <input
                type="password"
                name="password"
                placeholder="Password"
                className="auth-input"
                onChange={handleChange}
                required
              />
            </div>

            <div className="auth-input-group" style={{ flex: 1 }}>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                className="auth-input"
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="auth-input-group">
            <input
              type="text"
              name="address"
              placeholder="Business Address"
              className="auth-input"
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !isOtpSent}
            className="auth-btn"
          >
            {loading ? "Processing..." : "Complete Registration"}
          </button>
        </form>

        <p className="text-center text-muted text-sm mt-8 relative z-10">
          Already have an account? 
          <span 
            className="text-primary font-bold ml-2 transition-fast" 
            style={{ cursor: 'pointer' }} 
            onClick={() => navigate("/login")}
          >
            Sign in
          </span>
        </p>

      </div>
    </div>
  );
};

export default Register;