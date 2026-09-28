// src/components/StudentLayout.jsx
// Student dashboard shell: top Navbar (XP/streak/notifications/avatar, and
// the mobile nav drawer) + left StudentSidebar (desktop only) + content.
import React from "react";
import Navbar from "./Navbar";
import StudentSidebar from "./StudentSidebar";

export default function StudentLayout({ children }) {
  return (
    <>
      <Navbar showDesktopLinks={false} />
      <div style={{ display: "flex", alignItems: "flex-start" }}>
        <StudentSidebar />
        <main style={{ flex: 1, minWidth: 0, minHeight: "calc(100vh - var(--nav-height))" }}>
          {children}
        </main>
      </div>
    </>
  );
}
