import { useState } from "react";
import api from "../src/api";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/Auth";
import "./styling/Login.css";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [otp, setOtp] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const verifyEmail = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await api.post("/auth/verify-email", { email, otp });
      localStorage.setItem("userToken", response.data.token);
      localStorage.setItem("userProfile", JSON.stringify(response.data.user));
      setUser(response.data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Could not verify the code. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await api.post("/auth/verify-email/resend", { email });
      setMessage(response.data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Could not resend the code.");
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
        <p>Verify your college email</p>
        <div className="accent-bars" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <div className="login-card">
        <form onSubmit={verifyEmail}>
          <div className="input-group field--email">
            <label>COLLEGE EMAIL</label>
            <div className="input-wrapper">
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="student@college.edu"
                required
              />
            </div>
          </div>

          <div className="input-group field--code">
            <label>6-DIGIT CODE</label>
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

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "VERIFYING..." : "VERIFY EMAIL"}
          </button>
        </form>

        <button type="button" className="text-button" onClick={resendCode} disabled={loading || !email}>
          Resend code
        </button>
        {message && <p className="auth-message auth-success">{message}</p>}
        {error && <p className="auth-message auth-error">{error}</p>}

        <div className="signup-text">
          <Link to="/login">Back to login</Link>
        </div>
      </div>
    </div>
  );
}
