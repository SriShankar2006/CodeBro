// src/pages/AIRoadmap.jsx
// AI-powered career roadmap generator using Google Gemini API
import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import useStore from "../context/useStore";
import { saveRoadmap, getUserRoadmaps } from "../services/supabase";
import { Card, Button, SectionHeader } from "../components/UI";
import { generateText, parseJsonResponse } from "../services/ai";

const CAREER_GOALS = [
  { label: "Full Stack Developer",       icon: "🌐", desc: "React, Node.js, Databases, APIs" },
  { label: "AI/ML Engineer",             icon: "🤖", desc: "Python, ML, Deep Learning, MLOps" },
  { label: "Data Scientist",             icon: "📊", desc: "Statistics, Python, SQL, Visualization" },
  { label: "Cybersecurity Analyst",      icon: "🔐", desc: "Networking, Ethical Hacking, Security" },
  { label: "Mobile App Developer",       icon: "📱", desc: "React Native, Flutter, iOS, Android" },
  { label: "Cloud/DevOps Engineer",      icon: "☁️",  desc: "AWS, Docker, Kubernetes, CI/CD" },
  { label: "Backend Engineer",           icon: "⚙️",  desc: "APIs, Databases, System Design" },
  { label: "Frontend Developer",         icon: "🎨", desc: "React, CSS, Performance, UX" },
  { label: "Blockchain Developer",       icon: "⛓️",  desc: "Solidity, Web3, Smart Contracts" },
  { label: "Game Developer",             icon: "🎮", desc: "Unity, C#, Graphics, Physics" },
];

const EXPERIENCE_LEVELS = ["Complete Beginner", "Some Programming Experience", "Intermediate Developer", "Experienced Developer"];
const TIMEFRAMES = ["3 months", "6 months", "1 year", "2 years"];

const SYSTEM_PROMPT = `You are an expert career advisor and technical mentor at a top tech company. 
Generate a detailed, personalized learning roadmap in STRICT JSON format only. No markdown, no extra text.
Return exactly this structure:
{
  "title": "string",
  "summary": "string (2-3 sentences)",
  "totalDuration": "string",
  "difficulty": "Beginner|Intermediate|Advanced",
  "phases": [
    {
      "phase": 1,
      "title": "string",
      "duration": "string",
      "focus": "string",
      "skills": ["skill1","skill2",...],
      "resources": [{"name":"string","type":"Course|Book|YouTube|Practice","url":"string","free":true},...],
      "projects": ["project1","project2",...],
      "milestones": ["milestone1","milestone2",...],
      "weeklyHours": number
    }
  ],
  "certifications": [{"name":"string","provider":"string","priority":"High|Medium|Low"},...],
  "interviewPrep": ["tip1","tip2",...],
  "salaryRange": "string",
  "jobTitles": ["title1","title2",...],
  "tools": ["tool1","tool2",...]
}
Make it comprehensive with 4-5 phases, 5-8 skills per phase, 3-4 resources, 2-3 projects, 3-4 milestones.`;

function normalizeRoadmap(value) {
  if (!value || typeof value !== "object" || Array.isArray(value) || !Array.isArray(value.phases)) {
    throw new Error("Gemini returned an incomplete roadmap. Please generate it again.");
  }
  const asTextList = items => Array.isArray(items) ? items.filter(item => typeof item === "string") : [];
  const phases = value.phases.filter(phase => phase && typeof phase === "object" && !Array.isArray(phase)).map((phase, index) => ({
    ...phase,
    phase: Number.isFinite(phase.phase) ? phase.phase : index + 1,
    title: typeof phase.title === "string" ? phase.title : `Phase ${index + 1}`,
    duration: typeof phase.duration === "string" ? phase.duration : "",
    focus: typeof phase.focus === "string" ? phase.focus : "",
    weeklyHours: Number.isFinite(phase.weeklyHours) ? phase.weeklyHours : 0,
    skills: asTextList(phase.skills),
    projects: asTextList(phase.projects),
    milestones: asTextList(phase.milestones),
    resources: Array.isArray(phase.resources) ? phase.resources.filter(resource => resource && typeof resource === "object" && typeof resource.name === "string") : [],
  }));
  if (!phases.length) throw new Error("Gemini returned no learning phases. Please generate the roadmap again.");
  return {
    ...value,
    title: typeof value.title === "string" ? value.title : "Personalized Learning Roadmap",
    summary: typeof value.summary === "string" ? value.summary : "",
    totalDuration: typeof value.totalDuration === "string" ? value.totalDuration : "",
    difficulty: typeof value.difficulty === "string" ? value.difficulty : "",
    salaryRange: typeof value.salaryRange === "string" ? value.salaryRange : "",
    phases,
    certifications: Array.isArray(value.certifications) ? value.certifications.filter(item => item && typeof item === "object" && typeof item.name === "string") : [],
    interviewPrep: asTextList(value.interviewPrep),
    jobTitles: asTextList(value.jobTitles),
    tools: asTextList(value.tools),
  };
}

