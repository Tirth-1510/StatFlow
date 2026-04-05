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
    otp: "", // New OTP field
  });

  const [isOtpSent, setIsOtpSent] = useState(false); // Track if OTP was sent
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- STEP 1: REQUEST OTP ---
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
        alert("OTP sent to your email!");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // --- STEP 2: VERIFY & REGISTER ---
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
        alert("Registration Successful! Please Login.");
        navigate("/login");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen relative" style={{ padding: '2rem 0' }}>
      <div className="absolute w-full h-full" style={{ background: 'linear-gradient(135deg, var(--color-primary-faint) 0%, var(--color-primary-light) 100%)', zIndex: -1, top: 0, left: 0 }}></div>
      <div className="card flex overflow-hidden" style={{ width: '90%', maxWidth: '1000px', minHeight: '700px', height: 'auto', boxShadow: 'var(--shadow-glass)' }}>
        
        {/* LEFT SIDE ILLUSTRATION */}
        <div className="flex-col items-center justify-center p-8" style={{ flex: 1, backgroundColor: 'var(--color-surface)', display: 'flex', borderRight: '1px solid var(--color-border)' }}>
          <img src="/login-illustration.png" alt="Register" style={{ width: '90%' }} />
        </div>

        {/* RIGHT SIDE FORM */}
        <div className="flex-col p-8" style={{ flex: 1, display: 'flex', backgroundColor: '#ffffff', overflowY: 'auto' }}>
          <div style={{ maxWidth: '420px', width: '100%', margin: 'auto' }}>
            <h2 className="text-3xl font-black text-primary mb-2">Join StatFlow</h2>
            <p className="text-muted text-sm mb-6 font-medium">Create your account to get started.</p>

            {error && (
              <div className="p-4 mb-4" style={{ backgroundColor: 'var(--color-danger-faint)', color: 'var(--color-danger)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-danger-light)', fontSize: '0.875rem', fontWeight: '500', textAlign: 'center' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex-col gap-4">
              <div className="input-group mb-2">
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  className="input-field"
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Email Row with Send OTP Button */}
              <div className="flex gap-2" style={{ marginBottom: '0.5rem' }}>
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  className="input-field"
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
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    {loading ? "..." : "Send OTP"}
                  </button>
                )}
              </div>

              {/* OTP Field (Only shows after sending OTP) */}
              {isOtpSent && (
                <div className="input-group mb-2">
                  <input
                    type="text"
                    name="otp"
                    placeholder="Enter 6-Digit OTP"
                    className="input-field text-center font-bold text-xl text-primary"
                    style={{ letterSpacing: '0.5em', borderColor: 'var(--color-primary)' }}
                    onChange={handleChange}
                    maxLength="6"
                    required
                  />
                </div>
              )}

              <div className="input-group mb-2">
                <select
                  name="role"
                  value={formData.role}
                  className="input-field"
                  onChange={handleChange}
                >
                  <option value="customer">Customer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="input-group mb-2">
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  className="input-field"
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-group mb-2">
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  className="input-field"
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="input-group mb-4">
                <textarea
                  name="address"
                  placeholder="Full Address"
                  rows="2"
                  className="input-field"
                  style={{ resize: 'none' }}
                  onChange={handleChange}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || !isOtpSent}
                className="btn btn-primary w-full"
                style={{ padding: '1rem', fontSize: '1.125rem' }}
              >
                {loading ? "Processing..." : "Create Account"}
              </button>
            </form>

            <p className="text-center text-muted text-sm mt-8">
              Already have an account? 
              <span className="text-primary font-bold ml-2" style={{ cursor: 'pointer' }} onClick={() => navigate("/login")}>
                Login here
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;