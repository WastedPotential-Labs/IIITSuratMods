import './App.css'
import { Route, Routes, NavLink, useNavigate } from 'react-router-dom'
import Admin from '../components/Admin'
import Login from '../components/Login'
import Profile from '../components/Profile'
import TimeTable from '../components/TimeTable'
import Home from '../components/Home'
import DashBoard from '../components/DashBoard'
import { useState } from 'react'
import { useAuth } from '../context/Auth'
import SignUp from '../components/SignUp'
import VerifyEmail from '../components/VerifyEmail'
import ForgotPassword from '../components/ForgotPassword'
import Venues from '../components/Venues'
import Notifications from '../components/Notifications'
import Academics from '../components/Academics'

function App() {
  const { user, setUser } = useAuth();
  const nav = useNavigate();
  const [navBar, setNavBar] = useState(false);

  function handleLogout() {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userProfile");
    setUser(null);
    setNavBar(false);
    nav('/login');
  }

  return (
    <>
      <div className={`webpage ${navBar ? 'nav-open' : ''}`}>
        <aside className={`navbar ${navBar ? 'open' : ''}`}>
          <div id="head">
            <h1>IIIT<span className="gold">Surat</span><span className="teal">Mods</span></h1>
            <div className="nav-accent-bars" aria-hidden="true">
              <span></span><span></span><span></span><span></span><span></span>
            </div>
          </div>
          <ul onClick={() => setNavBar(false)}>
            {!user && <li><NavLink to="/login">Login</NavLink></li>}
            <li><NavLink to="/dashboard">Dashboard</NavLink></li>
            <li><NavLink to="/timetable">Timetable</NavLink></li>
            <li><NavLink to="/venues">Venues</NavLink></li>
            <li><NavLink to="/academics">Academics</NavLink></li>
            <li><NavLink to="/profile">Profile</NavLink></li>
            {user?.role === "admin" && <li><NavLink to="/admin">Admin</NavLink></li>}
            {user && (
              <li>
                <button className="logout-btn" onClick={handleLogout}>LOGOUT</button>
              </li>
            )}
          </ul>

          {user && (
            <div className="action-box">
              <button className="logout-btn" onClick={handleLogout}>
                 Logout
              </button>
            </div>
          )}
        </aside>
        {navBar && <button className="nav-backdrop" type="button" aria-label="Close menu" onClick={() => setNavBar(false)} />}
        <main className="main-content">
          <Notifications />
          <button
            className={`menu-toggle-btn ${navBar ? 'active' : ''}`}
            onClick={() => setNavBar(!navBar)}
            aria-label={navBar ? 'Close menu' : 'Open menu'}
            aria-expanded={navBar}
          >
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            {navBar ? '✕' : '≡'}
          </button>
          <Routes>
            <Route path='/admin' element={<Admin />} />
            <Route path='/profile' element={<Profile />} />
            <Route path='/login' element={<Login />} />
            <Route path='/timetable' element={<TimeTable year={"2025-26"} />} />
            <Route path='/venues' element={<Venues />} />
            <Route path='/academics' element={<Academics />} />
            <Route path='/dashboard' element={<DashBoard />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path='*' element={<Home />} />
          </Routes>
        </main>
      </div>
    </>
  )
}

export default App