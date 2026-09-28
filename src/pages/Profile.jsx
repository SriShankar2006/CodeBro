// src/pages/Profile.jsx
import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import useStore from "../context/useStore";
import { Card, ProgressBar, ActivityHeatmap, Button, Modal, Input, SectionHeader, DifficultyTag, DonutChart, BarChart, StatCard } from "../components/UI";
import { getActivityData } from "../services/supabase";
import { uploadAvatar } from "../services/supabase";
import { PROBLEMS } from "../data/problems";
import { BADGES } from "../data/courses";

export default function Profile() {
  const { user, userProfile, updateMyProfile, progressRevision } = useStore();
  const fileInputRef  = useRef();
  const [editOpen,    setEditOpen]    = useState(false);
  const [heatmap,     setHeatmap]     = useState({});
  const [uploading,   setUploading]   = useState(false);
  const [editForm,    setEditForm]    = useState({
    display_name: userProfile?.display_name || "",
    bio:          userProfile?.bio          || "",
    username:     userProfile?.username     || "",
    location:     userProfile?.location     || "",
  });

  useEffect(() => {
    if (!user?.uid) return;
    let active = true;
    (async () => {
      try {
        const idToken = await user.getIdToken();
        const hm = await getActivityData(idToken);
        if (active) setHeatmap(hm);
      } catch {
        if (active) setHeatmap({});
      }
    })();
    return () => { active = false; };
  }, [user, progressRevision]);

  const name    = userProfile?.display_name || user?.displayName || "Coder";
  const xp      = userProfile?.xp     || 0;
  const level   = userProfile?.level  || 1;
  const streak  = userProfile?.streak || 0;
  const solved  = (userProfile?.solved_problems || []).length;
  const badges  = userProfile?.badges || [];

  const solvedIds    = new Set(userProfile?.solved_problems || []);
  const solvedList   = PROBLEMS.filter(p => solvedIds.has(p.id));
  const easySolved   = solvedList.filter(p=>p.difficulty==="Easy").length;
  const mediumSolved = solvedList.filter(p=>p.difficulty==="Medium").length;
  const hardSolved   = solvedList.filter(p=>p.difficulty==="Hard").length;

  // Bar chart: submissions per month (real data)
  const monthlyData = Array.from({length:7},(_,i)=>{
    const d = new Date(); d.setMonth(d.getMonth()-6+i);
    const key = d.toISOString().slice(0,7);
    return Object.entries(heatmap).filter(([k])=>k.startsWith(key)).reduce((s,[,v])=>s+v,0);
  });
  const monthLabels = Array.from({length:7},(_,i)=>{
    const d=new Date(); d.setMonth(d.getMonth()-6+i);
    return d.toLocaleString("default",{month:"short"});
  });

  const handleAvatarUpload = async e => {
    const file = e.target.files?.[0];
    if (!file || !user?.uid) return;
    setUploading(true);
    try {
      const url = await uploadAvatar(await user.getIdToken(), file);
      await updateMyProfile({ avatar: url });
      toast.success("Avatar updated!");
    } catch (err) {
      toast.error("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const saveEdit = async () => {
    try {
      await updateMyProfile(editForm);
      toast.success("Profile updated!");
      setEditOpen(false);
    } catch { toast.error("Update failed"); }
  };

  const earnedBadges = BADGES.filter(b => badges.includes(b.id));
  const lockedBadges = BADGES.filter(b => !badges.includes(b.id));

  return (
    <div className="page-container fade-in">
      <div className="grid-2" style={{ alignItems:"start" }}>
        {/* ── Left ── */}
        <div>
          {/* Profile card */}
          <Card style={{ padding:0,marginBottom:14,overflow:"hidden" }}>
            <div style={{ height:72,background:"linear-gradient(135deg,var(--accent2),var(--purple) 55%,var(--cyan))" }} />
            <div style={{ textAlign:"center",padding:"0 24px 24px" }}>
              <div style={{ position:"relative",display:"inline-block",marginTop:-44,marginBottom:12 }}>
                <div style={{ width:88,height:88,borderRadius:"50%",border:"4px solid var(--bg2)",background:"linear-gradient(135deg,rgba(168,85,247,.35),rgba(99,102,241,.35))",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,fontWeight:800,overflow:"hidden",cursor:"pointer",boxShadow:"var(--shadow)" }}
                  onClick={() => fileInputRef.current?.click()}>
                  {userProfile?.avatar ? (
                    <img src={userProfile.avatar} alt="avatar" style={{ width:"100%",height:"100%",objectFit:"cover" }} />
                  ) : (
                    name.slice(0,2).toUpperCase()
                  )}
                </div>
                <div style={{ position:"absolute",bottom:0,right:-2,width:26,height:26,borderRadius:"50%",background:"var(--accent2)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",border:"2px solid var(--bg2)" }}
                  onClick={() => fileInputRef.current?.click()}>
                  {uploading ? <div className="spin-anim" style={{ width:12,height:12,border:"2px solid #fff",borderTopColor:"transparent",borderRadius:"50%" }} /> : "📷"}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleAvatarUpload} />
              </div>

              <h2 style={{ fontSize:18,marginBottom:2 }}>{name}</h2>
              <div style={{ fontSize:12,color:"var(--text3)",marginBottom:5 }}>@{userProfile?.username||"coder"}</div>
              {userProfile?.location && <div style={{ fontSize:12,color:"var(--text2)",marginBottom:4 }}>📍{userProfile.location}</div>}
              <div style={{ fontSize:12,color:"var(--text3)",marginBottom:16,lineHeight:1.6 }}>
                {userProfile?.bio || "No bio yet — click Edit Profile to add one."}
              </div>
              <div style={{ display:"inline-flex",alignItems:"center",gap:8,background:"rgba(245,158,11,.1)",border:"1px solid rgba(245,158,11,.25)",borderRadius:20,padding:"4px 16px",marginBottom:16 }}>
                <span style={{ fontSize:14 }}>⚡</span>
                <span style={{ color:"var(--yellow)",fontWeight:700,fontSize:12 }}>Level {level}</span>
                <span style={{ fontSize:11,color:"var(--text3)" }}>· {xp.toLocaleString()} XP</span>
              </div>
              <div style={{ display:"flex",justifyContent:"center",gap:8 }}>
                <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>✏️ Edit Profile</Button>
                <Button variant="outline" size="sm" onClick={() => { navigator.clipboard?.writeText(window.location.href); toast.success("Link copied!"); }}>🔗 Share</Button>
              </div>
            </div>
          </Card>

          {/* Social Links */}
          <Card style={{ marginBottom:14 }}>
            <SectionHeader title="🔗 Social Links" />
            {(userProfile?.social_links && Object.keys(userProfile.social_links).length > 0) ? (
              Object.entries(userProfile.social_links).map(([k,v]) => (
                <div key={k} style={{ display:"flex",alignItems:"center",gap:8,fontSize:12,marginBottom:6 }}>
                  <span>🔗</span><span style={{ color:"var(--accent3)" }}>{v}</span>
                </div>
              ))
            ) : (
              <div style={{ fontSize:12,color:"var(--text3)" }}>No social links added yet. Edit profile to add them.</div>
            )}
          </Card>

          {/* Badges */}
          <Card>
            <SectionHeader title="🏅 Achievements" sub={`${earnedBadges.length}/${BADGES.length} earned`} />
            {earnedBadges.length === 0 ? (
              <div style={{ textAlign:"center",padding:"14px 0",color:"var(--text3)",fontSize:12 }}>
                <div style={{ fontSize:32,marginBottom:6 }}>🏅</div>
                Solve problems to earn your first badge!
              </div>
            ) : (
              <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10 }}>
                {earnedBadges.map(b => (
                  <div key={b.id} style={{ textAlign:"center" }} title={b.desc}>
                    <div className="badge-icon" style={{ margin:"0 auto 4px" }}>{b.icon}</div>
                    <div style={{ fontSize:10,color:"var(--text2)" }}>{b.title}</div>
                  </div>
                ))}
                {lockedBadges.slice(0,8-earnedBadges.length).map(b => (
                  <div key={b.id} style={{ textAlign:"center",opacity:.3 }} title={b.desc}>
                    <div className="badge-icon" style={{ margin:"0 auto 4px" }}>{b.icon}</div>
                    <div style={{ fontSize:10,color:"var(--text3)" }}>🔒</div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* ── Right ── */}
        <div>
          {/* Stats */}
          <div className="grid-4" style={{ marginBottom:14 }}>
            <StatCard icon="✅" label="Solved"  value={solved} color="var(--green)" />
            <StatCard icon="⚡" label="XP"      value={xp.toLocaleString()} color="var(--yellow)" />
            <StatCard icon="🔥" label="Streak"  value={streak} sub={streak === 1 ? "day" : "days"} color="var(--orange)" />
            <StatCard icon="🏅" label="Badges"  value={badges.length} sub={`of ${BADGES.length}`} color="var(--purple)" />
          </div>

          {/* Solve distribution */}
          <Card style={{ marginBottom:14 }}>
            <SectionHeader title="📊 Problem Solving" />
            {solved === 0 ? (
              <div style={{ textAlign:"center",padding:20,color:"var(--text3)",fontSize:12 }}>
                Solve problems to see your distribution here!
              </div>
            ) : (
              <div style={{ display:"flex",gap:18,alignItems:"center" }}>
                <div style={{ flex:1 }}>
                  {[
                    { label:"Easy",   count:easySolved,   color:"var(--green)"  },
                    { label:"Medium", count:mediumSolved, color:"var(--yellow)" },
                    { label:"Hard",   count:hardSolved,   color:"var(--red)"    },
                  ].map(({ label,count,color }) => (
                    <div key={label} style={{ marginBottom:10 }}>
                      <div style={{ display:"flex",justifyContent:"space-between",fontSize:11,marginBottom:4 }}>
                        <span style={{ color }}>{label}</span>
                        <span style={{ color:"var(--text3)" }}>{count}/{PROBLEMS.filter(p=>p.difficulty===label).length}</span>
                      </div>
                      <ProgressBar value={count/PROBLEMS.filter(p=>p.difficulty===label).length*100} color={`linear-gradient(90deg,${color},${color}88)`} />
                    </div>
                  ))}
                </div>
                <div style={{ position:"relative",width:90,height:90,flexShrink:0 }}>
                  <DonutChart size={90} strokeWidth={14} segments={[
                    { value:easySolved||0.1,   color:"var(--green)"  },
                    { value:mediumSolved||0.1, color:"var(--yellow)" },
                    { value:hardSolved||0.1,   color:"var(--red)"    },
                  ]} />
                  <div style={{ position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",textAlign:"center" }}>
                    <div style={{ fontSize:16,fontWeight:800 }}>{solved}</div>
                    <div style={{ fontSize:9,color:"var(--text3)" }}>solved</div>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Submission trend */}
          <Card style={{ marginBottom:14 }}>
            <SectionHeader title="📈 Submission Trend" />
            {Object.keys(heatmap).length === 0 ? (
              <div style={{ textAlign:"center",padding:16,color:"var(--text3)",fontSize:12 }}>Submit solutions to see your trend here!</div>
            ) : (
              <BarChart data={monthlyData} labels={monthLabels} color="linear-gradient(180deg,var(--accent),var(--accent2))" height={80} />
            )}
          </Card>

          {/* Activity heatmap — real Supabase data */}
          <Card style={{ marginBottom:14 }}>
            <SectionHeader title="📅 Activity Calendar" />
            <ActivityHeatmap data={heatmap} />
          </Card>

          {/* Recent solved */}
          <Card>
            <SectionHeader title="✅ Recently Solved" action={<span style={{ fontSize:11,color:"var(--accent3)",cursor:"pointer" }}>View all →</span>} />
            {solvedList.length === 0 ? (
              <div style={{ textAlign:"center",padding:16,color:"var(--text3)",fontSize:12 }}>
                <div style={{ fontSize:28,marginBottom:6 }}>🧩</div>
                No problems solved yet. Start solving!
              </div>
            ) : solvedList.slice(-6).reverse().map(p => (
              <div key={p.id} style={{ display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:"1px solid var(--border-subtle)" }}>
                <span style={{ color:"var(--green)",fontSize:14 }}>✓</span>
                <span style={{ flex:1,fontSize:12,fontWeight:600 }}>#{p.id} {p.title}</span>
                <DifficultyTag difficulty={p.difficulty} />
                <span style={{ fontSize:11,color:"var(--yellow)",fontWeight:700 }}>+{p.xp}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="✏️ Edit Profile">
        <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
          <Input label="Display Name" type="text" value={editForm.display_name} onChange={e=>setEditForm(f=>({...f,display_name:e.target.value}))} />
          <Input label="Username"     type="text" value={editForm.username}     onChange={e=>setEditForm(f=>({...f,username:e.target.value}))} />
          <Input label="Location"     type="text" value={editForm.location}     onChange={e=>setEditForm(f=>({...f,location:e.target.value}))} placeholder="City, Country" />
          <div>
            <label>Bio</label>
            <textarea rows={3} value={editForm.bio} onChange={e=>setEditForm(f=>({...f,bio:e.target.value}))} style={{ resize:"none" }} placeholder="Tell us about yourself..." />
          </div>
          <div style={{ display:"flex",gap:8,justifyContent:"flex-end" }}>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={saveEdit}>Save Changes</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
