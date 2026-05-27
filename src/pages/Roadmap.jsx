// src/pages/Roadmap.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { ROADMAP_NODES, WEB_DEV_ROADMAP, ML_ROADMAP } from "../data/courses";
import { PROBLEMS } from "../data/problems";
import { Card, Button, ProgressBar, Toggle, TabBar } from "../components/UI";
import { getUserSubmissions } from "../services/supabase";
import useStore from "../context/useStore";

const ROADMAPS = {
  dsa: { name: "DSA Roadmap", data: ROADMAP_NODES, icon: "📊" },
  webdev: { name: "Web Dev Roadmap", data: WEB_DEV_ROADMAP, icon: "🌐" },
  ml: { name: "ML Roadmap", data: ML_ROADMAP, icon: "🤖" },
};

const STATUS_CFG = {
  done:   { icon:"✅", color:"var(--green)",  bg:"rgba(16,185,129,.07)",  border:"rgba(16,185,129,.3)",  label:"Completed" },
  active: { icon:"🔵", color:"var(--accent3)", bg:"rgba(99,102,241,.08)", border:"rgba(99,102,241,.35)", label:"In Progress" },
  locked: { icon:"🔒", color:"var(--text3)",   bg:"transparent",           border:"var(--border)",         label:"Locked" },
};

