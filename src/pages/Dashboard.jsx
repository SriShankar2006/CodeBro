// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import useStore from "../context/useStore";
import { StatCard, Card, ProgressBar, ActivityHeatmap, SectionHeader, DifficultyTag, Tag } from "../components/UI";
import { getActivityData } from "../services/supabase";
import { PROBLEMS } from "../data/problems";
import { COURSES } from "../data/courses";

export default function Dashboard() {
  const { user, userProfile } = useStore();
  const navigate = useNavigate();
  const [heatmap, setHeatmap] = useState({});
  const [loadingHeat, setLoadingHeat] = useState(true);

  const name   = userProfile?.display_name?.split(" ")[0] || "Coder";
  const xp     = userProfile?.xp     || 0;
  const level  = userProfile?.level  || 1;
  const streak = userProfile?.streak || 0;
  const solved = (userProfile?.solved_problems || []).length;
  const badges = (userProfile?.badges || []).length;
  const nextLevelXP = level * 500;
  const xpProgress  = Math.min(100, Math.round((xp % 500) / 5));

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  // Load REAL heatmap from Supabase — 0 for new user
  useEffect(() => {
    if (!user?.uid) return;
    (async () => {
      setLoadingHeat(true);
      try { setHeatmap(await getActivityData(user.uid)); }
      catch  { setHeatmap({}); }
      finally { setLoadingHeat(false); }
    })();
  }, [user?.uid]);

  // Daily challenge — pick a problem based on today's date
  const todayIdx   = new Date().getDate() % PROBLEMS.length;
  const dailyProblem = PROBLEMS[todayIdx];

  // Recommended — problems user hasn't solved yet
  const solvedSet = new Set(userProfile?.solved_problems || []);
  const recommended = PROBLEMS.filter(p => !solvedSet.has(p.id)).slice(0, 4);

  // Course progress — fresh (0%) for new user since it reads from Supabase
  const featuredCourses = COURSES.slice(0, 2);

  const stats = [
    { label:"Problems Solved", value: solved || 0,       color:"var(--green)",  icon:"✅", sub: solved === 0 ? "Start solving!" : `${Math.round(solved/PROBLEMS.length*100)}% of ${PROBLEMS.length}` },
    { label:`Level ${level}`,  value:`${xp} XP`,         color:"var(--yellow)", icon:"⚡", sub:`${nextLevelXP - (xp%500)} XP to Lv.${level+1}` },
    { label:"Day Streak",      value:`🔥 ${streak}`,     color:"var(--orange)", icon:"🔥", sub: streak === 0 ? "Solve today to start!" : "Keep it up!" },
    { label:"Badges Earned",   value: badges,             color:"var(--purple)", icon:"🏅", sub: badges === 0 ? "Solve to earn badges!" : `${badges} earned` },
  ];

  return (
    <div className="page-container fade-in">
      {/* Hero header */}
      <motion.div initial={{ opacity:0,y:-10 }} animate={{ opacity:1,y:0 }}
        style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:26,flexWrap:"wrap",gap:12 }}>
        <div>
          <h1 style={{ fontSize:24, marginBottom:4 }}>
            {greeting}, <span className="gradient-text">{name}</span>! 👋
          </h1>
          <p style={{ fontSize:13, margin:0 }}>
            {solved === 0
              ? "Welcome to CodeBro! Let's solve your first problem."
              : streak > 0
              ? `You're on a ${streak}-day streak. Keep the momentum going!`
              : "Solve a problem today to start your streak!"}
          </p>
        </div>
        <div style={{ display:"flex",gap:10 }}>
          <button className="btn btn-primary" onClick={() => navigate("/problems")}>🧩 Solve Problems</button>
          <button className="btn btn-outline" onClick={() => navigate("/courses")}>📚 Browse Courses</button>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom:20 }}>
        {stats.map((s, i) => (
          <motion.div key={i} initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*.07 }}>
            <StatCard {...s}>
              {i === 1 && <div style={{ marginTop:8 }}><ProgressBar value={xpProgress} color="linear-gradient(90deg,var(--yellow),var(--orange))" /></div>}
            </StatCard>
          </motion.div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom:20 }}>
        {/* Daily Challenge */}
        <Card style={{ borderLeft:`3px solid var(--yellow)` }}>
          <SectionHeader title="🎯 Daily Challenge" sub="Complete for 2× XP bonus"
            action={<DifficultyTag difficulty={dailyProblem.difficulty} />} />
          <h3 style={{ marginBottom:8 }}>{dailyProblem.id}. {dailyProblem.title}</h3>
          <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:12 }}>
            {dailyProblem.topics.slice(0,3).map(t => <Tag key={t}>{t}</Tag>)}
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span style={{ fontSize:11, color:"var(--text3)" }}>⚡ +{dailyProblem.xp * 2} XP bonus</span>
            <button className="btn btn-primary btn-sm" onClick={() => navigate(`/editor/${dailyProblem.id}`)}>Solve Now →</button>
          </div>
        </Card>

        {/* Featured Courses */}
        <Card>
          <SectionHeader title="📚 Featured Courses" action={<Link to="/courses" style={{ fontSize:11, color:"var(--accent3)" }}>All courses →</Link>} />
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {featuredCourses.map(c => (
              <div key={c.id} onClick={() => navigate(`/courses/${c.id}`)}
                style={{ display:"flex",alignItems:"center",gap:12,padding:10,background:"var(--bg3)",borderRadius:8,cursor:"pointer",border:"1px solid var(--border)",transition:"border-color .15s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor="var(--accent)"}
                onMouseLeave={e => e.currentTarget.style.borderColor="var(--border)"}
              >
                <div style={{ fontSize:26 }}>{c.icon}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, fontWeight:700, marginBottom:3 }}>{c.title}</div>
                  {/* Fresh for new user — 0% progress */}
                  <ProgressBar value={solvedSet.size === 0 ? 0 : 0} />
                  <div style={{ fontSize:10, color:"var(--text3)", marginTop:3 }}>{c.totalLessons} lessons · {c.estimatedHours}h · ⭐{c.rating}</div>
                </div>
                <span style={{ fontSize:18, color:"var(--text3)" }}>›</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Activity Heatmap — real data from Supabase */}
      <Card style={{ marginBottom:20 }}>
        <SectionHeader title="📅 Coding Activity" sub={solved === 0 ? "Your activity will appear here after your first submission" : undefined} />
        {loadingHeat ? (
          <div style={{ textAlign:"center", padding:20, color:"var(--text3)", fontSize:12 }}>Loading activity...</div>
        ) : (
          <ActivityHeatmap data={heatmap} />
        )}
      </Card>

      <div className="grid-2">
        {/* Recommended problems */}
        <Card>
          <SectionHeader title="💡 Recommended Problems"
            action={<Link to="/problems" style={{ fontSize:11, color:"var(--accent3)" }}>All →</Link>} />
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            {recommended.length === 0 ? (
              <div style={{ textAlign:"center", padding:20, color:"var(--green)", fontWeight:600, fontSize:13 }}>🎉 You've solved all problems!</div>
            ) : recommended.map(p => (
              <div key={p.id} onClick={() => navigate(`/editor/${p.id}`)}
                style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:"var(--bg3)",borderRadius:8,cursor:"pointer",border:"1px solid var(--border)",transition:"border-color .15s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor="var(--accent)"}
                onMouseLeave={e => e.currentTarget.style.borderColor="var(--border)"}
              >
                <span style={{ fontSize:11, color:"var(--text3)", width:28 }}>#{p.id}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, fontWeight:600 }}>{p.title}</div>
                  <div style={{ fontSize:10, color:"var(--text3)", marginTop:2 }}>{p.topics.slice(0,2).join(" · ")}</div>
                </div>
                <DifficultyTag difficulty={p.difficulty} />
                <span style={{ fontSize:11, color:"var(--yellow)", fontWeight:600 }}>+{p.xp}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Getting started / Progress */}
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <Card>
            <SectionHeader title="🚀 Getting Started" />
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {[
                { label:"Solve your first problem", done: solved >= 1,  link:"/problems" },
                { label:"Complete a quiz",           done: false,         link:"/quiz" },
                { label:"Watch a course lesson",     done: false,         link:"/courses" },
                { label:"Join the forum",            done: false,         link:"/forum" },
                { label:"Build a 3-day streak",      done: streak >= 3,   link:"/problems" },
              ].map(({ label, done, link }) => (
                <div key={label} onClick={() => !done && navigate(link)}
                  style={{ display:"flex",alignItems:"center",gap:10,padding:"9px 10px",background:"var(--bg3)",borderRadius:8,cursor:done?"default":"pointer",opacity:done?0.7:1 }}>
                  <span style={{ fontSize:16, color: done ? "var(--green)" : "var(--text3)" }}>{done ? "✅" : "⭕"}</span>
                  <span style={{ fontSize:12, fontWeight:500, textDecoration: done ? "line-through" : "none", color: done ? "var(--text3)" : "var(--text)" }}>{label}</span>
                  {!done && <span style={{ marginLeft:"auto", fontSize:11, color:"var(--accent3)" }}>→</span>}
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <SectionHeader title="🏅 Badges" sub={badges === 0 ? "Solve problems to earn badges" : undefined} />
            {badges === 0 ? (
              <div style={{ textAlign:"center", padding:"16px 0", color:"var(--text3)", fontSize:12 }}>
                <div style={{ fontSize:32, marginBottom:8 }}>🏅</div>
                Your earned badges will appear here
              </div>
            ) : (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
                {(userProfile?.badges || []).slice(0,8).map(b => (
                  <div key={b} style={{ textAlign:"center" }}>
                    <div className="badge-icon" style={{ margin:"0 auto 4px" }}>🏅</div>
                    <div style={{ fontSize:10, color:"var(--text2)" }}>{b}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
