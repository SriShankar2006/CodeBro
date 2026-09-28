// src/components/UI.jsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

// ─── Button ───────────────────────────────────────────────
export function Button({ children, variant = "primary", size = "", onClick, disabled, className = "", type = "button", loading = false, style = {} }) {
  return (
    <button type={type} className={`btn btn-${variant}${size ? " btn-"+size : ""} ${className}`}
      onClick={onClick} disabled={disabled || loading} style={style}>
      {loading && <span className="spin-anim" style={{ width:12,height:12,border:"2px solid currentColor",borderTopColor:"transparent",borderRadius:"50%",display:"inline-block",marginRight:6 }} />}
      {loading ? null : children}
    </button>
  );
}

// ─── Tag ─────────────────────────────────────────────────
export function Tag({ children, variant = "blue", style = {} }) {
  return <span className={`tag tag-${variant}`} style={style}>{children}</span>;
}

export function DifficultyTag({ difficulty }) {
  const map = { Easy:"easy", Medium:"medium", Hard:"hard" };
  return <Tag variant={map[difficulty] || "blue"}>{difficulty}</Tag>;
}

// ─── Card ─────────────────────────────────────────────────
export function Card({ children, onClick, className = "", style = {} }) {
  return (
    <div className={`card${onClick ? " card-hover" : ""} ${className}`} onClick={onClick} style={style}>
      {children}
    </div>
  );
}

