// src/pages/Certificates.jsx — Full certificate system with PDF download
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import useStore from "../context/useStore";
import { getUserCertificates, saveCertificate, verifyCertificate, getAllCourseProgress } from "../services/supabase";
import { Card, Button, SectionHeader } from "../components/UI";
import { getAllCourses } from "../utils/adminContent";

// ── Certificate Card (printable) ──────────────────────────
function CertificateView({ cert, onDownload }) {
  const certRef = useRef();

  const handlePrint = () => {
    const content = certRef.current?.innerHTML;
    if (!content) return;
    const win = window.open("", "_blank");
    win.document.write(`
      <!DOCTYPE html><html><head>
      <title>Certificate - ${cert.course_title}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Inter:wght@300;400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: white; display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: 'Inter', sans-serif; }
        .cert { width: 900px; height: 636px; background: linear-gradient(135deg, #0d1b35, #1a1040, #0f2d40); border: 3px solid #d4a017; border-radius: 12px; padding: 48px 56px; position: relative; overflow: hidden; color: white; }
        .cert::before { content:''; position:absolute; inset:10px; border:1px solid rgba(212,160,23,.3); border-radius:8px; pointer-events:none; }
        .corner { position:absolute; width:60px; height:60px; border-color:#d4a017; border-style:solid; }
        .tl { top:20px; left:20px; border-width:2px 0 0 2px; }
        .tr { top:20px; right:20px; border-width:2px 2px 0 0; }
        .bl { bottom:20px; left:20px; border-width:0 0 2px 2px; }
        .br { bottom:20px; right:20px; border-width:0 2px 2px 0; }
        .header { text-align:center; margin-bottom:20px; }
        .org { font-family:'Cinzel',serif; font-size:13px; letter-spacing:0.3em; color:#d4a017; text-transform:uppercase; }
        .title { font-family:'Cinzel',serif; font-size:36px; font-weight:700; color:#fff; margin:8px 0; text-shadow:0 0 20px rgba(212,160,23,.4); }
        .subtitle { font-size:12px; color:#a0b0c8; letter-spacing:0.15em; }
        .divider { width:200px; height:1px; background:linear-gradient(90deg,transparent,#d4a017,transparent); margin:16px auto; }
        .body { text-align:center; }
        .presented { font-size:12px; color:#a0b0c8; letter-spacing:0.1em; margin-bottom:8px; }
        .name { font-family:'Cinzel',serif; font-size:28px; color:#ffd700; font-weight:700; margin-bottom:12px; text-shadow:0 0 15px rgba(255,215,0,.3); }
        .course-txt { font-size:13px; color:#c0d0e8; line-height:1.6; max-width:520px; margin:0 auto 16px; }
        .course-name { color:#818cf8; font-weight:600; font-size:15px; }
        .meta { display:flex; justify-content:center; gap:40px; margin-top:20px; }
        .meta-item { text-align:center; }
        .meta-label { font-size:10px; color:#6a8a9a; letter-spacing:0.1em; text-transform:uppercase; }
        .meta-value { font-size:12px; color:#d4a017; font-weight:600; margin-top:3px; }
        .cert-id { font-family:monospace; font-size:11px; color:#5a7a8a; margin-top:4px; letter-spacing:0.05em; }
        .footer { position:absolute; bottom:32px; left:0; right:0; display:flex; justify-content:center; gap:60px; padding:0 56px; }
        .signature-image { width:150px; height:58px; object-fit:contain; display:block; margin:-6px auto -2px; filter:brightness(0) invert(1); }
        .sig-line { width:140px; height:1px; background:#d4a017; margin:0 auto 6px; }
        .sig-label { font-size:10px; color:#6a8a9a; text-align:center; letter-spacing:0.08em; }
        .sig-name { font-size:11px; color:#c0d0e8; font-weight:600; text-align:center; margin-bottom:2px; }
        .seal { width:64px; height:64px; border-radius:50%; border:2px solid #d4a017; display:flex; align-items:center; justify-content:center; font-size:28px; background:rgba(212,160,23,.1); }
      </style>
      </head><body>${content}</body></html>
    `);
    win.document.close();
    setTimeout(() => { win.print(); }, 500);
    if (onDownload) onDownload();
  };

  return (
    <div>
      {/* Printable certificate */}
      <div ref={certRef}>
        <div className="cert" style={{
          width:"100%", maxWidth:900, background:"linear-gradient(135deg,#0d1b35,#1a1040,#0f2d40)",
          border:"3px solid #d4a017", borderRadius:12, padding:"48px 56px", position:"relative",
          overflow:"hidden", color:"white", margin:"0 auto",
        }}>
          {/* Corner decorations */}
          {[{cls:"tl",s:{top:20,left:20,borderWidth:"2px 0 0 2px"}},{cls:"tr",s:{top:20,right:20,borderWidth:"2px 2px 0 0"}},{cls:"bl",s:{bottom:20,left:20,borderWidth:"0 0 2px 2px"}},{cls:"br",s:{bottom:20,right:20,borderWidth:"0 2px 2px 0"}}].map(({cls,s})=>(
            <div key={cls} style={{ position:"absolute",width:60,height:60,borderColor:"#d4a017",borderStyle:"solid",borderRadius:2,...s }} />
          ))}
          {/* Inner border */}
          <div style={{ position:"absolute",inset:10,border:"1px solid rgba(212,160,23,.3)",borderRadius:8,pointerEvents:"none" }} />

          {/* Header */}
          <div style={{ textAlign:"center",marginBottom:24 }}>
            <div style={{ fontFamily:"serif",fontSize:12,letterSpacing:"0.3em",color:"#d4a017",textTransform:"uppercase",marginBottom:8 }}>CodeBro Learning Platform</div>
            <div style={{ fontFamily:"serif",fontSize:34,fontWeight:700,color:"#fff",margin:"0 0 8px",textShadow:"0 0 20px rgba(212,160,23,.4)" }}>Certificate of Completion</div>
            <div style={{ fontSize:11,color:"#a0b0c8",letterSpacing:"0.15em" }}>This is to certify that</div>
            <div style={{ width:200,height:1,background:"linear-gradient(90deg,transparent,#d4a017,transparent)",margin:"14px auto" }} />
          </div>

          {/* Body */}
          <div style={{ textAlign:"center" }}>
            <div style={{ fontFamily:"serif",fontSize:28,color:"#ffd700",fontWeight:700,marginBottom:16,textShadow:"0 0 15px rgba(255,215,0,.3)" }}>
              {cert.user_name}
            </div>
            <div style={{ fontSize:13,color:"#c0d0e8",lineHeight:1.7,maxWidth:560,margin:"0 auto 20px" }}>
              has successfully completed all requirements and demonstrated proficiency in
              <div style={{ color:"#818cf8",fontWeight:600,fontSize:16,margin:"8px 0" }}>{cert.course_title}</div>
              as part of the CodeBro comprehensive learning curriculum.
            </div>
          </div>

          {/* Meta */}
          <div style={{ display:"flex",justifyContent:"center",gap:40,marginTop:16 }}>
            {[
              { label:"Date Issued",    value:new Date(cert.issued_at).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"}) },
              { label:"Certificate ID", value:cert.cert_id },
              { label:"Validity",       value:"Lifetime" },
            ].map(({label,value})=>(
              <div key={label} style={{ textAlign:"center" }}>
                <div style={{ fontSize:9,color:"#6a8a9a",letterSpacing:"0.1em",textTransform:"uppercase" }}>{label}</div>
                <div style={{ fontSize:11,color:"#d4a017",fontWeight:600,marginTop:3,fontFamily:"monospace" }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{ position:"absolute",bottom:32,left:0,right:0,display:"flex",justifyContent:"center",alignItems:"flex-end",gap:60,padding:"0 56px" }}>
            <div style={{ textAlign:"center" }}>
              <div style={{ width:130,height:1,background:"#d4a017",margin:"0 auto 6px" }} />
              <div style={{ fontSize:11,color:"#c0d0e8",fontWeight:600,marginBottom:2 }}>CodeBro Platform</div>
              <div style={{ fontSize:9,color:"#6a8a9a",letterSpacing:"0.1em" }}>ISSUING AUTHORITY</div>
            </div>
            <div style={{ width:60,height:60,borderRadius:"50%",border:"2px solid #d4a017",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,background:"rgba(212,160,23,.1)" }}>
              🏆
            </div>
            <div style={{ textAlign:"center" }}>
              <img className="signature-image" src="/verified-signature.svg" alt="Verified signature" />
              <div style={{ width:130,height:1,background:"#d4a017",margin:"0 auto 6px" }} />
              <div style={{ fontSize:11,color:"#c0d0e8",fontWeight:600,marginBottom:2 }}>Verified Signature</div>
              <div style={{ fontSize:9,color:"#6a8a9a",letterSpacing:"0.1em" }}>DIGITAL SEAL</div>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display:"flex",gap:10,justifyContent:"center",marginTop:16,flexWrap:"wrap" }}>
        <Button variant="primary" onClick={handlePrint}>🖨️ Print / Download PDF</Button>
        <Button variant="outline" onClick={()=>{ navigator.clipboard?.writeText(`https://codebro.io/verify/${cert.cert_id}`); toast.success("Verification link copied!"); }}>🔗 Copy Verify Link</Button>
        <Button variant="outline" onClick={()=>{ navigator.clipboard?.writeText(cert.cert_id); toast.success("Certificate ID copied!"); }}>📋 Copy ID</Button>
      </div>
    </div>
  );
}

// ── Main Certificates Page ────────────────────────────────
export default function Certificates() {
  const { user } = useStore();
  const progressRevision = useStore(state => state.progressRevision);
  const [searchParams] = useSearchParams();
  const requestedCourseId = searchParams.get("courseId");
  const [certs,     setCerts]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [selected,  setSelected]  = useState(null);
  const [verifyId,  setVerifyId]  = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verified,  setVerified]  = useState(null);
  const [issuing,   setIssuing]   = useState(null); // courseId being issued
  const [courseProgress, setCourseProgress] = useState({});
  const [tab,       setTab]       = useState(() => searchParams.get("tab") === "eligible" ? "eligible" : "my"); // "my" | "verify" | "eligible"
  const allCourses = getAllCourses();

  const loadCerts = useCallback(async () => {
    if (!user?.uid) {
      setCerts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await getUserCertificates(await user.getIdToken());
      setCerts(data);
    } catch (error) {
      setCerts([]);
      toast.error(`Certificates could not be loaded: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadCerts();
  }, [loadCerts]);

  useEffect(() => {
    if (!user?.uid) { setCourseProgress({}); return; }
    let active = true;
    (async () => {
      try {
        const idToken = await user.getIdToken();
        const rows = await getAllCourseProgress(idToken);
        const map = {};
        rows.forEach(row => { map[String(row.course_id)] = Number(row.progress_pct) || 0; });
        if (active) setCourseProgress(map);
      } catch (error) {
        if (active) {
          setCourseProgress({});
          toast.error(`Course completion could not be loaded: ${error.message}`);
        }
      }
    })();
    return () => { active = false; };
  }, [user, progressRevision]);

  // A certificate is available only after every lesson reaches 100%.
  const earnedCourseIds = certs.map(c => String(c.course_id));
  const eligibleCourses = allCourses.filter(c => !earnedCourseIds.includes(String(c.id)));

  const issueCertificate = async (course) => {
    if (courseProgress[String(course.id)] !== 100) {
      toast.error("Complete every lesson in this course before requesting a certificate.");
      return;
    }
    setIssuing(course.id);
    try {
      const saved = await saveCertificate(await user.getIdToken(), course.id);
      setCerts(prev => [saved, ...prev.filter(certificate => certificate.id !== saved.id)]);
      setSelected(saved);
      toast.success("🏆 Certificate issued!");
      setTab("my");
    } catch (err) {
      const missingTable = /relation .*certificates.* does not exist|could not find the table .*certificates.* in the schema cache/i.test(err.message || "");
      toast.error(missingTable
        ? "Certificates are not set up yet. Run SUPABASE_SETUP.sql in Supabase, then reload."
        : "Failed to issue certificate: " + err.message);
    }
    finally { setIssuing(null); }
  };

  const handleVerify = async () => {
    if (!verifyId.trim()) { toast.error("Enter a certificate ID"); return; }
    setVerifying(true);
    setVerified(null);
    try {
      const result = await verifyCertificate(verifyId.trim().toUpperCase());
      setVerified(result || false);
    } catch { setVerified(false); }
    setVerifying(false);
  };

  return (
    <div className="page-container fade-in">
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:24,flexWrap:"wrap",gap:12 }}>
        <div>
          <h2>🏆 Certificates</h2>
          <p style={{ fontSize:12,color:"var(--text3)",marginTop:2 }}>
            Earn and share verified completion certificates for your courses
          </p>
        </div>
        <div style={{ display:"flex",gap:8 }}>
          {["my","eligible","verify"].map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{
              padding:"7px 16px",borderRadius:8,border:`1px solid ${tab===t?"var(--accent)":"var(--border)"}`,
              background:tab===t?"rgba(99,102,241,.1)":"transparent",
              color:tab===t?"var(--accent3)":"var(--text2)",cursor:"pointer",fontSize:12,fontWeight:600,fontFamily:"inherit",
            }}>
              {t==="my"?"🏆 My Certs":t==="eligible"?"📚 Earn More":"🔍 Verify"}
            </button>
          ))}
        </div>
      </div>

      {/* My Certificates */}
      {tab==="my" && (
        <div>
          {loading ? (
            <Card><div style={{ textAlign:"center",padding:40,color:"var(--text3)" }}>Loading certificates...</div></Card>
          ) : certs.length === 0 ? (
            <Card style={{ textAlign:"center",padding:60 }}>
              <div style={{ fontSize:64,marginBottom:16 }}>🏆</div>
              <h3 style={{ marginBottom:8 }}>No Certificates Yet</h3>
              <p style={{ color:"var(--text3)",fontSize:12,marginBottom:20 }}>Complete a course and earn your first certificate!</p>
              <Button variant="primary" onClick={()=>setTab("eligible")}>Browse Courses →</Button>
            </Card>
          ) : (
            <>
              {/* Grid of earned certs */}
              <div className="grid-3" style={{ marginBottom:24 }}>
                {certs.map((cert, i) => (
                  <motion.div key={cert.id} initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*.08 }}>
                    <Card style={{ cursor:"pointer",borderColor:selected?.id===cert.id?"var(--yellow)":"var(--border)",background:selected?.id===cert.id?"rgba(245,158,11,.05)":"var(--bg2)" }}
                      onClick={()=>setSelected(selected?.id===cert.id?null:cert)}>
                      <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:12 }}>
                        <div style={{ fontSize:40 }}>🏆</div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontWeight:700,fontSize:13,marginBottom:2 }}>{cert.course_title}</div>
                          <div style={{ fontSize:10,color:"var(--text3)" }}>
                            Issued {new Date(cert.issued_at).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"numeric"})}
                          </div>
                        </div>
                      </div>
                      <div style={{ fontFamily:"monospace",fontSize:11,color:"var(--yellow)",background:"rgba(245,158,11,.08)",padding:"6px 10px",borderRadius:6,marginBottom:10,letterSpacing:"0.05em" }}>
                        ID: {cert.cert_id}
                      </div>
                      <div style={{ display:"flex",gap:6 }}>
                        <Button variant="outline" size="sm" style={{ flex:1,justifyContent:"center" }} onClick={()=>setSelected(selected?.id===cert.id?null:cert)}>
                          {selected?.id===cert.id?"Hide":"View"}
                        </Button>
                        <Button variant="success" size="sm" onClick={()=>{ navigator.clipboard?.writeText(cert.cert_id); toast.success("ID copied!"); }}>
                          📋
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Selected cert display */}
              <AnimatePresence>
                {selected && (
                  <motion.div initial={{ opacity:0,y:20 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:20 }}>
                    <Card style={{ marginBottom:20,border:"1px solid var(--yellow)" }}>
                      <SectionHeader title={`📜 ${selected.course_title}`} action={<button onClick={()=>setSelected(null)} style={{ background:"none",border:"1px solid var(--border)",color:"var(--text3)",cursor:"pointer",padding:"3px 8px",borderRadius:6,fontSize:12 }}>✕ Close</button>} />
                      <CertificateView cert={selected} onDownload={()=>toast.success("Certificate downloaded!")} />
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      )}

      {/* Eligible Courses */}
      {tab==="eligible" && (
        <div>
          <p style={{ fontSize:12,color:"var(--text3)",marginBottom:16 }}>
            Complete these courses to earn certificates. Click "Issue Certificate" after completing a course.
          </p>
          <div className="grid-3">
            {eligibleCourses.map((course, i) => {
              const alreadyEarned = earnedCourseIds.includes(String(course.id));
              const progressPct = courseProgress[String(course.id)] || 0;
              const completed = progressPct === 100;
              const isRequestedCourse = String(course.id) === requestedCourseId;
              return (
                <motion.div key={course.id} initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*.06 }}>
                  <Card style={{ opacity:alreadyEarned?.7:1, borderColor:isRequestedCourse ? "var(--green)" : "var(--border)" }}>
                    <div style={{ fontSize:32,marginBottom:8 }}>{course.icon}</div>
                    <div style={{ fontWeight:700,fontSize:13,marginBottom:4 }}>{course.title}</div>
                    {isRequestedCourse && <div style={{ color:"var(--green)",fontSize:11,fontWeight:700,marginBottom:8 }}>Course complete · certificate ready</div>}
                    <div style={{ fontSize:11,color:"var(--text3)",marginBottom:12 }}>
                      {course.level} · {course.totalLessons} lessons · {course.estimatedHours}h
                    </div>
                    {alreadyEarned ? (
                      <div style={{ display:"flex",alignItems:"center",gap:6,color:"var(--green)",fontSize:12,fontWeight:600 }}>
                        <span>✅</span> Certificate Earned
                      </div>
                    ) : (
                      <Button variant={completed ? "primary" : "outline"} size="sm"
                        onClick={()=>issueCertificate(course)}
                        disabled={issuing===course.id || !completed}
                        style={{ width:"100%",justifyContent:"center" }}>
                        {issuing===course.id ? "Issuing..." : completed ? "🏆 Issue Certificate" : `${progressPct}% complete`}
                      </Button>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Verify */}
      {tab==="verify" && (
        <div style={{ maxWidth:560,margin:"0 auto" }}>
          <Card>
            <SectionHeader title="🔍 Verify a Certificate" sub="Enter a certificate ID to verify its authenticity" />
            <div style={{ display:"flex",gap:10,marginBottom:20 }}>
              <input type="text" placeholder="e.g. ABCD-EFGH-IJKL"
                value={verifyId} onChange={e=>setVerifyId(e.target.value.toUpperCase())}
                style={{ flex:1,fontFamily:"monospace",letterSpacing:"0.05em" }}
                onKeyDown={e=>e.key==="Enter"&&handleVerify()} />
              <Button variant="primary" onClick={handleVerify} disabled={verifying}>
                {verifying?"Checking...":"Verify →"}
              </Button>
            </div>

            {verified === null && (
              <div style={{ textAlign:"center",padding:"20px 0",color:"var(--text3)",fontSize:12 }}>
                <div style={{ fontSize:40,marginBottom:8 }}>🔍</div>
                Enter a certificate ID above to verify
              </div>
            )}
            {verified === false && (
              <div style={{ background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.3)",borderRadius:10,padding:16,textAlign:"center" }}>
                <div style={{ fontSize:32,marginBottom:8 }}>❌</div>
                <div style={{ fontWeight:700,color:"var(--red)",marginBottom:4 }}>Certificate Not Found</div>
                <div style={{ fontSize:12,color:"var(--text3)" }}>This certificate ID was not found in our database.</div>
              </div>
            )}
            {verified && typeof verified === "object" && (
              <div style={{ background:"rgba(16,185,129,.08)",border:"1px solid rgba(16,185,129,.3)",borderRadius:10,padding:20 }}>
                <div style={{ textAlign:"center",marginBottom:16 }}>
                  <div style={{ fontSize:40,marginBottom:8 }}>✅</div>
                  <div style={{ fontWeight:700,color:"var(--green)",fontSize:15,marginBottom:4 }}>Valid Certificate</div>
                  <div style={{ fontSize:12,color:"var(--text3)" }}>This certificate is authentic and verified</div>
                </div>
                {[
                  ["Recipient",    verified.user_name],
                  ["Course",       verified.course_title],
                  ["Issued On",    new Date(verified.issued_at).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})],
                  ["Certificate ID", verified.cert_id],
                ].map(([label,value])=>(
                  <div key={label} style={{ display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:"1px solid rgba(16,185,129,.15)",fontSize:13 }}>
                    <span style={{ color:"var(--text3)" }}>{label}</span>
                    <span style={{ color:"var(--text)",fontWeight:600,fontFamily:label==="Certificate ID"?"monospace":"inherit" }}>{value}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}
