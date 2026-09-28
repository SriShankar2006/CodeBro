// src/pages/Editor.jsx — Complete, fully working with Next/Prev navigation
import React, { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import MonacoEditor from "@monaco-editor/react";
import toast from "react-hot-toast";
import { PROBLEM_DETAILS, defaultStarter } from "../data/problems";
import { getAllProblems } from "../utils/adminContent";
import { runCode } from "../services/judge0";
import { createSubmission } from "../services/supabase";
import useStore from "../context/useStore";
import { DifficultyTag } from "../components/UI";

/* ── Constants ───────────────────────────────────────────── */
const LANGUAGES = ["Python 3", "C++", "Java", "JavaScript", "C", "Go", "Rust"];

const LANG_MONACO = {
  "Python 3":   "python",
  "C++":        "cpp",
  "Java":       "java",
  "JavaScript": "javascript",
  "C":          "c",
  "Go":         "go",
  "Rust":       "rust",
};

const LAST_KEY    = "codebro-last-editor-problem";
const codeKey     = (uid, pid, lang) => `codebro-editor-code-${uid}-${pid}-${lang}`;

/* ── Output helpers ──────────────────────────────────────── */
function normalize(o) {
  return (o || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").trimEnd();
}
function cmpOutput(a, b) {
  if (normalize(a) === normalize(b)) return true;
  const compact = v => v.replace(/\s+/g, "").toLowerCase();
  return compact(normalize(a)) === compact(normalize(b));
}
function parseSafe(v) {
  const s = normalize(v);
  if (!s) return null;
  try { return JSON.parse(s); } catch {
    try {
      return JSON.parse(s
        .replace(/\bTrue\b/g,"true")
        .replace(/\bFalse\b/g,"false")
        .replace(/\bNone\b/g,"null"));
    } catch { return null; }
  }
}
function cmpProblem(actual, expected, pid) {
  if (cmpOutput(actual, expected)) return true;
  if (pid === 1) {
    const a = parseSafe(actual), e = parseSafe(expected);
    if (Array.isArray(a) && Array.isArray(e) && a.length === e.length)
      return [...a].sort((x,y)=>x-y).join(",") === [...e].sort((x,y)=>x-y).join(",");
  }
  return false;
}

function fnName(src, lang) {
  const m = {
    "Python 3":   /def\s+([A-Za-z_]\w*)\s*\(/,
    "JavaScript": /(?:function|var|let|const)\s+([A-Za-z_]\w*)\s*(?:=|\()/,
    "Java":       /public\s+(?:static\s+)?[\w<>\][]+\s+([A-Za-z_]\w*)\s*\(/,
    "C++":        /(?:int|bool|void|vector<[^>]+>|string)\s+([A-Za-z_]\w*)\s*\(/,
  };
  return src.match(m[lang])?.[1] || "solve";
}

function buildSrc({ sourceCode, language, stdin }) {
  if (!stdin?.trim()) return sourceCode;
  const fn = fnName(sourceCode, language);
  if (language === "Python 3") return `from typing import *\nimport ast,json,sys\n${sourceCode}\ndef __p(v):\n v=v.strip()\n if not v: return ""\n try: return ast.literal_eval(v)\n except: return v\n__a=[__p(l) for l in sys.stdin.read().splitlines() if l.strip()]\n__t=getattr(Solution(),"${fn}") if "Solution" in globals() else globals()["${fn}"]\n__r=__t(*__a)\nprint(json.dumps(__r,separators=(",",":")) if not isinstance(__r,str) else __r)\n`;
  if (language === "JavaScript") return `${sourceCode}\nconst __i=require("fs").readFileSync(0,"utf8").split(/\\r?\\n/).filter(Boolean);\nconst __p=v=>{try{return JSON.parse(v);}catch{return v;}};\nconst __r=${fn}(...__i.map(__p));\nconsole.log(typeof __r==="string"?__r:JSON.stringify(__r));\n`;
  return sourceCode;
}

/* ── Results Panel ───────────────────────────────────────── */
function ResultsPanel({ results, onClose }) {
  const allPassed = results.length > 0 && results.every(r => r.passed);
  const hasError  = results.some(r => ["Error","Configuration Error","Compilation Error","Runtime Error"].includes(r.verdict));
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      style={{ borderTop: "2px solid var(--border)", background: "var(--bg2)", overflow: "hidden" }}>
      {/* Header */}
      <div style={{
        padding: "8px 14px", borderBottom: "1px solid var(--border)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        background: allPassed ? "rgba(16,185,129,.08)" : hasError ? "rgba(239,68,68,.08)" : "transparent",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 700 }}>
            {allPassed ? "✅ All Passed" : "❌ Tests Failed"}
          </span>
          <span style={{ fontSize: 11, color: "var(--text3)" }}>
            ({results.filter(r => r.passed).length}/{results.length})
          </span>
        </div>
        <button onClick={onClose}
          style={{ background: "none", border: "none", color: "var(--text3)", cursor: "pointer", fontSize: 15, lineHeight: 1 }}>✕</button>
      </div>
      {/* Test cases */}
      <div style={{ maxHeight: 240, overflowY: "auto", padding: "8px 12px" }}>
        {results.map((r, i) => {
          const err = ["Error","Configuration Error","Compilation Error","Runtime Error"].includes(r.verdict);
          return (
            <div key={i} style={{
              marginBottom: 8, borderRadius: 8, overflow: "hidden",
              border: `1px solid ${r.passed ? "rgba(16,185,129,.25)" : "rgba(239,68,68,.25)"}`,
              background: r.passed ? "rgba(16,185,129,.06)" : err ? "rgba(239,68,68,.08)" : "rgba(239,68,68,.05)",
            }}>
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "6px 10px",
                borderBottom: `1px solid ${r.passed ? "rgba(16,185,129,.2)" : "rgba(239,68,68,.2)"}`,
              }}>
                <strong style={{ fontSize: 11 }}>Case {i + 1}</strong>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 4,
                  color: r.passed ? "var(--green)" : "var(--red)",
                  background: r.passed ? "rgba(16,185,129,.12)" : "rgba(239,68,68,.1)" }}>
                  {r.passed ? "✓ PASS" : "✗ FAIL"}
                </span>
              </div>
              <div style={{ padding: "6px 10px", fontSize: 11 }}>
                {r.input && <div style={{ marginBottom: 3 }}><span style={{ color:"var(--text3)",fontWeight:600 }}>Input: </span><span style={{ fontFamily:"var(--font-mono)",color:"var(--text2)" }}>{r.input.slice(0,120)}</span></div>}
                <div style={{ marginBottom: 3 }}><span style={{ color:"var(--text3)",fontWeight:600 }}>Output: </span><span style={{ fontFamily:"var(--font-mono)",color:r.passed?"var(--green)":"var(--red)" }}>{(r.output||"(empty)").slice(0,200)}</span></div>
                {!r.passed && r.expected && <div style={{ marginBottom:3 }}><span style={{ color:"var(--text3)",fontWeight:600 }}>Expected: </span><span style={{ fontFamily:"var(--font-mono)",color:"var(--green2)" }}>{r.expected.slice(0,200)}</span></div>}
                {r.stderr && <pre style={{ margin:"4px 0 0",padding:6,borderRadius:4,background:"rgba(239,68,68,.08)",border:"1px solid rgba(239,68,68,.15)",fontSize:10,color:"var(--red)",fontFamily:"var(--font-mono)",whiteSpace:"pre-wrap",wordBreak:"break-word" }}>{r.stderr.slice(0,300)}</pre>}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ── Main Editor Page ────────────────────────────────────── */
export default function EditorPage() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const { user, userProfile, darkMode, markProblemSolved, awardXP, notifyProgress } = useStore();
  useStore(state => state.contentRevision);
  const editorRef    = useRef(null);
  const [lang,        setLang]        = useState("Python 3");
  const [code,        setCode]        = useState("");
  const [loadedStorageKey, setLoadedStorageKey] = useState(null);
  const [testInput,   setTestInput]   = useState("");
  const [running,     setRunning]     = useState(false);
  const [results,     setResults]     = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [activeTab,   setActiveTab]   = useState("statement");
  const allProblems = getAllProblems();

  const problemId = id ? Number(id) : null;
  const problem   = useMemo(() => allProblems.find(p => Number(p.id) === problemId), [allProblems, problemId]);
  const isSolved  = userProfile?.solved_problems?.includes(problemId);
  const storageKey = problemId ? codeKey(user?.uid || "guest", problemId, lang) : null;

  /* ── Sorted problem list for navigation ─────────────────── */
  const sorted     = useMemo(() => [...allProblems].sort((a, b) => Number(a.id) - Number(b.id)), [allProblems]);
  const idx        = useMemo(() => sorted.findIndex(p => p.id === problemId), [sorted, problemId]);
  const prevProb   = idx > 0                 ? sorted[idx - 1] : null;
  const nextProb   = idx < sorted.length - 1 ? sorted[idx + 1] : null;

  const goTo = useCallback((p) => {
    if (!p) return;
    navigate(`/editor/${p.id}`);
    setResults([]);
    setShowResults(false);
    setActiveTab("statement");
    setTestInput("");
  }, [navigate]);

  const details = useMemo(() => {
    if (!problem) return null;
    return {
      ...(PROBLEM_DETAILS?.[problemId] || {}),
      ...problem,
      statement: problem.statement || PROBLEM_DETAILS?.[problemId]?.statement || `Solve: ${problem.title}`,
      examples: problem.examples || PROBLEM_DETAILS?.[problemId]?.examples || [],
      constraints: problem.constraints || PROBLEM_DETAILS?.[problemId]?.constraints || [],
      hints: problem.hints || PROBLEM_DETAILS?.[problemId]?.hints || ["Read the problem carefully.", "Check edge cases."],
      testCases: problem.testCases || PROBLEM_DETAILS?.[problemId]?.testCases || [],
      starterCode: problem.starterCode || PROBLEM_DETAILS?.[problemId]?.starterCode || {},
    };
  }, [problem, problemId]);

  /* ── Language change ─────────────────────────────────────── */
  const changeLang = useCallback((newLang) => {
    setLang(newLang);
    const saved = problemId ? localStorage.getItem(codeKey(user?.uid || "guest", problemId, newLang)) : null;
    setCode(saved || details?.starterCode?.[newLang] || defaultStarter(newLang));
  }, [details, problemId, user]);

  /* ── Redirect bare /editor to last problem ──────────────── */
  useEffect(() => {
    if (id) return;
    const lastId   = Number(localStorage.getItem(LAST_KEY));
    const fallback = allProblems[0]?.id;
    const target   = allProblems.some(p => Number(p.id) === lastId) ? lastId : fallback;
    if (target) navigate(`/editor/${target}`, { replace: true });
  }, [id, navigate, allProblems]);

  /* ── Load code when problem / lang changes ──────────────── */
  useEffect(() => {
    if (!problem || !details || !storageKey) return;
    localStorage.setItem(LAST_KEY, String(problemId));
    const saved = localStorage.getItem(storageKey);
    setCode(saved || details.starterCode?.[lang] || defaultStarter(lang));
    setLoadedStorageKey(storageKey);
  }, [problem, details, lang, problemId, storageKey]); // eslint-disable-line

  /* ── Auto-save code ─────────────────────────────────────── */
  useEffect(() => {
    if (storageKey && loadedStorageKey === storageKey && code) localStorage.setItem(storageKey, code);
  }, [storageKey, loadedStorageKey, code]);

  /* ── Ctrl/Cmd+Enter to run ──────────────────────────────── */
  useEffect(() => {
    const h = (e) => { if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); handleRun(); } };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }); // eslint-disable-line

  /* ── Record a submission for the activity heatmap / trend chart ─ */
  const recordSubmission = useCallback(async (verdict, idToken, details = {}) => {
    if (!user?.uid || !problemId) return true;
    try {
      await createSubmission({
        uid: user.uid,
        problem_id: problemId,
        problem_title: problem?.title || "",
        language: lang,
        code,
        verdict,
        ...details,
      }, idToken);
      notifyProgress();
      return true;
    } catch (err) {
      toast.error(`Progress was not saved: ${err.message}`);
      return false;
    }
  }, [user, problemId, problem, lang, code, notifyProgress]);

  /* ── Run Code ───────────────────────────────────────────── */
  const handleRun = useCallback(async () => {
    if (!code.trim()) { toast.error("Code is empty"); return false; }
    setRunning(true); setResults([]); setShowResults(false);
    try {
      const idToken = await user?.getIdToken?.();
      if (!idToken) throw new Error("Please sign in again before running code.");
      const cases = details?.testCases || [];
      if (cases.length === 0 && !testInput.trim()) {
        const res = await runCode({ sourceCode: buildSrc({ sourceCode: code, language: lang, stdin: "" }), language: lang, idToken });
        const passed = !res.demo && res.verdict === "Accepted";
        setResults([{ verdict: res.demo ? "Demo Mode" : res.verdict, output: res.stdout || res.stderr || "", stderr: res.stderr || "", passed }]);
        const persisted = res.demo ? false : await recordSubmission(res.verdict, idToken, { runtime: res.time || null, memory: res.memory || null });
        if (passed && persisted && problemId && !isSolved) {
          const marked = await markProblemSolved(problemId).catch(() => false);
          if (marked) {
            try { await awardXP(problem.xp, `Solved: ${problem.title}`); }
            catch (err) { toast.error(`Solution saved, but XP was not updated: ${err.message}`); }
            toast.success(`+${problem.xp} XP earned!`, { icon: "⚡" });
          }
        }
        setShowResults(true);
        return passed;
      } else {
        const custom   = testInput.trim() ? [{ input: testInput, expected: "" }] : [];
        const toRun    = cases.length > 0 ? [...cases, ...custom] : custom;
        const res      = [];
        for (const tc of toRun) {
          try {
            const stdin  = tc.input || "";
            const result = await runCode({ sourceCode: buildSrc({ sourceCode: code, language: lang, stdin }), language: lang, stdin, idToken });
            const output = result.stdout || "";
            const passed = !result.demo && result.verdict === "Executed" && Boolean(tc.expected) && cmpProblem(output, tc.expected, problemId);
            res.push({ input: stdin, expected: tc.expected || "", output, stderr: result.stderr || "", verdict: passed ? "Accepted" : result.verdict, passed });
          } catch (err) {
            res.push({ input: tc.input || "", expected: tc.expected || "", output: "", stderr: err.message, verdict: "Error", passed: false });
          }
        }
        setResults(res);
        const overallVerdict = res.every(r => r.passed)
          ? "Accepted"
          : (res.find(r => r.verdict !== "Accepted")?.verdict || "Wrong Answer");
        const canPersist = res.every(result => !["Demo Mode", "Configuration Error", "Error"].includes(result.verdict));
        const persisted = canPersist ? await recordSubmission(overallVerdict, idToken) : false;
        if (res.every(r => r.passed) && persisted && toRun.length > 0) {
          toast.success("🎉 All test cases passed!");
          if (problemId && !isSolved) {
            const marked = await markProblemSolved(problemId).catch(() => false);
            if (marked) {
              try { await awardXP(problem.xp, `Solved: ${problem.title}`); }
              catch (err) { toast.error(`Solution saved, but XP was not updated: ${err.message}`); }
              toast.success(`+${problem.xp} XP earned!`, { icon: "⚡" });
            }
          }
        }
        setShowResults(true);
        return res.every(r => r.passed);
      }
    } catch (err) {
      toast.error("Run error: " + err.message);
      setResults([{ verdict: "Error", output: "", stderr: err.message, passed: false }]);
      setShowResults(true);
      return false;
    } finally {
      setRunning(false);
    }
  }, [user, code, lang, details, testInput, problemId, problem, isSolved, markProblemSolved, awardXP, recordSubmission]);

  const handleSubmit = useCallback(async () => {
    if (running) return;
    const accepted = await handleRun();
    if (accepted && nextProb) {
      toast.success("Solution accepted. Opening the next problem…");
      goTo(nextProb);
    } else if (accepted) {
      toast.success("Solution accepted. You completed the last problem!");
    }
  }, [running, handleRun, nextProb, goTo]);

  /* ── Not found ──────────────────────────────────────────── */
  if (id && !problem) return (
    <div style={{ textAlign: "center", padding: "60px 20px" }}>
      <div style={{ fontSize: 36, marginBottom: 14 }}>📋</div>
      <h2>Problem #{id} not found</h2>
      <button onClick={() => navigate("/problems")} style={{ marginTop: 16, padding: "9px 22px", borderRadius: 8, background: "var(--gradient-primary)", color: "#fff", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
        ← Problems List
      </button>
    </div>
  );

  if (!id) return (
    <div style={{ textAlign: "center", padding: "80px 20px" }}>
      <div className="spin-anim" style={{ width: 28, height: 28, border: "3px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", margin: "0 auto 12px" }} />
      <p style={{ color: "var(--text3)" }}>Loading last problem…</p>
    </div>
  );

  /* ─────────────────────────────────────────────────────────
     SPLIT VIEW  (fills remaining viewport below navbar)
  ───────────────────────────────────────────────────────── */
  return (
    <div style={{
      display: "flex",
      /* viewport height minus the nav bar height that Layout already added */
      height: "calc(100vh - var(--nav-height))",
      overflow: "hidden",
      background: "var(--bg1)",
    }}>

      {/* ════════════ LEFT — Problem Panel ════════════════ */}
      <div style={{
        flex: "0 0 420px", maxWidth: 480, minWidth: 280,
        display: "flex", flexDirection: "column",
        background: "var(--bg2)", borderRight: "1px solid var(--border)",
        overflow: "hidden",
      }}>

        {/* ── Top: Prev / counter / Next ────────────────── */}
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "8px 12px", borderBottom: "1px solid var(--border)",
          flexShrink: 0, background: "var(--bg3)",
        }}>
          {/* PREV */}
          <button
            onClick={() => goTo(prevProb)}
            disabled={!prevProb}
            title={prevProb ? `← #${prevProb.id} ${prevProb.title}` : "No previous problem"}
            style={{
              flex: 1, padding: "6px 0", borderRadius: 7,
              border: "1px solid var(--border)",
              background: prevProb ? "var(--bg2)" : "transparent",
              color: prevProb ? "var(--text)" : "var(--text3)",
              opacity: prevProb ? 1 : 0.4,
              cursor: prevProb ? "pointer" : "not-allowed",
              fontSize: 12, fontWeight: 700, fontFamily: "var(--font-sans)",
              transition: "all .15s",
            }}
            onMouseEnter={e => { if (prevProb) { e.currentTarget.style.borderColor = "var(--accent3)"; e.currentTarget.style.color = "var(--accent3)"; }}}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = prevProb ? "var(--text)" : "var(--text3)"; }}
          >
            ← Prev
          </button>

          {/* Counter — click to go to problems list */}
          <button
            onClick={() => navigate("/problems")}
            title="Back to problem list"
            style={{
              padding: "5px 10px", borderRadius: 7,
              border: "1px solid var(--border)", background: "var(--bg2)",
              color: "var(--text3)", fontSize: 11, fontWeight: 600,
              cursor: "pointer", fontFamily: "var(--font-sans)",
            }}
          >
            {idx + 1}/{sorted.length}
          </button>

          {/* NEXT */}
          <button
            onClick={() => goTo(nextProb)}
            disabled={!nextProb}
            title={nextProb ? `#${nextProb.id} ${nextProb.title} →` : "No next problem"}
            style={{
              flex: 1, padding: "6px 0", borderRadius: 7,
              border: nextProb ? "1px solid var(--accent2)" : "1px solid var(--border)",
              background: nextProb ? "linear-gradient(135deg,var(--accent2),var(--accent))" : "transparent",
              color: nextProb ? "#fff" : "var(--text3)",
              opacity: nextProb ? 1 : 0.4,
              cursor: nextProb ? "pointer" : "not-allowed",
              fontSize: 12, fontWeight: 700, fontFamily: "var(--font-sans)",
              transition: "all .15s",
              boxShadow: nextProb ? "0 2px 8px rgba(99,102,241,.35)" : "none",
            }}
          >
            Next →
          </button>
        </div>

        {/* ── Problem title & meta ───────────────────────── */}
        <div style={{ padding: "12px 14px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: "var(--text3)", fontFamily: "var(--font-mono)", fontWeight: 700 }}>#{problemId}</span>
            {isSolved && <span style={{ color: "var(--green)", fontSize: 14, fontWeight: 700 }} title="Solved">✓ Solved</span>}
          </div>
          <h3 style={{ margin: "0 0 8px", fontSize: 15, lineHeight: 1.35, color: "var(--text)" }}>{problem?.title}</h3>
          <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
            <DifficultyTag difficulty={problem?.difficulty} />
            <span style={{ fontSize: 11, color: "var(--yellow)", fontWeight: 700 }}>+{problem?.xp} XP</span>
            {(problem?.companies || []).slice(0, 2).map(c => (
              <span key={c} className="tag tag-blue" style={{ fontSize: 10 }}>🏢 {c}</span>
            ))}
          </div>
        </div>

        {/* ── Tabs ──────────────────────────────────────── */}
        <div style={{ display: "flex", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
          {["statement", "examples", "hints"].map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              style={{
                flex: 1, padding: "9px 4px", fontSize: 12, fontWeight: 600,
                background: "none", border: "none", cursor: "pointer",
                fontFamily: "var(--font-sans)",
                color: activeTab === t ? "var(--accent3)" : "var(--text3)",
                borderBottom: activeTab === t ? "2px solid var(--accent3)" : "2px solid transparent",
              }}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* ── Tab content ───────────────────────────────── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px" }}>
          {activeTab === "statement" && (
            <>
              <div style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.75, whiteSpace: "pre-wrap", marginBottom: 14 }}>
                {details?.statement}
              </div>
              {(details?.constraints || []).length > 0 && <>
                <h4 style={{ marginBottom: 6, color: "var(--text3)" }}>Constraints</h4>
                <ul style={{ margin: 0, paddingLeft: 18, color: "var(--text3)", fontSize: 12, lineHeight: 1.9 }}>
                  {details.constraints.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </>}
            </>
          )}
          {activeTab === "examples" && (
            (details?.examples || []).length > 0
              ? details.examples.map((ex, i) => (
                <div key={i} style={{ marginBottom: 12, padding: 12, borderRadius: 8, background: "rgba(99,102,241,.05)", border: "1px solid var(--border)" }}>
                  <strong style={{ fontSize: 12 }}>Example {i + 1}</strong>
                  <pre style={{ fontSize: 11, marginTop: 8, fontFamily: "var(--font-mono)", background: "var(--bg3)", padding: "8px 10px", borderRadius: 6, border: "1px solid var(--border)", lineHeight: 1.5, color: "var(--text2)" }}>
                    {`Input:  ${ex.input}\nOutput: ${ex.output}`}
                  </pre>
                  {ex.explanation && <p style={{ fontSize: 11, color: "var(--text3)", marginTop: 6 }}>💡 {ex.explanation}</p>}
                </div>
              ))
              : <p style={{ color: "var(--text3)", fontSize: 12, textAlign: "center", paddingTop: 20 }}>No examples available.</p>
          )}
          {activeTab === "hints" && (
            (details?.hints || []).length > 0
              ? details.hints.map((h, i) => (
                <div key={i} style={{ marginBottom: 10, padding: 12, borderRadius: 8, background: "rgba(245,158,11,.05)", border: "1px solid rgba(245,158,11,.18)" }}>
                  <p style={{ fontSize: 12, color: "var(--text2)", margin: 0, lineHeight: 1.65 }}>💡 {h}</p>
                </div>
              ))
              : <p style={{ color: "var(--text3)", fontSize: 12, textAlign: "center", paddingTop: 20 }}>No hints available.</p>
          )}
        </div>

        {/* ── Bottom navigation bar ─────────────────────── */}
        <div style={{
          padding: "8px 12px", borderTop: "1px solid var(--border)",
          display: "flex", gap: 6, flexShrink: 0, background: "var(--bg3)",
        }}>
          <button onClick={() => goTo(prevProb)} disabled={!prevProb}
            style={{
              flex: 1, padding: "8px 0", borderRadius: 7,
              border: "1px solid var(--border)", background: prevProb ? "var(--bg2)" : "transparent",
              color: prevProb ? "var(--text)" : "var(--text3)",
              opacity: prevProb ? 1 : 0.35, cursor: prevProb ? "pointer" : "not-allowed",
              fontSize: 11, fontWeight: 700, fontFamily: "var(--font-sans)",
            }}>
            {prevProb ? `← #${prevProb.id}` : "← No Prev"}
          </button>

          <button onClick={() => navigate("/problems")}
            style={{ padding: "8px 14px", borderRadius: 7, border: "1px solid var(--border)", background: "var(--bg2)", color: "var(--text3)", cursor: "pointer", fontSize: 11, fontFamily: "var(--font-sans)" }}>
            📋 List
          </button>

          <button onClick={() => goTo(nextProb)} disabled={!nextProb}
            style={{
              flex: 1, padding: "8px 0", borderRadius: 7,
              border: nextProb ? "1px solid var(--accent2)" : "1px solid var(--border)",
              background: nextProb ? "linear-gradient(135deg,var(--accent2),var(--accent))" : "transparent",
              color: nextProb ? "#fff" : "var(--text3)",
              opacity: nextProb ? 1 : 0.35, cursor: nextProb ? "pointer" : "not-allowed",
              fontSize: 11, fontWeight: 700, fontFamily: "var(--font-sans)",
              boxShadow: nextProb ? "0 2px 8px rgba(99,102,241,.3)" : "none",
            }}>
            {nextProb ? `#${nextProb.id} →` : "No Next →"}
          </button>
        </div>
      </div>

      {/* ════════════ RIGHT — Code Editor ═════════════════ */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: "var(--bg1)" }}>

        {/* Editor toolbar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "8px 14px", borderBottom: "1px solid var(--border)",
          background: "var(--bg2)", flexShrink: 0, gap: 10,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <select value={lang} onChange={e => changeLang(e.target.value)}
              style={{ width: "auto", minWidth: 110, fontSize: 12, padding: "5px 8px" }}>
              {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <span style={{ fontSize: 10, color: "var(--text3)" }}>Ctrl+Enter to run</span>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {isSolved && (
              <span style={{ fontSize: 10, fontWeight: 700, color: "var(--green)", background: "rgba(16,185,129,.1)", border: "1px solid rgba(16,185,129,.25)", padding: "3px 8px", borderRadius: 20 }}>
                ✓ Solved
              </span>
            )}
            <button
              onClick={handleRun}
              disabled={running}
              style={{
                padding: "7px 20px", borderRadius: 7, fontWeight: 700, fontSize: 12,
                background: running ? "var(--bg4)" : "var(--green)",
                color: "#fff", border: "none",
                cursor: running ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", gap: 6,
                transition: "all .15s", fontFamily: "var(--font-sans)",
              }}>
              {running
                ? <><span className="spin-anim" style={{ width: 10, height: 10, border: "2px solid rgba(255,255,255,.5)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block" }} /> Running…</>
                : "▶ Run"}
            </button>
            <button
              onClick={handleSubmit}
              disabled={running}
              style={{
                padding: "7px 16px", borderRadius: 7, fontWeight: 700, fontSize: 12,
                background: running ? "var(--bg4)" : "var(--accent)", color: "#fff", border: "none",
                cursor: running ? "not-allowed" : "pointer", fontFamily: "var(--font-sans)",
              }}>
              ✓ Submit & Next
            </button>
          </div>
        </div>

        {/* Monaco Editor — fills remaining space */}
        <div style={{ flex: 1, overflow: "hidden", minHeight: 0 }}>
          <MonacoEditor
            height="100%"
            language={LANG_MONACO[lang] || "python"}
            value={code || defaultStarter(lang)}
            onChange={val => setCode(val || "")}
            theme={darkMode ? "vs-dark" : "vs"}
            onMount={editor => { editorRef.current = editor; }}
            options={{
              fontSize: 13,
              fontFamily: "'JetBrains Mono','Fira Code',monospace",
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              lineNumbers: "on",
              tabSize: 2,
              padding: { top: 12 },
              wordWrap: "on",
              smoothScrolling: true,
              cursorBlinking: "smooth",
              cursorSmoothCaretAnimation: "on",
              bracketPairColorization: { enabled: true },
              autoClosingBrackets: "always",
              autoClosingQuotes: "always",
              formatOnPaste: true,
              renderWhitespace: "selection",
            }}
          />
        </div>

        {/* Custom test input */}
        <div style={{ padding: "8px 12px", borderTop: "1px solid var(--border)", background: "var(--bg2)", flexShrink: 0 }}>
          <label style={{ marginBottom: 5, fontSize: 10 }}>Custom Input (optional)</label>
          <textarea
            value={testInput}
            onChange={e => setTestInput(e.target.value)}
            placeholder={details?.testCases?.length ? "Built-in tests run first. Add custom input here." : "One argument per line"}
            spellCheck={false}
            style={{ minHeight: 48, maxHeight: 90, resize: "vertical", fontFamily: "var(--font-mono)", fontSize: 11, lineHeight: 1.4 }}
          />
        </div>

        {/* Results */}
        <AnimatePresence>
          {showResults && results.length > 0 && (
            <div style={{ maxHeight: "40%", flexShrink: 0, overflow: "hidden" }}>
              <ResultsPanel results={results} onClose={() => setShowResults(false)} />
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
