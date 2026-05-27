// src/App.jsx
import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import useStore from "./context/useStore";
import Navbar from "./components/Navbar";
import { LoadingScreen } from "./components/UI";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import Problems from "./pages/Problems";
import Editor from "./pages/Editor";
import Courses, { CourseDetail } from "./pages/Courses";
import Quiz from "./pages/Quiz";
import Leaderboard from "./pages/Leaderboard";
import Forum from "./pages/Forum";
import Profile from "./pages/Profile";
import { Roadmap, Submissions, Settings } from "./pages/Roadmap";
import Admin from "./pages/Admin";
import "./styles/globals.css";

function ProtectedRoute({ children }) {
  const { user, loading } = useStore();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { user, userProfile, loading } = useStore();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (userProfile?.role !== "admin") return <Navigate to="/dashboard" replace />;
  return children;
}

function Layout({ children }) {
  const { darkMode } = useStore();
  useEffect(() => {
    document.documentElement.style.colorScheme = darkMode ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
  }, [darkMode]);
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

function AppInit({ children }) {
  const { initAuth, loading } = useStore();
  useEffect(() => {
    const unsub = initAuth();
    return () => unsub?.();
  }, []);
  if (loading) return <LoadingScreen />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInit>
        <Toaster position="bottom-right" toastOptions={{
          style: { background:"var(--bg2)", color:"var(--text)", border:"1px solid var(--border)", fontSize:12 },
          success: { iconTheme: { primary:"var(--green)", secondary:"#fff" } },
          error:   { iconTheme: { primary:"var(--red)",   secondary:"#fff" } },
        }} />
        <Routes>
          <Route path="/login"    element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
          <Route path="/problems"  element={<ProtectedRoute><Layout><Problems /></Layout></ProtectedRoute>} />
          <Route path="/editor"    element={<ProtectedRoute><Layout><Editor /></Layout></ProtectedRoute>} />
          <Route path="/editor/:id" element={<ProtectedRoute><Layout><Editor /></Layout></ProtectedRoute>} />
          <Route path="/courses"   element={<ProtectedRoute><Layout><Courses /></Layout></ProtectedRoute>} />
          <Route path="/courses/:courseId" element={<ProtectedRoute><Layout><CourseDetail /></Layout></ProtectedRoute>} />
          <Route path="/quiz"      element={<ProtectedRoute><Layout><Quiz /></Layout></ProtectedRoute>} />
          <Route path="/leaderboard" element={<ProtectedRoute><Layout><Leaderboard /></Layout></ProtectedRoute>} />
          <Route path="/forum"     element={<ProtectedRoute><Layout><Forum /></Layout></ProtectedRoute>} />
          <Route path="/profile"   element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
          <Route path="/roadmap"   element={<ProtectedRoute><Layout><Roadmap /></Layout></ProtectedRoute>} />
          <Route path="/submissions" element={<ProtectedRoute><Layout><Submissions /></Layout></ProtectedRoute>} />
          <Route path="/settings"  element={<ProtectedRoute><Layout><Settings /></Layout></ProtectedRoute>} />
          <Route path="/admin"     element={<AdminRoute><Layout><Admin /></Layout></AdminRoute>} />
          <Route path="*"          element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AppInit>
    </BrowserRouter>
  );
}
