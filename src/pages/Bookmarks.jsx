// src/pages/Bookmarks.jsx — Saved problems, courses & lessons
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import useStore from "../context/useStore";
import { Card, SectionHeader, TabBar, Button } from "../components/UI";
import { getBookmarks, removeBookmark } from "../services/supabase";

const TYPE_META = {
  problem: { icon: "🧩", label: "Challenges", route: (b) => `/editor/${b.item_id}` },
  course:  { icon: "📚", label: "Courses",     route: (b) => `/courses/${b.item_id}` },
  lesson:  { icon: "🎬", label: "Lessons",     route: (b) => `/courses/${b.item_id}` },
};

export default function Bookmarks() {
  const { user } = useStore();
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("All");

  const load = () => {
    if (!user?.uid) return;
    setLoading(true);
    getBookmarks(user.uid)
      .then(setBookmarks)
      .catch(() => setBookmarks([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, [user?.uid]);

  const handleRemove = async (b) => {
    setBookmarks((prev) => prev.filter((x) => x.id !== b.id));
    try {
      await removeBookmark(user.uid, b.item_type, b.item_id);
      toast.success("Removed bookmark");
    } catch {
      toast.error("Couldn't remove — try again");
      load();
    }
  };

  const tabs = ["All", "Challenges", "Courses", "Lessons"];
  const filtered = bookmarks.filter((b) => {
    if (tab === "All") return true;
    const meta = TYPE_META[b.item_type];
    return meta?.label === tab;
  });

  return (
    <div className="page-container fade-in">
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: "clamp(20px,4vw,28px)", marginBottom: 6 }}>
          🔖 <span className="gradient-text">Bookmarks</span>
        </h1>
        <p style={{ fontSize: 13, color: "var(--text3)", margin: 0 }}>
          Everything you've saved for later, in one place.
        </p>
      </div>

      <TabBar tabs={tabs} active={tab} onChange={setTab} style={{ marginBottom: 18 }} />

      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "var(--text3)", fontSize: 13 }}>
          <div className="spin-anim" style={{ width: 22, height: 22, border: "2px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", margin: "0 auto 10px" }} />
          Loading bookmarks…
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <div style={{ textAlign: "center", padding: "36px 0", color: "var(--text3)" }}>
            <div style={{ fontSize: 40, marginBottom: 10, opacity: 0.5 }}>🔖</div>
            <div style={{ fontSize: 13, marginBottom: 12 }}>
              No bookmarks yet — save challenges or courses to find them here fast.
            </div>
            <Button variant="secondary" size="sm" onClick={() => navigate("/problems")}>Browse challenges →</Button>
          </div>
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px,1fr))", gap: 12 }}>
          {filtered.map((b, i) => {
            const meta = TYPE_META[b.item_type] || { icon: "🔖", label: b.item_type, route: () => "#" };
            return (
              <motion.div key={b.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <Card className="glass-card-glow">
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <div style={{ fontSize: 22, flexShrink: 0 }}>{meta.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {b.item_title}
                      </div>
                      <div style={{ fontSize: 10, color: "var(--text3)", textTransform: "uppercase", letterSpacing: ".04em" }}>{meta.label}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <Button size="sm" variant="primary" onClick={() => navigate(meta.route(b))} style={{ flex: 1 }}>Open</Button>
                    <Button size="sm" variant="secondary" onClick={() => handleRemove(b)}>Remove</Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
