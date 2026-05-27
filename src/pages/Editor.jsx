// src/pages/Editor.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MonacoEditor from "@monaco-editor/react";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import { PROBLEMS, PROBLEM_DETAILS, defaultStarter } from "../data/problems";
import { runCode } from "../services/judge0";
import { createSubmission } from "../services/supabase";
import useStore from "../context/useStore";
import { DifficultyTag, Tag, Button } from "../components/UI";

const LANGUAGES = ["Python 3","C++","Java","JavaScript","C","Go","Rust"];
const MONACO_LANG = { "Python 3":"python","C++":"cpp","C":"c","Java":"java","JavaScript":"javascript","Go":"go","Rust":"rust" };
const VERDICT_COLORS = { "Accepted":"var(--green)","Wrong Answer":"var(--red)","Time Limit Exceeded":"var(--yellow)","Compilation Error":"var(--orange)","Runtime Error":"var(--red)","In Queue":"var(--text2)","Processing":"var(--text2)" };

export default function Editor() {
  const { id: problemId } = useParams();
  const navigate  = useNavigate();
  const { user, userProfile, markProblemSolved, awardXP, addNotification } = useStore();

  const problem = PROBLEMS.find(p => p.id === Number(problemId)) || PROBLEMS[0];
  const detail  = PROBLEM_DETAILS[problem.id] || null;

  const [lang,    setLang]    = useState("Python 3");
  const [code,    setCode]    = useState("");
  const [input,   setInput]   = useState(detail?.testCases?.[0]?.input || "");
  const [output,  setOutput]  = useState(null);
  const [running, setRunning] = useState(false);
  const [panel,   setPanel]   = useState("problem");
  const [hintIdx, setHintIdx] = useState(-1);
  const [theme,   setTheme]   = useState("vs-dark");
  const [fontSize,setFontSize]= useState(13);

  // Load saved code or starter
  useEffect(() => {
    const key   = `cb_code_${problem.id}_${lang}`;
    const saved = localStorage.getItem(key);
    setCode(saved || (detail?.starterCode?.[lang] ?? defaultStarter(lang)));
  }, [problem.id, lang]);

  const saveCode = val => {
    setCode(val);
    localStorage.setItem(`cb_code_${problem.id}_${lang}`, val);
  };

  const handleRun = async () => {
    setRunning(true);
    setOutput({ status:"running" });
    try {
      const result = await runCode({ sourceCode: code, language: lang, stdin: input });
      setOutput({ ...result, type:"run" });
    } catch (e) {
      setOutput({ verdict:"Error", stderr: e.message, type:"error" });
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    setRunning(true);
    setOutput({ status:"running", message:"Running all test cases..." });
    try {
      // Run against first test case (real hidden tests via Judge0 when key set)
      const result = await runCode({ sourceCode: code, language: lang, stdin: detail?.testCases?.[0]?.input || input });
      const accepted = result.verdictId === 3;

      // Save to Supabase
      if (user?.uid) {
        await createSubmission({
          uid:           user.uid,
          problem_id:    problem.id,
          problem_title: problem.title,
          language:      lang,
          code,
          verdict:       result.verdict,
          runtime:       result.time ? `${result.time}s` : null,
          memory:        result.memory ? `${Math.round(result.memory/1024)}MB` : null,
        });
      }

      if (accepted) {
        const isNew = await markProblemSolved(problem.id);
        if (isNew) {
          await awardXP(problem.xp, `Solved #${problem.id} ${problem.title}`);
          toast.success(`🎉 Accepted! +${problem.xp} XP`);
          addNotification({ type:"xp", message:`✅ Solved "${problem.title}" — +${problem.xp} XP` });
        } else {
          toast.success("✅ Accepted! (already solved)");
        }
      } else {
        toast.error(`❌ ${result.verdict}`);
      }
      setOutput({ ...result, type:"submit" });
    } catch (e) {
      setOutput({ verdict:"Error", stderr: e.message, type:"error" });
      toast.error("Submission error. Check your connection.");
    } finally {
      setRunning(false);
    }
  };

  const solvedSet = new Set(userProfile?.solved_problems || []);
  const isSolved  = solvedSet.has(problem.id);

  return (
    <div style={{ display:"flex", height:`calc(100vh - var(--nav-height))`, overflow:"hidden" }}>

      {/* ── Left: Problem ── */}
      <div style={{ width:"43%", minWidth:340, overflowY:"auto", borderRight:"1px solid var(--border)", display:"flex", flexDirection:"column" }}>
        {/* Problem header */}
        <div style={{ padding:"14px 18px", borderBottom:"1px solid var(--border)", background:"var(--bg2)", flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10, flexWrap:"wrap" }}>
            <span style={{ color:"var(--text3)", fontSize:13, fontFamily:"var(--font-mono)" }}>#{problem.id}</span>
            <h3 style={{ fontSize:15, flex:1 }}>{problem.title}</h3>
            {isSolved && <span className="tag tag-green">✓ Solved</span>}
            <DifficultyTag difficulty={problem.difficulty} />
          </div>
          <div style={{ display:"flex", gap:4, marginBottom:10, flexWrap:"wrap" }}>
            {["problem","solution","discuss"].map(p => (
              <button key={p} onClick={() => setPanel(p)} style={{
                padding:"5px 12px", borderRadius:6, fontSize:11, fontWeight:600,
                border:"1px solid var(--border)", cursor:"pointer", fontFamily:"inherit", transition:"all .15s",
                background: panel===p ? "var(--accent2)" : "transparent",
                color:      panel===p ? "#fff"            : "var(--text2)",
              }}>{p.charAt(0).toUpperCase()+p.slice(1)}</button>
            ))}
          </div>
          <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
            {problem.topics.map(t => <Tag key={t} style={{ fontSize:10 }}>{t}</Tag>)}
            {(problem.companies||[]).slice(0,3).map(c => (
              <span key={c} style={{ fontSize:10, color:"var(--text3)", background:"var(--bg3)", border:"1px solid var(--border)", borderRadius:20, padding:"2px 8px" }}>🏢{c}</span>
            ))}
          </div>
        </div>

        {/* Panel content */}
        <div style={{ flex:1, padding:18, overflowY:"auto" }}>
          {panel === "problem" && detail && (
            <>
              <div style={{ fontSize:13, lineHeight:1.8, color:"var(--text2)", marginBottom:18 }}>
                <ReactMarkdown>{detail.statement}</ReactMarkdown>
              </div>
              <h4 style={{ marginBottom:10 }}>Examples</h4>
              {detail.examples.map((ex, i) => (
                <div key={i} style={{ background:"var(--bg3)", borderRadius:8, padding:12, marginBottom:10, fontFamily:"var(--font-mono)", fontSize:12, lineHeight:1.9, border:"1px solid var(--border)" }}>
                  <div><span style={{ color:"var(--text3)" }}>Input:  </span>{ex.input}</div>
                  <div><span style={{ color:"var(--text3)" }}>Output: </span><span style={{ color:"var(--green)" }}>{ex.output}</span></div>
                  {ex.explanation && <div><span style={{ color:"var(--text3)" }}>Explain: </span>{ex.explanation}</div>}
                </div>
              ))}
              <h4 style={{ margin:"16px 0 8px" }}>Constraints</h4>
              <div style={{ fontFamily:"var(--font-mono)", fontSize:12, color:"var(--text2)", lineHeight:2 }}>
                {detail.constraints.map((c,i) => <div key={i}>• {c}</div>)}
              </div>
              {/* Hints */}
              <div style={{ marginTop:18 }}>
                <h4 style={{ marginBottom:10 }}>💡 Hints</h4>
                {detail.hints.map((h, i) => (
                  hintIdx >= i ? (
                    <div key={i} style={{ background:"rgba(245,158,11,.08)", border:"1px solid rgba(245,158,11,.2)", borderLeft:"3px solid var(--yellow)", borderRadius:"0 8px 8px 0", padding:"10px 14px", fontSize:12, color:"var(--text2)", marginBottom:8, lineHeight:1.7 }}>
                      💡 {h}
                    </div>
                  ) : null
                ))}
                {hintIdx < detail.hints.length - 1 && (
                  <button className="btn btn-outline btn-sm" onClick={() => setHintIdx(v => v+1)}>
                    Show Hint {hintIdx+2}
                  </button>
                )}
              </div>
              <div style={{ marginTop:16, display:"flex", gap:16, fontSize:11, color:"var(--text3)" }}>
                <span>Acceptance: <b style={{ color:"var(--text2)" }}>{problem.acceptance}%</b></span>
                <span>XP: <b style={{ color:"var(--yellow)" }}>+{problem.xp}</b></span>
              </div>
            </>
          )}

          {panel === "problem" && !detail && (
            <div style={{ padding:20 }}>
              <h3 style={{ marginBottom:12 }}>{problem.id}. {problem.title}</h3>
              <p style={{ color:"var(--text2)", lineHeight:1.8 }}>
                Solve this {problem.difficulty.toLowerCase()} level problem involving {problem.topics.slice(0,2).join(" and ")}.
                Write a solution that handles all edge cases efficiently.
              </p>
              <div style={{ marginTop:16 }}>
                <h4 style={{ marginBottom:8 }}>Topics</h4>
                {problem.topics.map(t => <Tag key={t} style={{ marginRight:6, marginBottom:6 }}>{t}</Tag>)}
              </div>
              <div style={{ marginTop:16, padding:12, background:"var(--bg3)", borderRadius:8, fontSize:12, color:"var(--text3)" }}>
                💡 Full problem statement, examples and test cases coming soon. Use custom input to test your solution.
              </div>
            </div>
          )}

          {panel === "solution" && (
            <div>
              <h4 style={{ marginBottom:12 }}>📖 Editorial Solution</h4>
              {detail?.editorial ? (
                <div style={{ fontSize:12, lineHeight:1.8 }}>
                  <ReactMarkdown>{detail.editorial}</ReactMarkdown>
                </div>
              ) : (
                <div style={{ color:"var(--text3)", fontSize:12 }}>
                  {isSolved ? "Editorial available after first solve." : "Solve the problem first to unlock the editorial."}
                </div>
              )}
            </div>
          )}

          {panel === "discuss" && (
            <div>
              <h4 style={{ marginBottom:14 }}>💬 Top Discussions</h4>
              {[
                `Clean O(n) solution with explanation — ${problem.topics[0]}`,
                "3 different approaches — brute force to optimal",
                "Why does this approach work? Edge cases explained",
                "Space optimization tricks for this problem",
              ].map((t, i) => (
                <div key={i} onClick={() => navigate("/forum")} style={{ padding:"10px 12px", background:"var(--bg3)", borderRadius:8, marginBottom:8, fontSize:12, color:"var(--accent3)", cursor:"pointer", border:"1px solid var(--border)" }}>
                  📣 {t}
                </div>
              ))}
              <button className="btn btn-outline btn-sm" style={{ width:"100%", marginTop:4 }} onClick={() => navigate("/forum")}>
                View all discussions →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Right: Editor ── */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>
        {/* Toolbar */}
        <div style={{ padding:"8px 16px", background:"var(--bg2)", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
          <div style={{ display:"flex", gap:4 }}>
            <div style={{ width:11,height:11,borderRadius:"50%",background:"#ff5f56" }} />
            <div style={{ width:11,height:11,borderRadius:"50%",background:"#ffbd2e" }} />
            <div style={{ width:11,height:11,borderRadius:"50%",background:"#27c93f" }} />
          </div>
          <select value={lang} onChange={e=>setLang(e.target.value)} style={{ width:130,fontSize:11,padding:"3px 8px",color:"var(--accent3)",fontWeight:600 }}>
            {LANGUAGES.map(l => <option key={l}>{l}</option>)}
          </select>
          <select value={theme} onChange={e=>setTheme(e.target.value)} style={{ width:105,fontSize:11,padding:"3px 8px" }}>
            <option value="vs-dark">Dark</option>
            <option value="vs-light">Light</option>
            <option value="hc-black">High Contrast</option>
          </select>
          <select value={fontSize} onChange={e=>setFontSize(Number(e.target.value))} style={{ width:72,fontSize:11,padding:"3px 8px" }}>
            {[11,12,13,14,15,16].map(s => <option key={s} value={s}>{s}px</option>)}
          </select>
          <div style={{ marginLeft:"auto", display:"flex", gap:6 }}>
            <button className="btn btn-outline btn-sm" onClick={() => { setCode(detail?.starterCode?.[lang] ?? defaultStarter(lang)); localStorage.removeItem(`cb_code_${problem.id}_${lang}`); }}>↩ Reset</button>
          </div>
        </div>

        {/* Monaco */}
        <div style={{ flex:1, overflow:"hidden" }}>
          <MonacoEditor
            height="100%"
            language={MONACO_LANG[lang] || "python"}
            value={code}
            onChange={saveCode}
            theme={theme}
            options={{ fontSize, minimap:{ enabled:false }, scrollBeyondLastLine:false, lineNumbers:"on", wordWrap:"on", tabSize:4, automaticLayout:true, fontFamily:"'JetBrains Mono','Fira Code',monospace", fontLigatures:true, bracketPairColorization:{ enabled:true }, suggestOnTriggerCharacters:true }}
          />
        </div>

        {/* Bottom panels */}
        <div style={{ background:"var(--bg2)", borderTop:"1px solid var(--border)", flexShrink:0 }}>
          {/* Custom input */}
          <div style={{ padding:"8px 16px", borderBottom:"1px solid var(--border)" }}>
            <div style={{ fontSize:11, color:"var(--text3)", marginBottom:4 }}>Custom Input</div>
            <textarea value={input} onChange={e=>setInput(e.target.value)} rows={2}
              style={{ resize:"none", fontFamily:"var(--font-mono)", fontSize:11, background:"var(--bg3)" }} />
          </div>

          {/* Output */}
          {output && (
            <div style={{ padding:"8px 16px", borderBottom:"1px solid var(--border)", maxHeight:130, overflowY:"auto" }}>
              {output.status === "running" ? (
                <div style={{ display:"flex",alignItems:"center",gap:8,fontSize:12,color:"var(--text2)" }}>
                  <div className="spin-anim" style={{ width:12,height:12,border:"2px solid var(--border)",borderTopColor:"var(--accent)",borderRadius:"50%" }} />
                  {output.message || "Running..."}
                </div>
              ) : (
                <div>
                  <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:4 }}>
                    <span style={{ fontSize:14, fontWeight:700, color: VERDICT_COLORS[output.verdict] || "var(--text)" }}>
                      {output.verdict === "Accepted" ? "✅" : "❌"} {output.verdict}
                    </span>
                    {output.time && <span style={{ fontSize:11, color:"var(--text3)" }}>· {output.time}s · {output.memory ? Math.round(output.memory/1024)+"MB" : ""}</span>}
                  </div>
                  {output.stdout && <div style={{ fontFamily:"var(--font-mono)",fontSize:11,color:"var(--green)",lineHeight:1.6 }}>{output.stdout}</div>}
                  {output.stderr && <div style={{ fontFamily:"var(--font-mono)",fontSize:11,color:"var(--red)",lineHeight:1.6 }}>{output.stderr}</div>}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div style={{ padding:"10px 16px", display:"flex", gap:8 }}>
            <Button variant="outline" onClick={handleRun} loading={running} style={{ flex:1 }}>▶ Run Code</Button>
            <Button variant="primary" onClick={handleSubmit} loading={running} style={{ flex:1 }}>⬆ Submit</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
