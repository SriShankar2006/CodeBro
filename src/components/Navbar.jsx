// src/components/Navbar.jsx
import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useStore from "../context/useStore";
import { Avatar, NotifBadge } from "./UI";
import { ADMIN_EMAIL } from "../services/firebase";

const NAV_LINKS = [
  { to:"/dashboard",    label:"Dashboard",   icon:"⚡" },
  { to:"/problems",     label:"Problems",    icon:"🧩" },
  { to:"/courses",      label:"Courses",     icon:"📚" },
  { to:"/editor",       label:"Editor",      icon:"💻" },
  { to:"/quiz",         label:"Quiz",        icon:"🎯" },
  { to:"/leaderboard",  label:"Leaderboard", icon:"📊" },
  { to:"/forum",        label:"Forum",       icon:"💬" },
  { to:"/roadmap",      label:"Roadmap",     icon:"🗺️" },
  { to:"/ai-assistant", label:"AI Chat",     icon:"🤖" },
  { to:"/ai-roadmap",   label:"AI Roadmap",  icon:"✨" },
  { to:"/certificates", label:"Certificates", icon:"🏆" },
];

// showDesktopLinks=false is used when this Navbar is paired with a role
// sidebar (e.g. StudentLayout) so navigation isn't duplicated on desktop.
// The mobile hamburger drawer still shows the full link list regardless,
// since sidebars are desktop-only.
export default function Navbar({ showDesktopLinks = true }) {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { user, userProfile, logout, notifications, darkMode, toggleDarkMode, markAllRead } = useStore();
  const [userMenu,   setUserMenu]   = useState(false);
  const [notifMenu,  setNotifMenu]  = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const userRef  = useRef();
  const notifRef = useRef();

  const unread = (notifications || []).filter(n => !n.read).length;
  const xp     = userProfile?.xp    || 0;
  const level  = userProfile?.level || 1;
  const streak = userProfile?.streak || 0;

  useEffect(() => {
    const handler = e => {
      if (userRef.current  && !userRef.current.contains(e.target))  setUserMenu(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const handleLogout = async () => {
    setUserMenu(false);
    await logout();
    navigate("/login");
  };

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .nav-links-desktop { display: none !important; }
          .nav-xp-pill       { display: none !important; }
          .nav-streak        { display: none !important; }
          .nav-hamburger     { display: flex !important; }
        }
        @media (min-width: 769px) {
          .nav-hamburger { display: none !important; }
          .nav-mobile-drawer { display: none !important; }
        }
      `}</style>

      <nav style={{
        display:"flex", alignItems:"center", gap:0,
        background:"var(--nav-bg)", backdropFilter:"blur(14px)", WebkitBackdropFilter:"blur(14px)",
        borderBottom:"1px solid var(--border)", padding:"0 16px",
        height:"var(--nav-height)", position:"sticky", top:0, zIndex:200,
        boxShadow:"0 1px 0 rgba(255,255,255,.04), 0 8px 24px rgba(15,23,42,.08)",
      }}>
        {/* Logo */}
        <Link to="/dashboard" style={{ textDecoration:"none", marginRight:16, flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:7 }}>
            <div style={{ width:30, height:30, borderRadius:8, overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 0 0 1px var(--border)" }}>
              <img src="/favicon.svg" alt="CodeBro" style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e=>e.target.style.display="none"} />
            </div>
            <span style={{ fontSize:15, fontWeight:800, color:"var(--nav-fg)", letterSpacing:0 }}>
              CodeBro
            </span>
          </div>
        </Link>

        {/* Desktop nav links — hidden when a role sidebar (e.g. StudentLayout) already provides navigation */}
        {showDesktopLinks ? (
          <div className="nav-links-desktop" style={{ display:"flex", gap:1, flex:1, overflowX:"auto", scrollbarWidth:"none" }}>
            {NAV_LINKS.map(({ to, label, icon }) => {
              const active = location.pathname === to || (to !== "/dashboard" && location.pathname.startsWith(to+"/"));
              return (
                <Link key={to} to={to} style={{
                  display:"flex", alignItems:"center", gap:4,
                  padding:"5px 9px", borderRadius:7, textDecoration:"none",
                  fontSize:11, fontWeight:500, whiteSpace:"nowrap", transition:"all .15s",
                  color:  active ? "#fff" : "var(--nav-muted)",
                  background: active ? "linear-gradient(135deg, var(--accent2), var(--accent))" : "transparent",
                  boxShadow: active ? "0 6px 18px rgba(99,102,241,.22)" : "none",
                }}
                  onMouseEnter={e => !active && (e.currentTarget.style.background = "var(--nav-hover)")}
                  onMouseLeave={e => !active && (e.currentTarget.style.background = "transparent")}
                >
                  <span style={{ fontSize:12 }}>{icon}</span> {label}
                </Link>
              );
            })}
          </div>
        ) : (
          <div style={{ flex:1 }} />
        )}

        {/* Right side */}
        <div style={{ display:"flex", alignItems:"center", gap:6, marginLeft:"auto", flexShrink:0 }}>
          {/* XP pill */}
          <div className="nav-xp-pill" style={{ background:"var(--nav-hover)", border:"1px solid var(--border)", borderRadius:20, padding:"3px 10px", fontSize:11, display:"flex", alignItems:"center", gap:5 }}>
            <span style={{ color:"var(--yellow)", fontWeight:700 }}>Lv.{level}</span>
            <span style={{ color:"var(--text3)" }}>·</span>
            <span style={{ color:"var(--accent3)", fontWeight:700 }}>⚡{xp.toLocaleString()}</span>
          </div>

          {/* Streak */}
          {streak > 0 && (
            <div className="nav-streak" style={{ fontSize:11, fontWeight:700, color:"var(--orange)", background:"rgba(249,115,22,.12)", border:"1px solid rgba(249,115,22,.25)", borderRadius:20, padding:"3px 8px" }}>
              🔥{streak}
            </div>
          )}

          {/* Dark mode */}
          <button className="btn btn-secondary btn-sm btn-icon" onClick={toggleDarkMode} title="Toggle theme" style={{ padding:"5px 9px" }}>
            {darkMode ? "☀️" : "🌙"}
          </button>

          {/* Notifications */}
          <div style={{ position:"relative" }} ref={notifRef}>
            <button className="btn btn-secondary btn-sm btn-icon" onClick={() => { setNotifMenu(v => !v); setUserMenu(false); }} style={{ padding:"5px 9px", position:"relative" }}>
              🔔
              <NotifBadge count={unread} />
            </button>
            {notifMenu && (
              <div style={{ position:"absolute", top:40, right:0, width:300, background:"var(--nav-card)", border:"1px solid var(--border)", borderRadius:"var(--radius-xl)", boxShadow:"var(--shadow-lg)", zIndex:300 }}>
                <div style={{ padding:"11px 14px", borderBottom:"1px solid var(--border)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontWeight:700, fontSize:13 }}>Notifications</span>
                  {unread > 0 && <span style={{ fontSize:11, color:"var(--accent3)", cursor:"pointer" }} onClick={markAllRead}>Mark all read</span>}
                </div>
                {(notifications || []).length === 0 ? (
                  <div style={{ padding:"28px", textAlign:"center", color:"var(--text3)", fontSize:12 }}>No notifications yet 🔔</div>
                ) : (notifications || []).slice(0,8).map(n => (
                  <div key={n.id} style={{ padding:"10px 14px", borderBottom:"1px solid var(--border-subtle)", display:"flex", gap:9, background: n.read ? "transparent" : "var(--surface-hover)" }}>
                    <span style={{ fontSize:15 }}>{n.type==="xp" ? "⚡" : n.type==="badge" ? "🏅" : n.type==="certificate" ? "🏆" : "🔔"}</span>
                    <div style={{ flex:1, fontSize:11, lineHeight:1.6, color:"var(--text2)" }}>{n.message}</div>
                    {!n.read && <div style={{ width:6, height:6, borderRadius:"50%", background:"var(--accent)", flexShrink:0, marginTop:4 }} />}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* User avatar */}
          <div style={{ position:"relative" }} ref={userRef}>
            <button onClick={() => { setUserMenu(v => !v); setNotifMenu(false); }}
              style={{ cursor:"pointer", background:"none", border:"none", padding:0, display:"flex", alignItems:"center", justifyContent:"center", borderRadius:8 }}>
              <Avatar name={userProfile?.display_name || user?.displayName || "User"} src={userProfile?.avatar} />
            </button>
            {userMenu && (
              <div style={{ position:"absolute", top:42, right:0, width:210, background:"var(--nav-card)", border:"1px solid var(--border)", borderRadius:"var(--radius-xl)", boxShadow:"var(--shadow-lg)", zIndex:300, overflow:"hidden" }}>
                <div style={{ padding:"12px 14px", borderBottom:"1px solid var(--border)", background:"var(--nav-hover)" }}>
                  <div style={{ fontWeight:700, fontSize:13 }}>{userProfile?.display_name || user?.displayName || "User"}</div>
                  <div style={{ fontSize:11, color:"var(--text3)", marginTop:1 }}>@{userProfile?.username || "coder"} · Lv.{level}</div>
                </div>
                {[
                  { label:"👤 My Profile",    to:"/profile"      },
                  { label:"📤 Submissions",   to:"/submissions"  },
                  { label:"⚙️ Settings",      to:"/settings"     },
                ].map(({ label, to }) => (
                  <Link key={to} to={to} onClick={() => setUserMenu(false)} style={{ display:"block", padding:"9px 14px", fontSize:12, color:"var(--text)", textDecoration:"none", borderBottom:"1px solid var(--border-subtle)", transition:"background .1s" }}
                    onMouseEnter={e => e.currentTarget.style.background="var(--nav-hover)"}
                    onMouseLeave={e => e.currentTarget.style.background="transparent"}
                  >{label}</Link>
                ))}
                {(userProfile?.role === "admin" || user?.email?.toLowerCase() === ADMIN_EMAIL) && (
                  <Link to="/admin" onClick={() => setUserMenu(false)} style={{ display:"block", padding:"9px 14px", fontSize:12, color:"var(--purple)", textDecoration:"none", borderBottom:"1px solid var(--border-subtle)", fontWeight:700 }}>
                    ⚙️ Admin Panel
                  </Link>
                )}
                <button onClick={handleLogout} style={{ display:"block", width:"100%", padding:"9px 14px", fontSize:12, color:"var(--red)", textAlign:"left", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit" }}
                  onMouseEnter={e => e.currentTarget.style.background="rgba(239,68,68,.1)"}
                  onMouseLeave={e => e.currentTarget.style.background="transparent"}
                >
                  🚪 Log out
                </button>
              </div>
            )}
          </div>

          {/* Hamburger (mobile only) */}
          <button className="nav-hamburger btn btn-secondary btn-sm btn-icon" onClick={() => setMobileOpen(v => !v)} style={{ display:"none", padding:"5px 9px" }}>
            {mobileOpen ? "✕" : "☰"}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="nav-mobile-drawer" style={{
          position:"fixed", top:"var(--nav-height)", left:0, right:0, bottom:0,
          background:"var(--nav-card)", zIndex:190, overflowY:"auto",
          borderTop:"1px solid var(--border)",
        }}>
          {/* User info */}
          <div style={{ padding:"16px", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", gap:12 }}>
            <Avatar name={userProfile?.display_name || "User"} src={userProfile?.avatar} size="lg" />
            <div>
              <div style={{ fontWeight:700 }}>{userProfile?.display_name || "User"}</div>
              <div style={{ fontSize:11, color:"var(--text3)" }}>@{userProfile?.username || "coder"} · Lv.{level} · ⚡{xp.toLocaleString()} XP{streak > 0 ? ` · 🔥${streak}` : ""}</div>
            </div>
          </div>

          {/* All nav links */}
          <div style={{ padding:"10px" }}>
            {NAV_LINKS.map(({ to, label, icon }) => {
              const active = location.pathname === to || (to !== "/dashboard" && location.pathname.startsWith(to+"/"));
              return (
                <Link key={to} to={to} style={{
                  display:"flex", alignItems:"center", gap:12,
                  padding:"12px 14px", borderRadius:10, textDecoration:"none",
                  fontSize:14, fontWeight: active ? 700 : 500,
                  color:  active ? "#fff" : "var(--nav-muted)",
                  background: active ? "linear-gradient(135deg, var(--accent2), var(--accent))" : "transparent",
                  marginBottom:3,
                }}>
                  <span style={{ fontSize:18, width:26 }}>{icon}</span> {label}
                </Link>
              );
            })}
            <div style={{ height:1, background:"var(--border)", margin:"10px 0" }} />
            {[
              { label:"👤 Profile",      to:"/profile"      },
              { label:"📤 Submissions",  to:"/submissions"  },
              { label:"⚙️ Settings",    to:"/settings"     },
            ].map(({ label, to }) => (
              <Link key={to} to={to} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px", borderRadius:10, textDecoration:"none", fontSize:14, color:"var(--nav-muted)", marginBottom:3 }}>
                {label}
              </Link>
            ))}
            {(userProfile?.role === "admin" || user?.email?.toLowerCase() === ADMIN_EMAIL) && (
              <Link to="/admin" style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px", borderRadius:10, textDecoration:"none", fontSize:14, color:"var(--purple)", fontWeight:700, marginBottom:3 }}>
                ⚙️ Admin Panel
              </Link>
            )}
            <button onClick={handleLogout} style={{ display:"flex", width:"100%", alignItems:"center", gap:12, padding:"12px 14px", borderRadius:10, fontSize:14, color:"var(--red)", background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", marginBottom:3 }}>
              🚪 Log out
            </button>
          </div>
        </div>
      )}
    </>
  );
}
