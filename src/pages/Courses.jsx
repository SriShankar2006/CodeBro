// src/pages/Courses.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { COURSES } from "../data/courses";
import { Card, ProgressBar, TabBar, Tag, Button, SectionHeader, VideoPlayer } from "../components/UI";
import { getAllCourseProgress, upsertCourseProgress } from "../services/supabase";
import useStore from "../context/useStore";

// ── Course List ───────────────────────────────────────────
export default function Courses() {
  const navigate = useNavigate();
  const { user } = useStore();
  const [tab,      setTab]      = useState("All");
  const [search,   setSearch]   = useState("");
  const [progress, setProgress] = useState({}); // { courseId: pct }
  const [loading,  setLoading]  = useState(true);

  // Load REAL progress from Supabase — 0 for new users
  useEffect(() => {
    if (!user?.uid) { setLoading(false); return; }
    (async () => {
      const rows = await getAllCourseProgress(user.uid);
      const map  = {};
      rows.forEach(r => { map[r.course_id] = r.progress_pct || 0; });
      setProgress(map);
      setLoading(false);
    })();
  }, [user?.uid]);

  const filtered = COURSES.filter(c => {
    if (tab === "My Courses" && !progress[c.id]) return false;
    if (tab === "Completed"  && progress[c.id] !== 100) return false;
    if (tab !== "All" && tab !== "My Courses" && tab !== "Completed" && c.level !== tab) return false;
    if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="page-container fade-in">
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:12 }}>
        <div>
          <h2>Learning Paths</h2>
          <p style={{ fontSize:12,marginTop:2 }}>Master programming from beginner to FAANG-ready</p>
        </div>
        <input type="text" placeholder="🔍 Search courses..." value={search} onChange={e=>setSearch(e.target.value)} style={{ width:220 }} />
      </div>

      <div style={{ marginBottom:20 }}>
        <TabBar tabs={["All","My Courses","Beginner","Intermediate","Advanced","Completed"]} active={tab} onChange={setTab} />
      </div>

      <div className="grid-3">
        {filtered.map((course, i) => {
          const prog = progress[course.id] || 0; // 0 for new users
          return (
            <motion.div key={course.id} initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*.06 }}>
              <div className="card card-hover" onClick={() => navigate(`/courses/${course.id}`)} style={{ padding:0, overflow:"hidden" }}>
                {/* Thumbnail */}
                <div style={{ height:120, background:course.color, position:"relative", overflow:"hidden" }}>
                  <img src={course.thumbnail} alt={course.title} style={{ width:"100%",height:"100%",objectFit:"cover",opacity:0.4 }} onError={e=>e.target.style.display="none"} />
                  <div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:48 }}>
                    {course.icon}
                  </div>
                  <div style={{ position:"absolute",top:10,right:10 }}>
                    <span className={`tag tag-${course.level==="Beginner"?"green":course.level==="Intermediate"?"blue":"purple"}`} style={{ fontSize:10 }}>{course.level}</span>
                  </div>
                  {prog === 100 && (
                    <div style={{ position:"absolute",top:10,left:10,background:"var(--green)",color:"#fff",borderRadius:20,padding:"2px 8px",fontSize:10,fontWeight:700 }}>✅ Done</div>
                  )}
                </div>

                {/* Body */}
                <div style={{ padding:14 }}>
                  <div style={{ fontSize:13,fontWeight:700,marginBottom:5 }}>{course.title}</div>
                  <div style={{ fontSize:11,color:"var(--text2)",lineHeight:1.5,marginBottom:10 }}>{course.description.slice(0,85)}...</div>
                  <div style={{ display:"flex",gap:4,flexWrap:"wrap",marginBottom:10 }}>
                    {course.tags.slice(0,3).map(t => <span key={t} className="tag tag-blue" style={{ fontSize:10 }}>{t}</span>)}
                  </div>
                  <div style={{ display:"flex",justifyContent:"space-between",fontSize:11,color:"var(--text3)",marginBottom:10 }}>
                    <span>📹 {course.totalLessons} lessons · ⏱ {course.estimatedHours}h</span>
                    <span>⭐ {course.rating} · 👥 {(course.enrolled/1000).toFixed(0)}K</span>
                  </div>
                  {prog > 0 ? (
                    <>
                      <ProgressBar value={prog} />
                      <div style={{ fontSize:10,color:"var(--text3)",marginTop:4 }}>{prog}% complete</div>
                    </>
                  ) : (
                    <div style={{ fontSize:10,color:"var(--text3)" }}>Not started yet</div>
                  )}
                  <button className={`btn ${prog===100?"btn-success":prog>0?"btn-outline":"btn-primary"} btn-sm`} style={{ width:"100%",marginTop:10,justifyContent:"center" }}>
                    {prog===100 ? "✅ Completed — Review" : prog>0 ? "Continue →" : "Start Course"}
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ gridColumn:"1/-1",textAlign:"center",padding:60,color:"var(--text3)" }}>
            <div style={{ fontSize:40,marginBottom:12 }}>📚</div>
            No courses match your filters
          </div>
        )}
      </div>
    </div>
  );
}