function PhaseCard({ phase, index }) {
  const [expanded, setExpanded] = useState(index === 0);
  const colors = ["var(--accent)", "var(--green)", "var(--yellow)", "var(--purple)", "var(--cyan)"];
  const color = colors[index % colors.length];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}>
      <div style={{ border: `1px solid ${expanded ? color : "var(--border)"}`, borderRadius: 12, marginBottom: 12, overflow: "hidden", transition: "border-color .2s" }}>
        {/* Header */}
        <div onClick={() => setExpanded(e => !e)}
          style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 18px", cursor: "pointer", background: expanded ? `${color}10` : "var(--bg2)", transition: "background .2s" }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#fff", flexShrink: 0 }}>
            {phase.phase}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Phase {phase.phase}: {phase.title}</div>
            <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 2 }}>⏱ {phase.duration} · 📚 {phase.weeklyHours}h/week · {phase.focus}</div>
          </div>
          <span style={{ color: "var(--text3)", fontSize: 16 }}>{expanded ? "▲" : "▼"}</span>
        </div>

        {/* Body */}
        {expanded && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: "16px 18px", background: "var(--bg3)", borderTop: `1px solid ${color}30` }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
              {/* Skills */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color, marginBottom: 8 }}>🎯 Skills to Learn</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                  {(phase.skills || []).map(s => (
                    <span key={s} style={{ padding: "3px 8px", background: `${color}15`, border: `1px solid ${color}40`, borderRadius: 12, fontSize: 11, color }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Projects */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--orange)", marginBottom: 8 }}>🛠️ Build Projects</div>
                {(phase.projects || []).map((p, i) => (
                  <div key={i} style={{ display: "flex", gap: 6, marginBottom: 5, fontSize: 12, color: "var(--text2)" }}>
                    <span style={{ color: "var(--orange)" }}>▸</span> {p}
                  </div>
                ))}
              </div>

              {/* Milestones */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--green)", marginBottom: 8 }}>✅ Milestones</div>
                {(phase.milestones || []).map((m, i) => (
                  <div key={i} style={{ display: "flex", gap: 6, marginBottom: 5, fontSize: 12, color: "var(--text2)" }}>
                    <span style={{ color: "var(--green)" }}>✓</span> {m}
                  </div>
                ))}
              </div>

              {/* Resources */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--cyan)", marginBottom: 8 }}>📖 Resources</div>
                {(phase.resources || []).map((r, i) => (
                  <div key={i} style={{ marginBottom: 6 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--accent3)" }}>{r.name}</div>
                    <div style={{ fontSize: 10, color: "var(--text3)" }}>
                      {r.type} · {r.free ? "🆓 Free" : "💰 Paid"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

function RoadmapDisplay({ roadmap, goal }) {
  if (!roadmap) return null;
  return (
    <div>
      {/* Header */}
      <Card style={{ marginBottom: 16, background: "linear-gradient(135deg, rgba(99,102,241,.1), rgba(168,85,247,.08))", border: "1px solid rgba(99,102,241,.3)" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ marginBottom: 6, fontSize: 20 }}>🗺️ {roadmap.title || goal}</h2>
            <p style={{ fontSize: 13, color: "var(--text2)", marginBottom: 12, lineHeight: 1.6 }}>{roadmap.summary}</p>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              {[
                { icon: "⏱", label: roadmap.totalDuration, color: "var(--yellow)" },
                { icon: "📈", label: roadmap.difficulty, color: "var(--green)" },
                { icon: "💰", label: roadmap.salaryRange, color: "var(--accent3)" },
              ].map(({ icon, label, color }) => label && (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span>{icon}</span>
                  <span style={{ fontSize: 12, color, fontWeight: 600 }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
          {roadmap.jobTitles && roadmap.jobTitles.length > 0 && (
            <div>
              <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 6 }}>Job Titles</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {roadmap.jobTitles.slice(0, 4).map(t => (
                  <span key={t} style={{ padding: "3px 8px", background: "rgba(99,102,241,.15)", border: "1px solid rgba(99,102,241,.3)", borderRadius: 12, fontSize: 11, color: "var(--accent3)" }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Tools */}
      {roadmap.tools && roadmap.tools.length > 0 && (
        <Card style={{ marginBottom: 16 }}>
          <SectionHeader title="🔧 Key Tools & Technologies" />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {roadmap.tools.map(t => (
              <span key={t} style={{ padding: "4px 10px", background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 16, fontSize: 11, color: "var(--text2)" }}>
                {t}
              </span>
            ))}
          </div>
        </Card>
      )}

      {/* Phases */}
      <h3 style={{ marginBottom: 12 }}>📋 Learning Phases</h3>
      {(roadmap.phases || []).map((phase, i) => (
        <PhaseCard key={i} phase={phase} index={i} />
      ))}

      {/* Bottom row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14, marginTop: 8 }}>
        {/* Certifications */}
        {roadmap.certifications && roadmap.certifications.length > 0 && (
          <Card>
            <SectionHeader title="🏆 Certifications" />
            {roadmap.certifications.map((c, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < roadmap.certifications.length - 1 ? "1px solid var(--border)" : "none", fontSize: 12 }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{c.name}</div>
                  <div style={{ fontSize: 10, color: "var(--text3)" }}>{c.provider}</div>
                </div>
                <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 10, fontWeight: 600,
                  background: c.priority === "High" ? "rgba(239,68,68,.1)" : c.priority === "Medium" ? "rgba(245,158,11,.1)" : "rgba(16,185,129,.1)",
                  color: c.priority === "High" ? "var(--red)" : c.priority === "Medium" ? "var(--yellow)" : "var(--green)",
                }}>
                  {c.priority}
                </span>
              </div>
            ))}
          </Card>
        )}

        {/* Interview Prep */}
        {roadmap.interviewPrep && roadmap.interviewPrep.length > 0 && (
          <Card>
            <SectionHeader title="🎯 Interview Preparation" />
            {roadmap.interviewPrep.map((tip, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 12, color: "var(--text2)", lineHeight: 1.5 }}>
                <span style={{ color: "var(--accent3)", flexShrink: 0 }}>{i + 1}.</span> {tip}
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}

export default function AIRoadmap() {
  const { user, userProfile, notifyProgress } = useStore();
  const [selectedGoal, setSelectedGoal] = useState("");
  const [customGoal, setCustomGoal] = useState("");
  const [experience, setExperience] = useState("Complete Beginner");
  const [timeframe, setTimeframe] = useState("6 months");
  const [loading, setLoading] = useState(false);
  const [roadmap, setRoadmap] = useState(null);
  const [currentGoal, setCurrentGoal] = useState("");
  const [savedRoadmaps, setSavedRoadmaps] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(true);
  const [activeView, setActiveView] = useState("generate"); // "generate" | "saved"

  const loadSavedRoadmaps = useCallback(async () => {
    if (!user?.uid) {
      setSavedRoadmaps([]);
      setLoadingSaved(false);
      return;
    }
    setLoadingSaved(true);
    try {
      const idToken = await user.getIdToken();
      const data = await getUserRoadmaps(idToken);
      setSavedRoadmaps(Array.isArray(data) ? data : []);
    } catch (error) {
      setSavedRoadmaps([]);
      toast.error(`Saved roadmaps could not be loaded: ${error.message}`);
    } finally {
      setLoadingSaved(false);
    }
  }, [user]);

  useEffect(() => {
    loadSavedRoadmaps();
  }, [loadSavedRoadmaps]);

  const generateRoadmap = async () => {
    const goal = customGoal.trim() || selectedGoal;
    if (!goal) { toast.error("Please select or enter a career goal"); return; }

    setLoading(true);
    setRoadmap(null);
    setCurrentGoal(goal);

    try {
      const idToken = await user?.getIdToken?.();
      if (!idToken) throw new Error("Sign in before generating a roadmap.");
      const prompt = `Generate a complete learning roadmap for: "${goal}"
Experience level: ${experience}
Target timeframe: ${timeframe}
Name: ${userProfile?.display_name || "Developer"}

Make it realistic, detailed, and actionable. Include specific resources, projects, and milestones.`;

      const text = await generateText({
        systemInstruction: SYSTEM_PROMPT,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        maxOutputTokens: 4000,
        idToken,
      });
      const parsed = normalizeRoadmap(parseJsonResponse(text));

      setRoadmap(parsed);

      // Save to Supabase
      if (user?.uid) {
        try {
          const saved = await saveRoadmap(idToken, goal, parsed);
          setSavedRoadmaps(current => [saved, ...current.filter(item => item.id !== saved.id)].slice(0, 50));
          notifyProgress();
          toast.success("🗺️ Roadmap generated and saved!");
        } catch (saveError) {
          toast.error(`Roadmap generated, but was not saved: ${saveError.message}`);
        }
      } else {
        toast("Roadmap generated. Sign in to save it.", { icon: "i" });
      }
    } catch (err) {
      console.error("Roadmap generation error:", err);
      toast.error(err.message || "Failed to generate roadmap. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadSavedRoadmap = (saved) => {
    setRoadmap(saved.roadmap);
    setCurrentGoal(saved.goal);
    setActiveView("generate");
  };

  return (
    <div className="page-container fade-in">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ marginBottom: 4 }}>✨ AI Career Roadmap Generator</h2>
          <p style={{ fontSize: 12, color: "var(--text3)" }}>
            Get a personalized, AI-generated learning roadmap for your dream tech career
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setActiveView("generate")}
            style={{ padding: "7px 14px", borderRadius: 8, border: `1px solid ${activeView === "generate" ? "var(--accent)" : "var(--border)"}`, background: activeView === "generate" ? "rgba(99,102,241,.1)" : "transparent", color: activeView === "generate" ? "var(--accent3)" : "var(--text2)", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
            ✨ Generate
          </button>
          <button onClick={() => setActiveView("saved")}
            style={{ padding: "7px 14px", borderRadius: 8, border: `1px solid ${activeView === "saved" ? "var(--accent)" : "var(--border)"}`, background: activeView === "saved" ? "rgba(99,102,241,.1)" : "transparent", color: activeView === "saved" ? "var(--accent3)" : "var(--text2)", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
            📂 Saved ({savedRoadmaps.length})
          </button>
        </div>
      </div>

      {activeView === "saved" ? (
        <div>
          {loadingSaved ? (
            <Card><div style={{ textAlign: "center", padding: 40, color: "var(--text3)" }}>Loading saved roadmaps...</div></Card>
          ) : savedRoadmaps.length === 0 ? (
            <Card style={{ textAlign: "center", padding: 48 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🗺️</div>
              <h3 style={{ marginBottom: 8 }}>No saved roadmaps yet</h3>
              <p style={{ color: "var(--text3)", fontSize: 12, marginBottom: 16 }}>Generate your first AI roadmap!</p>
              <Button variant="primary" onClick={() => setActiveView("generate")}>Generate Roadmap →</Button>
            </Card>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
              {savedRoadmaps.map((r) => (
                <Card key={r.id} style={{ cursor: "pointer" }} onClick={() => loadSavedRoadmap(r)}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>🗺️</div>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{r.goal}</div>
                  <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 12 }}>
                    {new Date(r.created_at).toLocaleDateString()}
                    {r.roadmap?.totalDuration ? ` · ${r.roadmap.totalDuration}` : ""}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 12 }}>
                    {(r.roadmap?.tools || []).slice(0, 4).map(t => (
                      <span key={t} style={{ padding: "2px 7px", background: "rgba(99,102,241,.1)", border: "1px solid rgba(99,102,241,.25)", borderRadius: 10, fontSize: 10, color: "var(--accent3)" }}>{t}</span>
                    ))}
                  </div>
                  <Button variant="outline" size="sm">View Roadmap →</Button>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          {/* Generator Form */}
          {!roadmap && !loading && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
                {/* Goal selection */}
                <div>
                  <h4 style={{ marginBottom: 14 }}>🎯 Choose Your Career Goal</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {CAREER_GOALS.map(({ label, icon, desc }) => (
                      <div key={label} onClick={() => { setSelectedGoal(label); setCustomGoal(""); }}
                        style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, cursor: "pointer", border: `1px solid ${selectedGoal === label ? "var(--accent)" : "var(--border)"}`, background: selectedGoal === label ? "rgba(99,102,241,.1)" : "var(--bg2)", transition: "all .15s" }}>
                        <span style={{ fontSize: 20 }}>{icon}</span>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: selectedGoal === label ? "var(--accent3)" : "var(--text)" }}>{label}</div>
                          <div style={{ fontSize: 10, color: "var(--text3)" }}>{desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: 14 }}>
                    <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 6 }}>Or enter a custom goal:</div>
                    <input type="text" maxLength={200} placeholder="e.g. Embedded Systems Engineer..." value={customGoal}
                      onChange={e => { setCustomGoal(e.target.value); setSelectedGoal(""); }}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${customGoal ? "var(--accent)" : "var(--border)"}`, background: "var(--bg3)", color: "var(--text)", fontSize: 12 }}
                    />
                  </div>
                </div>

                {/* Settings */}
                <div>
                  <h4 style={{ marginBottom: 14 }}>⚙️ Personalize Your Roadmap</h4>
                  <Card style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10 }}>Your Experience Level</div>
                    {EXPERIENCE_LEVELS.map(lvl => (
                      <div key={lvl} onClick={() => setExperience(lvl)}
                        style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderRadius: 8, cursor: "pointer", marginBottom: 5, border: `1px solid ${experience === lvl ? "var(--accent)" : "var(--border)"}`, background: experience === lvl ? "rgba(99,102,241,.08)" : "transparent" }}>
                        <span style={{ width: 14, height: 14, borderRadius: "50%", border: `2px solid ${experience === lvl ? "var(--accent)" : "var(--border)"}`, background: experience === lvl ? "var(--accent)" : "transparent", flexShrink: 0 }} />
                        <span style={{ fontSize: 12, color: experience === lvl ? "var(--accent3)" : "var(--text2)" }}>{lvl}</span>
                      </div>
                    ))}
                  </Card>

                  <Card style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10 }}>Target Timeframe</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                      {TIMEFRAMES.map(tf => (
                        <div key={tf} onClick={() => setTimeframe(tf)}
                          style={{ padding: "9px 12px", borderRadius: 8, cursor: "pointer", textAlign: "center", border: `1px solid ${timeframe === tf ? "var(--accent)" : "var(--border)"}`, background: timeframe === tf ? "rgba(99,102,241,.1)" : "transparent", fontSize: 12, fontWeight: timeframe === tf ? 700 : 400, color: timeframe === tf ? "var(--accent3)" : "var(--text2)" }}>
                          {tf}
                        </div>
                      ))}
                    </div>
                  </Card>

                  <Card style={{ background: "linear-gradient(135deg, rgba(99,102,241,.08), rgba(168,85,247,.06))", border: "1px solid rgba(99,102,241,.25)" }}>
                    <div style={{ fontSize: 12, marginBottom: 6, fontWeight: 700 }}>📋 Your Roadmap will include:</div>
                    {["4-5 learning phases with milestones", "Curated resources & tutorials", "Hands-on projects for portfolio", "Certification recommendations", "Interview preparation tips", "Salary & job market insights"].map(f => (
                      <div key={f} style={{ display: "flex", gap: 7, fontSize: 11, color: "var(--text2)", marginBottom: 5 }}>
                        <span style={{ color: "var(--green)" }}>✓</span> {f}
                      </div>
                    ))}
                  </Card>

                  <Button variant="primary" onClick={generateRoadmap}
                    style={{ width: "100%", justifyContent: "center", padding: "13px", marginTop: 14, fontSize: 13 }}
                    disabled={!selectedGoal && !customGoal.trim()}>
                    ✨ Generate My Roadmap
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <Card style={{ textAlign: "center", padding: 60 }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>🤖</div>
              <h3 style={{ marginBottom: 8 }}>Generating Your Personalized Roadmap</h3>
              <p style={{ color: "var(--text3)", fontSize: 12, marginBottom: 24 }}>
                Analyzing your goal: <strong style={{ color: "var(--accent3)" }}>{currentGoal}</strong><br />
                This takes 15-30 seconds...
              </p>
              <div style={{ display: "flex", justifyContent: "center", gap: 6 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: "var(--accent)", animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                ))}
              </div>
              <style>{`@keyframes pulse { 0%,100%{opacity:.2;transform:scale(.8)} 50%{opacity:1;transform:scale(1)} }`}</style>
            </Card>
          )}

          {/* Roadmap display */}
          {roadmap && !loading && (
            <div>
              <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
                <Button variant="outline" onClick={() => { setRoadmap(null); setSelectedGoal(""); setCustomGoal(""); }}>
                  ← Generate New
                </Button>
                <Button variant="primary" onClick={generateRoadmap}>
                  🔄 Regenerate
                </Button>
              </div>
              <RoadmapDisplay roadmap={roadmap} goal={currentGoal} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
