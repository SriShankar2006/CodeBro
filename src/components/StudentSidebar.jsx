// src/components/StudentSidebar.jsx
// Left sidebar navigation for the Student dashboard shell.
// Desktop: fixed 220px column. Mobile/tablet (<900px): hidden — Navbar's
// hamburger drawer (already lists every page) remains the mobile nav so we
// don't ship two competing mobile navs.
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useStore from "../context/useStore";

const SECTIONS = [
  {
    label: "Learn",
    links: [
      { to: "/dashboard",     label: "Dashboard",         icon: "⚡" },
      { to: "/courses",       label: "My Courses",        icon: "📚" },
      { to: "/courses",       label: "Continue Learning", icon: "▶️",  query: "?tab=continue" },
      { to: "/problems",      label: "Challenges",        icon: "🧩" },
    ],
  },
  {
    label: "AI",
    links: [
      { to: "/ai-roadmap",    label: "AI Roadmap",        icon: "✨" },
      { to: "/ai-assistant",  label: "AI Tutor",          icon: "🤖" },
    ],
  },
  {
    label: "Progress",
    links: [
      { to: "/certificates",  label: "Certificates",      icon: "🏆" },
      { to: "/leaderboard",   label: "Leaderboard",       icon: "📊" },
      { to: "/calendar",      label: "Calendar",          icon: "📅" },
      { to: "/notes",         label: "Notes",             icon: "📝" },
      { to: "/bookmarks",     label: "Bookmarks",         icon: "🔖" },
    ],
  },
  {
    label: "Account",
    links: [
      { to: "/profile",       label: "Profile",           icon: "👤" },
      { to: "/settings",      label: "Settings",          icon: "⚙️" },
    ],
  },
];

export default function StudentSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useStore();

  const isActive = (to) =>
    location.pathname === to || (to !== "/dashboard" && location.pathname.startsWith(to + "/"));

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .student-sidebar { display: none !important; }
        }
      `}</style>
      <aside
        className="student-sidebar"
        style={{
          width: 220,
          flexShrink: 0,
          borderRight: "1px solid var(--border)",
          background: "var(--glass-bg)",
          backdropFilter: "var(--glass-blur-sm)",
          WebkitBackdropFilter: "var(--glass-blur-sm)",
          padding: "18px 12px",
          position: "sticky",
          top: "var(--nav-height)",
          height: "calc(100vh - var(--nav-height))",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        {SECTIONS.map((section) => (
          <div key={section.label}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: ".08em",
                textTransform: "uppercase",
                color: "var(--text3)",
                padding: "0 10px",
                marginBottom: 6,
              }}
            >
              {section.label}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {section.links.map(({ to, label, icon, query }) => {
                const active = isActive(to) && !query;
                return (
                  <Link
                    key={label}
                    to={query ? `${to}${query}` : to}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 10px",
                      borderRadius: 9,
                      textDecoration: "none",
                      fontSize: 13,
                      fontWeight: active ? 700 : 500,
                      color: active ? "#fff" : "var(--text2)",
                      background: active
                        ? "linear-gradient(135deg, var(--accent2), var(--accent))"
                        : "transparent",
                      boxShadow: active ? "0 6px 18px rgba(99,102,241,.22)" : "none",
                      transition: "all .15s",
                    }}
                    onMouseEnter={(e) => !active && (e.currentTarget.style.background = "var(--nav-hover)")}
                    onMouseLeave={(e) => !active && (e.currentTarget.style.background = "transparent")}
                  >
                    <span style={{ fontSize: 14, width: 18, textAlign: "center" }}>{icon}</span>
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        <div style={{ marginTop: "auto", paddingTop: 10, borderTop: "1px solid var(--border)" }}>
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              width: "100%",
              alignItems: "center",
              gap: 10,
              padding: "8px 10px",
              borderRadius: 9,
              fontSize: 13,
              fontWeight: 600,
              color: "var(--red)",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,.1)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <span style={{ fontSize: 14, width: 18, textAlign: "center" }}>🚪</span> Log out
          </button>
        </div>
      </aside>
    </>
  );
}
