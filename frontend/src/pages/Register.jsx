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
    <div className="auth-bg-animated" style={{ minHeight: '100vh', padding: '2rem 0' }}>
      <div className="bg-shape shape-1"></div>
      <div className="bg-shape shape-2"></div>
      
      {/* HYBRID SPLIT-SCREEN GLASS PANEL */}
      <div className="glass-panel-pro flex flex-row overflow-hidden" style={{ maxWidth: '1000px', minHeight: '700px', height: 'auto', padding: 0, margin: '0 auto', alignSelf: 'center' }}>
        
        {/* LEFT SIDE ILLUSTRATION */}
        <div style={{ flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid rgba(255,255,255,0.5)' }}>
          <img src="/login-illustration.png" alt="Register" style={{ width: '85%', filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.1))' }} />
        </div>

        {/* RIGHT SIDE FORM */}
        <div className="flex-col justify-center" style={{ flex: 1, padding: '3rem', overflow: 'hidden' }}>
          <div className="w-full relative z-10" style={{ maxWidth: '420px', margin: '0 auto' }}>
            
            <div className="mb-2" style={{ background: 'var(--color-primary-faint)', padding: '0.75rem', borderRadius: '50%', display: 'inline-flex' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M19 8v6" /><path d="M22 11h-6" />
              </svg>
            </div>
            <h2 className="text-3xl font-black text-main tracking-tight">Join StatFlow</h2>
            <p className="text-muted text-sm mt-1 mb-6 font-medium">Create your account to get started.</p>

            {error && (
              <div className="p-4 mb-6" style={{ backgroundColor: 'var(--color-danger-faint)', color: 'var(--color-danger)', borderLeft: '4px solid var(--color-danger)', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', fontWeight: '600' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex-col w-full">
              
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
                style={{ marginTop: '0.5rem' }}
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
      </div>
    </div>
  );
};

export default Register;