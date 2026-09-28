// src/pages/Admin.jsx — Premium glassmorphism admin dashboard
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { getAdminUserDashboard, updateUserRole, suspendUser, updateAdminUser, uploadCourseImage } from "../services/supabase";
import { Card, TabBar, Button, SectionHeader, BarChart, Modal, Input, ProgressBar } from "../components/UI";
import { PROBLEMS, PROBLEM_DETAILS } from "../data/problems";
import { COURSES } from "../data/courses";
import {
  getAdminCourseOverrides,
  getAdminProblemOverrides,
  getAllCourses,
  getAllProblems,
  getAllQuizQuestions,
  getHiddenCourseIds,
  getHiddenProblemIds,
  saveAdminCourseOverrides,
  saveAdminProblemOverrides,
  saveAdminQuizOverrides,
  saveHiddenCourseIds,
  saveHiddenProblemIds,
} from "../utils/adminContent";
import { saveAdminContent } from "../services/supabase";
import { ADMIN_EMAIL } from "../services/firebase";
import useStore from "../context/useStore";

// ── Admin Setup Modal ──
function AdminSetupModal({ isOpen, onClose }) {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div className="modal-box" style={{ maxWidth: 680 }}
        initial={{ opacity:0, scale:.92 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:.92 }}
        onClick={e => e.stopPropagation()}>
        <div style={{ textAlign:"center", paddingBottom:20 }}>
          <div style={{ fontSize:48, marginBottom:16 }}>🔐</div>
          <h2 style={{ marginBottom:8 }}>Admin Dashboard Setup</h2>
          <p style={{ color:"var(--text3)", marginBottom:24, fontSize:12 }}>Follow these steps to set up your admin account</p>

          <div className="card" style={{ padding:24, marginBottom:20, textAlign:"left" }}>
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:12, fontWeight:700, color:"var(--accent3)", marginBottom:12 }}>STEP 1: CREATE ADMIN IN FIREBASE</div>
              <ol style={{ fontSize:11, color:"var(--text2)", marginLeft:16, lineHeight:1.9 }}>
                <li>Go to <strong>Firebase Console</strong> → Your Project → Authentication</li>
                <li>Click <strong>Add User</strong> → Email: <code style={{ color:"var(--yellow)" }}>{ADMIN_EMAIL}</code></li>
                <li>Choose a strong private password, then click <strong>Save</strong></li>
              </ol>
            </div>
            <div style={{ borderTop:"1px solid var(--border)", paddingTop:20 }}>
              <div style={{ fontSize:12, fontWeight:700, color:"var(--green)", marginBottom:12 }}>STEP 2: SET ADMIN ROLE IN SUPABASE</div>
              <p style={{ fontSize:11, color:"var(--text2)", marginBottom:8 }}>Run this in Supabase SQL Editor:</p>
              <div style={{ background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:8, padding:10, fontFamily:"monospace", fontSize:11, overflowX:"auto" }}>
                <code style={{ color:"var(--cyan)" }}>UPDATE users SET role = 'admin' WHERE email = '{ADMIN_EMAIL}';</code>
              </div>
            </div>
          </div>

          <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
            <Button variant="outline" size="sm" onClick={() => window.open("https://console.firebase.google.com/", "_blank")}>📱 Firebase Console</Button>
            <Button variant="outline" size="sm" onClick={() => window.open("https://supabase.com/dashboard", "_blank")}>🗄️ Supabase Dashboard</Button>
            <Button variant="primary" size="sm" onClick={() => { toast.success("Reloading..."); setTimeout(() => window.location.reload(), 1200); }}>✓ Done — Reload</Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ── Animated Stat Card ──
function AdminStat({ icon, label, value, color, delta, delay = 0 }) {
  return (
    <motion.div
      className="stat-card stat-glow glass-card-glow"
      initial={{ opacity:0, y:20 }}
      animate={{ opacity:1, y:0 }}
      transition={{ delay, duration:.4, ease:"easeOut" }}
    >
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
        <span style={{ fontSize:22 }}>{icon}</span>
        <span className="stat-label">{label}</span>
      </div>
      <div className="stat-value" style={{ color }}>{value}</div>
      {delta && <div style={{ fontSize:10, color:"var(--text3)", marginTop:4 }}>{delta}</div>}
    </motion.div>
  );
}

function AdminSearchBar({ value, onChange, onSearch, placeholder }) {
  const submit = event => {
    event.preventDefault();
    onSearch();
  };

  return (
    <form onSubmit={submit} style={{ display:"flex", gap:8, alignItems:"center", flex:1, minWidth:240 }}>
      <input
        type="search"
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        style={{ flex:1, minWidth:180 }}
      />
      <Button type="submit" variant="secondary" size="sm">🔍 Search</Button>
    </form>
  );
}

