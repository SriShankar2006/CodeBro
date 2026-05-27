// src/pages/Quiz.jsx
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { QUIZ_QUESTIONS, QUIZ_TOPICS } from "../data/courses";
import { saveQuizResult } from "../services/supabase";
import useStore from "../context/useStore";
import { Card, Button, ProgressBar, TabBar } from "../components/UI";

export default function Quiz() {
  const { user, awardXP } = useStore();
  const [phase,     setPhase]     = useState("select");
  const [topic,     setTopic]     = useState("Data Structures");
  const [diff,      setDiff]      = useState("All");
  const [questions, setQuestions] = useState([]);
  const [current,   setCurrent]   = useState(0);
  const [answers,   setAnswers]   = useState([]);
  const [timeLeft,  setTimeLeft]  = useState(0);
  const [showExp,   setShowExp]   = useState(false);
  const [score,     setScore]     = useState(0);

  const startQuiz = () => {
    let qs = [...(QUIZ_QUESTIONS[topic] || [])];
    if (diff !== "All") qs = qs.filter(q => q.difficulty === diff);
    if (!qs.length) { toast.error("No questions for this filter."); return; }
    const shuffled = qs.sort(() => Math.random() - 0.5).slice(0, Math.min(qs.length, 6));
    setQuestions(shuffled);
    setAnswers(new Array(shuffled.length).fill(-1));
    setCurrent(0);
    setTimeLeft(shuffled.length * 45);
    setShowExp(false);
    setPhase("quiz");
  };

  useEffect(() => {
    if (phase !== "quiz") return;
    if (timeLeft <= 0) { finishQuiz(); return; }
    const t = setTimeout(() => setTimeLeft(v => v - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, phase]);

  const selectAnswer = i => {
    if (answers[current] !== -1) return;
    const upd = [...answers]; upd[current] = i; setAnswers(upd); setShowExp(true);
  };

  const finishQuiz = useCallback(async () => {
    let correct = 0;
    questions.forEach((q, i) => { if (answers[i] === q.answer) correct++; });
    setScore(correct);
    setPhase("results");
    const xpEarned = correct * 20 + (correct === questions.length ? 50 : 0);
    if (xpEarned > 0) {
      await awardXP(xpEarned, `Quiz: ${correct}/${questions.length} correct`);
      toast.success(`+${xpEarned} XP earned!`);
    }
    if (user?.uid) {
      try {
        await saveQuizResult({ uid: user.uid, topic, score: correct, total: questions.length, accuracy: Math.round(correct/questions.length*100), xp_earned: xpEarned });
      } catch {}
    }
  }, [questions, answers, topic, user]);

  const accuracy = questions.length > 0 ? Math.round(score / questions.length * 100) : 0;
  const timerColor = timeLeft < 30 ? "var(--red)" : timeLeft < 60 ? "var(--yellow)" : "var(--accent3)";

  // ── Select ────────────────────────────────────────────
  if (phase === "select") return (
    <div className="page-container fade-in">
      <h2 style={{ marginBottom:4 }}>🎯 Quiz Center</h2>
      <p style={{ fontSize:12, marginBottom:24 }}>Test your knowledge. Earn XP for every correct answer.</p>
      <div className="grid-2" style={{ maxWidth:720, margin:"0 auto" }}>
        <div>
          <Card style={{ marginBottom:14 }}>
            <h4 style={{ marginBottom:12 }}>Choose Topic</h4>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {QUIZ_TOPICS.map(t => (
                <div key={t} onClick={() => setTopic(t)} style={{
                  padding:"10px 14px", borderRadius:8, cursor:"pointer", fontSize:12, fontWeight:600,
                  border:`1px solid ${topic===t?"var(--accent)":"var(--border)"}`,
                  background: topic===t ? "rgba(99,102,241,.1)" : "var(--bg3)",
                  color: topic===t ? "var(--accent3)" : "var(--text)", transition:"all .15s",
                }}>
                  {t}
                  <span style={{ float:"right", fontSize:11, color:"var(--text3)", fontWeight:400 }}>{QUIZ_QUESTIONS[t]?.length} Qs</span>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <h4 style={{ marginBottom:12 }}>Difficulty</h4>
            <TabBar tabs={["All","Easy","Medium","Hard"]} active={diff} onChange={setDiff} />
          </Card>
        </div>
        <div>
          <Card style={{ marginBottom:14 }}>
            <h4 style={{ marginBottom:12 }}>Quiz Settings</h4>
            {[
              ["📚 Topic",      topic],
              ["🎚 Difficulty", diff],
              ["❓ Questions",  "Up to 6"],
              ["⏱ Time",       "~4 minutes"],
              ["⚡ XP per correct","20 XP"],
              ["🎓 Perfect bonus", "50 XP"],
            ].map(([k,v]) => (
              <div key={k} style={{ display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid rgba(42,58,92,.4)",fontSize:12 }}>
                <span style={{ color:"var(--text2)" }}>{k}</span>
                <span style={{ color:"var(--text)",fontWeight:600 }}>{v}</span>
              </div>
            ))}
          </Card>
          <Button variant="primary" onClick={startQuiz} style={{ width:"100%", justifyContent:"center", padding:"13px" }}>
            🚀 Start Quiz
          </Button>
        </div>
      </div>
    </div>
  );

  // ── Results ───────────────────────────────────────────
  if (phase === "results") return (
    <div className="page-container fade-in" style={{ maxWidth:620, margin:"0 auto" }}>
      <motion.div initial={{ scale:.85, opacity:0 }} animate={{ scale:1, opacity:1 }}>
        <Card style={{ textAlign:"center", padding:36, marginBottom:20 }}>
          <div style={{ fontSize:60, marginBottom:12 }}>{accuracy>=80?"🎉":accuracy>=60?"😊":"💪"}</div>
          <h2 style={{ marginBottom:4 }}>Quiz Complete!</h2>
          <div style={{ fontSize:48, fontWeight:800, color: accuracy>=80?"var(--green)":accuracy>=60?"var(--yellow)":"var(--red)", margin:"14px 0" }}>
            {score} / {questions.length}
          </div>
          <div style={{ fontSize:13, color:"var(--text2)", marginBottom:20 }}>
            {accuracy}% accuracy · {score*20 + (score===questions.length?50:0)} XP earned
          </div>
          <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
            <Button variant="primary"  onClick={() => { setPhase("select"); }}>Try Another Quiz</Button>
            <Button variant="outline"  onClick={startQuiz}>Retry Same</Button>
          </div>
        </Card>
        <h4 style={{ marginBottom:12 }}>Review Your Answers</h4>
        {questions.map((q, i) => {
          const chosen  = answers[i];
          const isRight = chosen === q.answer;
          return (
            <Card key={q.id} style={{ marginBottom:10, borderLeft:`3px solid ${isRight?"var(--green)":"var(--red)"}` }}>
              <div style={{ fontSize:13, fontWeight:600, marginBottom:8 }}>{isRight?"✅":"❌"} Q{i+1}: {q.question}</div>
              {!isRight && chosen !== -1 && <div style={{ fontSize:12, color:"var(--red)", marginBottom:4 }}>Your answer: {q.options[chosen]}</div>}
              <div style={{ fontSize:12, color:"var(--green)", marginBottom:8 }}>Correct: {q.options[q.answer]}</div>
              <div style={{ fontSize:11, color:"var(--text2)", background:"var(--bg3)", padding:"8px 12px", borderRadius:6, lineHeight:1.6 }}>💡 {q.explanation}</div>
            </Card>
          );
        })}
      </motion.div>
    </div>
  );

  // ── Active quiz ───────────────────────────────────────
  const q      = questions[current];
  const chosen = answers[current];

  return (
    <div className="page-container fade-in" style={{ maxWidth:700, margin:"0 auto" }}>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16 }}>
        <div>
          <h3>{topic} Quiz</h3>
          <div style={{ fontSize:11, color:"var(--text3)" }}>Question {current+1} of {questions.length}</div>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontSize:26, fontWeight:800, color:timerColor, fontVariantNumeric:"tabular-nums" }}>
            {String(Math.floor(timeLeft/60)).padStart(2,"0")}:{String(timeLeft%60).padStart(2,"0")}
          </div>
          <div style={{ fontSize:10, color:"var(--text3)" }}>Time remaining</div>
        </div>
      </div>

      <ProgressBar value={(current+1)/questions.length*100} height={8} style={{ marginBottom:20 }} />

      <AnimatePresence mode="wait">
        <motion.div key={current} initial={{ opacity:0,x:20 }} animate={{ opacity:1,x:0 }} exit={{ opacity:0,x:-20 }}>
          <Card style={{ marginBottom:16 }}>
            <div style={{ fontSize:14, fontWeight:700, lineHeight:1.7, marginBottom:20 }}>{q.question}</div>
            <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
              {q.options.map((opt, i) => {
                const isChosen  = chosen === i;
                const isCorrect = i === q.answer;
                const revealed  = chosen !== -1;
                let border = "var(--border)", bg = "var(--bg3)", color = "var(--text)";
                if (revealed && isCorrect)              { border="var(--green)";  bg="rgba(16,185,129,.1)"; }
                else if (revealed && isChosen && !isCorrect) { border="var(--red)";   bg="rgba(239,68,68,.1)"; }
                return (
                  <div key={i} onClick={() => selectAnswer(i)} style={{
                    display:"flex",alignItems:"center",gap:12,padding:"12px 16px",
                    borderRadius:8,border:`1px solid ${border}`,background:bg,
                    cursor:chosen===-1?"pointer":"default",transition:"all .15s",color,
                  }}>
                    <div style={{ width:22,height:22,borderRadius:"50%",border:`1.5px solid ${border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,flexShrink:0,
                      background:revealed&&isCorrect?"var(--green)":revealed&&isChosen&&!isCorrect?"var(--red)":"transparent",
                      color:revealed&&(isCorrect||(isChosen&&!isCorrect))?"#fff":"inherit",
                    }}>
                      {revealed&&isCorrect?"✓":revealed&&isChosen&&!isCorrect?"✗":String.fromCharCode(65+i)}
                    </div>
                    <span style={{ fontSize:13 }}>{opt}</span>
                  </div>
                );
              })}
            </div>
            {showExp && (
              <motion.div initial={{ opacity:0,height:0 }} animate={{ opacity:1,height:"auto" }}
                style={{ marginTop:14,padding:"12px 14px",background:"rgba(16,185,129,.07)",border:"1px solid rgba(16,185,129,.2)",borderLeft:"3px solid var(--green)",borderRadius:"0 8px 8px 0" }}>
                <div style={{ fontSize:11,fontWeight:700,color:"var(--green)",marginBottom:4 }}>✅ Explanation</div>
                <div style={{ fontSize:12,color:"var(--text2)",lineHeight:1.7 }}>{q.explanation}</div>
              </motion.div>
            )}
          </Card>
        </motion.div>
      </AnimatePresence>

      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
        <Button variant="outline" onClick={() => { if(current>0){setCurrent(v=>v-1);setShowExp(answers[current-1]!==-1);} }} disabled={current===0}>← Previous</Button>
        <div style={{ display:"flex",gap:5 }}>
          {questions.map((_,i) => (
            <div key={i} onClick={() => { setCurrent(i);setShowExp(answers[i]!==-1); }} style={{ width:9,height:9,borderRadius:"50%",cursor:"pointer",background:i===current?"var(--accent)":answers[i]!==-1?"var(--green)":"var(--bg3)" }} />
          ))}
        </div>
        <Button variant="primary" onClick={() => { if(current<questions.length-1){setCurrent(v=>v+1);setShowExp(answers[current+1]!==-1);}else finishQuiz(); }} disabled={chosen===-1&&!showExp}>
          {current===questions.length-1?"Finish ✓":"Next →"}
        </Button>
      </div>
    </div>
  );
}
