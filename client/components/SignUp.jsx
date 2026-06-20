//all the code+comments written are cross verified with the documentation ; if u have any suggestions for improvement please let me know :)


import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/Auth";
import "./styling/Login.css";
import { useNavigate, Link } from "react-router-dom";
import {BlinkBlur}  from 'react-loading-indicators';
export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [batch, setBatch] = useState("CSE 1"); 
  const [semester, setSemester] = useState("Semester 1"); 

  const { user, setUser } = useAuth();
  const nav = useNavigate();
  const [loading,setLoading] = useState(false);
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Express register expects this exact shape in the request body.
      // Full route: POST http://localhost:5000/api/auth/register
      const newUserPayload = {
        name,
        email,
        batch,
        semester,
        password
      };

      const response = await axios.post("http://localhost:5000/api/auth/register", newUserPayload);
      
      if (response.status === 201) {
        alert("Account SuccessFully Created");
        nav("/Login");
      }
    } catch (err) {
      alert(err + "SignUp Failed");
    }
    setLoading(false)
  };

  return (
    <div className="portal-container">
      <div className="portal-header">
        <h1>IIITSuratMods</h1>
        <p>IIIT Surat Portal</p>
      </div>

      <div className="login-card">
        <form onSubmit={handleSignup}>
          
          <div className="input-group">
            <label>NAME</label>
            <div className="input-wrapper">
              <span className="input-icon">👤</span>
              <input 
                placeholder="Your Full Name" 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="input-group">
            <label>EMAIL</label>
            <div className="input-wrapper">
              <span className="input-icon">📧</span>
              <input 
                placeholder="College Email" 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="input-group">
            <label>BATCH</label>
            <div className="input-wrapper">
              <select 
                value={batch} 
                onChange={(e) => setBatch(e.target.value)}
                className="select-input" 
                required
              >
                <option value="CSE 1">CSE 1</option>
                <option value="CSE 2">CSE 2</option>
                <option value="MNC">MNC</option>
                <option value="ECE">ECE</option>
              </select>
            </div>
          </div>

          <div className="input-group">
            <label>SEMESTER</label>
            <div className="input-wrapper">
              <select 
                value={semester} 
                onChange={(e) => setSemester(e.target.value)}
                className="select-input"
                required
              >
                <option value="Semester 1">Semester 1</option>
                <option value="Semester 2">Semester 2</option>
                <option value="Semester 3">Semester 3</option>
                <option value="Semester 4">Semester 4</option>
                <option value="Semester 5">Semester 5</option>
                <option value="Semester 6">Semester 6</option>
                <option value="Semester 7">Semester 7</option>
                <option value="Semester 8">Semester 8</option>
              </select>
            </div>
          </div>

          <div className="input-group">
            <label>SET PASSWORD</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input 
                placeholder="••••••••" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>
          </div>

          <button type="submit" className="login-btn">SignUp</button>
          {loading && 
          <div id="loading-anim">
            <BlinkBlur color="#0ea5e9" size="medium" text="" textColor="" />
          </div>}
        </form>

        <div className="signup-text">
          Have an account? <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  );
}