export default function Admin() {
  const { user, userProfile, contentRevision, progressRevision } = useStore();
  const isAdmin = userProfile?.role === "admin";
  const [showSetup, setShowSetup] = useState(false);

  const [tab, setTab] = useState("Overview");
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [userSearch, setUserSearch] = useState("");
  const [appliedUserSearch, setAppliedUserSearch] = useState("");
  const [problemSearch, setProblemSearch] = useState("");
  const [appliedProblemSearch, setAppliedProblemSearch] = useState("");
  const [courseSearch, setCourseSearch] = useState("");
  const [appliedCourseSearch, setAppliedCourseSearch] = useState("");
  const [quizSearch, setQuizSearch] = useState("");
  const [appliedQuizSearch, setAppliedQuizSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedUser, setSelectedUser] = useState(null);
  const [userEditModal, setUserEditModal] = useState(false);
  const [userForm, setUserForm] = useState({ display_name:"", username:"", bio:"", location:"", xp:0, level:1, coins:0, streak:0 });
  const [localProblems, setLocalProblems] = useState(() => getAdminProblemOverrides());
  const [localCourses, setLocalCourses] = useState(() => getAdminCourseOverrides());
  const [hiddenProblems, setHiddenProblems] = useState(() => getHiddenProblemIds());
  const [hiddenCourses, setHiddenCourses] = useState(() => getHiddenCourseIds());
  const [problemModal, setProblemModal] = useState(false);
  const [courseModal, setCourseModal] = useState(false);
  const [quizModal, setQuizModal] = useState(false);
  const [editingProblemId, setEditingProblemId] = useState(null);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [editingQuizId, setEditingQuizId] = useState(null);
  const [problemForm, setProblemForm] = useState({ title:"", difficulty:"Easy", topics:"", acceptance:70, xp:30, companies:"", statement:"", examples:"", constraints:"", hints:"", testCases:"", starterPython:"" });
  const [courseForm, setCourseForm] = useState({ title:"", description:"", level:"Beginner", estimatedHours:8, totalLessons:1, tags:"", icon:"📚", youtube_url:"", thumbnail:"" });
  const [courseImageUploading, setCourseImageUploading] = useState(false);
  const [quizForm, setQuizForm] = useState({ topic:"Data Structures", question:"", options:"", answer:0, explanation:"", difficulty:"Easy" });

  const loadUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const data = await getAdminUserDashboard(await user.getIdToken(), 500);
      setUsers(data);
    } catch (err) {
      console.error("Failed to load users:", err);
      setUsers([]);
      toast.error("Failed to load users");
    }
    setUsersLoading(false);
  }, [user]);

  useEffect(() => { loadUsers(); }, [loadUsers, progressRevision]);
  useEffect(() => { if (isAdmin) setShowSetup(false); }, [isAdmin]);
  useEffect(() => {
    setLocalProblems(getAdminProblemOverrides());
    setLocalCourses(getAdminCourseOverrides());
    setHiddenProblems(getHiddenProblemIds());
    setHiddenCourses(getHiddenCourseIds());
  }, [contentRevision]);

  const problems = getAllProblems();
  const courses = getAllCourses();
  const quizzes = getAllQuizQuestions();
  const quizRows = Object.entries(quizzes).flatMap(([topic, questions]) => questions.map(question => ({ ...question, topic })));

  const filteredProblems = problems.filter(problem => {
    const q = appliedProblemSearch.trim().toLowerCase();
    return !q || [problem.title, problem.difficulty, ...(problem.topics || []), ...(problem.companies || [])]
      .some(value => String(value || "").toLowerCase().includes(q));
  });
  const filteredCourses = courses.filter(course => {
    const q = appliedCourseSearch.trim().toLowerCase();
    return !q || [course.title, course.description, course.level, ...(course.tags || [])]
      .some(value => String(value || "").toLowerCase().includes(q));
  });
  const filteredQuizRows = quizRows.filter(quiz => {
    const q = appliedQuizSearch.trim().toLowerCase();
    return !q || [quiz.topic, quiz.question, quiz.difficulty, ...(quiz.options || [])]
      .some(value => String(value || "").toLowerCase().includes(q));
  });

  // Filtered users
  const filteredUsers = users.filter(u => {
    const q = appliedUserSearch.trim().toLowerCase();
    const matchSearch = !q || [u.display_name, u.username, u.email, u.uid].some(v => String(v || "").toLowerCase().includes(q));
    const matchRole = roleFilter === "All Roles" || (u.role || "student") === roleFilter.toLowerCase();
    const matchStatus = statusFilter === "All" || (statusFilter === "Active" ? !u.suspended : u.suspended);
    return matchSearch && matchRole && matchStatus;
  });

  const activeToday = users.filter(u => {
    const last = u.admin_progress?.latestActivity || u.last_login_date;
    return last && new Date(last).toDateString() === new Date().toDateString();
  }).length;

  // ── Persist helpers ──
  const persistContent = async (key, content) => saveAdminContent(key, content, await user.getIdToken());
  const persistProblems = async p => { await persistContent("problems", p); setLocalProblems(p); saveAdminProblemOverrides(p); };
  const persistCourses = async c => { await persistContent("courses", c); setLocalCourses(c); saveAdminCourseOverrides(c); };
  const persistQuizzes = async q => { await persistContent("quizzes", q); saveAdminQuizOverrides(q); };
  const persistHiddenProblems = async ids => { await persistContent("hiddenProblems", ids); setHiddenProblems(ids); saveHiddenProblemIds(ids); };
  const persistHiddenCourses = async ids => { await persistContent("hiddenCourses", ids); setHiddenCourses(ids); saveHiddenCourseIds(ids); };

  // ── Problem CRUD ──
  const openProblemForm = problem => {
    setEditingProblemId(problem?.id || null);
    const details = problem ? (problem.statement ? problem : (PROBLEM_DETAILS?.[problem.id] || problem)) : {};
    setProblemForm(problem ? {
      title:problem.title, difficulty:problem.difficulty,
      topics:(problem.topics || []).join(", "), acceptance:problem.acceptance,
      xp:problem.xp, companies:(problem.companies || []).join(", "),
      statement:details.statement || "",
      examples:(details.examples || []).map(example => `${example.input} => ${example.output}${example.explanation ? ` => ${example.explanation}` : ""}`).join("\n"),
      constraints:(details.constraints || []).join("\n"), hints:(details.hints || []).join("\n"),
      testCases:(details.testCases || []).map(test => `${test.input.replace(/\n/g, "\\n")} => ${test.expected}`).join("\n"),
      starterPython:details.starterCode?.["Python 3"] || "",
    } : { title:"", difficulty:"Easy", topics:"", acceptance:70, xp:30, companies:"", statement:"", examples:"", constraints:"", hints:"", testCases:"", starterPython:"" });
    setProblemModal(true);
  };
  const saveProblem = async () => {
    if (!problemForm.title.trim()) { toast.error("Title required"); return; }
    const payload = {
      id: editingProblemId || (Math.max(...problems.map(p => p.id), 0) + 1),
      title: problemForm.title.trim(),
      difficulty: problemForm.difficulty,
      topics: problemForm.topics.split(",").map(t => t.trim()).filter(Boolean),
      acceptance: Number(problemForm.acceptance) || 70,
      xp: Number(problemForm.xp) || 30,
      companies: problemForm.companies.split(",").map(c => c.trim()).filter(Boolean),
      statement: problemForm.statement.trim(),
      examples: problemForm.examples.split("\n").map(line => line.split(" => ")).filter(parts => parts[0] && parts[1]).map(parts => ({ input:parts[0].trim(), output:parts[1].trim(), explanation:parts.slice(2).join(" => ").trim() })),
      constraints: problemForm.constraints.split("\n").map(line => line.trim()).filter(Boolean),
      hints: problemForm.hints.split("\n").map(line => line.trim()).filter(Boolean),
      testCases: problemForm.testCases.split("\n").map(line => line.split(" => ")).filter(parts => parts[0] && parts[1]).map(parts => ({ input:parts[0].replace(/\\n/g, "\n").trim(), expected:parts.slice(1).join(" => ").trim() })),
      starterCode: { "Python 3": problemForm.starterPython },
      local: !PROBLEMS.some(p => String(p.id) === String(editingProblemId)),
    };
    const exists = localProblems.some(p => String(p.id) === String(payload.id));
    try {
      await persistProblems(exists
        ? localProblems.map(p => String(p.id) === String(payload.id) ? payload : p)
        : [payload, ...localProblems]
      );
      setProblemModal(false);
      toast.success(editingProblemId ? "Problem updated for all users!" : "Problem added for all users!");
    } catch (error) { toast.error(error.message || "Could not save problem to Supabase"); }
  };
  const deleteProblem = async p => {
    if (!window.confirm(`Delete "${p.title}"?`)) return;
    const isBuiltIn = PROBLEMS.some(base => String(base.id) === String(p.id));
    try {
      if (isBuiltIn) await persistHiddenProblems([...new Set([...hiddenProblems.map(String), String(p.id)])]);
      await persistProblems(localProblems.filter(problem => String(problem.id) !== String(p.id)));
      toast.success("Problem deleted for all users.");
    } catch (error) {
      toast.error(error.message || "Could not delete problem.");
    }
  };

  // ── Course CRUD ──
  const getYouTubeId = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?\s]+)/);
    return match ? match[1] : null;
  };

  const openCourseForm = course => {
    setEditingCourseId(course?.id || null);
    const existingVideoId = course?.chapters?.[0]?.lessons?.[0]?.videoId;
    setCourseForm(course ? {
      title:course.title, description:course.description, level:course.level,
      estimatedHours:course.estimatedHours, totalLessons:course.totalLessons,
      tags:(course.tags || []).join(", "), icon:course.icon || "📚",
      youtube_url: existingVideoId ? `https://youtube.com/watch?v=${existingVideoId}` : "",
      thumbnail:course.thumbnail || "",
    } : { title:"", description:"", level:"Beginner", estimatedHours:8, totalLessons:1, tags:"", icon:"📚", youtube_url:"", thumbnail:"" });
    setCourseModal(true);
  };
  const handleCourseImageUpload = async event => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    setCourseImageUploading(true);
    try {
      const url = await uploadCourseImage(file, await user.getIdToken());
      setCourseForm(form => ({ ...form, thumbnail:url }));
      toast.success("Course thumbnail uploaded.");
    } catch (error) {
      toast.error(error.message || "Course thumbnail upload failed.");
    } finally {
      setCourseImageUploading(false);
      input.value = "";
    }
  };
  const saveCourse = async () => {
    if (!courseForm.title.trim()) { toast.error("Title required"); return; }
    const currentCourse = courses.find(course => String(course.id) === String(editingCourseId));
    const videoId = getYouTubeId(courseForm.youtube_url) || currentCourse?.chapters?.[0]?.lessons?.[0]?.videoId || "PkZNo7MFNFg";
    const chapters = currentCourse?.chapters?.length
      ? currentCourse.chapters.map((chapter, chapterIndex) => chapterIndex === 0 ? {
        ...chapter,
        lessons: (chapter.lessons || []).map((lesson, lessonIndex) => lessonIndex === 0 ? { ...lesson, videoId } : lesson),
      } : chapter)
      : [{ id:1, title:"Getting Started", lessons:[{ id:"1-1", title:"Introduction", duration:"10:00", videoId }] }];
    const payload = {
      id: editingCourseId || `custom-${Date.now()}`,
      title: courseForm.title.trim(), description: courseForm.description.trim() || "Custom learning path",
      icon: courseForm.icon || "📚", thumbnail:courseForm.thumbnail.trim() || currentCourse?.thumbnail || "",
      color:currentCourse?.color || "#123047", level:courseForm.level, totalLessons:Number(courseForm.totalLessons) || 1,
      estimatedHours:Number(courseForm.estimatedHours) || 8, rating:currentCourse?.rating || 4.7, enrolled:currentCourse?.enrolled || 0,
      tags: courseForm.tags.split(",").map(t => t.trim()).filter(Boolean),
      chapters,
      local: currentCourse?.local ?? !COURSES.some(c => String(c.id) === String(editingCourseId)),
    };
    const exists = localCourses.some(c => String(c.id) === String(payload.id));
    try {
      await persistCourses(exists
        ? localCourses.map(c => String(c.id) === String(payload.id) ? payload : c)
        : [payload, ...localCourses]
      );
      setCourseModal(false);
      toast.success(editingCourseId ? "Course updated for all users!" : "Course added for all users!");
    } catch (error) { toast.error(error.message || "Could not save course to Supabase"); }
  };
  const deleteCourse = async c => {
    if (!window.confirm(`Delete "${c.title}"?`)) return;
    const isBuiltIn = COURSES.some(base => String(base.id) === String(c.id));
    try {
      if (isBuiltIn) await persistHiddenCourses([...new Set([...hiddenCourses.map(String), String(c.id)])]);
      await persistCourses(localCourses.filter(course => String(course.id) !== String(c.id)));
      toast.success("Course deleted for all users.");
    } catch (error) {
      toast.error(error.message || "Could not delete course.");
    }
  };

  const openQuizForm = quiz => {
    setEditingQuizId(quiz?.id || null);
    setQuizForm(quiz ? {
      topic:quiz.topic, question:quiz.question, options:(quiz.options || []).join(" | "), answer:quiz.answer,
      explanation:quiz.explanation || "", difficulty:quiz.difficulty || "Easy",
    } : { topic:"Data Structures", question:"", options:"", answer:0, explanation:"", difficulty:"Easy" });
    setQuizModal(true);
  };
  const saveQuiz = async () => {
    const options = quizForm.options.split("|").map(option => option.trim()).filter(Boolean);
    const answer = Number(quizForm.answer);
    if (!quizForm.question.trim() || options.length < 2 || answer < 0 || answer >= options.length) {
      toast.error("Add a question, at least two options, and a valid correct answer index");
      return;
    }
    const topicQuestions = [...(quizzes[quizForm.topic] || [])];
    const payload = {
      id: editingQuizId || `admin-${Date.now()}`, question:quizForm.question.trim(), options,
      answer, explanation:quizForm.explanation.trim(), difficulty:quizForm.difficulty,
    };
    const index = topicQuestions.findIndex(question => String(question.id) === String(editingQuizId));
    const nextTopicQuestions = index >= 0
      ? topicQuestions.map((question, itemIndex) => itemIndex === index ? payload : question)
      : [payload, ...topicQuestions];
    const next = { ...quizzes, [quizForm.topic]: nextTopicQuestions };
    if (editingQuizId) {
      Object.keys(next).forEach(topic => {
        if (topic !== quizForm.topic) next[topic] = next[topic].filter(question => String(question.id) !== String(editingQuizId));
      });
    }
    try {
      await persistQuizzes(next);
      setQuizModal(false);
      toast.success(editingQuizId ? "Quiz question updated for all users!" : "Quiz question added for all users!");
    } catch (error) { toast.error(error.message || "Could not save quiz to Supabase"); }
  };
  const deleteQuiz = async quiz => {
    if (!window.confirm(`Delete this question from ${quiz.topic}?`)) return;
    const next = { ...quizzes, [quiz.topic]: (quizzes[quiz.topic] || []).filter(question => String(question.id) !== String(quiz.id)) };
    try {
      await persistQuizzes(next);
      toast.success("Quiz question deleted for all users");
    } catch (error) { toast.error(error.message || "Could not delete quiz from Supabase"); }
  };

  // ── User actions ──
  const handleSuspend = async (u) => {
    const action = u.suspended ? "activate" : "suspend";
    if (!window.confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} user "${u.display_name}"?`)) return;
    try {
      await suspendUser(await user.getIdToken(), u.uid, !u.suspended);
      setUsers(prev => prev.map(x => x.uid === u.uid ? { ...x, suspended: !u.suspended } : x));
      if (selectedUser?.uid === u.uid) setSelectedUser(prev => ({ ...prev, suspended: !u.suspended }));
      toast.success(`User ${action}d`);
    } catch { toast.error("Action failed"); }
  };
  const handleRoleChange = async (u, role) => {
    try {
      await updateUserRole(await user.getIdToken(), u.uid, role);
      setUsers(prev => prev.map(x => x.uid === u.uid ? { ...x, role } : x));
      if (selectedUser?.uid === u.uid) setSelectedUser(prev => ({ ...prev, role }));
      toast.success(`Role updated to ${role}`);
    } catch { toast.error("Failed to update role"); }
  };

  const openUserEditor = user => {
    setSelectedUser(user);
    setUserForm({
      display_name:user.display_name || "", username:user.username || "", bio:user.bio || "",
      location:user.location || "", xp:user.xp || 0, level:user.level || 1,
      coins:user.coins || 0, streak:user.streak || 0,
    });
    setUserEditModal(true);
  };

  const viewUser = user => {
    setUserEditModal(false);
    setSelectedUser(user);
  };

  const saveUser = async () => {
    if (!selectedUser || !userForm.display_name.trim()) { toast.error("Name is required"); return; }
    try {
      const updated = await updateAdminUser(await user.getIdToken(), selectedUser.uid, {
        ...userForm, display_name:userForm.display_name.trim(), username:userForm.username.trim(),
        xp:Number(userForm.xp) || 0, level:Number(userForm.level) || 1,
        coins:Number(userForm.coins) || 0, streak:Number(userForm.streak) || 0,
      });
      setUsers(prev => prev.map(user => user.uid === selectedUser.uid ? { ...user, ...updated } : user));
      setUserEditModal(false);
      setSelectedUser(null);
      setTab("Users");
      toast.success("User updated");
    } catch (err) {
      toast.error(err.message || "Failed to update user");
    }
  };

  const DASH_STATS = [
    { label:"Total Users", value:users.length || "—", color:"var(--accent3)", icon:"👥", delta:`${filteredUsers.length} visible` },
    { label:"Problems", value:problems.length, color:"var(--green)", icon:"🧩", delta:`${problems.filter(p => p.difficulty === "Easy").length} Easy` },
    { label:"Courses", value:courses.length, color:"var(--yellow)", icon:"📚", delta:`${courses.reduce((s, c) => s + c.totalLessons, 0)} lessons` },
    { label:"Active Today", value:activeToday, color:"var(--purple)", icon:"🟢", delta:"From latest activity" },
  ];

  return (
    <div className="page-container fade-in">
      <AdminSetupModal isOpen={showSetup} onClose={() => setShowSetup(false)} />

      {/* ── Admin Profile Header ── */}
      <motion.div className="admin-hero" initial={{ opacity:0, y:-12 }} animate={{ opacity:1, y:0 }}>
        <div className="admin-hero-banner">
          <span className="admin-hero-kicker">CODEBRO CONTROL CENTER</span>
          <span className="admin-hero-dot" />
          <span className="admin-hero-live">Live workspace</span>
        </div>
        <div className="admin-hero-body">
          <div className="admin-hero-avatar">{(userProfile?.display_name || "A")[0].toUpperCase()}</div>
          <div className="admin-hero-copy">
            <div className="admin-hero-title-row">
              <h2>Admin Panel</h2>
              <span className="admin-badge">✓ ADMIN</span>
            </div>
            <p>{userProfile?.display_name || "Admin"} <span>·</span> Manage learning content, users, and platform activity</p>
          </div>
          <div className="admin-hero-actions">
            <Button variant="secondary" size="sm" onClick={loadUsers} disabled={usersLoading}>
              {usersLoading ? "Loading..." : "↻ Refresh data"}
            </Button>
            <Button variant="primary" size="sm" onClick={() => { setTab("Quizzes"); setTimeout(() => openQuizForm(null), 100); }}>+ Add quiz</Button>
          </div>
        </div>
      </motion.div>

      {/* ── Tabs ── */}
      <div style={{ marginBottom:20 }}>
        <TabBar tabs={["Overview", "Problems", "Courses", "Quizzes", "Users", "Reports"]} active={tab} onChange={setTab} />
      </div>

      {/* ══════════════════════════════════════════════════════
          OVERVIEW TAB
          ══════════════════════════════════════════════════════ */}
      {tab === "Overview" && (
        <>
          <div className="grid-4" style={{ marginBottom:20 }}>
            {DASH_STATS.map((s, i) => (
              <AdminStat key={s.label} {...s} delay={i * 0.1} />
            ))}
          </div>

          <div className="grid-2">
            <Card>
              <SectionHeader title="⚡ Quick Actions" />
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                {[
                  { icon:"➕", label:"Add Problem", color:"var(--accent3)", action:() => { setTab("Problems"); setTimeout(() => openProblemForm(null), 100); }},
                  { icon:"📚", label:"Add Course", color:"var(--green)", action:() => { setTab("Courses"); setTimeout(() => openCourseForm(null), 100); }},
                  { icon:"🎯", label:"Add Quiz", color:"var(--pink)", action:() => { setTab("Quizzes"); setTimeout(() => openQuizForm(null), 100); }},
                  { icon:"👥", label:"View Users", color:"var(--yellow)", action:() => setTab("Users") },
                  { icon:"📊", label:"Reports", color:"var(--purple)", action:() => setTab("Reports") },
                  { icon:"🔄", label:"Refresh Data", color:"var(--cyan)", action:loadUsers },
                  { icon:"🔐", label:"Setup Guide", color:"var(--orange)", action:() => setShowSetup(true) },
                ].map(({ icon, label, color, action }) => (
                  <button key={label} onClick={action} className="glass-card-glow" style={{
                    display:"flex", alignItems:"center", gap:8, padding:"10px 12px",
                    background:"var(--glass-bg)", backdropFilter:"var(--glass-blur-sm)",
                    border:"1px solid var(--glass-border)", borderRadius:8,
                    cursor:"pointer", fontSize:12, fontWeight:600, color:"var(--text)", fontFamily:"inherit",
                    transition:"all .18s",
                  }}>
                    <span style={{ color }}>{icon}</span>{label}
                  </button>
                ))}
              </div>
            </Card>
            <Card>
              <SectionHeader title="📋 Platform Stats" />
              {[
                { label:"Easy Problems", value:problems.filter(p => p.difficulty === "Easy").length, color:"var(--green)" },
                { label:"Medium Problems", value:problems.filter(p => p.difficulty === "Medium").length, color:"var(--yellow)" },
                { label:"Hard Problems", value:problems.filter(p => p.difficulty === "Hard").length, color:"var(--red)" },
                { label:"Total Courses", value:courses.length, color:"var(--accent3)" },
                { label:"Total Lessons", value:courses.reduce((s, c) => s + c.totalLessons, 0), color:"var(--cyan)" },
                { label:"Total Users", value:users.length, color:"var(--purple)" },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid var(--border-subtle)", fontSize:12 }}>
                  <span style={{ color:"var(--text2)" }}>{label}</span>
                  <span style={{ color, fontWeight:700 }}>{value}</span>
                </div>
              ))}
            </Card>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════════════════
          PROBLEMS TAB
          ══════════════════════════════════════════════════════ */}
      {tab === "Problems" && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, flexWrap:"wrap", gap:10 }}>
            <h3>All Problems ({filteredProblems.length} of {problems.length})</h3>
            <AdminSearchBar value={problemSearch} onChange={setProblemSearch} onSearch={() => setAppliedProblemSearch(problemSearch)} placeholder="Search problems by title, topic, or company" />
            <Button variant="primary" onClick={() => openProblemForm(null)}>+ Add Problem</Button>
          </div>
          <Card style={{ padding:0, overflow:"hidden" }}>
            <div style={{ overflowX:"auto" }}>
              <table className="data-table">
                <thead><tr><th>#</th><th>Title</th><th>Difficulty</th><th>Topics</th><th>Acceptance</th><th>XP</th><th>Actions</th></tr></thead>
                <tbody>
                  {filteredProblems.slice(0, 50).map(p => (
                    <tr key={p.id}>
                      <td style={{ color:"var(--text3)" }}>{p.id}</td>
                      <td style={{ fontWeight:600 }}>{p.title}</td>
                      <td><span className={`tag tag-${p.difficulty === "Easy" ? "easy" : p.difficulty === "Medium" ? "medium" : "hard"}`}>{p.difficulty}</span></td>
                      <td style={{ fontSize:11, color:"var(--text3)", maxWidth:160 }}>{(p.topics || []).slice(0, 2).join(", ")}</td>
                      <td style={{ color:"var(--text3)" }}>{p.acceptance}%</td>
                      <td style={{ color:"var(--yellow)", fontWeight:700 }}>+{p.xp}</td>
                      <td>
                        <div style={{ display:"flex", gap:4 }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => openProblemForm(p)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => deleteProblem(p)}>Del</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          COURSES TAB
          ══════════════════════════════════════════════════════ */}
      {tab === "Courses" && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, flexWrap:"wrap", gap:10 }}>
            <h3>All Courses ({filteredCourses.length} of {courses.length})</h3>
            <AdminSearchBar value={courseSearch} onChange={setCourseSearch} onSearch={() => setAppliedCourseSearch(courseSearch)} placeholder="Search courses by title, level, or tag" />
            <Button variant="primary" onClick={() => openCourseForm(null)}>+ Add Course</Button>
          </div>
          <div className="grid-3">
            {filteredCourses.map(c => (
              <Card key={c.id} className="glass-card-glow">
                <div style={{ fontSize:28, marginBottom:8 }}>{c.icon}</div>
                <div style={{ fontWeight:700, marginBottom:4 }}>{c.title}</div>
                <div style={{ fontSize:11, color:"var(--text3)", marginBottom:4 }}>{c.level} · {c.totalLessons} lessons · {c.estimatedHours}h</div>
                <div style={{ fontSize:11, color:"var(--yellow)", marginBottom:4 }}>⭐{c.rating} · {(c.enrolled / 1000).toFixed(1)}K enrolled</div>
                {c.chapters?.[0]?.lessons?.[0]?.videoId && (
                  <div style={{ fontSize:10, color:"var(--cyan)", marginBottom:8 }}>
                    🎬 YouTube: {c.chapters[0].lessons[0].videoId}
                  </div>
                )}
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  <Button variant="outline" size="sm" onClick={() => openCourseForm(c)}>✏️ Edit</Button>
                  <Button variant="danger" size="sm" onClick={() => deleteCourse(c)}>🗑️ Del</Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          QUIZZES TAB
          ══════════════════════════════════════════════════════ */}
      {tab === "Quizzes" && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16, flexWrap:"wrap", gap:10 }}>
            <h3>All Quiz Questions ({filteredQuizRows.length} of {quizRows.length})</h3>
            <AdminSearchBar value={quizSearch} onChange={setQuizSearch} onSearch={() => setAppliedQuizSearch(quizSearch)} placeholder="Search quizzes by topic or question" />
            <Button variant="primary" onClick={() => openQuizForm(null)}>+ Add Question</Button>
          </div>
          <Card style={{ padding:0, overflow:"hidden" }}>
            <div style={{ overflowX:"auto" }}>
              <table className="data-table">
                <thead><tr><th>Topic</th><th>Question</th><th>Difficulty</th><th>Options</th><th>Actions</th></tr></thead>
                <tbody>
                  {filteredQuizRows.map(quiz => (
                    <tr key={`${quiz.topic}-${quiz.id}`}>
                      <td style={{ color:"var(--accent3)", fontWeight:600 }}>{quiz.topic}</td>
                      <td style={{ minWidth:260 }}>{quiz.question}</td>
                      <td>{quiz.difficulty}</td>
                      <td style={{ fontSize:11, color:"var(--text3)" }}>{quiz.options?.length || 0} options · Correct: {Number(quiz.answer) + 1}</td>
                      <td><div style={{ display:"flex", gap:4 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => openQuizForm(quiz)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteQuiz(quiz)}>Del</button>
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          USERS TAB
          ══════════════════════════════════════════════════════ */}
      {tab === "Users" && (
        <div>
          {/* Search/filter bar */}
          <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap", alignItems:"center" }}>
            <AdminSearchBar value={userSearch} onChange={setUserSearch} onSearch={() => setAppliedUserSearch(userSearch)} placeholder="Search name, email, username, or uid" />
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ width:130 }}>
              <option>All Roles</option>
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ width:110 }}>
              <option>All</option>
              <option>Active</option>
              <option>Suspended</option>
            </select>
            <Button variant="secondary" size="sm" onClick={loadUsers} disabled={usersLoading}>
              {usersLoading ? "Loading..." : "🔄 Refresh"}
            </Button>
            <span style={{ fontSize:11, color:"var(--text3)", marginLeft:"auto" }}>{filteredUsers.length} of {users.length} users</span>
          </div>

          {usersLoading ? (
            <Card><div style={{ textAlign:"center", padding:40, color:"var(--text3)" }}>Loading users...</div></Card>
          ) : users.length === 0 ? (
            <Card><div style={{ textAlign:"center", padding:40, color:"var(--text3)" }}>
              No users yet — or check Supabase table policies.<br />
              <span style={{ fontSize:11 }}>Make sure the "users" table has a public read policy.</span>
            </div></Card>
          ) : (
            <Card style={{ padding:0, overflow:"hidden" }}>
              <div style={{ overflowX:"auto" }}>
                <table className="data-table">
                  <thead><tr>
                    <th>User</th><th>Email</th><th>Stats</th><th>Courses</th>
                    <th>Quiz</th><th>Last Activity</th><th>Role</th><th>Status</th><th>Actions</th>
                  </tr></thead>
                  <tbody>
                    {filteredUsers.map(u => (
                      <tr key={u.uid}>
                        <td>
                          <div style={{ fontWeight:700 }}>{u.display_name || "Unnamed"}</div>
                          <div style={{ color:"var(--text3)", fontSize:11 }}>@{u.username || "coder"} · Lv.{u.level || 1}</div>
                          <div style={{ color:"var(--yellow)", fontSize:10, fontWeight:600 }}>{(u.xp || 0).toLocaleString()} XP</div>
                        </td>
                        <td style={{ color:"var(--text2)", fontSize:11 }}>{u.email || "—"}</td>
                        <td>
                          <div style={{ fontSize:11, fontWeight:600 }}>{(u.solved_problems || []).length} solved</div>
                          <div style={{ color:"var(--text3)", fontSize:10 }}>{u.admin_progress?.totalSubmissions || 0} subs · {u.admin_progress?.acceptanceRate || 0}% acc</div>
                        </td>
                        <td>
                          <div style={{ fontSize:11, fontWeight:600 }}>{u.admin_progress?.activeCourses || 0} active</div>
                          <div style={{ color:"var(--text3)", fontSize:10 }}>{u.admin_progress?.avgCourseProgress || 0}% avg</div>
                        </td>
                        <td>
                          <div style={{ fontSize:11, fontWeight:600 }}>{u.admin_progress?.quizzesTaken || 0} quizzes</div>
                          <div style={{ color:"var(--text3)", fontSize:10 }}>{u.admin_progress?.avgQuizAccuracy || 0}% acc</div>
                        </td>
                        <td style={{ color:"var(--text3)", fontSize:11 }}>
                          {u.admin_progress?.latestActivity
                            ? new Date(u.admin_progress.latestActivity).toLocaleDateString()
                            : "No activity"}
                        </td>
                        <td>
                          <select value={u.role || "student"} onChange={e => handleRoleChange(u, e.target.value)}
                            style={{ width:90, padding:"4px 6px", fontSize:11 }}>
                            <option value="student">student</option>
                            <option value="admin">admin</option>
                          </select>
                        </td>
                        <td>
                          <span style={{
                            fontSize:10, padding:"2px 8px", borderRadius:10, fontWeight:700,
                            background: u.suspended ? "rgba(239,68,68,.15)" : "rgba(16,185,129,.12)",
                            color: u.suspended ? "var(--red)" : "var(--green)",
                          }}>
                            {u.suspended ? "Suspended" : "Active"}
                          </span>
                        </td>
                        <td>
                          <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => viewUser(u)}>👁 View</button>
                            <button className="btn btn-secondary btn-sm" onClick={() => openUserEditor(u)}>✏️ Edit</button>
                            <button className={`btn btn-sm ${u.suspended ? "btn-success" : "btn-danger"}`} onClick={() => handleSuspend(u)}>
                              {u.suspended ? "Activate" : "Suspend"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          REPORTS TAB
          ══════════════════════════════════════════════════════ */}
      {tab === "Reports" && (
        <div>
          {/* Stats row */}
          <div className="grid-4" style={{ marginBottom:20 }}>
            {[
              { label:"Total Users", value:users.length, color:"var(--accent3)", icon:"👥" },
              { label:"Admins", value:users.filter(u => u.role === "admin").length, color:"var(--purple)", icon:"🛡️" },
              { label:"Active Today", value:activeToday, color:"var(--green)", icon:"🟢" },
              { label:"Suspended", value:users.filter(u => u.suspended).length, color:"var(--red)", icon:"⛔" },
            ].map((s, i) => (
              <AdminStat key={s.label} {...s} delay={i * 0.08} />
            ))}
          </div>

          <div className="grid-2">
            <Card>
              <SectionHeader title="📈 Problems by Difficulty" />
              <BarChart
                data={[problems.filter(p => p.difficulty === "Easy").length, problems.filter(p => p.difficulty === "Medium").length, problems.filter(p => p.difficulty === "Hard").length]}
                labels={["Easy", "Medium", "Hard"]}
                color="linear-gradient(180deg,var(--accent),var(--accent2))"
                height={100}
              />
            </Card>
            <Card>
              <SectionHeader title="📚 Lessons per Course" />
              <BarChart
                data={courses.slice(0, 8).map(c => c.totalLessons)}
                labels={courses.slice(0, 8).map(c => c.icon)}
                color="linear-gradient(180deg,var(--green),var(--teal))"
                height={100}
              />
            </Card>
            <Card>
              <SectionHeader title="🏢 Company Coverage" />
              {["Google", "Amazon", "Facebook", "Microsoft", "Apple"].map(company => {
                const count = problems.filter(p => (p.companies || []).includes(company)).length;
                const pct = problems.length ? (count / problems.length * 100) : 0;
                return (
                  <div key={company} style={{ marginBottom:10 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, marginBottom:3 }}>
                      <span style={{ color:"var(--text2)" }}>{company}</span>
                      <span style={{ color:"var(--accent3)", fontWeight:600 }}>{count} problems</span>
                    </div>
                    <ProgressBar value={pct} height={5} />
                  </div>
                );
              })}
            </Card>
            <Card>
              <SectionHeader title="👥 User Stats" />
              {[
                { label:"Total Registered", value:users.length },
                { label:"Admins", value:users.filter(u => u.role === "admin").length },
                { label:"Students", value:users.filter(u => u.role !== "admin").length },
                { label:"Suspended", value:users.filter(u => u.suspended).length },
                { label:"Active Today", value:activeToday },
                { label:"With Submissions", value:users.filter(u => (u.admin_progress?.totalSubmissions || 0) > 0).length },
              ].map(({ label, value }) => (
                <div key={label} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid var(--border-subtle)", fontSize:12 }}>
                  <span style={{ color:"var(--text2)" }}>{label}</span>
                  <span style={{ color:"var(--accent3)", fontWeight:700 }}>{value}</span>
                </div>
              ))}
            </Card>
          </div>
        </div>
      )}

      {/* ── User Detail Modal ── */}
      <AnimatePresence>

      <Modal isOpen={quizModal} onClose={() => setQuizModal(false)} title={editingQuizId ? "✏️ Edit Quiz Question" : "➕ Add Quiz Question"} width={650}>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div>
              <label>Topic</label>
              <input list="admin-quiz-topics" value={quizForm.topic} onChange={e => setQuizForm(f => ({ ...f, topic:e.target.value }))} placeholder="Data Structures" />
              <datalist id="admin-quiz-topics">{Object.keys(quizzes).map(topic => <option key={topic} value={topic} />)}</datalist>
            </div>
            <div>
              <label>Difficulty</label>
              <select value={quizForm.difficulty} onChange={e => setQuizForm(f => ({ ...f, difficulty:e.target.value }))}>
                {['Easy', 'Medium', 'Hard'].map(level => <option key={level}>{level}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label>Question</label>
            <textarea rows={3} value={quizForm.question} onChange={e => setQuizForm(f => ({ ...f, question:e.target.value }))} placeholder="Write the question..." />
          </div>
          <div>
            <label>Options</label>
            <input value={quizForm.options} onChange={e => setQuizForm(f => ({ ...f, options:e.target.value }))} placeholder="Option A | Option B | Option C | Option D" />
            <div style={{ fontSize:10, color:"var(--text3)", marginTop:4 }}>Separate options with the pipe character: |</div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"160px 1fr", gap:12 }}>
            <Input label="Correct option #" type="number" min="1" value={Number(quizForm.answer) + 1} onChange={e => setQuizForm(f => ({ ...f, answer:Number(e.target.value) - 1 }))} />
            <Input label="Explanation" value={quizForm.explanation} onChange={e => setQuizForm(f => ({ ...f, explanation:e.target.value }))} placeholder="Explain the correct answer" />
          </div>
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
            <Button variant="outline" onClick={() => setQuizModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={saveQuiz}>Save Question</Button>
          </div>
        </div>
      </Modal>
        {selectedUser && (
          <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
            <motion.div className="modal-box" style={{ maxWidth:780 }}
              initial={{ opacity:0, scale:.92 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:.92 }}
              onClick={e => e.stopPropagation()}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
                <h3>👤 User Details</h3>
                <button onClick={() => setSelectedUser(null)} className="btn btn-ghost btn-sm">✕</button>
              </div>

              {/* Info grid */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
                {[
                  ["Name", selectedUser.display_name || "Unnamed"],
                  ["Username", `@${selectedUser.username || "coder"}`],
                  ["Email", selectedUser.email || "No email"],
                  ["UID", selectedUser.uid],
                  ["Role", selectedUser.role || "student"],
                  ["Status", selectedUser.suspended ? "🔴 Suspended" : "🟢 Active"],
                  ["Joined", selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString() : "Unknown"],
                  ["Location", selectedUser.location || "Not set"],
                ].map(([label, value]) => (
                  <div key={label} className="card" style={{ padding:10 }}>
                    <div style={{ fontSize:10, color:"var(--text3)", marginBottom:3 }}>{label}</div>
                    <div style={{ fontSize:12, fontWeight:600, wordBreak:"break-word" }}>{value}</div>
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="grid-4" style={{ marginBottom:16 }}>
                {[
                  ["XP", (selectedUser.xp || 0).toLocaleString(), "var(--yellow)"],
                  ["Solved", `${(selectedUser.solved_problems || []).length}/${PROBLEMS.length}`, "var(--green)"],
                  ["Submissions", selectedUser.admin_progress?.totalSubmissions || 0, "var(--accent3)"],
                  ["Streak", `🔥${selectedUser.streak || 0}`, "var(--orange)"],
                ].map(([label, value, color]) => (
                  <div key={label} className="card" style={{ padding:12, textAlign:"center" }}>
                    <div style={{ fontSize:18, fontWeight:800, color }}>{value}</div>
                    <div style={{ fontSize:10, color:"var(--text3)", marginTop:2 }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
                <button className="btn btn-secondary btn-sm" onClick={() => openUserEditor(selectedUser)}>✏️ Edit Profile</button>
                <select value={selectedUser.role || "student"} onChange={e => handleRoleChange(selectedUser, e.target.value)} style={{ width:130 }}>
                  <option value="student">student</option>
                  <option value="admin">admin</option>
                </select>
                <button className={`btn btn-sm ${selectedUser.suspended ? "btn-success" : "btn-danger"}`} onClick={() => handleSuspend(selectedUser)}>
                  {selectedUser.suspended ? "✅ Activate" : "⛔ Suspend"}
                </button>
              </div>

              <div className="grid-2">
                <div>
                  <div style={{ fontSize:12, fontWeight:700, marginBottom:8 }}>Recent Submissions</div>
                  {(selectedUser.admin_progress?.submissions || []).slice(0, 5).map((s, i) => (
                    <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:"1px solid var(--border-subtle)", fontSize:11 }}>
                      <span style={{ color:"var(--text2)" }}>#{s.problem_id} {(s.problem_title || "").slice(0, 24)}</span>
                      <span style={{ color:s.verdict === "Accepted" ? "var(--green)" : "var(--red)", fontWeight:700 }}>{s.verdict}</span>
                    </div>
                  ))}
                  {!(selectedUser.admin_progress?.submissions || []).length && <div style={{ fontSize:11, color:"var(--text3)" }}>No submissions</div>}
                </div>
                <div>
                  <div style={{ fontSize:12, fontWeight:700, marginBottom:8 }}>Quiz History</div>
                  {(selectedUser.admin_progress?.quizResults || []).slice(0, 5).map((q, i) => (
                    <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:"1px solid var(--border-subtle)", fontSize:11 }}>
                      <span style={{ color:"var(--text2)" }}>{q.topic}</span>
                      <span style={{ color:"var(--accent3)", fontWeight:700 }}>{q.score}/{q.total} ({q.accuracy}%)</span>
                    </div>
                  ))}
                  {!(selectedUser.admin_progress?.quizResults || []).length && <div style={{ fontSize:11, color:"var(--text3)" }}>No quiz attempts</div>}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Modal isOpen={userEditModal} onClose={() => setUserEditModal(false)} title="✏️ Edit User" width={600}>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Input label="Display Name" value={userForm.display_name} onChange={e => setUserForm(f => ({ ...f, display_name:e.target.value }))} />
            <Input label="Username" value={userForm.username} onChange={e => setUserForm(f => ({ ...f, username:e.target.value }))} />
            <Input label="Location" value={userForm.location} onChange={e => setUserForm(f => ({ ...f, location:e.target.value }))} />
            <Input label="Level" type="number" value={userForm.level} onChange={e => setUserForm(f => ({ ...f, level:e.target.value }))} />
            <Input label="XP" type="number" value={userForm.xp} onChange={e => setUserForm(f => ({ ...f, xp:e.target.value }))} />
            <Input label="Coins" type="number" value={userForm.coins} onChange={e => setUserForm(f => ({ ...f, coins:e.target.value }))} />
            <Input label="Streak" type="number" value={userForm.streak} onChange={e => setUserForm(f => ({ ...f, streak:e.target.value }))} />
          </div>
          <div>
            <label>Bio</label>
            <textarea rows={3} value={userForm.bio} onChange={e => setUserForm(f => ({ ...f, bio:e.target.value }))} />
          </div>
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
            <Button variant="outline" onClick={() => setUserEditModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={saveUser}>Save Changes</Button>
          </div>
        </div>
      </Modal>

      {/* ── Problem Modal ── */}
      <Modal isOpen={problemModal} onClose={() => setProblemModal(false)} title={editingProblemId ? "✏️ Edit Problem" : "➕ Add Problem"} width={820}>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div style={{ padding:"10px 12px", border:"1px solid var(--border)", borderRadius:8, background:"var(--bg3)", fontSize:11, color:"var(--text2)" }}>
            Complete every section. These details are shown to learners in the Editor and test cases are used by Run Code.
          </div>
          <Input label="Title" value={problemForm.title} onChange={e => setProblemForm(f => ({ ...f, title:e.target.value }))} placeholder="e.g. Two Sum" />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div>
              <label>Difficulty</label>
              <select value={problemForm.difficulty} onChange={e => setProblemForm(f => ({ ...f, difficulty:e.target.value }))}>
                {["Easy", "Medium", "Hard"].map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <Input label="XP Reward" type="number" value={problemForm.xp} onChange={e => setProblemForm(f => ({ ...f, xp:e.target.value }))} />
            <Input label="Acceptance %" type="number" value={problemForm.acceptance} onChange={e => setProblemForm(f => ({ ...f, acceptance:e.target.value }))} />
            <Input label="Companies" value={problemForm.companies} onChange={e => setProblemForm(f => ({ ...f, companies:e.target.value }))} placeholder="Google, Amazon" />
          </div>
          <Input label="Topics (comma-separated)" value={problemForm.topics} onChange={e => setProblemForm(f => ({ ...f, topics:e.target.value }))} placeholder="Array, Hash Table, DP" />
          <div>
            <label>Problem Statement</label>
            <textarea rows={6} value={problemForm.statement} onChange={e => setProblemForm(f => ({ ...f, statement:e.target.value }))} placeholder="Describe the task, inputs, expected output, and requirements..." />
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div>
              <label>Examples</label>
              <textarea rows={6} value={problemForm.examples} onChange={e => setProblemForm(f => ({ ...f, examples:e.target.value }))} placeholder={"input => output => explanation\n[2,7], 9 => [0,1] => The pair sums to target"} />
              <div style={{ fontSize:10, color:"var(--text3)", marginTop:4 }}>One per line: input =&gt; output =&gt; explanation</div>
            </div>
            <div>
              <label>Test Cases</label>
              <textarea rows={6} value={problemForm.testCases} onChange={e => setProblemForm(f => ({ ...f, testCases:e.target.value }))} placeholder={"[2,7,11,15]\\n9 => [0,1]\n[3,2,4]\\n6 => [1,2]"} />
              <div style={{ fontSize:10, color:"var(--text3)", marginTop:4 }}>One per line: input =&gt; expected output. Use \n inside input.</div>
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div>
              <label>Constraints</label>
              <textarea rows={4} value={problemForm.constraints} onChange={e => setProblemForm(f => ({ ...f, constraints:e.target.value }))} placeholder="One constraint per line" />
            </div>
            <div>
              <label>Hints</label>
              <textarea rows={4} value={problemForm.hints} onChange={e => setProblemForm(f => ({ ...f, hints:e.target.value }))} placeholder="One hint per line" />
            </div>
          </div>
          <div>
            <label>Python 3 Starter Code</label>
            <textarea rows={8} value={problemForm.starterPython} onChange={e => setProblemForm(f => ({ ...f, starterPython:e.target.value }))} placeholder="class Solution:\n    def solve(self):\n        pass" style={{ fontFamily:"var(--font-mono)" }} />
          </div>
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:4 }}>
            <Button variant="outline" onClick={() => setProblemModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={saveProblem}>{editingProblemId ? "Save Changes" : "Add Problem"}</Button>
          </div>
        </div>
      </Modal>

      {/* ── Course Modal ── */}
      <Modal isOpen={courseModal} onClose={() => setCourseModal(false)} title={editingCourseId ? "✏️ Edit Course" : "➕ Add Course"} width={600}>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div style={{ display:"grid", gridTemplateColumns:"80px 1fr", gap:12 }}>
            <Input label="Icon (emoji)" value={courseForm.icon} onChange={e => setCourseForm(f => ({ ...f, icon:e.target.value }))} />
            <Input label="Title" value={courseForm.title} onChange={e => setCourseForm(f => ({ ...f, title:e.target.value }))} placeholder="e.g. React Mastery" />
          </div>
          <div>
            <label>Description</label>
            <textarea rows={3} value={courseForm.description} onChange={e => setCourseForm(f => ({ ...f, description:e.target.value }))} style={{ resize:"none" }} placeholder="What students will learn..." />
          </div>
          <Input label="YouTube Video URL" value={courseForm.youtube_url} onChange={e => setCourseForm(f => ({ ...f, youtube_url:e.target.value }))} placeholder="https://youtube.com/watch?v=..." />
          {courseForm.youtube_url && getYouTubeId(courseForm.youtube_url) && (
            <div style={{ borderRadius:8, overflow:"hidden", border:"1px solid var(--border)", aspectRatio:"16/9" }}>
              <iframe
                width="100%" height="100%"
                src={`https://www.youtube.com/embed/${getYouTubeId(courseForm.youtube_url)}`}
                title="Preview" frameBorder="0" allowFullScreen
                style={{ border:0 }}
              />
            </div>
          )}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
            <div>
              <label>Level</label>
              <select value={courseForm.level} onChange={e => setCourseForm(f => ({ ...f, level:e.target.value }))}>
                {["Beginner", "Intermediate", "Advanced"].map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label>Total Lessons</label>
              <div style={{ padding:"9px 12px",border:"1px solid var(--border)",borderRadius:8,color:"var(--text2)",fontSize:12 }}>{courseForm.totalLessons} from course videos</div>
            </div>
            <Input label="Est. Hours" type="number" value={courseForm.estimatedHours} onChange={e => setCourseForm(f => ({ ...f, estimatedHours:e.target.value }))} />
          </div>
          <Input label="Tags (comma-separated)" value={courseForm.tags} onChange={e => setCourseForm(f => ({ ...f, tags:e.target.value }))} placeholder="React, Hooks, API" />
            <div>
              <label>Course thumbnail image (separate from YouTube)</label>
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleCourseImageUpload} disabled={courseImageUploading} />
              {courseImageUploading && <div style={{ color:"var(--text3)",fontSize:11,marginTop:6 }}>Uploading thumbnail...</div>}
              {courseForm.thumbnail && <img src={courseForm.thumbnail} alt="Course thumbnail preview" style={{ display:"block",width:"100%",maxHeight:180,objectFit:"cover",marginTop:8,borderRadius:8,border:"1px solid var(--border)" }} />}
            </div>
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end", marginTop:4 }}>
            <Button variant="outline" onClick={() => setCourseModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={saveCourse} disabled={courseImageUploading}>{editingCourseId ? "Save Changes" : "Add Course"}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
