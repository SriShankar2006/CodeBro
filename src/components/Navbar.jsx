// src/components/Navbar.jsx
import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useStore from "../context/useStore";
import { Avatar, NotifBadge } from "./UI";

const NAV_LINKS = [
  { to:"/dashboard",    label:"Dashboard",   icon:"⚡" },
  { to:"/problems",     label:"Problems",    icon:"🧩" },
  { to:"/courses",      label:"Courses",     icon:"📚" },
  { to:"/editor",       label:"Editor",      icon:"💻" },
  { to:"/quiz",         label:"Quiz",        icon:"🎯" },
  { to:"/leaderboard",  label:"Leaderboard", icon:"📊" },
  { to:"/forum",        label:"Forum",       icon:"💬" },
  { to:"/roadmap",      label:"Roadmap",     icon:"🗺️" },
];

export default function Navbar() {
  const location = useLocation();
  const navigate  = useNavigate();
  const { user, userProfile, logout, notifications, darkMode, toggleDarkMode, markAllRead } = useStore();
  const [userMenu,  setUserMenu]  = useState(false);
  const [notifMenu, setNotifMenu] = useState(false);
  const userRef  = useRef();
  const notifRef = useRef();

  const unread = (notifications || []).filter(n => !n.read).length;
  const xp     = userProfile?.xp    || 0;
  const level  = userProfile?.level || 1;
  const streak = userProfile?.streak || 0;

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = e => {
      if (userRef.current  && !userRef.current.contains(e.target))  setUserMenu(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav style={{
      display:"flex", alignItems:"center", gap:0,
      background:"rgba(10,14,26,.95)", backdropFilter:"blur(12px)",
      borderBottom:"1px solid var(--border)", padding:"0 20px",
      height:"var(--nav-height)", position:"sticky", top:0, zIndex:200,
    }}>
      {/* Logo */}
      <Link to="/dashboard" style={{ textDecoration:"none", marginRight:24, flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:30, height:30, borderRadius:8, overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(0,0,0,0.08)" }}>
            <img src="/favicon.svg" alt="CodeBro logo" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
          </div>
          <span style={{ fontSize:16, fontWeight:800, background:"linear-gradient(135deg, var(--accent3), var(--cyan))", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
            CodeBro
          </span>
        </div>
      </Link>

      {/* Nav links */}
      <div style={{ display:"flex", gap:2, flex:1, overflowX:"auto" }}>
        {NAV_LINKS.map(({ to, label, icon }) => {
          const active = location.pathname === to || location.pathname.startsWith(to+"/");
          return (
            <Link key={to} to={to} style={{
              display:"flex", alignItems:"center", gap:5,
              padding:"6px 11px", borderRadius:8, textDecoration:"none",
              fontSize:12, fontWeight:500, whiteSpace:"nowrap", transition:"all .15s",
              color:  active ? "#fff"            : "var(--text2)",
              background: active ? "var(--accent2)" : "transparent",
            }}
              onMouseEnter={e => !active && (e.currentTarget.style.background = "var(--bg3)")}
              onMouseLeave={e => !active && (e.currentTarget.style.background = "transparent")}
            >
              <span style={{ fontSize:13 }}>{icon}</span> {label}
            </Link>
          );
        })}
      </div>

      {/* Right */}
      <div style={{ display:"flex", alignItems:"center", gap:8, marginLeft:"auto", flexShrink:0 }}>
        {/* XP pill */}
        <div style={{ background:"var(--bg3)", border:"1px solid var(--border)", borderRadius:20, padding:"4px 12px", fontSize:11, display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ color:"var(--yellow)", fontWeight:700 }}>Lv.{level}</span>
          <span style={{ color:"var(--text3)" }}>·</span>
          <span style={{ color:"var(--accent3)", fontWeight:700 }}>⚡{xp.toLocaleString()}</span>
        </div>

        {/* Streak */}
        {streak > 0 && (
          <div style={{ fontSize:12, fontWeight:700, color:"var(--orange)", background:"rgba(249,115,22,.12)", border:"1px solid rgba(249,115,22,.25)", borderRadius:20, padding:"4px 10px" }}>
            🔥{streak}
          </div>
        )}

        {/* Dark mode */}
        <button className="btn btn-outline btn-sm btn-icon" onClick={toggleDarkMode} title="Toggle theme" style={{ padding:"6px 10px" }}>
          {darkMode ? "☀️" : "🌙"}
        </button>

        {/* Notifications */}
        <div style={{ position:"relative" }} ref={notifRef}>
          <button className="btn btn-outline btn-sm btn-icon" onClick={() => { setNotifMenu(v => !v); setUserMenu(false); }} style={{ padding:"6px 10px", position:"relative" }}>
            🔔
            <NotifBadge count={unread} />
          </button>
          {notifMenu && (
            <div style={{ position:"absolute", top:40, right:0, width:310, background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:"var(--radius-xl)", boxShadow:"var(--shadow-lg)", zIndex:300 }}>
              <div style={{ padding:"12px 16px", borderBottom:"1px solid var(--border)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontWeight:700, fontSize:13 }}>Notifications</span>
                {unread > 0 && <span style={{ fontSize:11, color:"var(--accent3)", cursor:"pointer" }} onClick={markAllRead}>Mark all read</span>}
              </div>
              {(notifications || []).length === 0 ? (
                <div style={{ padding:"32px", textAlign:"center", color:"var(--text3)", fontSize:12 }}>No notifications yet 🔔</div>
              ) : (notifications || []).slice(0,8).map(n => (
                <div key={n.id} style={{ padding:"11px 16px", borderBottom:"1px solid rgba(42,58,92,.4)", display:"flex", gap:10, background: n.read ? "transparent" : "rgba(99,102,241,.04)" }}>
                  <span style={{ fontSize:16 }}>{n.type==="xp" ? "⚡" : n.type==="badge" ? "🏅" : "🔔"}</span>
                  <div style={{ flex:1, fontSize:11, lineHeight:1.6, color:"var(--text2)" }}>{n.message}</div>
                  {!n.read && <div style={{ width:7, height:7, borderRadius:"50%", background:"var(--accent)", flexShrink:0, marginTop:3 }} />}
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          className="btn btn-danger btn-sm"
          onClick={handleLogout}
          title="Log out"
          style={{ padding:"6px 12px", fontWeight:700 }}
        >
          Logout
        </button>

        {/* User avatar - ALWAYS VISIBLE */}
        <div style={{ position:"relative" }} ref={userRef}>
          <button
            onClick={() => { setUserMenu(v => !v); setNotifMenu(false); }}
            style={{
              cursor:"pointer",
              background:"none",
              border:"none",
              padding:0,
              display:"flex",
              alignItems:"center",
              justifyContent:"center",
              borderRadius:8,
              transition:"all .15s",
            }}
            onMouseEnter={e => e.currentTarget.style.background="var(--bg3)"}
            onMouseLeave={e => e.currentTarget.style.background="none"}
            title="User profile"
          >
            <Avatar name={userProfile?.display_name || user?.displayName || "User"} src={userProfile?.avatar} />
          </button>
          {userMenu && (
            <div style={{ position:"absolute", top:42, right:0, width:210, background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:"var(--radius-xl)", boxShadow:"var(--shadow-lg)", zIndex:300, overflow:"hidden" }}>
              <div style={{ padding:"14px 16px", borderBottom:"1px solid var(--border)", background:"var(--bg3)" }}>
                <div style={{ fontWeight:700, fontSize:13 }}>{userProfile?.display_name || user?.displayName || "User"}</div>
                <div style={{ fontSize:11, color:"var(--text3)", marginTop:2 }}>@{userProfile?.username || "coder"}</div>
              </div>
              {[
                { label:"👤 My Profile",   to:"/profile"     },
                { label:"📤 Submissions",  to:"/submissions" },
                { label:"⚙️ Settings",    to:"/settings"    },
              ].map(({ label, to }) => (
                <Link key={to} to={to} onClick={() => setUserMenu(false)} style={{ display:"block", padding:"10px 16px", fontSize:12, color:"var(--text)", textDecoration:"none", borderBottom:"1px solid rgba(42,58,92,.3)", transition:"background .1s" }}
                  onMouseEnter={e => e.currentTarget.style.background="var(--bg3)"}
                  onMouseLeave={e => e.currentTarget.style.background="transparent"}
                >{label}</Link>
              ))}
              {userProfile?.role === "admin" && (
                <Link to="/admin" onClick={() => setUserMenu(false)} style={{ display:"block", padding:"10px 16px", fontSize:12, color:"var(--purple)", textDecoration:"none", borderBottom:"1px solid rgba(42,58,92,.3)", fontWeight:700 }}>
                  ⚙️ Admin Panel
                </Link>
              )}
              <button onClick={handleLogout} style={{ display:"block", width:"100%", padding:"10px 16px", fontSize:12, color:"var(--red)", textAlign:"left", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", transition:"background .1s" }}
                onMouseEnter={e => e.currentTarget.style.background="rgba(239,68,68,.1)"}
                onMouseLeave={e => e.currentTarget.style.background="transparent"}
              >
                🚪 Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
