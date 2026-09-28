// src/pages/AuthPage.jsx — High-level, elegant auth UI
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import useStore from "../context/useStore";
import { ADMIN_EMAIL } from "../services/firebase";

const FEATURES = [
  { icon:"🧩", title:"118+ Problems",   desc:"From Easy to Hard, with real company questions" },
  { icon:"🤖", title:"AI Assistant",    desc:"Gemini-powered coding mentor available 24/7" },
  { icon:"📚", title:"8 Courses",       desc:"Structured learning paths for every level" },
  { icon:"🏆", title:"Certificates",    desc:"Verifiable PDF certs for completed courses" },
  { icon:"🎯", title:"Smart Quizzes",   desc:"Topic-based quizzes with explanations" },
  { icon:"📊", title:"Leaderboards",    desc:"Compete globally, climb the XP rankings" },
];

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, register, loginGoogle, forgotPassword, user, userProfile, loading: authLoading } = useStore();
  const [mode,         setMode]         = useState("login");
  const [submitLoading,setSubmitLoading]= useState(false);
  const [form,         setForm]         = useState({ displayName:"", email:"", password:"", confirm:"" });
  const [errors,       setErrors]       = useState({});
  const [showPass,     setShowPass]     = useState(false);

  useEffect(() => {
    if (user && !authLoading) navigate(userProfile?.role === "admin" && user.email?.toLowerCase() === ADMIN_EMAIL ? "/admin" : "/dashboard", { replace:true });
  }, [user, userProfile?.role, authLoading, navigate]);

  const set = (k, v) => { setForm(f => ({...f,[k]:v})); setErrors(e => ({...e,[k]:""})); };

  const validate = () => {
    const e = {};
    if (mode==="register" && !form.displayName.trim()) e.displayName = "Name is required";
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = "Enter a valid email";
    if (mode!=="forgot" && form.password.length < 6) e.password = "At least 6 characters";
    if (mode==="register" && form.password !== form.confirm) e.confirm = "Passwords don't match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitLoading(true);
    try {
      if (mode==="login") {
        await login(form.email, form.password);
        toast.success("Welcome back! 👋");
      } else if (mode==="register") {
        await register(form.email, form.password, form.displayName.trim());
        toast.success("Account created! Welcome to CodeBro 🎉");
      } else {
        await forgotPassword(form.email);
        toast.success("Reset email sent! Check your inbox.");
        setMode("login");
      }
    } catch (err) {
      const msg =
        err.code==="auth/user-not-found"      ? "No account found with this email." :
        err.code==="auth/wrong-password"       ? "Incorrect password. Try again." :
        err.code==="auth/email-already-in-use" ? "Email already registered." :
        err.code==="auth/too-many-requests"    ? "Too many attempts. Wait a moment." :
        err.code==="auth/invalid-credential"   ? "Invalid email or password." :
        err.code==="auth/network-request-failed"? "Network error. Check your connection." :
        err.message || "Something went wrong.";
      toast.error(msg);
    } finally { setSubmitLoading(false); }
  };

  const handleGoogle = async () => {
    setSubmitLoading(true);
    try { await loginGoogle(); toast.success("Signed in with Google! 🚀"); }
    catch { toast.error("Google sign-in failed. Try again."); }
    finally { setSubmitLoading(false); }
  };

  const fieldStyle = (key) => ({
    width:"100%", padding:"11px 13px", fontSize:13,
    background:"var(--bg3)", color:"var(--text)",
    border:`1.5px solid ${errors[key]?"var(--red)":"var(--border)"}`,
    borderRadius:10, outline:"none", fontFamily:"inherit",
    transition:"border-color .15s, box-shadow .15s",
  });

  const focusStyle = { borderColor:"var(--accent)", boxShadow:"0 0 0 3px rgba(99,102,241,.15)" };

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg1)", display:"flex", overflow:"hidden" }}>

      {/* ── Left Panel (branding) — hidden on mobile ── */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center", padding:"60px 48px", position:"relative", background:"linear-gradient(135deg, #0a0f1a 0%, #0f172a 50%, #1a1040 100%)", borderRight:"1px solid var(--border)" }}
        className="auth-left-panel">
        <style>{`
          @media (max-width: 820px) { .auth-left-panel { display: none !important; } }
        `}</style>

        {/* Ambient glows */}
        <div style={{ position:"absolute", top:"10%", left:"20%", width:300, height:300, borderRadius:"50%", background:"radial-gradient(circle, rgba(99,102,241,.15) 0%, transparent 70%)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", bottom:"15%", right:"10%", width:250, height:250, borderRadius:"50%", background:"radial-gradient(circle, rgba(168,85,247,.1) 0%, transparent 70%)", pointerEvents:"none" }} />

        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:48 }}>
          <div style={{ width:44, height:44, borderRadius:12, background:"linear-gradient(135deg,#6366f1,#a855f7)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, boxShadow:"0 0 20px rgba(99,102,241,.4)" }}>
            💻
          </div>
          <div>
            <div style={{ fontSize:22, fontWeight:800, color:"#fff", letterSpacing:"-.02em" }}>CodeBro</div>
            <div style={{ fontSize:11, color:"var(--text3)", letterSpacing:".04em" }}>LEARNING PLATFORM</div>
          </div>
        </div>

        <h2 style={{ fontSize:"clamp(22px,3vw,32px)", fontWeight:800, color:"#fff", marginBottom:12, lineHeight:1.25 }}>
          Level up your<br />
          <span className="gradient-text">coding skills</span>
        </h2>
        <p style={{ fontSize:13, color:"var(--text3)", marginBottom:40, lineHeight:1.75, maxWidth:360 }}>
          Join thousands of developers who use CodeBro to practice algorithms, build projects, and land their dream jobs.
        </p>

        {/* Features */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          {FEATURES.map(({ icon, title, desc }) => (
            <div key={title} style={{ display:"flex", gap:10, padding:"12px 14px", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.06)", borderRadius:10 }}>
              <span style={{ fontSize:18, flexShrink:0 }}>{icon}</span>
              <div>
                <div style={{ fontSize:12, fontWeight:700, color:"var(--text)", marginBottom:2 }}>{title}</div>
                <div style={{ fontSize:10, color:"var(--text3)", lineHeight:1.5 }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div style={{ display:"flex", gap:32, marginTop:36, paddingTop:28, borderTop:"1px solid rgba(255,255,255,.06)" }}>
          {[ ["50K+","Learners"],["118","Problems"],["8","Courses"],["Free","Forever"]].map(([v,l]) => (
            <div key={l}>
              <div style={{ fontSize:18, fontWeight:800, color:"var(--accent3)" }}>{v}</div>
              <div style={{ fontSize:10, color:"var(--text3)", marginTop:2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Panel (form) ── */}
      <div style={{ width:"100%", maxWidth:480, display:"flex", flexDirection:"column", justifyContent:"center", padding:"40px 36px", overflowY:"auto" }}>
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} style={{ width:"100%", maxWidth:400, margin:"0 auto" }}>

          {/* Mobile logo */}
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:32 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:"linear-gradient(135deg,#6366f1,#a855f7)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>💻</div>
            <span style={{ fontSize:18, fontWeight:800, background:"linear-gradient(135deg,var(--accent3),var(--cyan))", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>CodeBro</span>
          </div>

          {/* Mode title */}
          <AnimatePresence mode="wait">
            <motion.div key={mode} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }} style={{ marginBottom:28 }}>
              <h2 style={{ marginBottom:4 }}>
                {mode==="login" ? "Sign in to your account" : mode==="register" ? "Create your account" : "Reset password"}
              </h2>
              <p style={{ fontSize:12, color:"var(--text3)", margin:0 }}>
                {mode==="login"    ? "Welcome back! Enter your credentials to continue." :
                 mode==="register" ? "Join for free. No credit card required." :
                 "We'll send a reset link to your email."}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Google button */}
          {mode !== "forgot" && (
            <>
              <button onClick={handleGoogle} disabled={submitLoading}
                style={{
                  width:"100%", padding:"11px 16px", borderRadius:10,
                  border:"1.5px solid var(--border)", background:"var(--bg3)",
                  color:"var(--text)", fontSize:13, fontWeight:600,
                  cursor:"pointer", display:"flex", alignItems:"center",
                  justifyContent:"center", gap:10, fontFamily:"inherit",
                  transition:"all .15s", marginBottom:20,
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.background = "rgba(99,102,241,.06)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--bg3)"; }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24">
                  <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
                <div style={{ flex:1, height:1, background:"var(--border)" }} />
                <span style={{ fontSize:11, color:"var(--text3)", whiteSpace:"nowrap" }}>or continue with email</span>
                <div style={{ flex:1, height:1, background:"var(--border)" }} />
              </div>
            </>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {mode==="register" && (
              <div>
                <label style={{ fontSize:12, fontWeight:600, color:"var(--text2)", display:"block", marginBottom:5 }}>Full Name</label>
                <input type="text" placeholder="Arjun Kumar" value={form.displayName}
                  onChange={e => set("displayName", e.target.value)}
                  style={fieldStyle("displayName")}
                  onFocus={e => Object.assign(e.target.style, focusStyle)}
                  onBlur={e => { e.target.style.borderColor = errors.displayName ? "var(--red)" : "var(--border)"; e.target.style.boxShadow = "none"; }}
                />
                {errors.displayName && <div style={{ fontSize:11, color:"var(--red)", marginTop:4 }}>{errors.displayName}</div>}
              </div>
            )}

            <div>
              <label style={{ fontSize:12, fontWeight:600, color:"var(--text2)", display:"block", marginBottom:5 }}>Email Address</label>
              <input type="email" placeholder="you@example.com" value={form.email}
                onChange={e => set("email", e.target.value)}
                style={fieldStyle("email")}
                onFocus={e => Object.assign(e.target.style, focusStyle)}
                onBlur={e => { e.target.style.borderColor = errors.email ? "var(--red)" : "var(--border)"; e.target.style.boxShadow = "none"; }}
              />
              {errors.email && <div style={{ fontSize:11, color:"var(--red)", marginTop:4 }}>{errors.email}</div>}
            </div>

            {mode !== "forgot" && (
              <div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
                  <label style={{ fontSize:12, fontWeight:600, color:"var(--text2)" }}>Password</label>
                  {mode==="login" && (
                    <span style={{ fontSize:11, color:"var(--accent3)", cursor:"pointer", fontWeight:500 }}
                      onClick={() => setMode("forgot")}>Forgot password?</span>
                  )}
                </div>
                <div style={{ position:"relative" }}>
                  <input type={showPass?"text":"password"} placeholder="••••••••" value={form.password}
                    onChange={e => set("password", e.target.value)}
                    style={{ ...fieldStyle("password"), paddingRight:42 }}
                    onFocus={e => Object.assign(e.target.style, { ...focusStyle, paddingRight:"42px" })}
                    onBlur={e => { e.target.style.borderColor = errors.password ? "var(--red)" : "var(--border)"; e.target.style.boxShadow = "none"; }}
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"var(--text3)", fontSize:14, padding:0 }}>
                    {showPass ? "🙈" : "👁"}
                  </button>
                </div>
                {errors.password && <div style={{ fontSize:11, color:"var(--red)", marginTop:4 }}>{errors.password}</div>}
              </div>
            )}

            {mode==="register" && (
              <div>
                <label style={{ fontSize:12, fontWeight:600, color:"var(--text2)", display:"block", marginBottom:5 }}>Confirm Password</label>
                <input type="password" placeholder="••••••••" value={form.confirm}
                  onChange={e => set("confirm", e.target.value)}
                  style={fieldStyle("confirm")}
                  onFocus={e => Object.assign(e.target.style, focusStyle)}
                  onBlur={e => { e.target.style.borderColor = errors.confirm ? "var(--red)" : "var(--border)"; e.target.style.boxShadow = "none"; }}
                />
                {errors.confirm && <div style={{ fontSize:11, color:"var(--red)", marginTop:4 }}>{errors.confirm}</div>}
              </div>
            )}

            <button type="submit" disabled={submitLoading}
              style={{
                width:"100%", padding:"12px", borderRadius:10, fontSize:14, fontWeight:700,
                background:"linear-gradient(135deg,var(--accent2),var(--accent))", color:"#fff",
                border:"none", cursor:"pointer", fontFamily:"inherit",
                boxShadow:"0 4px 16px rgba(99,102,241,.4)",
                opacity:submitLoading ? .7 : 1, transition:"all .15s",
                display:"flex", alignItems:"center", justifyContent:"center", gap:8,
              }}
              onMouseEnter={e => !submitLoading && (e.currentTarget.style.transform = "translateY(-1px)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "none")}
            >
              {submitLoading && (
                <div style={{ width:16, height:16, border:"2px solid rgba(255,255,255,.4)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin .7s linear infinite" }} />
              )}
              {mode==="login"    ? "Sign In →" :
               mode==="register" ? "Create Account →" :
               "Send Reset Email"}
            </button>
          </form>

          {/* Mode switch */}
          <div style={{ marginTop:20, textAlign:"center", fontSize:13, color:"var(--text3)" }}>
            {mode==="login" ? (
              <>Don't have an account?{" "}
                <span style={{ color:"var(--accent3)", cursor:"pointer", fontWeight:600 }} onClick={() => setMode("register")}>
                  Sign up free
                </span>
              </>
            ) : mode==="register" ? (
              <>Already have an account?{" "}
                <span style={{ color:"var(--accent3)", cursor:"pointer", fontWeight:600 }} onClick={() => setMode("login")}>
                  Sign in
                </span>
              </>
            ) : (
              <span style={{ color:"var(--accent3)", cursor:"pointer", fontWeight:500 }} onClick={() => setMode("login")}>
                ← Back to sign in
              </span>
            )}
          </div>

          {/* Terms */}
          {mode==="register" && (
            <p style={{ textAlign:"center", fontSize:11, color:"var(--text3)", marginTop:14, lineHeight:1.6 }}>
              By creating an account you agree to our{" "}
              <span style={{ color:"var(--accent3)" }}>Terms of Service</span> and{" "}
              <span style={{ color:"var(--accent3)" }}>Privacy Policy</span>.
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