// ─── Progress Bar ─────────────────────────────────────────
export function ProgressBar({ value = 0, color, height = 6 }) {
  const bg = color ? { background: color } : {};
  return (
    <div className="progress-bar" style={{ height }}>
      <div className="progress-fill" style={{ width:`${Math.min(100,Math.max(0,value))}%`, height, ...bg }} />
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────
export function Avatar({ name = "?", src, size = "" }) {
  const [imgError, setImgError] = useState(false);
  const initials = (name || "?").split(" ").map(w => w[0]).join("").slice(0,2).toUpperCase();
  const cls = `avatar${size?" avatar-"+size:""}`;
  const sizeMap = {
    sm: 24,
    md: 32,
    lg: 48,
    xl: 64,
  };
  const dimension = sizeMap[size] || 32;
  
  return (
    <div className={cls} style={{
      position:"relative",
      overflow:"hidden",
      width: dimension,
      height: dimension,
      borderRadius: 8,
      background: "var(--bg3)",
      border: "1px solid var(--border)",
      display:"flex",
      alignItems:"center",
      justifyContent:"center",
      flexShrink: 0,
    }}>
      {src && !imgError ? (
        <img src={src} alt={name} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} onError={() => setImgError(true)} />
      ) : (
        <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", fontSize: dimension > 40 ? 14 : 11, fontWeight:700, color:"var(--accent3)" }}>{initials}</div>
      )}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────
export function StatCard({ label, value, color, sub, icon, children }) {
  return (
    <motion.div className="stat-card fade-in">
      {icon && <div style={{ fontSize:20, marginBottom:8 }}>{icon}</div>}
      <div className="stat-value" style={color ? { color } : {}}>{value}</div>
      <div className="stat-label">{label}</div>
      {sub && <div style={{ fontSize:10, color:"var(--text3)", marginTop:4 }}>{sub}</div>}
      {children}
    </motion.div>
  );
}

// ─── Section Header ───────────────────────────────────────
export function SectionHeader({ title, sub, action }) {
  return (
    <div className="section-header">
      <div>
        <div className="section-title">{title}</div>
        {sub && <div className="section-sub">{sub}</div>}
      </div>
      {action}
    </div>
  );
}

// ─── Tab Bar ──────────────────────────────────────────────
export function TabBar({ tabs, active, onChange, style = {} }) {
  return (
    <div className="tab-bar" style={style}>
      {tabs.map(tab => (
        <div key={tab} className={`tab-item${active===tab?" active":""}`} onClick={() => onChange(tab)}>{tab}</div>
      ))}
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────
export function Modal({ isOpen, onClose, title, children, width = 500 }) {
  useEffect(() => {
    const handler = e => { if (e.key === "Escape") onClose(); };
    if (isOpen) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  return createPortal((
    <AnimatePresence>
      <motion.div className="modal-overlay" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
        onClick={onClose}>
        <motion.div className="modal-box" initial={{ scale:.92, opacity:0 }} animate={{ scale:1, opacity:1 }} exit={{ scale:.92, opacity:0 }}
          style={{ width, maxWidth: width }}
          onClick={e => e.stopPropagation()}>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18 }}>
            <h3>{title}</h3>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>✕</button>
          </div>
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  ), document.body);
}

// ─── Input ────────────────────────────────────────────────
export function Input({ label, error, id, ...props }) {
  const inputId = id || `input-${Math.random().toString(36).slice(2, 8)}`;
  return (
    <div>
      {label && <label htmlFor={inputId}>{label}</label>}
      <input id={inputId} {...props} />
      {error && <div style={{ fontSize:11, color:"var(--red)", marginTop:3 }}>{error}</div>}
    </div>
  );
}

// ─── Toggle Switch ────────────────────────────────────────
export function Toggle({ value, onChange, label, sub }) {
  return (
    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 0",borderBottom:"1px solid var(--border-subtle)" }}>
      <div>
        <div style={{ fontSize:13, fontWeight:500 }}>{label}</div>
        {sub && <div style={{ fontSize:11, color:"var(--text3)", marginTop:2 }}>{sub}</div>}
      </div>
      <div onClick={() => onChange(!value)} style={{
        width:44, height:24, borderRadius:12, cursor:"pointer", transition:"all .2s",
        background: value ? "var(--accent2)" : "var(--bg3)",
        border: `1px solid ${value ? "var(--accent)" : "var(--border)"}`,
        position:"relative", flexShrink:0,
      }}>
        <div style={{ width:18, height:18, borderRadius:"50%", background:"#fff", position:"absolute", top:2, left: value ? 22 : 2, transition:"left .2s" }} />
      </div>
    </div>
  );
}

// ─── Activity Heatmap ─────────────────────────────────────
// data: { "2024-12-01": 3 } — real submission counts from Supabase
const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

export function ActivityHeatmap({ data = {} }) {
  const scrollRef = useRef(null);

  const { weeks, monthLabels, totalSubmissions, activeDays, maxCount } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // ~53 weeks back, then align the start to a Sunday so rows line up
    const start = new Date(today);
    start.setDate(start.getDate() - 370);
    start.setDate(start.getDate() - start.getDay());

    const cells = [];
    let totalSubmissions = 0, activeDays = 0, maxCount = 1;
    const cursor = new Date(start);
    while (cursor <= today) {
      const key   = cursor.toISOString().slice(0, 10);
      const count = data[key] || 0;
      if (count > 0) { totalSubmissions += count; activeDays += 1; }
      if (count > maxCount) maxCount = count;
      cells.push({ key, count, date: new Date(cursor) });
      cursor.setDate(cursor.getDate() + 1);
    }

    const weeks = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

    const monthLabels = weeks.map((week, i) => {
      const firstOfMonth = week.find(c => c.date.getDate() === 1);
      if (firstOfMonth) return firstOfMonth.date.toLocaleString("default", { month: "short" });
      return i === 0 ? week[0].date.toLocaleString("default", { month: "short" }) : "";
    });

    return { weeks, monthLabels, totalSubmissions, activeDays, maxCount };
  }, [data]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
  }, [weeks]);

  const today = new Date(); today.setHours(0, 0, 0, 0);

  const getClass = count => {
    if (!count) return "";
    const p = count / maxCount;
    if (p < 0.25) return "l1";
    if (p < 0.5)  return "l2";
    if (p < 0.75) return "l3";
    return "l4";
  };

  return (
    <div className="heatmap-card">
      <div className="heatmap-scroll" ref={scrollRef}>
        <div className="heatmap-grid">
          <div className="heatmap-corner" />
          <div className="heatmap-months">
            {monthLabels.map((m, i) => <div key={i} className="heatmap-month">{m}</div>)}
          </div>
          <div className="heatmap-days">
            {DAY_LABELS.map((d, i) => <div key={i} className="heatmap-daylabel">{d}</div>)}
          </div>
          <div className="heatmap">
            {weeks.map((week, wi) => (
              <div key={wi} className="heatmap-col">
                {week.map(c => {
                  const isFuture = c.date > today;
                  return (
                    <div
                      key={c.key}
                      className={`hcell ${isFuture ? "future" : getClass(c.count)}`}
                      title={isFuture ? "" : `${c.count} submission${c.count !== 1 ? "s" : ""} \u00b7 ${c.date.toLocaleDateString("default", { month: "short", day: "numeric", year: "numeric" })}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="heatmap-footer">
        <div>
          <span className="heatmap-stat-num">{totalSubmissions}</span> submission{totalSubmissions !== 1 ? "s" : ""}
          {" \u00b7 "}
          <span className="heatmap-stat-num">{activeDays}</span> active day{activeDays !== 1 ? "s" : ""} in the past year
        </div>
        <div className="heatmap-legend">
          <span>Less</span>
          <div className="hcell" />
          <div className="hcell l1" />
          <div className="hcell l2" />
          <div className="hcell l3" />
          <div className="hcell l4" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
}

// ─── Countdown Timer ──────────────────────────────────────
export function CountdownTimer({ targetDate }) {
  const [t, setT] = useState({});
  useEffect(() => {
    const calc = () => {
      const diff = new Date(targetDate) - Date.now();
      if (diff <= 0) return setT({ expired: true });
      setT({ d: Math.floor(diff/86400000), h: Math.floor((diff%86400000)/3600000), m: Math.floor((diff%3600000)/60000), s: Math.floor((diff%60000)/1000) });
    };
    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [targetDate]);
  if (t.expired) return <span style={{ color:"var(--red)" }}>Ended</span>;
  return <span style={{ fontVariantNumeric:"tabular-nums" }}>{t.d}d {String(t.h).padStart(2,"0")}h {String(t.m).padStart(2,"0")}m {String(t.s).padStart(2,"0")}s</span>;
}

// ─── Empty State ──────────────────────────────────────────
export function EmptyState({ icon = "📭", title, sub, action }) {
  return (
    <div style={{ textAlign:"center", padding:"52px 24px", color:"var(--text3)" }}>
      <div style={{ fontSize:48, marginBottom:14 }}>{icon}</div>
      <div style={{ fontWeight:700, color:"var(--text2)", marginBottom:6, fontSize:15 }}>{title}</div>
      {sub && <div style={{ fontSize:12, marginBottom:16 }}>{sub}</div>}
      {action}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────
export function Skeleton({ height = 16, width = "100%", style = {} }) {
  return <div className="skeleton" style={{ height, width, borderRadius:6, ...style }} />;
}

// ─── Notification Badge ───────────────────────────────────
export function NotifBadge({ count }) {
  if (!count) return null;
  return <span style={{ position:"absolute",top:-4,right:-4,background:"var(--red)",color:"#fff",borderRadius:10,padding:"1px 5px",fontSize:10,fontWeight:700 }}>{count > 99 ? "99+" : count}</span>;
}

// ─── Donut Chart ─────────────────────────────────────────
export function DonutChart({ segments, size = 100, strokeWidth = 14 }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const total = segments.reduce((s, seg) => s + seg.value, 0) || 1;
  let offset = 0;
  return (
    <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--bg3)" strokeWidth={strokeWidth} />
      {segments.map((seg, i) => {
        const dash = (seg.value / total) * circ;
        const el = (
          <circle key={i} cx={size/2} cy={size/2} r={r} fill="none"
            stroke={seg.color} strokeWidth={strokeWidth}
            strokeDasharray={`${dash} ${circ - dash}`}
            strokeDashoffset={-offset} strokeLinecap="butt" />
        );
        offset += dash;
        return el;
      })}
    </svg>
  );
}

// ─── Bar Chart ────────────────────────────────────────────
export function BarChart({ data, color = "var(--accent)", height = 80, labels }) {
  const max = Math.max(...data, 1);
  return (
    <div>
      <div style={{ display:"flex", alignItems:"flex-end", gap:8, height }}>
        {data.map((v, i) => (
          <div key={i} style={{ flex:1, height:"100%", display:"flex", flexDirection:"column", justifyContent:"flex-end", alignItems:"center" }}>
            <span style={{ fontSize:10, fontWeight:700, color: v>0 ? "var(--text2)" : "var(--text3)", marginBottom:4, opacity: v>0 ? 1 : 0.5 }}>{v}</span>
            <motion.div className="bar-chart-bar" initial={{ height:0 }} animate={{ height:`${Math.max((v/max)*100, v>0?4:0)}%` }} transition={{ delay:i*.05, duration:.5, ease:"easeOut" }}
              style={{
                width:"100%", minHeight: v>0 ? 4 : 2, borderRadius:"6px 6px 3px 3px",
                background: v>0 ? color : "var(--bg3)",
                border: v>0 ? "none" : "1px dashed var(--border)",
              }}
              title={`${v} submission${v!==1?"s":""}`} />
          </div>
        ))}
      </div>
      {labels && (
        <div style={{ display:"flex", justifyContent:"space-between", fontSize:10, color:"var(--text3)", marginTop:8, fontWeight:600 }}>
          {labels.map((l,i) => <span key={i} style={{ flex:1, textAlign:"center" }}>{l}</span>)}
        </div>
      )}
    </div>
  );
}

// ─── YouTube Video Player ─────────────────────────────────
let youtubeApiPromise;

function loadYouTubeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (youtubeApiPromise) return youtubeApiPromise;
  youtubeApiPromise = new Promise((resolve, reject) => {
    const previousCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previousCallback?.();
      resolve(window.YT);
    };
    let script = document.getElementById("youtube-iframe-api");
    if (!script) {
      script = document.createElement("script");
      script.id = "youtube-iframe-api";
      script.src = "https://www.youtube.com/iframe_api";
      script.onerror = () => {
        youtubeApiPromise = null;
        reject(new Error("YouTube playback events are unavailable."));
      };
      document.head.appendChild(script);
    }
  });
  return youtubeApiPromise;
}

export function VideoPlayer({ videoId, title, onEnded }) {
  const iframeRef = useRef(null);
  const onEndedRef = useRef(onEnded);
  onEndedRef.current = onEnded;

  useEffect(() => {
    if (!videoId || !iframeRef.current) return undefined;
    let cancelled = false;
    let player;
    loadYouTubeApi().then(YT => {
      if (cancelled || !iframeRef.current) return;
      player = new YT.Player(iframeRef.current, {
        events: {
          onStateChange: event => {
            if (event.data === YT.PlayerState.ENDED) onEndedRef.current?.();
          },
        },
      });
    }).catch(() => {});
    return () => {
      cancelled = true;
      player?.destroy();
    };
  }, [videoId]);

  if (!videoId) return (
    <div style={{ background:"var(--bg3)", borderRadius:"var(--radius-lg)", height:200, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:10, color:"var(--text3)" }}>
      <span style={{ fontSize:40 }}>▶️</span>
      <span style={{ fontSize:12 }}>Video unavailable</span>
    </div>
  );
  return (
    <div className="video-container">
      <iframe
        ref={iframeRef}
        src={`https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}&rel=0&modestbranding=1`}
        title={title || "Lesson video"}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

// ─── Loading Screen ───────────────────────────────────────
export function LoadingScreen() {
  return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"var(--bg)", gap:16 }}>
      <div style={{ fontSize:32, fontWeight:800 }}>
        <span className="gradient-text">CodeBro</span>
      </div>
      <div className="spin-anim" style={{ width:28, height:28, border:"3px solid var(--border)", borderTopColor:"var(--accent)", borderRadius:"50%" }} />
    </div>
  );
}
