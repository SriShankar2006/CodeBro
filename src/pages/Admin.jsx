// src/pages/Admin.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { getAdminUserDashboard } from "../services/supabase";
import { Card, TabBar, Button, SectionHeader, BarChart, Modal, Input } from "../components/UI";
import { PROBLEMS } from "../data/problems";
import { COURSES } from "../data/courses";
import useStore from "../context/useStore";

export default function Admin() {
  const navigate = useNavigate();
  const { logout, userProfile } = useStore();
  const [tab,   setTab]   = useState("Overview");
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [userSearch, setUserSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [selectedUser, setSelectedUser] = useState(null);
  const [adminSetupModal, setAdminSetupModal] = useState(!userProfile?.role || userProfile?.role !== "admin");
  const [localProblems, setLocalProblems] = useState(() => JSON.parse(localStorage.getItem("cb_admin_problems") || "[]"));
  const [localCourses, setLocalCourses] = useState(() => JSON.parse(localStorage.getItem("cb_admin_courses") || "[]"));
  const [problemModal, setProblemModal] = useState(false);
  const [courseModal, setCourseModal] = useState(false);
  const [editingProblemId, setEditingProblemId] = useState(null);
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [problemForm, setProblemForm] = useState({ title:"", difficulty:"Easy", topics:"", acceptance:70, xp:30, companies:"" });
  const [courseForm, setCourseForm] = useState({ title:"", description:"", level:"Beginner", estimatedHours:8, totalLessons:1, tags:"", icon:"📚" });

  useEffect(() => {
    (async () => {
      setUsersLoading(true);
      try { setUsers(await getAdminUserDashboard(500)); } catch { setUsers([]); }
      setUsersLoading(false);
    })();
  }, []);

  const problems = [...PROBLEMS, ...localProblems];
  const courses = [...COURSES, ...localCourses];
  const filteredUsers = users.filter(u => {
    const q = userSearch.toLowerCase();
    const matchesSearch = !q || [u.display_name, u.username, u.email, u.uid].some(v => String(v || "").toLowerCase().includes(q));
    const matchesRole = roleFilter === "All Roles" || (u.role || "student").toLowerCase() === roleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });
  const activeToday = users.filter(u => {
    const last = u.admin_progress?.latestActivity || u.last_login_date;
    return last && new Date(last).toDateString() === new Date().toDateString();
  }).length;

  const persistProblems = next => {
    setLocalProblems(next);
    localStorage.setItem("cb_admin_problems", JSON.stringify(next));
  };

  const persistCourses = next => {
    setLocalCourses(next);
    localStorage.setItem("cb_admin_courses", JSON.stringify(next));
  };

  const openProblemForm = problem => {
    setEditingProblemId(problem?.id || null);
    setProblemForm(problem ? {
      title: problem.title,
      difficulty: problem.difficulty,
      topics: (problem.topics || []).join(", "),
      acceptance: problem.acceptance,
      xp: problem.xp,
      companies: (problem.companies || []).join(", "),
    } : { title:"", difficulty:"Easy", topics:"", acceptance:70, xp:30, companies:"" });
    setProblemModal(true);
  };

  const saveProblem = () => {
    if (!problemForm.title.trim()) { toast.error("Problem title is required"); return; }
    const payload = {
      id: editingProblemId || Math.max(...problems.map(p => p.id), 0) + 1,
      title: problemForm.title.trim(),
      difficulty: problemForm.difficulty,
      topics: problemForm.topics.split(",").map(t=>t.trim()).filter(Boolean),
      acceptance: Number(problemForm.acceptance) || 70,
      xp: Number(problemForm.xp) || 30,
      companies: problemForm.companies.split(",").map(c=>c.trim()).filter(Boolean),
      local: true,
    };
    persistProblems(editingProblemId ? localProblems.map(p => p.id === editingProblemId ? payload : p) : [payload, ...localProblems]);
    setProblemModal(false);
    toast.success(editingProblemId ? "Problem updated" : "Problem added");
  };

  const deleteProblem = problem => {
    if (!problem.local) { toast.error("Built-in problems are read-only here"); return; }
    persistProblems(localProblems.filter(p => p.id !== problem.id));
    toast.success("Problem deleted");
  };

  const openCourseForm = course => {
    setEditingCourseId(course?.id || null);
    setCourseForm(course ? {
      title: course.title,
      description: course.description,
      level: course.level,
      estimatedHours: course.estimatedHours,
      totalLessons: course.totalLessons,
      tags: (course.tags || []).join(", "),
      icon: course.icon || "📚",
    } : { title:"", description:"", level:"Beginner", estimatedHours:8, totalLessons:1, tags:"", icon:"📚" });
    setCourseModal(true);
  };

  const saveCourse = () => {
    if (!courseForm.title.trim()) { toast.error("Course title is required"); return; }
    const payload = {
      id: editingCourseId || `custom-${Date.now()}`,
      title: courseForm.title.trim(),
      description: courseForm.description.trim() || "Custom learning path",
      icon: courseForm.icon || "📚",
      thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80",
      color: "#123047",
      level: courseForm.level,
      totalLessons: Number(courseForm.totalLessons) || 1,
      estimatedHours: Number(courseForm.estimatedHours) || 8,
      rating: 4.7,
      enrolled: 0,
      tags: courseForm.tags.split(",").map(t=>t.trim()).filter(Boolean),
      chapters: [{ id:1, title:"Getting Started", lessons:[{ id:"1-1", title:"Course Introduction", duration:"10:00", videoId:"PkZNo7MFNFg" }] }],
      local: true,
    };
    persistCourses(editingCourseId ? localCourses.map(c => c.id === editingCourseId ? payload : c) : [payload, ...localCourses]);
    setCourseModal(false);
    toast.success(editingCourseId ? "Course updated" : "Course added");
  };

  const deleteCourse = course => {
    if (!course.local) { toast.error("Built-in courses are read-only here"); return; }
    persistCourses(localCourses.filter(c => c.id !== course.id));
    toast.success("Course deleted");
  };

  const STATS = [
    { label:"Total Users",     value: users.length || "—", color:"var(--accent3)", icon:"👥", delta:"+12 today" },
    { label:"Total Problems",  value: problems.length,     color:"var(--green)",   icon:"🧩", delta:`${problems.filter(p=>p.difficulty==="Easy").length} Easy` },
    { label:"Total Courses",   value: courses.length,      color:"var(--yellow)",  icon:"📚", delta:`${courses.reduce((s,c)=>s+c.totalLessons,0)} lessons` },
    { label:"Active Today",    value:"—",                  color:"var(--purple)",  icon:"🟢", delta:"Real-time" },
  ];
  const DASH_STATS = [
    { label:"Total Users", value: users.length || "-", color:"var(--accent3)", icon:"Users", delta:`${filteredUsers.length} visible` },
    { label:"Total Problems", value: problems.length, color:"var(--green)", icon:"Problems", delta:`${problems.filter(p=>p.difficulty==="Easy").length} Easy` },
    { label:"Total Courses", value: courses.length, color:"var(--yellow)", icon:"Courses", delta:`${courses.reduce((s,c)=>s+c.totalLessons,0)} lessons` },
    { label:"Active Today", value: activeToday, color:"var(--purple)", icon:"Live", delta:"From latest activity" },
  ];

  return (
    <div className="page-container fade-in">
      {/* Admin Setup Modal */}
      <Modal isOpen={adminSetupModal} onClose={() => {}} width={700}>
        <div style={{ textAlign: "center", paddingBottom: 20 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔐</div>
          <h2 style={{ marginBottom: 8 }}>Admin Dashboard Setup</h2>
          <p style={{ color: "var(--text3)", marginBottom: 24 }}>Follow these steps to set up your admin account</p>
          
          <div style={{ background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 12, padding: 24, marginBottom: 20, textAlign: "left" }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--accent3)", marginBottom: 12 }}>✓ STEP 1: DEFAULT ADMIN CREDENTIALS</div>
              <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 8, padding: 14, fontFamily: "monospace", fontSize: 13, marginBottom: 12 }}>
                <div style={{ marginBottom: 8 }}>
                  <span style={{ color: "var(--text3)" }}>Email:</span> <span style={{ color: "var(--yellow)", fontWeight: 700 }}>admin@codebro.io</span>
                </div>
                <div>
                  <span style={{ color: "var(--text3)" }}>Password:</span> <span style={{ color: "var(--yellow)", fontWeight: 700 }}>Admin123!@#</span>
                </div>
              </div>
              <div style={{ fontSize: 11, color: "var(--text3)" }}>
                <strong>Note:</strong> Use these credentials to log in. After login, your account role will automatically be set to "admin".
              </div>
            </div>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 20, marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--green)", marginBottom: 12 }}>✓ STEP 2: CREATE ADMIN ACCOUNT IN FIREBASE</div>
              <ol style={{ fontSize: 11, color: "var(--text2)", textAlign: "left", marginLeft: 16, lineHeight: 1.8 }}>
                <li>Go to <strong>Firebase Console</strong> → Your Project</li>
                <li>Navigate to <strong>Authentication</strong> → Users</li>
                <li>Click <strong>Create User</strong></li>
                <li>Email: <strong>admin@codebro.io</strong></li>
                <li>Password: <strong>Admin123!@#</strong></li>
                <li>Click <strong>Create</strong></li>
              </ol>
            </div>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--purple)", marginBottom: 12 }}>✓ STEP 3: SET ADMIN ROLE IN SUPABASE</div>
              <ol style={{ fontSize: 11, color: "var(--text2)", textAlign: "left", marginLeft: 16, lineHeight: 1.8 }}>
                <li>Go to <strong>Supabase Dashboard</strong> → Your Project</li>
                <li>Navigate to <strong>SQL Editor</strong></li>
                <li>Run this query:</li>
              </ol>
              <div style={{ background: "var(--bg2)", border: "1px solid var(--border)", borderRadius: 8, padding: 10, marginTop: 10, fontFamily: "monospace", fontSize: 10, overflow: "auto" }}>
                <code style={{ color: "var(--cyan)" }}>
                  UPDATE users SET role = 'admin' WHERE email = 'admin@codebro.io';
                </code>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <Button variant="outline" size="sm" onClick={() => window.open("https://firebase.google.com/", "_blank")}>
              📱 Go to Firebase
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.open("https://supabase.com/", "_blank")}>
              🗄️ Go to Supabase
            </Button>
            <Button variant="success" size="sm" onClick={() => {
              toast.success("Setup complete! Refresh the page to continue.");
              setTimeout(() => window.location.reload(), 1500);
            }}>
              ✓ Setup Complete
            </Button>
          </div>
        </div>
      </Modal>

      <button
        onClick={async () => {
          await logout();
          navigate("/login");
        }}
        style={{
          position:"fixed",
          top:74,
          right:22,
          zIndex:500,
          background:"var(--red)",
          color:"#fff",
          border:"none",
          borderRadius:8,
          padding:"9px 14px",
          fontSize:12,
          fontWeight:800,
          cursor:"pointer",
          boxShadow:"var(--shadow-lg)",
          fontFamily:"inherit",
        }}
      >
        Logout
      </button>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20 }}>
        <div>
          <h2>⚙️ Admin Panel</h2>
          <p style={{ fontSize:12,marginTop:2 }}>👤 {userProfile?.display_name || "Admin"} · Manage platform content and users</p>
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
          <span className="tag tag-purple">✓ Admin Access</span>
          <Button variant="outline" size="sm" onClick={async () => {
            await logout();
            navigate("/login");
          }}>Logout</Button>
        </div>
      </div>

      <div style={{ marginBottom:20 }}>
        <TabBar tabs={["Overview","Problems","Courses","Users","Analytics"]} active={tab} onChange={setTab} />
      </div>

      {tab==="Overview" && (
        <>
          <div className="grid-4" style={{ marginBottom:20 }}>
            {DASH_STATS.map(({ label,value,color,icon,delta }) => (
              <Card key={label}>
                <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:8 }}>
                  <span style={{ fontSize:22 }}>{icon}</span>
                  <div style={{ fontSize:11,color:"var(--text3)" }}>{label}</div>
                </div>
                <div style={{ fontSize:24,fontWeight:800,color }}>{value}</div>
                <div style={{ fontSize:10,color:"var(--text3)",marginTop:4 }}>{delta}</div>
              </Card>
            ))}
          </div>
          <Card style={{ marginBottom:20 }}>
            <SectionHeader title="🔐 Admin Credentials" />
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,fontSize:12,marginBottom:16 }}>
              <div style={{ background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:8,padding:12 }}>
                <div style={{ color:"var(--text3)",fontSize:10,marginBottom:4,fontWeight:700 }}>Admin Email</div>
                <div style={{ color:"var(--accent3)",fontFamily:"monospace",fontWeight:700,fontSize:13,wordBreak:"break-all" }}>admin@codebro.io</div>
              </div>
              <div style={{ background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:8,padding:12 }}>
                <div style={{ color:"var(--text3)",fontSize:10,marginBottom:4,fontWeight:700 }}>Admin Password</div>
                <div style={{ color:"var(--yellow)",fontFamily:"monospace",fontWeight:700,fontSize:13 }}>Admin123!@#</div>
              </div>
            </div>
            <div style={{ background:"rgba(99,102,241,.1)",border:"1px solid rgba(99,102,241,.2)",borderRadius:8,padding:12,fontSize:11,color:"var(--text2)",lineHeight:1.6 }}>
              <strong>⚠️ Important:</strong> Change your password immediately after first login. Share these credentials securely with other admins only.<br/><br/>
              <strong>Setup Steps:</strong><br/>
              1️⃣ Create user in Firebase Auth with these credentials<br/>
              2️⃣ Update user role to "admin" in Supabase<br/>
              3️⃣ Log in with these credentials<br/>
              4️⃣ Change password in Settings
            </div>
          </Card>
          <div className="grid-2">
            <Card>
              <SectionHeader title="⚡ Quick Actions" />
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8 }}>
                {[
                  { icon:"➕",label:"Add Problem",   color:"var(--accent3)", action:()=>setTab("Problems") },
                  { icon:"📚",label:"Add Course",    color:"var(--green)",   action:()=>setTab("Courses")  },
                  { icon:"👥",label:"View Users",    color:"var(--yellow)",  action:()=>setTab("Users")    },
                  { icon:"📊",label:"Analytics",     color:"var(--purple)",  action:()=>setTab("Analytics")},
                  { icon:"🔄",label:"Refresh Data",  color:"var(--cyan)",    action:()=>toast.success("Data refreshed!") },
                  { icon:"📢",label:"Announcement",  color:"var(--orange)",  action:()=>toast.success("Announcement sent!") },
                ].map(({ icon,label,color,action }) => (
                  <button key={label} onClick={action} style={{ display:"flex",alignItems:"center",gap:8,padding:"10px 12px",background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:8,cursor:"pointer",fontSize:12,fontWeight:600,color:"var(--text)",fontFamily:"inherit",transition:"all .15s" }}
                    onMouseEnter={e=>e.currentTarget.style.borderColor=color}
                    onMouseLeave={e=>e.currentTarget.style.borderColor="var(--border)"}
                  >
                    <span style={{ color }}>{icon}</span>{label}
                  </button>
                ))}
              </div>
            </Card>
            <Card>
              <SectionHeader title="📋 Platform Stats" />
              {[
                { label:"Easy Problems",   value:problems.filter(p=>p.difficulty==="Easy").length,   color:"var(--green)"   },
                { label:"Medium Problems", value:problems.filter(p=>p.difficulty==="Medium").length, color:"var(--yellow)"  },
                { label:"Hard Problems",   value:problems.filter(p=>p.difficulty==="Hard").length,   color:"var(--red)"     },
                { label:"Total Courses",   value:courses.length,                                     color:"var(--accent3)" },
                { label:"Total Lessons",   value:courses.reduce((s,c)=>s+c.totalLessons,0),          color:"var(--cyan)"    },
              ].map(({ label,value,color }) => (
                <div key={label} style={{ display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:"1px solid rgba(42,58,92,.4)",fontSize:12 }}>
                  <span style={{ color:"var(--text2)" }}>{label}</span>
                  <span style={{ color,fontWeight:700 }}>{value}</span>
                </div>
              ))}
            </Card>
          </div>
        </>
      )}

      {tab==="Problems" && (
        <div>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
            <h3>All Problems ({problems.length})</h3>
            <Button variant="primary" onClick={()=>openProblemForm(null)}>+ Add Problem</Button>
          </div>
          <Card style={{ padding:0,overflow:"hidden" }}>
            <table className="data-table">
              <thead><tr><th>#</th><th>Title</th><th>Difficulty</th><th>Topics</th><th>Acceptance</th><th>XP</th><th>Actions</th></tr></thead>
              <tbody>
                {problems.slice(0,30).map(p => (
                  <tr key={p.id}>
                    <td style={{ color:"var(--text3)" }}>{p.id}</td>
                    <td style={{ fontWeight:600 }}>{p.title}</td>
                    <td><span className={`tag tag-${p.difficulty==="Easy"?"easy":p.difficulty==="Medium"?"medium":"hard"}`}>{p.difficulty}</span></td>
                    <td style={{ fontSize:11,color:"var(--text3)" }}>{p.topics.slice(0,2).join(", ")}</td>
                    <td style={{ color:"var(--text3)" }}>{p.acceptance}%</td>
                    <td style={{ color:"var(--yellow)",fontWeight:700 }}>+{p.xp}</td>
                    <td>
                      <div style={{ display:"flex",gap:4 }}>
                        <button className="btn btn-outline btn-sm" onClick={()=>openProblemForm(p)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={()=>deleteProblem(p)}>Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {tab==="Courses" && (
        <div>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
            <h3>All Courses ({courses.length})</h3>
            <Button variant="primary" onClick={()=>openCourseForm(null)}>+ Add Course</Button>
          </div>
          <div className="grid-3">
            {courses.map(c => (
              <Card key={c.id}>
                <div style={{ fontSize:28,marginBottom:8 }}>{c.icon}</div>
                <div style={{ fontWeight:700,marginBottom:4 }}>{c.title}</div>
                <div style={{ fontSize:11,color:"var(--text3)",marginBottom:10 }}>{c.level} · {c.totalLessons} lessons · {c.estimatedHours}h</div>
                <div style={{ fontSize:11,color:"var(--yellow)",marginBottom:12 }}>⭐{c.rating} · {(c.enrolled/1000).toFixed(0)}K enrolled</div>
                <div style={{ display:"flex",gap:6 }}>
                  <Button variant="outline" size="sm" onClick={()=>openCourseForm(c)}>Edit</Button>
                  <Button variant="success" size="sm" onClick={()=>toast.success(`${c.title} published!`)}>Publish</Button>
                  <Button variant="danger" size="sm" onClick={()=>deleteCourse(c)}>Del</Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {tab==="Users" && (
        <div>
          <div style={{ display:"flex",gap:8,marginBottom:16,flexWrap:"wrap",alignItems:"center" }}>
            <input type="text" placeholder="Search name, email, username, uid..." value={userSearch} onChange={e=>setUserSearch(e.target.value)} style={{ width:280 }} />
            <select value={roleFilter} onChange={e=>setRoleFilter(e.target.value)} style={{ width:130 }}><option>All Roles</option><option>Student</option><option>Admin</option></select>
            <Button variant="outline" size="sm" onClick={async()=>{ setUsersLoading(true); try { setUsers(await getAdminUserDashboard(500)); toast.success("Users refreshed"); } catch { toast.error("Could not refresh users"); } setUsersLoading(false); }}>Refresh</Button>
          </div>
          {usersLoading ? (
            <Card><div style={{ textAlign:"center",padding:40,color:"var(--text3)" }}>Loading users and progress...</div></Card>
          ) : users.length === 0 ? (
            <Card><div style={{ textAlign:"center",padding:40,color:"var(--text3)" }}>No users found. Check Supabase policies or create a user account.</div></Card>
          ) : (
            <Card style={{ padding:0,overflow:"hidden" }}>
              <table className="data-table">
                <thead><tr><th>User</th><th>Email</th><th>Progress</th><th>Courses</th><th>Quiz</th><th>Activity</th><th>Role</th><th>Actions</th></tr></thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.uid}>
                      <td>
                        <div style={{ fontWeight:700 }}>{u.display_name || "Unnamed"}</div>
                        <div style={{ color:"var(--text3)",fontSize:11 }}>@{u.username || "coder"} · Lv.{u.level||1} · {(u.xp||0).toLocaleString()} XP</div>
                        <div style={{ color:"var(--text3)",fontSize:10,fontFamily:"var(--font-mono)" }}>{u.uid}</div>
                      </td>
                      <td style={{ color:"var(--text2)",fontSize:12 }}>{u.email || "No email"}</td>
                      <td>
                        <div style={{ fontSize:12,fontWeight:700 }}>{(u.solved_problems||[]).length}/{problems.length} solved</div>
                        <div style={{ color:"var(--text3)",fontSize:11 }}>{u.admin_progress?.totalSubmissions || 0} submissions · {u.admin_progress?.acceptanceRate || 0}% accepted</div>
                      </td>
                      <td>
                        <div style={{ fontSize:12,fontWeight:700 }}>{u.admin_progress?.activeCourses || 0} active</div>
                        <div style={{ color:"var(--text3)",fontSize:11 }}>{u.admin_progress?.avgCourseProgress || 0}% avg progress</div>
                      </td>
                      <td>
                        <div style={{ fontSize:12,fontWeight:700 }}>{u.admin_progress?.quizzesTaken || 0} taken</div>
                        <div style={{ color:"var(--text3)",fontSize:11 }}>{u.admin_progress?.avgQuizAccuracy || 0}% avg accuracy</div>
                      </td>
                      <td style={{ color:"var(--text3)",fontSize:11 }}>{u.admin_progress?.latestActivity ? new Date(u.admin_progress.latestActivity).toLocaleDateString() : "No activity"}</td>
                      <td><span className={`tag tag-${u.role==="admin"?"purple":"blue"}`} style={{ fontSize:10 }}>{u.role||"student"}</span></td>
                      <td><button className="btn btn-outline btn-sm" onClick={()=>setSelectedUser(u)}>View</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </div>
      )}

      {false && tab==="Users" && (
        <div>
          <div style={{ display:"flex",gap:8,marginBottom:16 }}>
            <input type="text" placeholder="🔍 Search users..." value={userSearch} onChange={e=>setUserSearch(e.target.value)} style={{ width:220 }} />
            <select value={roleFilter} onChange={e=>setRoleFilter(e.target.value)} style={{ width:130 }}><option>All Roles</option><option>Student</option><option>Admin</option></select>
          </div>
          {users.length === 0 ? (
            <Card><div style={{ textAlign:"center",padding:40,color:"var(--text3)" }}>Connect Supabase to view real users. Demo leaderboard loaded above.</div></Card>
          ) : (
            <Card style={{ padding:0,overflow:"hidden" }}>
              <table className="data-table">
                <thead><tr><th>Name</th><th>Username</th><th>XP</th><th>Level</th><th>Solved</th><th>Role</th><th>Actions</th></tr></thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.uid}>
                      <td style={{ fontWeight:600 }}>{u.display_name}</td>
                      <td style={{ color:"var(--text3)" }}>@{u.username}</td>
                      <td style={{ color:"var(--yellow)",fontWeight:700 }}>{(u.xp||0).toLocaleString()}</td>
                      <td>Lv.{u.level||1}</td>
                      <td>{(u.solved_problems||[]).length}</td>
                      <td><span className={`tag tag-${u.role==="admin"?"purple":"blue"}`} style={{ fontSize:10 }}>{u.role||"student"}</span></td>
                      <td>
                        <div style={{ display:"flex",gap:4 }}>
                          <button className="btn btn-outline btn-sm">View</button>
                          <button className="btn btn-danger btn-sm" onClick={()=>toast.error("Action requires admin Supabase policy")}>Ban</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </div>
      )}

      {tab==="Analytics" && (
        <div className="grid-2">
          <Card>
            <SectionHeader title="📈 Problems by Difficulty" />
            <BarChart
              data={[problems.filter(p=>p.difficulty==="Easy").length,problems.filter(p=>p.difficulty==="Medium").length,problems.filter(p=>p.difficulty==="Hard").length]}
              labels={["Easy","Medium","Hard"]}
              color="linear-gradient(180deg,var(--accent),var(--accent2))"
              height={100}
            />
          </Card>
          <Card>
            <SectionHeader title="📚 Lessons per Course" />
            <BarChart
              data={courses.map(c=>c.totalLessons)}
              labels={courses.map(c=>c.icon)}
              color="linear-gradient(180deg,var(--green),var(--teal))"
              height={100}
            />
          </Card>
          <Card>
            <SectionHeader title="🏢 Company Coverage" />
            {["Google","Amazon","Facebook","Microsoft","Apple"].map(c => {
              const count = problems.filter(p=>p.companies?.includes(c)).length;
              return (
                <div key={c} style={{ marginBottom:8 }}>
                  <div style={{ display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:3 }}>
                    <span>{c}</span><span style={{ color:"var(--accent3)" }}>{count} problems</span>
                  </div>
                  <div style={{ background:"var(--bg3)",borderRadius:10,height:5,overflow:"hidden" }}>
                    <div style={{ height:"100%",width:`${count/problems.length*100}%`,background:"var(--accent2)",borderRadius:10 }} />
                  </div>
                </div>
              );
            })}
          </Card>
          <Card>
            <SectionHeader title="ℹ️ Database Info" />
            <div style={{ fontSize:12,color:"var(--text2)",lineHeight:1.8 }}>
              Connect Supabase to see real analytics:<br/>
              • Daily active users<br/>
              • Submission trends<br/>
              • Course completion rates<br/>
              • Quiz accuracy distributions<br/>
              • Revenue metrics
            </div>
          </Card>
        </div>
      )}

      <Modal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} title="User Details" width={760}>
        {selectedUser && (
          <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
              {[
                ["Name", selectedUser.display_name || "Unnamed"],
                ["Email", selectedUser.email || "No email"],
                ["Username", `@${selectedUser.username || "coder"}`],
                ["UID", selectedUser.uid],
                ["Role", selectedUser.role || "student"],
                ["Joined", selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleString() : "Unknown"],
                ["Last Login", selectedUser.last_login_date || "Unknown"],
                ["Location", selectedUser.location || "Not set"],
              ].map(([label,value]) => (
                <div key={label} style={{ background:"var(--bg3)",border:"1px solid var(--border)",borderRadius:8,padding:10 }}>
                  <div style={{ fontSize:10,color:"var(--text3)",marginBottom:3 }}>{label}</div>
                  <div style={{ fontSize:12,fontWeight:600,wordBreak:"break-word" }}>{value}</div>
                </div>
              ))}
            </div>

            <div className="grid-4">
              {[
                ["XP", (selectedUser.xp || 0).toLocaleString(), "var(--yellow)"],
                ["Solved", `${(selectedUser.solved_problems||[]).length}/${problems.length}`, "var(--green)"],
                ["Submissions", selectedUser.admin_progress?.totalSubmissions || 0, "var(--accent3)"],
                ["Streak", selectedUser.streak || 0, "var(--orange)"],
              ].map(([label,value,color]) => (
                <Card key={label} style={{ textAlign:"center",padding:12 }}>
                  <div style={{ fontSize:18,fontWeight:800,color }}>{value}</div>
                  <div style={{ fontSize:10,color:"var(--text3)" }}>{label}</div>
                </Card>
              ))}
            </div>

            <Card>
              <SectionHeader title="Course Progress" />
              {(selectedUser.admin_progress?.courseProgress || []).length === 0 ? (
                <div style={{ fontSize:12,color:"var(--text3)" }}>No course progress yet.</div>
              ) : selectedUser.admin_progress.courseProgress.map(c => (
                <div key={c.course_id} style={{ display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid rgba(42,58,92,.4)",fontSize:12 }}>
                  <span>{c.course_id}</span>
                  <span style={{ color:"var(--accent3)",fontWeight:700 }}>{c.progress_pct || 0}% · {(c.completed_lessons || []).length} lessons</span>
                </div>
              ))}
            </Card>

            <div className="grid-2">
              <Card>
                <SectionHeader title="Recent Submissions" />
                {(selectedUser.admin_progress?.submissions || []).slice(0,6).map(s => (
                  <div key={`${s.problem_id}-${s.created_at}`} style={{ display:"flex",justifyContent:"space-between",gap:8,padding:"7px 0",borderBottom:"1px solid rgba(42,58,92,.4)",fontSize:11 }}>
                    <span>#{s.problem_id} {s.problem_title || "Problem"}</span>
                    <span style={{ color:s.verdict==="Accepted"?"var(--green)":"var(--red)",fontWeight:700 }}>{s.verdict}</span>
                  </div>
                ))}
                {(selectedUser.admin_progress?.submissions || []).length === 0 && <div style={{ fontSize:12,color:"var(--text3)" }}>No submissions yet.</div>}
              </Card>
              <Card>
                <SectionHeader title="Quiz History" />
                {(selectedUser.admin_progress?.quizResults || []).slice(0,6).map(q => (
                  <div key={`${q.topic}-${q.created_at}`} style={{ display:"flex",justifyContent:"space-between",gap:8,padding:"7px 0",borderBottom:"1px solid rgba(42,58,92,.4)",fontSize:11 }}>
                    <span>{q.topic}</span>
                    <span style={{ color:"var(--accent3)",fontWeight:700 }}>{q.score}/{q.total} · {q.accuracy}%</span>
                  </div>
                ))}
                {(selectedUser.admin_progress?.quizResults || []).length === 0 && <div style={{ fontSize:12,color:"var(--text3)" }}>No quiz attempts yet.</div>}
              </Card>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={problemModal} onClose={() => setProblemModal(false)} title={editingProblemId ? "Edit Problem" : "Add Problem"} width={560}>
        <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
          <Input label="Title" value={problemForm.title} onChange={e=>setProblemForm(f=>({...f,title:e.target.value}))} />
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
            <div>
              <label>Difficulty</label>
              <select value={problemForm.difficulty} onChange={e=>setProblemForm(f=>({...f,difficulty:e.target.value}))}>
                {["Easy","Medium","Hard"].map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <Input label="XP" type="number" value={problemForm.xp} onChange={e=>setProblemForm(f=>({...f,xp:e.target.value}))} />
            <Input label="Acceptance %" type="number" value={problemForm.acceptance} onChange={e=>setProblemForm(f=>({...f,acceptance:e.target.value}))} />
            <Input label="Companies" value={problemForm.companies} onChange={e=>setProblemForm(f=>({...f,companies:e.target.value}))} placeholder="Google, Frontend" />
          </div>
          <Input label="Topics" value={problemForm.topics} onChange={e=>setProblemForm(f=>({...f,topics:e.target.value}))} placeholder="Array, DP, React" />
          <div style={{ display:"flex",gap:8,justifyContent:"flex-end",marginTop:6 }}>
            <Button variant="outline" onClick={() => setProblemModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={saveProblem}>{editingProblemId ? "Save Problem" : "Add Problem"}</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={courseModal} onClose={() => setCourseModal(false)} title={editingCourseId ? "Edit Course" : "Add Course"} width={600}>
        <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
          <div style={{ display:"grid",gridTemplateColumns:"80px 1fr",gap:12 }}>
            <Input label="Icon" value={courseForm.icon} onChange={e=>setCourseForm(f=>({...f,icon:e.target.value}))} />
            <Input label="Title" value={courseForm.title} onChange={e=>setCourseForm(f=>({...f,title:e.target.value}))} />
          </div>
          <div>
            <label>Description</label>
            <textarea rows={3} value={courseForm.description} onChange={e=>setCourseForm(f=>({...f,description:e.target.value}))} style={{ resize:"none" }} />
          </div>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12 }}>
            <div>
              <label>Level</label>
              <select value={courseForm.level} onChange={e=>setCourseForm(f=>({...f,level:e.target.value}))}>
                {["Beginner","Intermediate","Advanced"].map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <Input label="Lessons" type="number" value={courseForm.totalLessons} onChange={e=>setCourseForm(f=>({...f,totalLessons:e.target.value}))} />
            <Input label="Hours" type="number" value={courseForm.estimatedHours} onChange={e=>setCourseForm(f=>({...f,estimatedHours:e.target.value}))} />
          </div>
          <Input label="Tags" value={courseForm.tags} onChange={e=>setCourseForm(f=>({...f,tags:e.target.value}))} placeholder="React, API, SQL" />
          <div style={{ display:"flex",gap:8,justifyContent:"flex-end",marginTop:6 }}>
            <Button variant="outline" onClick={() => setCourseModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={saveCourse}>{editingCourseId ? "Save Course" : "Add Course"}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
