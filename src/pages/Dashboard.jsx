// src/pages/Dashboard.jsx — Premium, elegant, fully-working dashboard
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import useStore from "../context/useStore";
import { Card, ProgressBar, ActivityHeatmap, SectionHeader, DifficultyTag, Tag } from "../components/UI";
import { getActivityData, getAllCourseProgress } from "../services/supabase";
import { getAllCourses, getAllProblems } from "../utils/adminContent";

const FEATURE_CARDS = [
  { icon:"🤖", label:"AI Assistant",  to:"/ai-assistant", color:"#6366f1", desc:"Chat with your AI tutor"      },
  { icon:"✨", label:"AI Roadmap",    to:"/ai-roadmap",   color:"#a855f7", desc:"Generate a career roadmap"    },
  { icon:"🏆", label:"Certificates",  to:"/certificates", color:"#f59e0b", desc:"Earn & download certs"        },
  { icon:"💬", label:"Forum",         to:"/forum",        color:"#10b981", desc:"Ask the community"            },
  { icon:"🗺️", label:"Roadmap",       to:"/roadmap",      color:"#22d3ee", desc:"Visual learning path"         },
  { icon:"📊", label:"Leaderboard",   to:"/leaderboard",  color:"#ec4899", desc:"See where you rank"           },
];

