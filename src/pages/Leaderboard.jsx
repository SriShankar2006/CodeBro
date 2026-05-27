// src/pages/Leaderboard.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getLeaderboard } from "../services/supabase";
import { Card, TabBar, ProgressBar, Avatar } from "../components/UI";
import useStore from "../context/useStore";

const COLORS = ["var(--yellow)","var(--text2)","#cd7f32","var(--accent3)","var(--green)","var(--purple)","var(--pink)","var(--cyan)","var(--orange)","var(--blue)"];

function RankIcon({ rank }) {
  if (rank === 1) return <span style={{ fontSize:20 }}>🥇</span>;
  if (rank === 2) return <span style={{ fontSize:20 }}>🥈</span>;
  if (rank === 3) return <span style={{ fontSize:20 }}>🥉</span>;
  return <span style={{ fontSize:12,fontWeight:700,color:"var(--text3)",width:24,textAlign:"center",display:"inline-block" }}>{rank}</span>;
}

export default function Leaderboard() {
  const { user, userProfile } = useStore();
  const [tab,     setTab]     = useState("🌍 Global");
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await getLeaderboard(50);
        setLeaders(data.map((u,i) => ({ ...u, rank: i+1 })));
      } catch {
        // fallback demo data
        setLeaders([
          { uid:"u1", display_name:"Priya Sharma",  username:"priya_codes",  xp:12400, level:25, solved_problems:[1,2,3,4,5,6,7,8,9,10], streak:24, rank:1 },
          { uid:"u2", display_name:"Raj Kumar",     username:"raj_dev",      xp:10800, level:22, solved_problems:[1,2,3,4,5,6,7,8,9],    streak:18, rank:2 },
          { uid:"u3", display_name:"Sneha Patel",   username:"sneha_tech",   xp:9200,  level:19, solved_problems:[1,2,3,4,5,6,7,8],      streak:12, rank:3 },
          { uid:"u4", display_name:"Vikram Das",    username:"vikram_cpp",   xp:7800,  level:16, solved_problems:[1,2,3,4,5,6,7],        streak:9,  rank:4 },
          { uid:"u5", display_name:"Ananya Singh",  username:"ananya_ml",    xp:6500,  level:14, solved_problems:[1,2,3,4,5,6],          streak:7,  rank:5 },
          { uid:"u6", display_name:"Kiran Nair",    username:"kiran_go",     xp:5400,  level:12, solved_problems:[1,2,3,4,5],            streak:5,  rank:6 },
          { uid:"u7", display_name:"Rohan Verma",   username:"rohan_js",     xp:4200,  level:10, solved_problems:[1,2,3,4],              streak:3,  rank:7 },
          { uid:"u8", display_name:"Meera Krishnan",username:"meera_py",     xp:3100,  level:8,  solved_problems:[1,2,3],               streak:2,  rank:8 },
          { uid:"u9", display_name:"Dev Malhotra",  username:"dev_rust",     xp:2000,  level:5,  solved_problems:[1,2],                 streak:1,  rank:9 },
          { uid:"u10",display_name:"Aisha Khan",    username:"aisha_java",   xp:900,   level:3,  solved_problems:[1],                   streak:0,  rank:10 },
        ]);
      }
      setLoading(false);
    })();
  }, [tab]);

  const myRank = leaders.findIndex(l => l.uid === user?.uid) + 1;
  const myEntry = leaders.find(l => l.uid === user?.uid);
  const myXP   = userProfile?.xp || 0;

  const TOPIC_RANKS = [
    { topic:"Arrays & Hashing", rank:58,  pct:88, color:"var(--accent3)" },
    { topic:"Trees",            rank:91,  pct:78, color:"var(--green)"   },
    { topic:"Dynamic Programming",rank:234,pct:52,color:"var(--yellow)"  },
    { topic:"Graphs",           rank:412, pct:38, color:"var(--purple)"  },
  ];

  return (
    <div className="page-container fade-in">
      <h2 style={{ marginBottom:4 }}>📊 Global Leaderboard</h2>
      <p style={{ fontSize:12, marginBottom:20 }}>Top coders ranked by XP. Solve problems to climb the ranks!</p>

      <div style={{ display:"flex",gap:12,marginBottom:20,flexWrap:"wrap" }}>
        <div style={{ minWidth:260 }}>
          <TabBar tabs={["🌍 Global","📅 Weekly","👥 Friends"]} active={tab} onChange={setTab} />
        </div>
      </div>

      <div className="grid-2">
        {/* Main list */}
        <div>
          {/* Top 3 podium */}
          {!loading && leaders.length >= 3 && (
            <div style={{ display:"flex",gap:8,marginBottom:18,alignItems:"flex-end" }}>
              {[leaders[1],leaders[0],leaders[2]].map((u,i) => {
                const heights = [90,115,70];
                const podiumColors = ["var(--text2)","var(--yellow)","#cd7f32"];
                return (
                  <div key={u.uid} style={{ flex:1,textAlign:"center" }}>
                    <Avatar name={u.display_name} />
                    <div style={{ fontSize:11,fontWeight:700,marginTop:4,color:u.uid===user?.uid?"var(--accent3)":"var(--text)" }}>
                      {u.display_name}{u.uid===user?.uid&&" (You)"}
                    </div>
                    <div style={{ fontSize:10,color:"var(--text3)" }}>{(u.solved_problems||[]).length} solved</div>
                    <div style={{ height:heights[i],background:podiumColors[i],borderRadius:"8px 8px 0 0",marginTop:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:i===1?28:20 }}>
                      {["🥈","🥇","🥉"][i]}
                    </div>
                    <div style={{ background:"var(--bg3)",padding:4,fontSize:11,fontWeight:700,color:"var(--yellow)" }}>
                      {(u.xp||0).toLocaleString()} XP
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <Card style={{ padding:0,overflow:"hidden" }}>
            <div style={{ padding:"10px 16px",borderBottom:"1px solid var(--border)",display:"flex",justifyContent:"space-between",fontSize:11,color:"var(--text3)",fontWeight:600 }}>
              <span>Rank · User</span><span>XP · Solved</span>
            </div>
            {loading ? (
              Array.from({length:8}).map((_,i) => (
                <div key={i} style={{ padding:"12px 16px",borderBottom:"1px solid rgba(42,58,92,.4)",display:"flex",gap:12,alignItems:"center" }}>
                  <div className="skeleton" style={{ width:24,height:16,borderRadius:4 }} />
                  <div className="skeleton" style={{ width:32,height:32,borderRadius:"50%" }} />
                  <div style={{ flex:1 }}><div className="skeleton" style={{ width:"60%",height:12,marginBottom:4 }} /><div className="skeleton" style={{ width:"40%",height:10 }} /></div>
                  <div className="skeleton" style={{ width:60,height:12 }} />
                </div>
              ))
            ) : leaders.map((u,i) => (
              <motion.div key={u.uid} initial={{ opacity:0,x:-8 }} animate={{ opacity:1,x:0 }} transition={{ delay:i*.03 }}
                style={{ display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderBottom:"1px solid rgba(42,58,92,.4)",background:u.uid===user?.uid?"rgba(99,102,241,.06)":"transparent" }}>
                <div style={{ width:28,textAlign:"center",flexShrink:0 }}><RankIcon rank={u.rank} /></div>
                <div style={{ width:32,height:32,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,flexShrink:0,background:(COLORS[i]||"var(--accent)")+"22",color:COLORS[i]||"var(--accent)" }}>
                  {(u.display_name||"?")[0].toUpperCase()}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12,fontWeight:600 }}>
                    {u.display_name}
                    {u.uid===user?.uid&&<span style={{ fontSize:10,color:"var(--accent3)",marginLeft:6 }}>(You)</span>}
                  </div>
                  <div style={{ fontSize:10,color:"var(--text3)" }}>@{u.username} · Lv.{u.level||1}</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:12,fontWeight:700,color:"var(--yellow)" }}>{(u.xp||0).toLocaleString()} XP</div>
                  <div style={{ fontSize:10,color:"var(--text3)" }}>{(u.solved_problems||[]).length} solved</div>
                </div>
              </motion.div>
            ))}
          </Card>
        </div>

        {/* Right panel */}
        <div>
          {/* Your rank */}
          <Card style={{ marginBottom:14 }}>
            <h4 style={{ marginBottom:14 }}>📍 Your Position</h4>
            {myRank > 0 ? (
              <>
                <div style={{ display:"flex",alignItems:"center",gap:14,marginBottom:14 }}>
                  <div style={{ fontSize:38,fontWeight:800,color:"var(--accent3)" }}>#{myRank}</div>
                  <div>
                    <div style={{ fontSize:14,fontWeight:700 }}>{userProfile?.display_name}</div>
                    <div style={{ fontSize:11,color:"var(--text3)" }}>{myXP.toLocaleString()} XP · Level {userProfile?.level||1}</div>
                    {myRank > 1 && <div style={{ fontSize:11,color:"var(--green)",marginTop:2 }}>Keep going to reach #{myRank-1}!</div>}
                  </div>
                </div>
                <ProgressBar value={myXP/((leaders[0]?.xp||10000))*100} />
                <div style={{ fontSize:10,color:"var(--text3)",marginTop:4 }}>
                  {leaders[0] && myRank > 1 ? `${((leaders[0].xp||0) - myXP).toLocaleString()} XP behind #1` : "🏆 You're #1!"}
                </div>
              </>
            ) : (
              <div style={{ color:"var(--text3)",fontSize:12 }}>
                Solve problems to appear on the leaderboard!
              </div>
            )}
          </Card>

          {/* Topic rankings */}
          <Card style={{ marginBottom:14 }}>
            <h4 style={{ marginBottom:12 }}>🏷️ Topic Rankings</h4>
            <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
              {TOPIC_RANKS.map(({ topic,rank,pct,color }) => (
                <div key={topic}>
                  <div style={{ display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:4 }}>
                    <span>{topic}</span>
                    <span style={{ color,fontWeight:700 }}>#{rank}</span>
                  </div>
                  <ProgressBar value={pct} color={`linear-gradient(90deg,${color},${color}88)`} />
                </div>
              ))}
              {(userProfile?.solved_problems||[]).length === 0 && (
                <div style={{ textAlign:"center",padding:12,fontSize:12,color:"var(--text3)" }}>Solve problems to build topic rankings!</div>
              )}
            </div>
          </Card>

          {/* Weekly summary */}
          <Card>
            <h4 style={{ marginBottom:12 }}>📈 This Week</h4>
            {[
              { icon:"⚡",text:`${myXP} total XP earned`,               color:"var(--yellow)"  },
              { icon:"✅",text:`${(userProfile?.solved_problems||[]).length} problems solved`, color:"var(--green)"  },
              { icon:"🔥",text:`${userProfile?.streak||0}-day streak`,   color:"var(--orange)"  },
              { icon:"🏅",text:`${(userProfile?.badges||[]).length} badges earned`,            color:"var(--purple)" },
            ].map(({ icon,text,color }) => (
              <div key={text} style={{ display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:"1px solid rgba(42,58,92,.4)",fontSize:12 }}>
                <span style={{ color,fontSize:16 }}>{icon}</span>
                <span style={{ color:"var(--text2)" }}>{text}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  );
}
