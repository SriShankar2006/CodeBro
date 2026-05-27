// src/pages/AuthPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import useStore from "../context/useStore";
import { Button, Input } from "../components/UI";

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, register, loginGoogle, forgotPassword, user, loading: authLoading } = useStore();
  const [mode,    setMode]    = useState("login");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [form,    setForm]    = useState({ displayName:"", email:"", password:"", confirm:"" });
  const [errors,  setErrors]  = useState({});

  useEffect(() => {
    if (user && !authLoading) navigate("/dashboard", { replace: true });
  }, [user, authLoading, navigate]);

  const set = (k, v) => { setForm(f => ({ ...f, [k]:v })); setErrors(e => ({ ...e, [k]:"" })); };

  const validate = () => {
    const e = {};
    if (mode==="register" && !form.displayName.trim()) e.displayName = "Name is required";
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = "Enter a valid email";
    if (mode!=="forgot" && form.password.length < 6) e.password = "Minimum 6 characters";
    if (mode==="register" && form.password !== form.confirm) e.confirm = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitLoading(true);
    try {
      if (mode === "login") {
        await login(form.email, form.password);
        toast.success("Welcome back! 👋");
      } else if (mode === "register") {
        await register(form.email, form.password, form.displayName.trim());
        toast.success("Account created! Welcome to CodeBro 🎉");
      } else {
        await forgotPassword(form.email);
        toast.success("Reset email sent! Check your inbox.");
        setMode("login");
      }
    } catch (err) {
      const msg =
        err.code==="auth/user-not-found"       ? "No account with this email." :
        err.code==="auth/wrong-password"        ? "Incorrect password." :
        err.code==="auth/email-already-in-use"  ? "Email already in use." :
        err.code==="auth/too-many-requests"     ? "Too many attempts. Try again later." :
        err.code==="auth/invalid-credential"    ? "Invalid email or password." :
        err.message || "Something went wrong.";
      toast.error(msg);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleGoogle = async () => {
    setSubmitLoading(true);
    try {
      await loginGoogle();
      toast.success("Signed in with Google! 🚀");
    } catch (err) {
      toast.error("Google sign-in failed. Try again.");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)", display:"flex", alignItems:"center", justifyContent:"center", padding:20, position:"relative", overflow:"hidden" }}>
      {/* Background glows */}
      <div style={{ position:"fixed", top:"15%",  left:"10%",  width:400, height:400, borderRadius:"50%", background:"radial-gradient(circle, rgba(99,102,241,.1) 0%, transparent 70%)", pointerEvents:"none" }} />
      <div style={{ position:"fixed", bottom:"15%",right:"10%", width:500, height:500, borderRadius:"50%", background:"radial-gradient(circle, rgba(168,85,247,.07) 0%, transparent 70%)", pointerEvents:"none" }} />

      <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} style={{ width:"100%", maxWidth:420, zIndex:1 }}>
        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:10, marginBottom:10 }}>
            <div style={{ width:42, height:42, borderRadius:12, background:"linear-gradient(135deg, var(--accent2), var(--purple))", display:"flex", alignItems:"center", justifyContent:"center", fontSize:20 }}>💻</div>
            <span style={{ fontSize:26, fontWeight:800, background:"linear-gradient(135deg, var(--accent3), var(--cyan))", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>CodeBro</span>
          </div>
          <p style={{ fontSize:13, color:"var(--text3)", margin:0 }}>
            {mode==="login" ? "Welcome back! Sign in to continue coding." : mode==="register" ? "Join 50,000+ coders. Start your journey." : "Reset your account password."}
          </p>
        </div>

        <div style={{ background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:"var(--radius-xl)", padding:28 }}>
          {/* Google */}
          {mode !== "forgot" && (
            <>
              <button onClick={handleGoogle} disabled={submitLoading} style={{
                width:"100%", padding:"11px", border:"1px solid var(--border)", borderRadius:"var(--radius)",
                background:"var(--bg3)", color:"var(--text)", fontSize:13, fontWeight:600, cursor:"pointer",
                display:"flex", alignItems:"center", justifyContent:"center", gap:10, fontFamily:"inherit", transition:"all .15s",
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor="var(--accent)"}
                onMouseLeave={e => e.currentTarget.style.borderColor="var(--border)"}
              >
                <svg width="17" height="17" viewBox="0 0 24 24">
                  <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
              <div style={{ display:"flex", alignItems:"center", gap:12, margin:"18px 0" }}>
                <div style={{ flex:1, height:1, background:"var(--border)" }} />
                <span style={{ fontSize:11, color:"var(--text3)" }}>or continue with email</span>
                <div style={{ flex:1, height:1, background:"var(--border)" }} />
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {mode==="register" && (
              <Input label="Full Name" type="text" placeholder="Arjun Kumar" value={form.displayName} onChange={e => set("displayName", e.target.value)} error={errors.displayName} />
            )}
            <Input label="Email" type="email" placeholder="you@example.com" value={form.email} onChange={e => set("email", e.target.value)} error={errors.email} />
            {mode!=="forgot" && (
              <div>
                <Input label="Password" type="password" placeholder="••••••••" value={form.password} onChange={e => set("password", e.target.value)} error={errors.password} />
                {mode==="login" && (
                  <div style={{ textAlign:"right", marginTop:5 }}>
                    <span style={{ fontSize:11, color:"var(--accent3)", cursor:"pointer" }} onClick={() => setMode("forgot")}>Forgot password?</span>
                  </div>
                )}
              </div>
            )}
            {mode==="register" && (
              <Input label="Confirm Password" type="password" placeholder="••••••••" value={form.confirm} onChange={e => set("confirm", e.target.value)} error={errors.confirm} />
            )}
            <Button type="submit" loading={submitLoading} style={{ width:"100%", justifyContent:"center", padding:"12px" }}>
              {mode==="login" ? "Sign In →" : mode==="register" ? "Create Account →" : "Send Reset Email"}
            </Button>
          </form>

          <div style={{ marginTop:18, textAlign:"center", fontSize:12, color:"var(--text3)" }}>
            {mode==="login" ? (
              <>Don't have an account? <span style={{ color:"var(--accent3)", cursor:"pointer", fontWeight:600 }} onClick={() => setMode("register")}>Sign up free</span></>
            ) : mode==="register" ? (
              <>Already have an account? <span style={{ color:"var(--accent3)", cursor:"pointer", fontWeight:600 }} onClick={() => setMode("login")}>Sign in</span></>
            ) : (
              <span style={{ color:"var(--accent3)", cursor:"pointer" }} onClick={() => setMode("login")}>← Back to sign in</span>
            )}
          </div>
        </div>

        {/* Stats strip */}
        <div style={{ display:"flex", justifyContent:"center", gap:24, marginTop:24 }}>
          {[["50K+","Members"],["118","Problems"],["6","Courses"],["Free","Forever"]].map(([v,l]) => (
            <div key={l} style={{ textAlign:"center" }}>
              <div style={{ fontSize:14, fontWeight:800, color:"var(--accent3)" }}>{v}</div>
              <div style={{ fontSize:10, color:"var(--text3)" }}>{l}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
