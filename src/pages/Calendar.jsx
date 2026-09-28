// src/pages/Calendar.jsx — Personal study calendar, CRUD against Supabase `calendar_events` table
import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import useStore from "../context/useStore";
import { Card, SectionHeader, Button, Modal, Tag } from "../components/UI";
import { getCalendarEvents, createCalendarEvent, deleteCalendarEvent } from "../services/supabase";

const TYPE_META = {
  reminder:  { icon: "🔔", label: "Reminder",  color: "var(--accent3)", tag: "blue" },
  deadline:  { icon: "⏰", label: "Deadline",  color: "var(--red)", tag: "red" },
  contest:   { icon: "🏆", label: "Contest",   color: "var(--yellow)", tag: "yellow" },
  study:     { icon: "📚", label: "Study",     color: "var(--green)", tag: "green" },
  live:      { icon: "🎥", label: "Live Class", color: "var(--purple)", tag: "purple" },
};
const TYPE_OPTIONS = Object.keys(TYPE_META);

function toDateKey(d) {
  return d.toISOString().slice(0, 10);
}

function fmtShort(dateStr) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("default", { month: "short", day: "numeric" });
}

// ── Reusable list card for a category of events (deadlines, challenges, etc.) ──
function EventListCard({ title, icon, items, emptyText, onSelect }) {
  return (
    <Card>
      <SectionHeader title={`${icon} ${title}`} />
      {items.length === 0 ? (
        <div style={{ textAlign: "center", padding: "16px 0", color: "var(--text3)", fontSize: 12 }}>
          {emptyText}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {items.map((e) => {
            const meta = TYPE_META[e.type] || TYPE_META.reminder;
            return (
              <div
                key={e.id}
                onClick={() => onSelect(e.event_date.slice(0, 10))}
                style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "7px 9px",
                  background: "var(--bg3)", borderRadius: 8, cursor: "pointer",
                  border: "1px solid var(--border)",
                }}
              >
                <span style={{ fontSize: 14 }}>{meta.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {e.title}
                  </div>
                </div>
                <span style={{ fontSize: 10, color: "var(--text3)", flexShrink: 0 }}>
                  {fmtShort(e.event_date)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

export default function CalendarPage() {
  const { user } = useStore();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState(() => { const d = new Date(); d.setDate(1); return d; });
  const [selectedDate, setSelectedDate] = useState(null); // "YYYY-MM-DD" or null
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", type: "reminder", link: "" });

  const load = () => {
    if (!user?.uid) return;
    setLoading(true);
    getCalendarEvents(user.uid).then(setEvents).catch(() => setEvents([])).finally(() => setLoading(false));
  };
  useEffect(load, [user?.uid]);

  const eventsByDate = useMemo(() => {
    const map = {};
    events.forEach((e) => {
      const key = (e.event_date || "").slice(0, 10);
      if (!map[key]) map[key] = [];
      map[key].push(e);
    });
    return map;
  }, [events]);

  const today = new Date();
  const todayKey = toDateKey(today);
  const todayLabel = today.toLocaleDateString("default", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  const { weeks, monthLabel } = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const startOffset = firstOfMonth.getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    while (cells.length % 7 !== 0) cells.push(null);

    const weeks = [];
    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

    const monthLabel = firstOfMonth.toLocaleString("default", { month: "long", year: "numeric" });
    return { weeks, monthLabel };
  }, [cursor]);

  const goPrevMonth = () => setCursor((c) => { const d = new Date(c); d.setMonth(d.getMonth() - 1); return d; });
  const goNextMonth = () => setCursor((c) => { const d = new Date(c); d.setMonth(d.getMonth() + 1); return d; });
  const goToday = () => { const d = new Date(); d.setDate(1); setCursor(d); setSelectedDate(todayKey); };

  const openNew = (dateKey) => {
    setForm({ title: "", type: "reminder", link: "" });
    setSelectedDate(dateKey);
    setCreating(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error("Give your event a title"); return; }
    if (!selectedDate) { toast.error("Pick a date first"); return; }
    setSaving(true);
    try {
      const created = await createCalendarEvent(user.uid, form.title, selectedDate, form.type, form.link);
      setEvents((prev) => [...prev, created]);
      toast.success("Event added");
      setCreating(false);
    } catch {
      toast.error("Couldn't save event — try again");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (ev) => {
    setEvents((prev) => prev.filter((x) => x.id !== ev.id));
    try {
      await deleteCalendarEvent(ev.id);
      toast.success("Event removed");
    } catch {
      toast.error("Couldn't remove — try again");
      load();
    }
  };

  const selectedEvents = selectedDate ? (eventsByDate[selectedDate] || []) : [];

  // ── Categorized lists for the sections below the calendar ──
  const isUpcoming = (e) => (e.event_date || "").slice(0, 10) >= todayKey;
  const isPast = (e) => (e.event_date || "").slice(0, 10) < todayKey;
  const byDateAsc = (a, b) => a.event_date.localeCompare(b.event_date);
  const byDateDesc = (a, b) => b.event_date.localeCompare(a.event_date);

  const upcomingDeadlines  = events.filter((e) => e.type === "deadline" && isUpcoming(e)).sort(byDateAsc).slice(0, 5);
  const upcomingChallenges = events.filter((e) => e.type === "contest" && isUpcoming(e)).sort(byDateAsc).slice(0, 5);
  const courseSchedule     = events.filter((e) => (e.type === "study" || e.type === "live") && isUpcoming(e)).sort(byDateAsc).slice(0, 5);
  const learningReminders  = events.filter((e) => e.type === "reminder" && isUpcoming(e)).sort(byDateAsc).slice(0, 5);
  const recentEvents       = events.filter(isPast).sort(byDateDesc).slice(0, 5);

  const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="page-container fade-in">
      <style>{`
        .calendar-main-grid {
          display: grid;
          grid-template-columns: minmax(0,2fr) minmax(220px,1fr);
          gap: 16px;
          margin-top: 16px;
        }
        @media (max-width: 860px) {
          .calendar-main-grid { grid-template-columns: 1fr; }
        }
        .calendar-sections-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 12px;
          margin-top: 20px;
        }
      `}</style>

      <SectionHeader
        title="📅 Calendar"
        sub={events.length ? `${events.length} upcoming event${events.length !== 1 ? "s" : ""} · Today is ${todayLabel}` : `Plan your study schedule, deadlines & contests · Today is ${todayLabel}`}
        action={<Button variant="primary" size="sm" onClick={() => openNew(todayKey)}>+ New Event</Button>}
      />

      <div className="calendar-main-grid">
        {/* ── Month Grid ── */}
        <Card>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button className="btn btn-secondary btn-sm btn-icon" onClick={goPrevMonth}>‹</button>
              <h3 style={{ margin: 0, fontSize: 15, minWidth: 150, textAlign: "center" }}>{monthLabel}</h3>
              <button className="btn btn-secondary btn-sm btn-icon" onClick={goNextMonth}>›</button>
            </div>
            <Button variant="secondary" size="sm" onClick={goToday}>Today</Button>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: 40, color: "var(--text3)", fontSize: 13 }}>
              <div className="spin-anim" style={{ width: 22, height: 22, border: "2px solid var(--border)", borderTopColor: "var(--accent)", borderRadius: "50%", margin: "0 auto 10px" }} />
              Loading calendar…
            </div>
          ) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 6 }}>
                {DOW.map((d) => (
                  <div key={d} style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em", color: "var(--text3)", textAlign: "center", padding: "4px 0" }}>
                    {d}
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {weeks.map((week, wi) => (
                  <div key={wi} style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
                    {week.map((date, di) => {
                      if (!date) return <div key={di} />;
                      const key = toDateKey(date);
                      const dayEvents = eventsByDate[key] || [];
                      const isToday = key === todayKey;
                      const isSelected = key === selectedDate;
                      return (
                        <div
                          key={di}
                          onClick={() => setSelectedDate(key)}
                          style={{
                            minHeight: 62, borderRadius: 9, padding: "5px 6px", cursor: "pointer",
                            background: isSelected ? "var(--glass-bg)" : "var(--bg3)",
                            border: `1px solid ${isSelected ? "var(--accent2)" : isToday ? "var(--accent3)" : "var(--border)"}`,
                            display: "flex", flexDirection: "column", gap: 3, transition: "all .15s",
                          }}
                        >
                          <span style={{ fontSize: 11, fontWeight: isToday ? 800 : 600, color: isToday ? "var(--accent3)" : "var(--text2)" }}>
                            {date.getDate()}
                          </span>
                          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                            {dayEvents.slice(0, 2).map((e) => (
                              <div key={e.id} title={e.title} style={{
                                fontSize: 9, fontWeight: 600, padding: "1px 4px", borderRadius: 4,
                                background: `${TYPE_META[e.type]?.color || "var(--accent3)"}22`,
                                color: TYPE_META[e.type]?.color || "var(--accent3)",
                                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                              }}>
                                {TYPE_META[e.type]?.icon} {e.title}
                              </div>
                            ))}
                            {dayEvents.length > 2 && (
                              <span style={{ fontSize: 9, color: "var(--text3)" }}>+{dayEvents.length - 2} more</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>

        {/* ── Side panel: selected day ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Card>
            <SectionHeader
              title={selectedDate ? new Date(selectedDate + "T00:00:00").toLocaleDateString("default", { weekday: "long", month: "short", day: "numeric" }) : "Select a day"}
              action={selectedDate && <Button variant="secondary" size="sm" onClick={() => openNew(selectedDate)}>+ Add</Button>}
            />
            {!selectedDate ? (
              <div style={{ textAlign: "center", padding: "20px 0", color: "var(--text3)", fontSize: 12 }}>
                Tap a date to see or add events.
              </div>
            ) : selectedEvents.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px 0", color: "var(--text3)", fontSize: 12 }}>
                No events on this day.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {selectedEvents.map((e) => (
                  <div key={e.id} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "8px 10px", background: "var(--bg3)", borderRadius: 9, border: "1px solid var(--border)" }}>
                    <span style={{ fontSize: 15 }}>{TYPE_META[e.type]?.icon || "🔔"}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 700 }}>{e.title}</div>
                      <Tag variant={TYPE_META[e.type]?.tag || "blue"} style={{ marginTop: 4 }}>{TYPE_META[e.type]?.label || e.type}</Tag>
                    </div>
                    <button onClick={() => handleDelete(e)} style={{ fontSize: 11, color: "var(--red)", background: "none", border: "none", cursor: "pointer" }}>
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* ── Categorized sections: deadlines, challenges, course schedule, reminders, recent ── */}
      <div className="calendar-sections-grid">
        <EventListCard
          title="Upcoming Deadlines" icon="⏰"
          items={upcomingDeadlines}
          emptyText="No deadlines coming up."
          onSelect={setSelectedDate}
        />
        <EventListCard
          title="Coding Challenges" icon="🏆"
          items={upcomingChallenges}
          emptyText="No contests scheduled yet."
          onSelect={setSelectedDate}
        />
        <EventListCard
          title="Course Schedule" icon="📚"
          items={courseSchedule}
          emptyText="No classes or study sessions planned."
          onSelect={setSelectedDate}
        />
        <EventListCard
          title="Learning Reminders" icon="🔔"
          items={learningReminders}
          emptyText="No reminders set."
          onSelect={setSelectedDate}
        />
        <EventListCard
          title="Recent Events" icon="🕘"
          items={recentEvents}
          emptyText="Nothing in your recent history yet."
          onSelect={setSelectedDate}
        />
      </div>

      <Modal isOpen={creating} onClose={() => setCreating(false)} title="New Event" width={440}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input
            placeholder="Event title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            style={{ padding: "9px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg3)", color: "var(--text)", fontSize: 13 }}
          />
          <input
            type="date"
            value={selectedDate || ""}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ padding: "9px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg3)", color: "var(--text)", fontSize: 13 }}
          />
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {TYPE_OPTIONS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setForm((f) => ({ ...f, type: t }))}
                style={{
                  padding: "6px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: "pointer",
                  border: `1px solid ${form.type === t ? "var(--accent2)" : "var(--border)"}`,
                  background: form.type === t ? "var(--glass-bg)" : "var(--bg3)",
                  color: form.type === t ? TYPE_META[t].color : "var(--text2)",
                }}
              >
                {TYPE_META[t].icon} {TYPE_META[t].label}
              </button>
            ))}
          </div>
          <input
            placeholder="Link (optional — e.g. course or contest URL)"
            value={form.link}
            onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
            style={{ padding: "9px 12px", borderRadius: 10, border: "1px solid var(--border)", background: "var(--bg3)", color: "var(--text)", fontSize: 13 }}
          />
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 6 }}>
            <Button variant="secondary" onClick={() => setCreating(false)}>Cancel</Button>
            <Button variant="primary" loading={saving} onClick={handleSave}>Save Event</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