// ── Roadmap Page ──────────────────────────────────────────
export function Roadmap() {
  const navigate = useNavigate();
  const { userProfile } = useStore();
  const [selected, setSelected] = useState(null);
  const [roadmapType, setRoadmapType] = useState("dsa");

  const currentRoadmap = ROADMAPS[roadmapType];
  const nodes = currentRoadmap.data;

  const solvedSet   = new Set(userProfile?.solved_problems || []);
  const doneCount   = nodes.filter(n=>n.status==="done").length;
  const activeCount = nodes.filter(n=>n.status==="active").length;
  const pct         = Math.round(doneCount/nodes.length*100);

  return (
    <div className="page-container fade-in">
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20 }}>
        <div>
          <h2>{currentRoadmap.icon} {currentRoadmap.name}</h2>
          <p style={{ fontSize:12,marginTop:2 }}>Your personalized path from beginner to expert</p>
        </div>
        <select value={roadmapType} onChange={e => setRoadmapType(e.target.value)} style={{ width:180, padding:"8px 12px", borderRadius:"var(--radius)", border:"1px solid var(--border)", background:"var(--bg3)", color:"var(--text)", fontSize:12, cursor:"pointer" }}>
          <option value="dsa">📊 DSA Roadmap</option>
          <option value="webdev">🌐 Web Dev Roadmap</option>
          <option value="ml">🤖 ML Roadmap</option>
        </select>
      </div>

      <Card style={{ marginBottom:24,display:"flex",alignItems:"center",gap:20,flexWrap:"wrap" }}>
        <div style={{ flex:1,minWidth:200 }}>
          <div style={{ display:"flex",justifyContent:"space-between",marginBottom:8 }}>
            <span style={{ fontWeight:700 }}>{currentRoadmap.name}</span>
            <span style={{ color:"var(--accent3)",fontWeight:700 }}>{pct}%</span>
          </div>
          <ProgressBar value={pct} height={10} />
          <div style={{ fontSize:11,color:"var(--text3)",marginTop:4 }}>{doneCount} of {nodes.length} topics completed</div>
        </div>
        <div style={{ display:"flex",gap:20 }}>
          {[
            { label:"Completed", count:doneCount,                                        color:"var(--green)"   },
            { label:"Active",    count:activeCount,                                       color:"var(--accent3)" },
            { label:"Locked",    count:nodes.length-doneCount-activeCount,               color:"var(--text3)"   },
          ].map(({ label,count,color }) => (
            <div key={label} style={{ textAlign:"center" }}>
              <div style={{ fontSize:22,fontWeight:800,color }}>{count}</div>
              <div style={{ fontSize:10,color:"var(--text3)" }}>{label}</div>
            </div>
          ))}
        </div>
      </Card>

      <div style={{ display:"flex",gap:20 }}>
        <div style={{ flex:1,maxWidth:560 }}>
          {nodes.map((node,i) => {
            const cfg = STATUS_CFG[node.status];
            const isSelected = selected?.id === node.id;
            return (
              <motion.div key={node.id} initial={{ opacity:0,x:-8 }} animate={{ opacity:1,x:0 }} transition={{ delay:i*.05 }}>
                {i>0 && <div style={{ width:2,height:18,marginLeft:22,background:nodes[i-1].status==="done"?"var(--green)":"var(--border)" }} />}
                <div onClick={() => setSelected(isSelected?null:node)} style={{
                  display:"flex",alignItems:"center",gap:12,padding:"13px 16px",
                  borderRadius:"var(--radius)",border:`1px solid ${isSelected?cfg.color:cfg.border}`,
                  background:cfg.bg,cursor:"pointer",transition:"all .15s",
                  boxShadow:isSelected?`0 0 0 2px ${cfg.color}33`:"none",
                }}>
                  <span style={{ fontSize:18 }}>{cfg.icon}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13,fontWeight:600,color:node.status==="locked"?"var(--text3)":"var(--text)" }}>{node.title}</div>
                    <div style={{ fontSize:10,color:"var(--text3)",marginTop:2 }}>
                      {node.problemIds.filter(id=>solvedSet.has(id)).length}/{node.problemIds.length} problems solved
                      {node.prerequisites.length>0&&` · Needs: ${node.prerequisites.join(", ")}`}
                    </div>
                  </div>
                  <span style={{ fontSize:11,color:cfg.color,fontWeight:700 }}>{cfg.label}</span>
                  <span style={{ color:"var(--text3)",fontSize:12 }}>{isSelected?"▲":"▼"}</span>
                </div>
                {isSelected && (
                  <motion.div initial={{ opacity:0,height:0 }} animate={{ opacity:1,height:"auto" }}
                    style={{ marginLeft:18,borderLeft:`2px solid ${cfg.color}`,paddingLeft:16,marginTop:-4,paddingTop:12,paddingBottom:12 }}>
                    <div style={{ fontSize:12,color:"var(--text2)",marginBottom:10,lineHeight:1.6 }}>
                      {node.status==="locked"?`Complete prerequisites first: ${node.prerequisites.join(", ")}`:
                       node.status==="done"?"🎉 You've mastered this topic! Review to stay sharp.":
                       "🔵 You're currently working on this topic. Keep going!"}
                    </div>
                    {node.problemIds.length>0 && (
                      <div style={{ marginBottom:10 }}>
                        <div style={{ fontSize:11,color:"var(--text3)",marginBottom:6 }}>Linked Problems</div>
                        <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
                          {node.problemIds.map(pid=>{
                            const p = PROBLEMS.find(pr=>pr.id===pid);
                            return p && (
                              <span key={pid} onClick={e=>{e.stopPropagation();navigate(`/editor/${pid}`);}}
                                className="tag tag-blue" style={{ cursor:"pointer",fontSize:11 }}>
                                #{pid} {p.title.slice(0,20)}{p.title.length>20?"...":""}
                                {solvedSet.has(pid)&&" ✓"}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {node.status!=="locked" && (
                      <Button variant="primary" size="sm" onClick={e=>{e.stopPropagation();navigate("/problems");}}>
                        {node.status==="done"?"📖 Review Problems":"🚀 Solve Problems"}
                      </Button>
                    )}
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>

        <div style={{ width:250,flexShrink:0 }}>
          <Card style={{ marginBottom:14 }}>
            <h4 style={{ marginBottom:12 }}>💡 Study Tips</h4>
            {[
              ["🎯","Focus on one topic at a time — depth over breadth."],
              ["📝","Solve 5-10 problems per topic before moving on."],
              ["⏱️","Time yourself — 20min for Easy, 40min for Medium."],
              ["🔁","Revisit weak topics every 2 weeks."],
              ["💬","Explain your approach out loud."],
            ].map(([icon,tip]) => (
              <div key={tip} style={{ display:"flex",gap:8,fontSize:12,color:"var(--text2)",marginBottom:8,lineHeight:1.6 }}>
                <span>{icon}</span><span>{tip}</span>
              </div>
            ))}
          </Card>
          <Card>
            <h4 style={{ marginBottom:10 }}>🏁 Completion Estimate</h4>
            <div style={{ fontSize:12,color:"var(--text2)",lineHeight:1.7 }}>
              At 2-3 topics per week, you'll complete the {currentRoadmap.name} in approximately:
              <div style={{ fontSize:28,fontWeight:800,color:"var(--yellow)",textAlign:"center",margin:"10px 0" }}>
                ~{Math.ceil(nodes.length/3)} weeks
              </div>
              Stay consistent and you'll level up! 🚀
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ── Submissions Page ──────────────────────────────────────
const VERDICT_COLORS = {
  "Accepted":"var(--green)",
  "Wrong Answer":"var(--red)",
  "Time Limit Exceeded":"var(--yellow)",
  "Compilation Error":"var(--orange)",
  "Runtime Error":"var(--red)"
};
const VERDICT_ICONS = {
  "Accepted":"✅",
  "Wrong Answer":"❌",
  "Time Limit Exceeded":"⏱",
  "Compilation Error":"⚙️",
  "Runtime Error":"💥"
};

export function Submissions() {
  const navigate = useNavigate();
  const { user } = useStore();
  const [subs,    setSubs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState("All");

  useEffect(() => {
    if (!user?.uid) return;
    (async () => {
      const data = await getUserSubmissions(user.uid).catch(() => []);
      setSubs(data);
      setLoading(false);
    })();
  }, [user?.uid]);

  const filtered = subs.filter(s => filter==="All" || s.verdict===filter);

  return (
    <div className="page-container fade-in">
      <h2 style={{ marginBottom:4 }}>📤 My Submissions</h2>
      <p style={{ fontSize:12,marginBottom:20 }}>Your complete submission history</p>
      <div style={{ display:"flex",gap:8,marginBottom:18,flexWrap:"wrap" }}>
        {["All","Accepted","Wrong Answer","Time Limit Exceeded","Compilation Error"].map(f => (
          <div key={f} onClick={()=>setFilter(f)} style={{
            padding:"5px 12px",borderRadius:20,cursor:"pointer",fontSize:11,fontWeight:600,transition:"all .15s",
            background:filter===f?"var(--accent2)":"rgba(99,102,241,.1)",
            color:filter===f?"#fff":"var(--accent3)",
          }}>
            {f} {f!=="All"&&`(${subs.filter(s=>s.verdict===f).length})`}
          </div>
        ))}
      </div>
      <div className="card" style={{ padding:0,overflow:"hidden" }}>
        {loading ? (
          <div style={{ padding:40,textAlign:"center",color:"var(--text3)" }}>Loading submissions...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding:60,textAlign:"center",color:"var(--text3)" }}>
            <div style={{ fontSize:40,marginBottom:12 }}>📤</div>
            {subs.length===0?"No submissions yet. Start solving problems!":"No submissions match this filter."}
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Problem</th>
                <th>Verdict</th>
                <th>Language</th>
                <th>Runtime</th>
                <th>Memory</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s,i) => (
                <tr key={s.id||i} className="clickable" onClick={()=>navigate(`/editor/${s.problem_id}`)}>
                  <td><div style={{ fontWeight:600 }}>#{s.problem_id} {s.problem_title}</div></td>
                  <td><span style={{ color:VERDICT_COLORS[s.verdict]||"var(--text)",fontWeight:700,fontSize:12 }}>{VERDICT_ICONS[s.verdict]||"•"} {s.verdict}</span></td>
                  <td style={{ color:"var(--accent3)",fontSize:11 }}>{s.language}</td>
                  <td style={{ color:"var(--text2)",fontSize:12 }}>{s.runtime||"—"}</td>
                  <td style={{ color:"var(--text2)",fontSize:12 }}>{s.memory||"—"}</td>
                  <td style={{ color:"var(--text3)",fontSize:11 }}>{s.created_at?new Date(s.created_at).toLocaleDateString():"—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ── Settings Page ─────────────────────────────────────────
export function Settings() {
  const { user, userProfile, updateMyProfile, logout, forgotPassword, darkMode, toggleDarkMode, addNotification } = useStore();
  const navigate = useNavigate();
  const [tab,     setTab]     = useState("Account");
  const [saving,  setSaving]  = useState(false);
  const [account, setAccount] = useState({ display_name:"", username:"", email:"", location:"", bio:"" });
  const [notifs,  setNotifs]  = useState(() => JSON.parse(localStorage.getItem("cb_notif_prefs") || "null") || { contestReminders:true,quizReminders:true,achievementAlerts:true,emailNotifs:false,weeklyDigest:true });
  const [privacy, setPrivacy] = useState(() => JSON.parse(localStorage.getItem("cb_privacy_prefs") || "null") || { publicProfile:true,showSolved:true,showXP:true,allowFriends:true });
  const [editorPrefs, setEditorPrefs] = useState(() => JSON.parse(localStorage.getItem("cb_editor_prefs") || "null") || { defaultLanguage:"Python 3", editorTheme:"Dark", fontSize:"13px" });

  useEffect(() => {
    setAccount({
      display_name: userProfile?.display_name || "",
      username: userProfile?.username || "",
      email: userProfile?.email || user?.email || "",
      location: userProfile?.location || "",
      bio: userProfile?.bio || "",
    });
  }, [userProfile, user?.email]);

  const saveAccount = async () => {
    setSaving(true);
    try {
      const { email, ...updates } = account;
      await updateMyProfile(updates);
      toast.success("Account settings saved!");
      addNotification({ type:"profile", message:"Profile settings updated" });
    } catch (err) {
      toast.error(err.message || "Could not save account settings");
    } finally {
      setSaving(false);
    }
  };

  const savePrefs = (section) => {
    if (section === "Notifications") localStorage.setItem("cb_notif_prefs", JSON.stringify(notifs));
    if (section === "Privacy") localStorage.setItem("cb_privacy_prefs", JSON.stringify(privacy));
    if (section === "Appearance") localStorage.setItem("cb_editor_prefs", JSON.stringify(editorPrefs));
    toast.success(`${section} settings saved!`);
  };

  const sendPasswordReset = async () => {
    const email = account.email || user?.email;
    if (!email) { toast.error("No email is available for this account."); return; }
    try {
      await forgotPassword(email);
      toast.success("Password reset email sent.");
    } catch (err) {
      toast.error(err.message || "Could not send password reset email");
    }
  };

  return (
    <div className="page-container fade-in" style={{ maxWidth:760 }}>
      <h2 style={{ marginBottom:4 }}>⚙️ Settings</h2>
      <p style={{ fontSize:12,marginBottom:20 }}>Manage your account and preferences</p>
      <div style={{ marginBottom:20 }}>
        <TabBar tabs={["Account","Notifications","Appearance","Privacy","Security"]} active={tab} onChange={setTab} />
      </div>

      {tab==="Account" && (
        <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
          <Card>
            <h4 style={{ marginBottom:16 }}>Profile Information</h4>
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12 }}>
              <div><label>Display Name</label><input type="text" value={account.display_name} onChange={e=>setAccount(a=>({...a,display_name:e.target.value}))} /></div>
              <div><label>Username</label><input type="text" value={account.username} onChange={e=>setAccount(a=>({...a,username:e.target.value}))} /></div>
              <div><label>Email</label><input type="email" value={account.email} disabled title="Email changes are handled by authentication provider" /></div>
              <div><label>Location</label><input type="text" value={account.location} onChange={e=>setAccount(a=>({...a,location:e.target.value}))} placeholder="City, Country" /></div>
            </div>
            <div style={{ marginBottom:12 }}><label>Bio</label><textarea rows={3} value={account.bio} onChange={e=>setAccount(a=>({...a,bio:e.target.value}))} style={{ resize:"none" }} /></div>
            <Button variant="primary" onClick={saveAccount} loading={saving}>Save Changes</Button>
          </Card>
          <Card style={{ borderColor:"rgba(239,68,68,.3)" }}>
            <h4 style={{ marginBottom:8,color:"var(--red)" }}>⚠️ Danger Zone</h4>
            <p style={{ fontSize:12,color:"var(--text2)",marginBottom:14 }}>These actions cannot be undone.</p>
            <div style={{ display:"flex",gap:8 }}>
              <Button variant="danger" onClick={async()=>{await logout();navigate("/login");}}>Log Out</Button>
              <Button variant="outline" onClick={()=>toast.error("Account deletion needs a backend admin function.")}>Delete Account</Button>
            </div>
          </Card>
        </div>
      )}

      {tab==="Notifications" && (
        <Card>
          <h4 style={{ marginBottom:4 }}>Notification Preferences</h4>
          <p style={{ fontSize:12,color:"var(--text3)",marginBottom:16 }}>Control what you receive</p>
          {[
            { k:"contestReminders",  l:"Contest Reminders",   s:"Notified before contests start" },
            { k:"quizReminders",     l:"Quiz Reminders",      s:"Daily reminder to complete quiz" },
            { k:"achievementAlerts", l:"Achievement Alerts",  s:"New badge or milestone unlocked" },
            { k:"emailNotifs",       l:"Email Notifications", s:"Receive updates via email" },
            { k:"weeklyDigest",      l:"Weekly Digest",       s:"Weekly summary every Sunday" },
          ].map(({ k,l,s }) => (
            <Toggle key={k} value={notifs[k]} label={l} sub={s} onChange={v=>setNotifs(n=>({...n,[k]:v}))} />
          ))}
          <div style={{ marginTop:16 }}><Button variant="primary" onClick={()=>savePrefs("Notifications")}>Save</Button></div>
        </Card>
      )}

      {tab==="Appearance" && (
        <Card>
          <h4 style={{ marginBottom:16 }}>Theme</h4>
          <div style={{ display:"flex",gap:10,marginBottom:16 }}>
            {[{l:"Dark",icon:"🌙",active:darkMode},{l:"Light",icon:"☀️",active:!darkMode}].map(({l,icon,active})=>(
              <div key={l} onClick={toggleDarkMode} style={{ flex:1,padding:16,borderRadius:10,cursor:"pointer",textAlign:"center",border:`2px solid ${active?"var(--accent)":"var(--border)"}`,background:active?"rgba(99,102,241,.1)":"var(--bg3)" }}>
                <div style={{ fontSize:28,marginBottom:6 }}>{icon}</div>
                <div style={{ fontSize:13,fontWeight:600 }}>{l} Mode</div>
                {active&&<div style={{ fontSize:11,color:"var(--accent3)",marginTop:4 }}>✓ Active</div>}
              </div>
            ))}
          </div>
          <h4 style={{ marginBottom:12 }}>Editor Preferences</h4>
          <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
            <div style={{ display:"flex",alignItems:"center",gap:12 }}>
              <label style={{ width:160,flexShrink:0 }}>Default Language</label>
              <select value={editorPrefs.defaultLanguage} onChange={e=>setEditorPrefs(p=>({...p,defaultLanguage:e.target.value}))} style={{ flex:1 }}>
                {["Python 3","C++","Java","JavaScript"].map(o=><option key={o}>{o}</option>)}
              </select>
            </div>
            <div style={{ display:"flex",alignItems:"center",gap:12 }}>
              <label style={{ width:160,flexShrink:0 }}>Editor Theme</label>
              <select value={editorPrefs.editorTheme} onChange={e=>setEditorPrefs(p=>({...p,editorTheme:e.target.value}))} style={{ flex:1 }}>
                {["Dark","Light","High Contrast"].map(o=><option key={o}>{o}</option>)}
              </select>
            </div>
            <div style={{ display:"flex",alignItems:"center",gap:12 }}>
              <label style={{ width:160,flexShrink:0 }}>Font Size</label>
              <select value={editorPrefs.fontSize} onChange={e=>setEditorPrefs(p=>({...p,fontSize:e.target.value}))} style={{ flex:1 }}>
                {["12px","13px","14px","15px"].map(o=><option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <div style={{ marginTop:14 }}><Button variant="primary" onClick={()=>savePrefs("Appearance")}>Save</Button></div>
        </Card>
      )}

      {tab==="Privacy" && (
        <Card>
          <h4 style={{ marginBottom:16 }}>Privacy Settings</h4>
          {[
            { k:"publicProfile", l:"Public Profile",       s:"Anyone can view your profile" },
            { k:"showSolved",    l:"Show Solved Problems", s:"Display solved list on profile" },
            { k:"showXP",        l:"Show XP & Level",      s:"Show XP to other users" },
            { k:"allowFriends",  l:"Allow Friend Requests",s:"Others can send you requests" },
          ].map(({ k,l,s }) => (
            <Toggle key={k} value={privacy[k]} label={l} sub={s} onChange={v=>setPrivacy(p=>({...p,[k]:v}))} />
          ))}
          <div style={{ marginTop:16 }}><Button variant="primary" onClick={()=>savePrefs("Privacy")}>Save</Button></div>
        </Card>
      )}

      {tab==="Security" && (
        <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
          <Card>
            <h4 style={{ marginBottom:16 }}>Password</h4>
            <div style={{ display:"flex",flexDirection:"column",gap:10,maxWidth:400 }}>
              <p style={{ fontSize:12,color:"var(--text2)",lineHeight:1.7 }}>Send a secure password reset link to {account.email || "your account email"}.</p>
              <Button variant="primary" style={{ width:"fit-content" }} onClick={sendPasswordReset}>Send Reset Email</Button>
            </div>
          </Card>
          <Card>
            <h4 style={{ marginBottom:10 }}>Two-Factor Authentication</h4>
            <p style={{ fontSize:12,color:"var(--text2)",marginBottom:14 }}>Add an extra layer of security to your account.</p>
            <Button variant="outline" onClick={()=>toast("2FA requires a backend auth policy before it can be enabled.")}>Enable 2FA</Button>
          </Card>
        </div>
      )}
    </div>
  );
}
