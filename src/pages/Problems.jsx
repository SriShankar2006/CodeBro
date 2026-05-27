// src/pages/Problems.jsx
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import useStore from "../context/useStore";
import { DifficultyTag, Tag, Card, TabBar, ProgressBar } from "../components/UI";
import { PROBLEMS, ALL_TOPICS } from "../data/problems";

export default function Problems() {
  const navigate = useNavigate();
  const { userProfile } = useStore();
  const solvedSet = new Set(userProfile?.solved_problems || []);

  const [search,     setSearch]     = useState("");
  const [topic,      setTopic]      = useState("All");
  const [difficulty, setDifficulty] = useState("All");
  const [sort,       setSort]       = useState("Default");
  const [tab,        setTab]        = useState("All Problems");
  const [company,    setCompany]    = useState("All");

  const companies = ["All","Google","Amazon","Facebook","Microsoft","Apple","Bloomberg","Adobe","LinkedIn","Uber","Netflix","Frontend","Backend","Full Stack","DevOps","ML"];

  const filtered = useMemo(() => {
    let list = [...PROBLEMS];
    if (tab === "Solved")     list = list.filter(p => solvedSet.has(p.id));
    if (tab === "Unsolved")   list = list.filter(p => !solvedSet.has(p.id));
    if (tab === "Easy")       list = list.filter(p => p.difficulty === "Easy");
    if (tab === "Medium")     list = list.filter(p => p.difficulty === "Medium");
    if (tab === "Hard")       list = list.filter(p => p.difficulty === "Hard");
    if (search)               list = list.filter(p => p.title.toLowerCase().includes(search.toLowerCase()) || String(p.id).includes(search));
    if (topic !== "All")      list = list.filter(p => p.topics.some(t => t === topic));
    if (difficulty !== "All") list = list.filter(p => p.difficulty === difficulty);
    if (company !== "All")    list = list.filter(p => p.companies?.includes(company));
    if (sort === "Acc ↑")     list.sort((a,b) => a.acceptance - b.acceptance);
    if (sort === "Acc ↓")     list.sort((a,b) => b.acceptance - a.acceptance);
    if (sort === "Difficulty") list.sort((a,b) => ["Easy","Medium","Hard"].indexOf(a.difficulty) - ["Easy","Medium","Hard"].indexOf(b.difficulty));
    if (sort === "XP ↓")      list.sort((a,b) => b.xp - a.xp);
    return list;
  }, [search, topic, difficulty, sort, tab, company, solvedSet]);

  const easySolved   = PROBLEMS.filter(p => p.difficulty==="Easy"   && solvedSet.has(p.id)).length;
  const mediumSolved = PROBLEMS.filter(p => p.difficulty==="Medium" && solvedSet.has(p.id)).length;
  const hardSolved   = PROBLEMS.filter(p => p.difficulty==="Hard"   && solvedSet.has(p.id)).length;
  const easyTotal    = PROBLEMS.filter(p => p.difficulty==="Easy").length;
  const mediumTotal  = PROBLEMS.filter(p => p.difficulty==="Medium").length;
  const hardTotal    = PROBLEMS.filter(p => p.difficulty==="Hard").length;

  return (
    <div className="page-container fade-in">
      <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:12 }}>
        <div>
          <h2>Problem Set</h2>
          <p style={{ fontSize:12, marginTop:2 }}>{PROBLEMS.length} problems · {solvedSet.size} solved ({Math.round(solvedSet.size/PROBLEMS.length*100)}%)</p>
        </div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          <input type="text" placeholder="🔍 Search problems or #id..." value={search} onChange={e=>setSearch(e.target.value)} style={{ width:230 }} />
          <select value={difficulty} onChange={e=>setDifficulty(e.target.value)} style={{ width:120 }}>
            {["All","Easy","Medium","Hard"].map(d => <option key={d}>{d}</option>)}
          </select>
          <select value={company} onChange={e=>setCompany(e.target.value)} style={{ width:130 }}>
            {companies.map(c => <option key={c}>{c}</option>)}
          </select>
          <select value={sort} onChange={e=>setSort(e.target.value)} style={{ width:120 }}>
            {["Default","Acc ↑","Acc ↓","Difficulty","XP ↓"].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Progress cards */}
      <div style={{ display:"flex", gap:10, marginBottom:18, flexWrap:"wrap" }}>
        {[
          { label:"Easy",   solved:easySolved,   total:easyTotal,   color:"var(--green)",  bg:"rgba(16,185,129,.1)",  border:"rgba(16,185,129,.25)"  },
          { label:"Medium", solved:mediumSolved, total:mediumTotal, color:"var(--yellow)", bg:"rgba(245,158,11,.1)",  border:"rgba(245,158,11,.25)"  },
          { label:"Hard",   solved:hardSolved,   total:hardTotal,   color:"var(--red)",    bg:"rgba(239,68,68,.1)",   border:"rgba(239,68,68,.25)"   },
          { label:"Total",  solved:solvedSet.size,total:PROBLEMS.length,color:"var(--accent3)",bg:"var(--bg3)", border:"var(--border)" },
        ].map(({ label,solved,total,color,bg,border }) => (
          <div key={label} style={{ flex:1,minWidth:100,background:bg,border:`1px solid ${border}`,borderRadius:10,padding:"12px 14px",textAlign:"center" }}>
            <div style={{ fontSize:20,fontWeight:800,color }}>{solved}<span style={{ fontSize:13,color:"var(--text3)",fontWeight:400 }}>/{total}</span></div>
            <div style={{ fontSize:10,color:"var(--text3)",marginTop:2 }}>{label}</div>
            <ProgressBar value={total?solved/total*100:0} color={`linear-gradient(90deg,${color},${color}88)`} height={4} />
          </div>
        ))}
      </div>

      {/* Topic pills */}
      <div style={{ display:"flex", gap:5, flexWrap:"wrap", marginBottom:14 }}>
        {["All",...ALL_TOPICS.slice(0,14)].map(t => (
          <div key={t} onClick={() => setTopic(t)} className="tag"
            style={{ cursor:"pointer",padding:"5px 12px",transition:"all .15s",
              background: topic===t ? "var(--accent2)" : "rgba(99,102,241,.1)",
              color:      topic===t ? "#fff"            : "var(--accent3)",
            }}>{t}</div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ marginBottom:14 }}>
        <TabBar tabs={["All Problems","Solved","Unsolved","Easy","Medium","Hard"]} active={tab} onChange={setTab} />
      </div>

      {/* Table */}
      <Card style={{ padding:0, overflow:"hidden" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width:50 }}>#</th>
              <th>Title</th>
              <th>Acceptance</th>
              <th>Difficulty</th>
              <th>Topics</th>
              <th>XP</th>
              <th style={{ width:60 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <motion.tr key={p.id} className="clickable"
                initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:Math.min(i*.02,.3) }}
                onClick={() => navigate(`/editor/${p.id}`)}>
                <td style={{ color:"var(--text3)", fontFamily:"var(--font-mono)" }}>{p.id}</td>
                <td>
                  <div style={{ fontWeight:600 }}>{p.title}</div>
                  <div style={{ fontSize:10, color:"var(--text3)", marginTop:2 }}>
                    {p.companies?.slice(0,2).map(c => (
                      <span key={c} style={{ marginRight:5 }}>🏢{c}</span>
                    ))}
                  </div>
                </td>
                <td style={{ color:"var(--text3)", fontFamily:"var(--font-mono)" }}>{p.acceptance.toFixed(1)}%</td>
                <td><DifficultyTag difficulty={p.difficulty} /></td>
                <td>
                  {p.topics.slice(0,2).map(t => (
                    <span key={t} className="tag tag-blue" style={{ marginRight:4, fontSize:10 }}>{t}</span>
                  ))}
                </td>
                <td style={{ color:"var(--yellow)", fontWeight:700, fontSize:11 }}>+{p.xp}</td>
                <td style={{ textAlign:"center" }}>
                  {solvedSet.has(p.id)
                    ? <span style={{ color:"var(--green)", fontSize:16 }}>✓</span>
                    : <span style={{ color:"var(--text3)", fontSize:14 }}>○</span>}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ textAlign:"center", padding:40, color:"var(--text3)" }}>
            <div style={{ fontSize:36, marginBottom:10 }}>🔍</div>
            No problems match your filters
          </div>
        )}
      </Card>
    </div>
  );
}
