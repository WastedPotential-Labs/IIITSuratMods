//all the code+comments written are cross verified with the documentation ; if u have any suggestions for improvement please let me know :)



import { useState } from "react";
import api from "../src/api";//http requests to backend
import { Link, useNavigate } from "react-router-dom";
import "./styling/Login.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [codeRequested, setCodeRequested] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const requestCode = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await api.post("/auth/forgot-password", { email });
      setCodeRequested(true);
      setMessage(response.data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Could not send a reset code.");
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/reset-password", { email, otp, password });
      setMessage(response.data.message);
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Could not reset the password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="portal-container">
      <div className="portal-header">
        <h1>
          IIIT<span className="gold">Surat</span><span className="teal">Mods</span>
        </h1>
        <p>Reset your password</p>
        <div className="accent-bars" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <div className="login-card">
        <form onSubmit={codeRequested ? changePassword : requestCode}>
          <div className="input-group field--email">
            <label>COLLEGE EMAIL</label>
            <div className="input-wrapper">
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="student@college.edu"
                required
                disabled={codeRequested}
              />
            </div>
          </div>

          {codeRequested && (
            <>
              <div className="input-group field--code">
                <label>6-DIGIT RESET CODE</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength="6"
                    value={otp}
                    onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))}
                    placeholder="123456"
                    required
                  />
                </div>
              </div>

              <div className="input-group field--password">
                <label>NEW PASSWORD</label>
                <div className="input-wrapper">
                  <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength="8" required />
                </div>
              </div>

              <div className="input-group field--password">
                <label>CONFIRM NEW PASSWORD</label>
                <div className="input-wrapper">
                  <input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength="8" required />
                </div>
              </div>
            </>
          )}

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "PLEASE WAIT..." : codeRequested ? "RESET PASSWORD" : "SEND RESET CODE"}
          </button>
        </form>

        {codeRequested && <button type="button" className="text-button" onClick={requestCode} disabled={loading}>Resend code</button>}
        {message && <p className="auth-message auth-success">{message}</p>}
        {error && <p className="auth-message auth-error">{error}</p>}

        <div className="signup-text"><Link to="/login">Back to login</Link></div>
      </div>
    </div>
  );
}
