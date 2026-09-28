// src/pages/Notes.jsx — Personal study notes, CRUD against Supabase `notes` table
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import useStore from "../context/useStore";
import { Card, SectionHeader, Button, Modal, Tag } from "../components/UI";
import { getNotes, createNote, updateNote, deleteNote } from "../services/supabase";

export default function Notes() {
  const { user } = useStore();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null); // note being edited, or {} for new
  const [form, setForm] = useState({ title: "", content: "", tags: "" });
  const [saving, setSaving] = useState(false);

  const load = () => {
    if (!user?.uid) return;
    setLoading(true);
    getNotes(user.uid).then(setNotes).catch(() => setNotes([])).finally(() => setLoading(false));
  };
  useEffect(load, [user?.uid]);

  const openNew = () => { setForm({ title: "", content: "", tags: "" }); setEditing({}); };
  const openEdit = (n) => {
    setForm({ title: n.title || "", content: n.content || "", tags: (n.tags || []).join(", ") });
    setEditing(n);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("Give your note a title"); return; }
    setSaving(true);
    const tags = form.tags.split(",").map((t) => t.trim()).filter(Boolean);
    try {
      if (editing?.id) {
        const updated = await updateNote(editing.id, { title: form.title, content: form.content, tags });
        setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
        toast.success("Note updated");
      } else {
        const created = await createNote(user.uid, form.title, form.content, tags);
        setNotes((prev) => [created, ...prev]);
        toast.success("Note saved");
      }
      setEditing(null);
    } catch {
      toast.error("Couldn't save note — try again");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (n) => {
    setNotes((prev) => prev.filter((x) => x.id !== n.id));
    try {
      await deleteNote(n.id);
      toast.success("Note deleted");
    } catch {
      toast.error("Couldn't delete — try again");
      load();
    }
  };

  const filtered = notes.filter((n) => {
    const q = search.toLowerCase();
    return !q || n.title?.toLowerCase().includes(q) || n.content?.toLowerCase().includes(q) || (n.tags || []).some((t) => t.toLowerCase().includes(q));
  });

  return (
    <div className="page-container fade-in">
      <SectionHeader
        title="📝 My Notes"
        sub={notes.length ? `${notes.length} note${notes.length !== 1 ? "s" : ""}` : "Jot down what you're learning"}
        action={<Button variant="primary" size="sm" onClick={openNew}>+ New Note</Button>}
      />

      <input
        placeholder="Search notes…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="input"
        style={{ width: "100%", margin: "14px 0 18px", padding: "9px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg3)", color: "var(--text)", fontSize: 13 }}
      />

      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "var(--text3)", fontSize: 13 }}>
          <div className="spin-anim" style={{ width: 22, height: 22, border: "2px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", margin: "0 auto 10px" }} />
          Loading notes…
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <div style={{ textAlign: "center", padding: "36px 0", color: "var(--text3)" }}>
            <div style={{ fontSize: 40, marginBottom: 10, opacity: 0.5 }}>📝</div>
            <div style={{ fontSize: 13, marginBottom: 12 }}>
              {notes.length === 0 ? "No notes yet — capture ideas while you learn." : "No notes match your search."}
            </div>
            {notes.length === 0 && <Button variant="secondary" size="sm" onClick={openNew}>Write your first note</Button>}
          </div>
        </Card>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px,1fr))", gap: 12 }}>
          {filtered.map((n, i) => (
            <motion.div key={n.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className="glass-card-glow" onClick={() => openEdit(n)} style={{ cursor: "pointer", height: "100%", display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6 }}>{n.title}</div>
                <div style={{ fontSize: 12, color: "var(--text2)", flex: 1, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 4, WebkitBoxOrient: "vertical", lineHeight: 1.5 }}>
                  {n.content || <span style={{ color: "var(--text3)" }}>No content</span>}
                </div>
                {(n.tags || []).length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 10 }}>
                    {n.tags.slice(0, 4).map((t) => <Tag key={t}>{t}</Tag>)}
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, paddingTop: 8, borderTop: "1px solid var(--border-subtle)" }}>
                  <span style={{ fontSize: 10, color: "var(--text3)" }}>
                    {n.updated_at ? new Date(n.updated_at).toLocaleDateString() : ""}
                  </span>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(n); }}
                    style={{ fontSize: 11, color: "var(--red)", background: "none", border: "none", cursor: "pointer" }}
                  >
                    Delete
                  </button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title={editing?.id ? "Edit Note" : "New Note"} width={520}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            style={{ padding: "9px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg3)", color: "var(--text)", fontSize: 13 }}
          />
          <textarea
            placeholder="Write your notes here…"
            value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            rows={8}
            style={{ padding: "9px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg3)", color: "var(--text)", fontSize: 13, resize: "vertical", fontFamily: "inherit" }}
          />
          <input
            placeholder="Tags (comma separated)"
            value={form.tags}
            onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
            style={{ padding: "9px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg3)", color: "var(--text)", fontSize: 13 }}
          />
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 6 }}>
            <Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
            <Button variant="primary" loading={saving} onClick={handleSave}>Save Note</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