export default function Dashboard() {
  const { user, userProfile, progressRevision } = useStore();
  useStore(state => state.contentRevision);
  const navigate = useNavigate();
  const location = useLocation();
  const [heatmap, setHeatmap] = useState({});
  const [loadingHeat, setLoadingHeat] = useState(true);
  const [courseProgress, setCourseProgress] = useState({});
  const allProblems = getAllProblems();
  const allCourses = getAllCourses();

  const name   = userProfile?.display_name?.split(" ")[0] || "Coder";
  const xp     = userProfile?.xp     || 0;
  const level  = userProfile?.level  || 1;
  const streak = userProfile?.streak || 0;
  const solved = (userProfile?.solved_problems || []).length;
  const xpIntoLevel  = xp % 500;
  const xpProgress   = Math.min(100, Math.round(xpIntoLevel / 5));
  const xpToNextLevel= 500 - xpIntoLevel;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  useEffect(() => {
    if (!user?.uid) return;
    let active = true;
    user.getIdToken()
      .then(idToken => getActivityData(idToken))
      .then(data => { if (active) setHeatmap(data); })
      .catch(() => { if (active) setHeatmap({}); })
      .finally(() => { if (active) setLoadingHeat(false); });
    return () => { active = false; };
  }, [user, location.key, progressRevision]);

  useEffect(() => {
    if (!user?.uid) { setCourseProgress({}); return; }
    let active = true;
    user.getIdToken().then(getAllCourseProgress).then(rows => {
      const map = {};
      rows.forEach(row => { map[row.course_id] = row.progress_pct || 0; });
      if (active) setCourseProgress(map);
    }).catch(() => { if (active) setCourseProgress({}); });
    return () => { active = false; };
  }, [user, progressRevision]);

  const todayIdx     = new Date().getDate() % allProblems.length;
  const dailyProblem = allProblems[todayIdx];
  const solvedSet    = new Set(userProfile?.solved_problems || []);
  const recommended  = allProblems.filter(p => !solvedSet.has(p.id)).slice(0, 4);
  const featuredCourses = allCourses.slice(0, 3);

  const stats = [
    {
      label: "Problems Solved", value: solved,
      color: "var(--green)", icon: "✅",
      sub: `${allProblems.length - solved} remaining`,
      progress: Math.round(solved / allProblems.length * 100),
      progressColor: "var(--green)",
    },
    {
      label: `Level ${level}`, value: `${xp.toLocaleString()} XP`,
      color: "var(--yellow)", icon: "⚡",
      sub: `${xpToNextLevel} XP to Lv.${level + 1}`,
      progress: xpProgress,
      progressColor: "var(--yellow)",
    },
    {
      label: "Day Streak", value: streak,
      color: "var(--orange)", icon: "🔥",
      sub: streak === 0 ? "Solve today to start!" : streak >= 7 ? "On fire! 🔥" : "Keep going!",
    },
  ];

  return (
    <div className="page-container fade-in">

      {/* ── Hero ── */}
      <motion.div initial={{ opacity:0, y:-12 }} animate={{ opacity:1, y:0 }}
        style={{ marginBottom:28, display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:14 }}>
        <div>
          <p style={{ fontSize:12, color:"var(--text3)", marginBottom:4, fontWeight:600, letterSpacing:".04em", textTransform:"uppercase" }}>
            {greeting} 👋
          </p>
          <h1 style={{ fontSize:"clamp(20px,4vw,30px)", marginBottom:8 }}>
            Welcome back, <span className="gradient-text">{name}</span>!
          </h1>
          <p style={{ fontSize:13, margin:0, maxWidth:480 }}>
            {solved === 0
              ? "🚀 You're all set. Solve your first problem to start earning XP and building your streak!"
              : streak > 0
              ? `🔥 You're on a ${streak}-day streak — keep it alive by solving at least one problem today.`
              : "✅ Great progress! Solve a problem today to restart your streak."}
          </p>
        </div>
        <div style={{ display:"flex", gap:8, flexShrink:0, flexWrap:"wrap" }}>
          <button className="btn btn-primary" onClick={() => navigate("/problems")}>
            🧩 Solve Now
          </button>
          <button className="btn btn-secondary" onClick={() => navigate("/ai-assistant")}>
            🤖 Ask AI
          </button>
        </div>
      </motion.div>

      {/* ── Stats Row ── */}
      <div className="grid-4" style={{ marginBottom:20 }}>
        {stats.map((s, i) => (
          <motion.div key={i} initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} transition={{ delay: i * 0.08 }}>
            <div className="card glass-card-glow" style={{ borderLeft:`3px solid ${s.color}`, padding:"16px 18px", cursor:"default" }}>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
                <span style={{ fontSize:20 }}>{s.icon}</span>
                <span style={{ fontSize:10, color:"var(--text3)", fontWeight:600, textTransform:"uppercase", letterSpacing:".06em" }}>{s.label}</span>
              </div>
              <div style={{ fontSize:24, fontWeight:800, color:s.color, marginBottom:4 }}>{s.value}</div>
              <div style={{ fontSize:11, color:"var(--text3)", marginBottom:s.progress !== undefined ? 8 : 0 }}>{s.sub}</div>
              {s.progress !== undefined && (
                <ProgressBar value={s.progress} color={`linear-gradient(90deg,${s.progressColor},${s.progressColor}88)`} />
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Feature Quick-Access ── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(170px,1fr))", gap:10, marginBottom:20 }}>
        {FEATURE_CARDS.map(({ icon, label, to, color, desc }, i) => (
          <motion.div key={to} initial={{ opacity:0, scale:.95 }} animate={{ opacity:1, scale:1 }} transition={{ delay:.1 + i*.04 }}
            onClick={() => navigate(to)}
            className="card glass-card-glow"
            style={{
              display:"flex", alignItems:"center", gap:12, padding:"13px 14px",
              borderLeft:`3px solid ${color}`, borderRadius:12, cursor:"pointer",
            }}
          >
            <div style={{ width:38, height:38, borderRadius:10, background:`${color}18`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>
              {icon}
            </div>
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:"var(--text)" }}>{label}</div>
              <div style={{ fontSize:10, color:"var(--text3)", marginTop:1 }}>{desc}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Daily Challenge + Courses ── */}
      <div className="grid-2" style={{ marginBottom:20 }}>
        {/* Daily Challenge */}
        <Card className="glass-card-glow" style={{ borderLeft:`3px solid var(--yellow)` }}>
          <SectionHeader
            title="🎯 Daily Challenge"
            sub={`2× XP bonus today · ${new Date().toLocaleDateString("en-US",{weekday:"long",month:"short",day:"numeric"})}`}
            action={<DifficultyTag difficulty={dailyProblem.difficulty} />}
          />
          <div style={{ padding:"14px 0 10px" }}>
            <h3 style={{ marginBottom:8, fontSize:15 }}>
              #{dailyProblem.id}. {dailyProblem.title}
            </h3>
            <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:12 }}>
              {dailyProblem.topics.slice(0, 3).map(t => <Tag key={t}>{t}</Tag>)}
            </div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:8 }}>
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <span style={{ fontSize:11, color:"var(--yellow)", fontWeight:700 }}>⚡ +{dailyProblem.xp * 2} XP bonus</span>
                <span style={{ fontSize:11, color:"var(--text3)" }}>Acceptance: {dailyProblem.acceptance}%</span>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => navigate(`/editor/${dailyProblem.id}`)}>
                Solve Now →
              </button>
            </div>
          </div>
          {/* Companies */}
          {dailyProblem.companies?.length > 0 && (
            <div style={{ borderTop:"1px solid var(--border)", paddingTop:10, marginTop:6, display:"flex", gap:5, flexWrap:"wrap" }}>
              {dailyProblem.companies.slice(0, 4).map(c => (
                <span key={c} style={{ fontSize:10, padding:"2px 7px", background:"var(--bg3)", border:"1px solid var(--border)", borderRadius:10, color:"var(--text3)" }}>
                  {c}
                </span>
              ))}
            </div>
          )}
        </Card>

        {/* Enrolled Courses */}
        <Card>
          <SectionHeader
            title="📚 Your Courses"
            action={<Link to="/courses" style={{ fontSize:11, color:"var(--accent3)", fontWeight:600 }}>Browse all →</Link>}
          />
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {featuredCourses.map(c => (
              <div key={c.id} onClick={() => navigate(`/courses/${c.id}`)}
                style={{
                  display:"flex", alignItems:"center", gap:12,
                  padding:"11px 12px", background:"var(--bg3)",
                  borderRadius:10, cursor:"pointer", border:"1px solid var(--border)", transition:"all .15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent2)"; e.currentTarget.style.background = "var(--glass-bg)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--bg3)"; }}
              >
                <div style={{ fontSize:26, flexShrink:0 }}>{c.icon}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12, fontWeight:700, marginBottom:4, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.title}</div>
                  <ProgressBar value={courseProgress[c.id] || 0} height={5} />
                  <div style={{ fontSize:10, color:"var(--text3)", marginTop:3, display:"flex", gap:8 }}>
                    <span>{courseProgress[c.id] || 0}% complete</span>
                    <span>·</span>
                    <span>{c.totalLessons} lessons</span>
                    <span>·</span>
                    <span>⭐ {c.rating}</span>
                  </div>
                </div>
                <span style={{ color:"var(--text3)", fontSize:16, flexShrink:0 }}>›</span>
              </div>
            ))}
            {featuredCourses.length === 0 && (
              <div style={{ textAlign:"center", padding:"20px 0", color:"var(--text3)", fontSize:12 }}>
                No courses yet — <Link to="/courses" style={{ color:"var(--accent3)" }}>browse courses</Link>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* ── Activity Heatmap ── */}
      <Card style={{ marginBottom:20 }}>
        <SectionHeader
          title="📅 Coding Activity"
          sub={Object.keys(heatmap).length === 0 ? "Your submissions will appear here" : "GitHub-style activity calendar"}
        />
        {loadingHeat ? (
          <div style={{ textAlign:"center", padding:24, color:"var(--text3)", fontSize:12 }}>
            <div className="spin-anim" style={{ width:20, height:20, border:"2px solid var(--border)", borderTopColor:"var(--accent)", borderRadius:"50%", margin:"0 auto 8px" }} />
            Loading activity...
          </div>
        ) : <ActivityHeatmap data={heatmap} />}
      </Card>

      {/* ── Recommended + Getting Started ── */}
      <div className="grid-2">
        <Card>
          <SectionHeader
            title="💡 Recommended Problems"
            action={<Link to="/problems" style={{ fontSize:11, color:"var(--accent3)", fontWeight:600 }}>All problems →</Link>}
          />
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {recommended.length === 0 ? (
              <div style={{ textAlign:"center", padding:"24px 0", color:"var(--green)", fontWeight:700, fontSize:13 }}>
                🎉 You've solved all problems!
              </div>
            ) : recommended.map(p => (
              <div key={p.id} onClick={() => navigate(`/editor/${p.id}`)}
                style={{
                  display:"flex", alignItems:"center", gap:10, padding:"10px 12px",
                  background:"var(--bg3)", borderRadius:10, cursor:"pointer",
                  border:"1px solid var(--border)", transition:"all .15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent2)"; e.currentTarget.style.background = "var(--glass-bg)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--bg3)"; }}
              >
                <span style={{ fontSize:11, color:"var(--text3)", width:30, flexShrink:0 }}>#{p.id}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12, fontWeight:600, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.title}</div>
                  <div style={{ fontSize:10, color:"var(--text3)", marginTop:2 }}>{p.topics.slice(0, 2).join(" · ")}</div>
                </div>
                <DifficultyTag difficulty={p.difficulty} />
                <span style={{ fontSize:11, color:"var(--yellow)", fontWeight:700, flexShrink:0 }}>+{p.xp}</span>
              </div>
            ))}
          </div>
        </Card>

        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {/* Getting started checklist */}
          <Card>
            <SectionHeader title="🚀 Getting Started" sub={`${[solved>=1,streak>=3].filter(Boolean).length}/2 complete`} />
            {[
              { label:"Solve your first problem",  done:solved >= 1,   link:"/problems",     icon:"🧩" },
              { label:"Build a 3-day streak",       done:streak >= 3,   link:"/problems",     icon:"🔥" },
              { label:"Complete a quiz",            done:false,          link:"/quiz",         icon:"🎯" },
              { label:"Enroll in a course",         done:Object.keys(courseProgress).length > 0, link:"/courses", icon:"📚" },
              { label:"Join the forum",             done:false,          link:"/forum",        icon:"💬" },
              { label:"Generate AI roadmap",        done:false,          link:"/ai-roadmap",   icon:"✨" },
            ].map(({ label, done, link, icon }) => (
              <div key={label}
                onClick={() => !done && navigate(link)}
                style={{
                  display:"flex", alignItems:"center", gap:10, padding:"9px 10px",
                  background:"var(--bg3)", borderRadius:8, cursor:done?"default":"pointer",
                  marginBottom:5, border:"1px solid var(--border)",
                  opacity:done ? 0.65 : 1, transition:"all .15s",
                }}
                onMouseEnter={e => !done && (e.currentTarget.style.borderColor = "var(--accent2)")}
                onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
              >
                <span style={{ fontSize:15 }}>{done ? "✅" : icon}</span>
                <span style={{ fontSize:12, fontWeight:500, flex:1, textDecoration:done?"line-through":"none", color:done?"var(--text3)":"var(--text)" }}>
                  {label}
                </span>
                {!done && <span style={{ fontSize:12, color:"var(--accent3)" }}>→</span>}
              </div>
            ))}
          </Card>

        </div>
      </div>
    </div>
  );
}
