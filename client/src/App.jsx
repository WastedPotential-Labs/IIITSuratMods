import './App.css'
import { Route, Routes, NavLink, useNavigate } from 'react-router-dom'
import Admin from '../components/Admin'
import Login from '../components/Login'
import Profile from '../components/Profile'
import TimeTable from '../components/TimeTable'
import Home from '../components/Home'
import DashBoard from '../components/DashBoard'
import CourseCard from '../components/CourseCard'
import Material from '../components/Material'
import { useState } from 'react'
import { useAuth } from '../context/Auth'
import SignUp from '../components/SignUp'
import VerifyEmail from '../components/VerifyEmail'
import ForgotPassword from '../components/ForgotPassword'

const navItems = [
  { to: '/profile', label: 'Profile', icon: '👤', authOnly: false },
  { to: '/dashboard', label: 'Dashboard', icon: '📊', authOnly: false },
  { to: '/timetable', label: 'Timetable', icon: '🗓️', authOnly: false },
  { to: '/coursecard', label: 'Course Card', icon: '📘', authOnly: false },
  { to: '/material', label: 'Materials', icon: '📂', authOnly: false },
  { to: '/admin', label: 'Admin', icon: '⚙️', authOnly: false },
]

function App() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [navBar, setNavBar] = useState(false);

  function handleLogout(){
    localStorage.removeItem("userToken");
    localStorage.removeItem("userProfile");
    window.location.reload();
    nav('./login');
  }

  return (
    <>
      <div className="webpage">
        <aside className={`navbar ${navBar ? 'open' : ''}`}>
          <div id="head">
            <div className="logo-badge">IS</div>
            <h1>IIITSuratMods</h1>
          </div>

          {user && (
            <div className="user-chip">
              <div className="user-avatar">{(user.username || 'U')[0].toUpperCase()}</div>
              <div className="user-meta">
                <span className="user-name">{user.username || 'Student'}</span>
                <span className="user-sub">Signed in</span>
              </div>
            </div>
          )}

          <ul onClick={() => setNavBar(false)}>
            {user === null && (
              <li>
                <NavLink to="/login" className="nav-link">
                  <span className="nav-icon">🔑</span> Login
                </NavLink>
              </li>
            )}
            {navItems.map(item => (
              <li key={item.to}>
                <NavLink to={item.to} className="nav-link">
                  <span className="nav-icon">{item.icon}</span> {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {user && (
            <div className="action-box">
              <button className="logout-btn" onClick={handleLogout}>
                 Logout
              </button>
            </div>
          )}
        </aside>

        <main className="main-content">
          <button
            className={`menu-toggle-btn ${navBar ? 'active' : ''}`}
            onClick={() => setNavBar(!navBar)}
          >
            {navBar ? '✕' : '☰'}
          </button>
          <Routes>
            <Route path='/admin' element={<Admin />} />
            <Route path='/profile' element={<Profile />} />
            <Route path='/login' element={<Login />} />
            <Route path='/timetable' element={<TimeTable year={"2025-26"} semester={"2nd"} section={"Cse 2"} />} />
            <Route path='/dashboard' element={<DashBoard />} />
            <Route path='/material' element={<Material />} />
            <Route path='/coursecard' element={<CourseCard />} />
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