// ── Course Detail with playable videos ────────────────────
export function CourseDetail() {
  const { courseId }  = useParams();
  const navigate      = useNavigate();
  const { user, awardXP } = useStore();

  const course = COURSES.find(c => c.id === courseId) || COURSES[0];
  const [progress,     setProgress]     = useState({});
  const [activeLesson, setActiveLesson] = useState(null);
  const [expandedCh,   setExpandedCh]   = useState(1);

  // Load progress
  useEffect(() => {
    if (!user?.uid) return;
    (async () => {
      const { getCourseProgress } = await import("../services/supabase");
      const row = await getCourseProgress(user.uid, course.id);
      const completed = row?.completed_lessons || [];
      const map = {};
      completed.forEach(k => { map[k] = true; });
      setProgress(map);
      // Auto-open first unfinished chapter
      for (const ch of course.chapters) {
        const chDone = ch.lessons.every(l => map[l.id]);
        if (!chDone) { setExpandedCh(ch.id); break; }
      }
    })();
  }, [user?.uid, course.id]);

  // Set first lesson by default
  useEffect(() => {
    if (course.chapters?.[0]?.lessons?.[0]) {
      setActiveLesson(course.chapters[0].lessons[0]);
    }
  }, [course.id]);

  const totalLessons   = course.chapters.reduce((s,c) => s + c.lessons.length, 0);
  const doneLessons    = Object.keys(progress).length;
  const progressPct    = Math.round(doneLessons / totalLessons * 100);

  const markComplete = async lesson => {
    if (progress[lesson.id] || !user?.uid) return;
    await upsertCourseProgress(user.uid, course.id, lesson.id, totalLessons);
    setProgress(p => ({ ...p, [lesson.id]: true }));
    await awardXP(15, `Completed lesson: ${lesson.title}`);
    toast.success(`✅ Lesson complete! +15 XP`);
  };

  return (
    <div style={{ display:"flex", height:`calc(100vh - var(--nav-height))`, overflow:"hidden" }}>
      {/* Sidebar */}
      <div style={{ width:320,flexShrink:0,overflowY:"auto",borderRight:"1px solid var(--border)",background:"var(--bg2)",display:"flex",flexDirection:"column" }}>
        <div style={{ padding:"16px 18px",borderBottom:"1px solid var(--border)",flexShrink:0 }}>
          <button className="btn btn-outline btn-sm" onClick={() => navigate("/courses")} style={{ marginBottom:12 }}>← Back</button>
          <div style={{ fontSize:22,marginBottom:6 }}>{course.icon}</div>
          <h3 style={{ fontSize:14,marginBottom:6 }}>{course.title}</h3>
          <div style={{ fontSize:11,color:"var(--text3)",marginBottom:8 }}>{doneLessons}/{totalLessons} lessons · {progressPct}% complete</div>
          <ProgressBar value={progressPct} />
        </div>

        <div style={{ flex:1,overflowY:"auto" }}>
          {course.chapters.map(ch => {
            const chDone = ch.lessons.filter(l => progress[l.id]).length;
            return (
              <div key={ch.id}>
                <div onClick={() => setExpandedCh(expandedCh===ch.id ? null : ch.id)}
                  style={{ display:"flex",alignItems:"center",gap:10,padding:"11px 18px",cursor:"pointer",borderBottom:"1px solid var(--border)",background:"var(--bg3)",transition:"background .1s" }}
                  onMouseEnter={e=>e.currentTarget.style.background="var(--bg4)"}
                  onMouseLeave={e=>e.currentTarget.style.background="var(--bg3)"}
                >
                  <span style={{ fontSize:14 }}>{chDone===ch.lessons.length?"✅":expandedCh===ch.id?"📂":"📁"}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:12,fontWeight:600 }}>Ch.{ch.id}: {ch.title}</div>
                    <div style={{ fontSize:10,color:"var(--text3)" }}>{chDone}/{ch.lessons.length} lessons</div>
                  </div>
                  <span style={{ color:"var(--text3)",fontSize:12 }}>{expandedCh===ch.id?"▲":"▼"}</span>
                </div>
                {expandedCh === ch.id && ch.lessons.map(lesson => {
                  const done   = !!progress[lesson.id];
                  const active = activeLesson?.id === lesson.id;
                  return (
                    <div key={lesson.id} onClick={() => setActiveLesson(lesson)}
                      style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 20px 10px 28px",cursor:"pointer",transition:"background .1s",
                        background: active?"rgba(99,102,241,.12)":"transparent",
                        borderLeft: active?"3px solid var(--accent)":"3px solid transparent",
                      }}
                      onMouseEnter={e=>!active&&(e.currentTarget.style.background="var(--bg3)")}
                      onMouseLeave={e=>!active&&(e.currentTarget.style.background="transparent")}
                    >
                      <span style={{ fontSize:14,color:done?"var(--green)":"var(--text3)" }}>{done?"✅":"▶"}</span>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:11,fontWeight:active?700:400,color:active?"var(--accent3)":"var(--text)" }}>{lesson.title}</div>
                        <div style={{ fontSize:10,color:"var(--text3)" }}>⏱ {lesson.duration}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex:1,overflowY:"auto",padding:24 }}>
        {activeLesson ? (
          <div>
            <h2 style={{ marginBottom:6 }}>{activeLesson.title}</h2>
            <div style={{ fontSize:12,color:"var(--text3)",marginBottom:16 }}>⏱ {activeLesson.duration} · {course.title}</div>

            {/* YouTube video player */}
            <VideoPlayer videoId={activeLesson.videoId} title={activeLesson.title} />

            <div style={{ marginTop:20,display:"flex",gap:10,alignItems:"center" }}>
              {!progress[activeLesson.id] ? (
                <Button variant="success" onClick={() => markComplete(activeLesson)}>
                  ✅ Mark as Complete (+15 XP)
                </Button>
              ) : (
                <div style={{ display:"flex",alignItems:"center",gap:6,color:"var(--green)",fontWeight:600,fontSize:13 }}>
                  ✅ Completed!
                </div>
              )}
              {/* Next lesson */}
              {(() => {
                let found = false;
                for (const ch of course.chapters) {
                  for (const l of ch.lessons) {
                    if (found) return (
                      <Button variant="outline" onClick={() => setActiveLesson(l)}>Next: {l.title} →</Button>
                    );
                    if (l.id === activeLesson.id) found = true;
                  }
                }
                return <span style={{ color:"var(--green)",fontSize:12,fontWeight:600 }}>🎉 Last lesson of this section!</span>;
              })()}
            </div>

            <div style={{ marginTop:24,padding:16,background:"var(--bg2)",border:"1px solid var(--border)",borderRadius:10 }}>
              <div style={{ fontWeight:700,marginBottom:8,fontSize:13 }}>📝 About this lesson</div>
              <p style={{ fontSize:12,lineHeight:1.7 }}>
                This lesson covers {activeLesson.title.toLowerCase()} as part of the {course.title} course.
                Watch the full video and mark as complete to earn XP and track your progress.
              </p>
            </div>
          </div>
        ) : (
          <div style={{ textAlign:"center",padding:60,color:"var(--text3)" }}>
            <div style={{ fontSize:56,marginBottom:16 }}>{course.icon}</div>
            <h2 style={{ marginBottom:8 }}>{course.title}</h2>
            <p style={{ marginBottom:20,maxWidth:440,margin:"0 auto 20px" }}>{course.description}</p>
            <Button variant="primary" onClick={() => setActiveLesson(course.chapters[0]?.lessons[0])}>
              Start Learning →
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
