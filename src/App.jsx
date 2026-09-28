// src/App.jsx — Production-ready, all routes, theme sync, no duplicate nav-height padding
import React, { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import useStore from "./context/useStore";
import Navbar from "./components/Navbar";
import { LoadingScreen } from "./components/UI";
import { ADMIN_EMAIL } from "./services/firebase";
import "./styles/globals.css";

const AuthPage = lazy(() => import("./pages/AuthPage"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Problems = lazy(() => import("./pages/Problems"));
const Editor = lazy(() => import("./pages/Editor"));
const Courses = lazy(() => import("./pages/Courses").then((module) => ({ default: module.default })));
const CourseDetail = lazy(() => import("./pages/Courses").then((module) => ({ default: module.CourseDetail })));
const Quiz = lazy(() => import("./pages/Quiz"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const Forum = lazy(() => import("./pages/Forum"));
const Profile = lazy(() => import("./pages/Profile"));
const Roadmap = lazy(() => import("./pages/Roadmap").then((module) => ({ default: module.Roadmap })));
const Submissions = lazy(() => import("./pages/Roadmap").then((module) => ({ default: module.Submissions })));
const Settings = lazy(() => import("./pages/Roadmap").then((module) => ({ default: module.Settings })));
const AIAssistant = lazy(() => import("./pages/AIAssistant"));
const AIRoadmap = lazy(() => import("./pages/AIRoadmap"));
const Admin = lazy(() => import("./pages/Admin"));
const Certificates = lazy(() => import("./pages/Certificates"));

/* ── Route Guards ──────────────────────────────────────────── */  
function ProtectedRoute({ children }) {
  const { user, loading } = useStore();
  if (loading) return <LoadingScreen />;
  if (!user)   return <Navigate to="/login" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { user, userProfile, loading } = useStore();
  if (loading) return <LoadingScreen />;
  if (!user)   return <Navigate to="/login" replace />;
  if (userProfile?.role !== "admin" || user?.email?.toLowerCase() !== ADMIN_EMAIL) return <Navigate to="/dashboard" replace />;
  return children;
}

/* ── Theme sync ────────────────────────────────────────────── */
function ThemeSync() {
  const { darkMode } = useStore();
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
    document.documentElement.style.colorScheme = darkMode ? "dark" : "light";
  }, [darkMode]);
  return null;
}

/* ── Layout ─────────────────────────────────────────────────── */
function Layout({ children }) {
  return (
    <>
      <Navbar />
      {/* Navbar is sticky, so NO extra paddingTop needed */}
      <main style={{ minHeight: "calc(100vh - var(--nav-height))" }}>
        {children}
      </main>
    </>
  );
}

/* ── App Init ───────────────────────────────────────────────── */
function AppInit({ children }) {
  const { initAuth, loadAdminContent, startAdminContentSync, loading, contentLoading } = useStore();
  useEffect(() => {
    const unsub = initAuth();
    const stopAdminContentSync = startAdminContentSync();
    loadAdminContent();
    return () => {
      if (typeof unsub === "function") unsub();
      stopAdminContentSync();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  if (loading || contentLoading) return <LoadingScreen />;
  return children;
}

/* ── Root ──────────────────────────────────────────────────── */
export default function App() {
  return (
    <BrowserRouter>
      <AppInit>
        <ThemeSync />
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: "var(--bg2)",
              color: "var(--text)",
              border: "1px solid var(--border)",
              fontSize: 13,
              borderRadius: 10,
              boxShadow: "var(--shadow-lg)",
            },
            success: { iconTheme: { primary: "var(--green)", secondary: "#fff" } },
            error:   { iconTheme: { primary: "var(--red)",   secondary: "#fff" } },
          }}
        />
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
          {/* ── Public ──────────────────────────────────── */}
          <Route path="/login"    element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />
          <Route path="/"         element={<Navigate to="/dashboard" replace />} />

          {/* ── Protected ───────────────────────────────── */}
          <Route path="/dashboard"      element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
          <Route path="/problems"       element={<ProtectedRoute><Layout><Problems /></Layout></ProtectedRoute>} />
          <Route path="/editor"         element={<ProtectedRoute><Layout><Editor /></Layout></ProtectedRoute>} />
          <Route path="/editor/:id"     element={<ProtectedRoute><Layout><Editor /></Layout></ProtectedRoute>} />
          <Route path="/courses"        element={<ProtectedRoute><Layout><Courses /></Layout></ProtectedRoute>} />
          <Route path="/courses/:courseId" element={<ProtectedRoute><Layout><CourseDetail /></Layout></ProtectedRoute>} />
          <Route path="/quiz"           element={<ProtectedRoute><Layout><Quiz /></Layout></ProtectedRoute>} />
          <Route path="/leaderboard"    element={<ProtectedRoute><Layout><Leaderboard /></Layout></ProtectedRoute>} />
          <Route path="/forum"          element={<ProtectedRoute><Layout><Forum /></Layout></ProtectedRoute>} />
          <Route path="/profile"        element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
          <Route path="/roadmap"        element={<ProtectedRoute><Layout><Roadmap /></Layout></ProtectedRoute>} />
          <Route path="/ai-assistant"   element={<ProtectedRoute><Layout><AIAssistant /></Layout></ProtectedRoute>} />
          <Route path="/ai-roadmap"     element={<ProtectedRoute><Layout><AIRoadmap /></Layout></ProtectedRoute>} />
          <Route path="/certificates"   element={<ProtectedRoute><Layout><Certificates /></Layout></ProtectedRoute>} />
          <Route path="/submissions"    element={<ProtectedRoute><Layout><Submissions /></Layout></ProtectedRoute>} />
          <Route path="/settings"       element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />

          {/* ── Admin ───────────────────────────────────── */}
          <Route path="/admin"          element={<AdminRoute><Layout><Admin /></Layout></AdminRoute>} />

          {/* ── Catch-all ───────────────────────────────── */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </AppInit>
    </BrowserRouter>
  );
}
