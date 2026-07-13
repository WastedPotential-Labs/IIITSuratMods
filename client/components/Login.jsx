import { useEffect, useState } from "react";
import api from "../src/api";
import { useAuth } from "../context/Auth";
import "./styling/Login.css";
import { useNavigate, Link } from "react-router-dom";
import { BlinkBlur } from "react-loading-indicators";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { user, setUser } = useAuth();
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [needsVerification, setNeedsVerification] = useState(false);

  useEffect(() => {
    const savedProfile = localStorage.getItem("userProfile");
    if (user || savedProfile) {
      nav("/dashboard");
    }
  }, [user, nav]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setNeedsVerification(false);

    try {
      const response = await api.post("/auth/login", {
        email,
        password
      });

      if (response.data?.token && response.data?.user) {
        localStorage.setItem("userToken", response.data.token);
        localStorage.setItem("userProfile", JSON.stringify(response.data.user));
        setUser(response.data.user);
        nav("/dashboard");
      } else {
        setError("Login response was incomplete. Please try again.");
      }
    } catch (err) {
      const backendMessage = err.response?.data?.message;
      const statusText = err.response?.status ? `HTTP ${err.response.status}` : err.code || err.message;
      setError(backendMessage || `Login failed: ${statusText}`);
      setNeedsVerification(Boolean(err.response?.data?.emailVerificationRequired));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="portal-container login-page">
      <div className="portal-header">
        <h1>
          IIIT<span className="gold">Surat</span><span className="teal">Mods</span>
        </h1>
        <p>Login to your college portal</p>
        <div className="accent-bars" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <div className="login-card">
        <form onSubmit={handleLogin}>
          <div className="input-group field--email">
            <label>COLLEGE EMAIL</label>
            <div className="input-wrapper">
              <input
                placeholder="student@iiitsurat.ac.in"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group field--password">
            <div className="label-row">
              <label>PASSWORD</label>
              <Link to="/forgot-password" className="forgot-link">
                Forgot?
              </Link>
            </div>
            <div className="input-wrapper">
              <input
                placeholder="••••••••"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "LOGGING IN..." : "LOGIN"}
          </button>

          {error && <p className="auth-message auth-error">{error}</p>}
          {error && error.includes("No account found") && (
            <div className="signup-text">
              <Link to="/signup">Create this account</Link>
            </div>
          )}
          {needsVerification && (
            <div className="signup-text">
              <Link to={`/verify-email?email=${encodeURIComponent(email)}`}>Verify email now</Link>
            </div>
          )}
          {loading && (
            <div id="loading-anim">
              <BlinkBlur color="#C6E86B" size="medium" text="" textColor="" />
            </div>
          )}
        </form>

        <div className="signup-text">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </div>
      </div>
    </div>
  );
}
