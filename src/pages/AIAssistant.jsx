// src/pages/AIAssistant.jsx
// Full AI Coding Assistant — Google Gemini API + Supabase chat history
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import useStore from "../context/useStore";
import { getAIChats, createAIChat, updateAIChat } from "../services/supabase";
import { generateText } from "../services/ai";

const localChatsKey = uid => `codebro-ai-chats-${uid}`;
const readLocalChats = uid => {
  try { return JSON.parse(localStorage.getItem(localChatsKey(uid)) || "[]"); } catch { return []; }
};
const writeLocalChats = (uid, chats) => localStorage.setItem(localChatsKey(uid), JSON.stringify(chats));

const QUICK_PROMPTS = [
  { label: "Explain a concept",  prompt: "Explain recursion with a simple Python example" },
  { label: "Debug my code",      prompt: "Help me debug this code:\n```python\n# paste your code here\n```" },
  { label: "Optimize code",      prompt: "How can I optimize this function for better time complexity?" },
  { label: "Generate project",   prompt: "Give me a beginner React project idea with step-by-step implementation guide" },
  { label: "Explain error",      prompt: "I'm getting this error:\n\n(paste your error message here)\n\nWhat does it mean and how do I fix it?" },
  { label: "SQL query help",     prompt: "Help me write a SQL query to find duplicate records in a table" },
  { label: "Big O analysis",     prompt: "Analyze the time and space complexity of this code:\n```python\n# paste your code here\n```" },
  { label: "Code review",        prompt: "Please review this code for bugs, performance, and best practices:\n```javascript\n// paste your code here\n```" },
];

// ── Syntax-highlighted code block ─────────────────────────
function CodeBlock({ code, language }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div style={{ position:"relative", margin:"10px 0", borderRadius:10, overflow:"hidden", border:"1px solid #30363d" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", background:"#161b22", padding:"6px 12px" }}>
        <span style={{ color:"#6e7681", fontSize:11, fontFamily:"var(--font-mono)" }}>{language || "code"}</span>
        <button onClick={copy} style={{ background:"none", border:"1px solid #30363d", color:"#8b949e", borderRadius:4, padding:"2px 8px", cursor:"pointer", fontSize:11, fontFamily:"inherit" }}>
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>
      <pre style={{ margin:0, background:"#0d1117", padding:"14px 16px", overflow:"auto", fontSize:12, lineHeight:1.7 }}>
        <code style={{ color:"#e6edf3", fontFamily:"var(--font-mono)" }}>{code}</code>
      </pre>
    </div>
  );
}

// ── Render markdown-ish message content ──────────────────
function MessageContent({ content }) {
  const parts = [];
  const regex = /```(\w*)\n?([\s\S]*?)```/g;
  let lastIndex = 0, match;
  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) parts.push({ type:"text", content: content.slice(lastIndex, match.index) });
    parts.push({ type:"code", language: match[1], content: match[2] });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < content.length) parts.push({ type:"text", content: content.slice(lastIndex) });
  const escapeHtml = text => text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

  return (
    <div>
      {parts.map((p, i) =>
        p.type === "code" ? (
          <CodeBlock key={i} code={p.content} language={p.language} />
        ) : (
          <div key={i} style={{ fontSize:13, lineHeight:1.75, whiteSpace:"pre-wrap", wordBreak:"break-word" }}
            dangerouslySetInnerHTML={{
              __html: escapeHtml(p.content)
                .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
                .replace(/\*(.+?)\*/g, "<em>$1</em>")
                .replace(/`([^`]+)`/g, '<code style="background:var(--bg3);padding:1px 5px;border-radius:3px;font-family:var(--font-mono);font-size:0.88em;color:var(--cyan);border:1px solid var(--border)">$1</code>')
                .replace(/^### (.+)$/gm, '<h4 style="margin:12px 0 6px;font-size:13px;font-weight:700">$1</h4>')
                .replace(/^## (.+)$/gm,  '<h3 style="margin:14px 0 7px;font-size:14px;font-weight:700">$1</h3>')
                .replace(/^# (.+)$/gm,   '<h2 style="margin:16px 0 8px;font-size:16px;font-weight:800">$1</h2>')
                .replace(/^- (.+)$/gm,   '<div style="display:flex;gap:6px;margin:3px 0"><span style="color:var(--accent3);flex-shrink:0">•</span><span>$1</span></div>')
                .replace(/^\d+\. (.+)$/gm,'<div style="display:flex;gap:6px;margin:3px 0"><span style="color:var(--accent3);flex-shrink:0">›</span><span>$1</span></div>')
            }}
          />
        )
      )}
    </div>
  );
}

// ── Typing indicator ──────────────────────────────────────
function TypingIndicator() {
  return (
    <div style={{ display:"flex", gap:5, alignItems:"center", padding:"12px 16px" }}>
      {[0,1,2].map(i => (
        <div key={i} style={{ width:7, height:7, borderRadius:"50%", background:"var(--accent3)",
          animation:`aiBounce 1.1s ease-in-out ${i*0.16}s infinite` }} />
      ))}
      <style>{`@keyframes aiBounce{0%,80%,100%{transform:scale(.7);opacity:.4}40%{transform:scale(1);opacity:1}}`}</style>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────
export default function AIAssistant() {
  const { user, userProfile, notifyProgress } = useStore();
  const [chats,         setChats]         = useState([]);
  const [activeChatId,  setActiveChatId]  = useState(null);
  const [messages,      setMessages]      = useState([]);
  const [input,         setInput]         = useState("");
  const [loading,       setLoading]       = useState(false);
  const [loadingChats,  setLoadingChats]  = useState(true);
  const [sidebarOpen,   setSidebarOpen]   = useState(true);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    if (!user?.uid) {
      setChats([]);
      setLoadingChats(false);
      return;
    }
    let active = true;
    (async () => {
      setLoadingChats(true);
      const local = readLocalChats(user.uid);
      try {
        const idToken = await user.getIdToken();
        const remote = await getAIChats(idToken);
        const remoteIds = new Set(remote.map(chat => chat.id));
        if (active) setChats([...remote, ...local.filter(chat => !remoteIds.has(chat.id))]);
      } catch {
        if (active) setChats(local);
      } finally {
        if (active) setLoadingChats(false);
      }
    })();
    return () => { active = false; };
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [messages, loading]);

  const newChat = () => { setActiveChatId(null); setMessages([]); inputRef.current?.focus(); };

  const openChat = (chat) => {
    setActiveChatId(chat.id);
    try {
      const msgs = typeof chat.messages === "string" ? JSON.parse(chat.messages) : chat.messages;
      setMessages(msgs || []);
    } catch { setMessages([]); }
  };

  const sendMessage = useCallback(async (text) => {
    const content = (text || input).trim();
    if (!content || loading) return;
    setInput("");

    const userMsg = { role:"user", content, ts:Date.now() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setLoading(true);

    try {
      const contents = newMessages.map(m => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));
      const idToken = await user?.getIdToken?.();
      const replyText = await generateText({ contents, idToken });
      const assistantMsg = { role:"assistant", content:replyText, ts:Date.now() };
      const finalMessages = [...newMessages, assistantMsg];
      setMessages(finalMessages);

      // Save to Supabase
      const title = content.slice(0,60) + (content.length>60?"…":"");
      if (!user?.uid) {
        toast("Sign in to save this conversation.", { icon: "i" });
        return;
      }
      if (activeChatId) {
        try {
          await updateAIChat(idToken, activeChatId, finalMessages);
          notifyProgress();
        }
        catch {
          const local = readLocalChats(user.uid);
          const localChat = local.find(chat => chat.id === activeChatId) || chats.find(chat => chat.id === activeChatId);
          writeLocalChats(user.uid, [
            { ...localChat, id: activeChatId, uid: user.uid, messages: JSON.stringify(finalMessages), updated_at: new Date().toISOString(), localOnly: true },
            ...local.filter(chat => chat.id !== activeChatId),
          ]);
        }
        setChats(cs => cs.map(c => c.id===activeChatId ? {...c, messages:JSON.stringify(finalMessages)} : c));
      } else {
        let saved;
        try {
          saved = await createAIChat(idToken, title, finalMessages);
          notifyProgress();
        }
        catch {
          saved = { id: `local-${Date.now()}`, uid: user.uid, title, messages: JSON.stringify(finalMessages), created_at: new Date().toISOString(), updated_at: new Date().toISOString(), localOnly: true };
          writeLocalChats(user.uid, [saved, ...readLocalChats(user.uid)]);
          toast("Chat saved locally. Run the Supabase AI migration to sync it to the database.", { icon: "i" });
        }
        if (saved) {
          setActiveChatId(saved.id);
          setChats(cs => [{...saved, messages:JSON.stringify(finalMessages)}, ...cs]);
        }
      }
    } catch (err) {
      toast.error("AI request failed: " + err.message);
      // Keep the question visible so a retry does not lose conversation context.
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }, [input, messages, loading, activeChatId, user, chats, notifyProgress]);

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const sidebarStyle = { width:260, flexShrink:0, borderRight:"1px solid var(--border)", background:"var(--bg2)", display:"flex", flexDirection:"column", overflow:"hidden" };

  return (
    <div style={{ display:"flex", height:"calc(100vh - var(--nav-height))", overflow:"hidden" }}>
      {/* ── Sidebar ── */}
      {sidebarOpen && (
        <div style={sidebarStyle}>
          <div style={{ padding:"14px 12px", borderBottom:"1px solid var(--border)", display:"flex", gap:8 }}>
            <button onClick={newChat}
              style={{ flex:1, padding:"8px 10px", background:"linear-gradient(135deg,var(--accent2),var(--accent))", color:"#fff", border:"none", borderRadius:8, cursor:"pointer", fontSize:12, fontWeight:700, fontFamily:"inherit" }}>
              + New Chat
            </button>
            <button onClick={() => setSidebarOpen(false)}
              style={{ padding:"8px 10px", background:"var(--bg3)", border:"1px solid var(--border)", borderRadius:8, cursor:"pointer", fontSize:14, color:"var(--text3)", fontFamily:"inherit" }}>
              ←
            </button>
          </div>
          <div style={{ flex:1, overflowY:"auto", padding:8 }}>
            {loadingChats ? (
              <div style={{ padding:20, textAlign:"center", color:"var(--text3)", fontSize:12 }}>Loading chats...</div>
            ) : chats.length === 0 ? (
              <div style={{ padding:20, textAlign:"center", color:"var(--text3)", fontSize:12 }}>No chats yet.<br/>Start a conversation!</div>
            ) : chats.map(chat => (
              <div key={chat.id} onClick={() => openChat(chat)}
                style={{ padding:"10px 12px", borderRadius:8, cursor:"pointer", marginBottom:4, fontSize:12,
                  background: activeChatId===chat.id ? "rgba(99,102,241,.15)" : "transparent",
                  border:`1px solid ${activeChatId===chat.id ? "rgba(99,102,241,.4)" : "transparent"}`,
                  transition:"all .1s",
                }}
                onMouseEnter={e => activeChatId!==chat.id && (e.currentTarget.style.background="var(--bg3)")}
                onMouseLeave={e => activeChatId!==chat.id && (e.currentTarget.style.background="transparent")}
              >
                <div style={{ fontWeight:600, color:"var(--text)", marginBottom:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                  💬 {chat.title || "New Chat"}
                </div>
                <div style={{ color:"var(--text3)", fontSize:10 }}>
                  {new Date(chat.updated_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Main ── */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        {/* Header */}
        <div style={{ padding:"12px 18px", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", gap:10, background:"var(--bg2)", flexShrink:0 }}>
          {!sidebarOpen && (
            <button onClick={() => setSidebarOpen(true)}
              style={{ padding:"6px 10px", background:"var(--bg3)", border:"1px solid var(--border)", borderRadius:8, cursor:"pointer", fontSize:14, color:"var(--text3)", fontFamily:"inherit" }}>
              ☰
            </button>
          )}
          <div style={{ fontSize:24 }}>🤖</div>
          <div>
            <div style={{ fontWeight:700, fontSize:14 }}>CodeBro AI Assistant</div>
            <div style={{ fontSize:11, color:"var(--text3)" }}>Powered by Gemini · C, C++, Java, Python, JS, TS, SQL, React, Node.js</div>
          </div>
          <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:6 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:"var(--green)", boxShadow:"0 0 6px var(--green)" }} />
            <span style={{ fontSize:11, color:"var(--text3)" }}>Online</span>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex:1, overflowY:"auto", padding:"20px 20px 8px" }}>
          {messages.length === 0 ? (
            <div style={{ maxWidth:720, margin:"0 auto" }}>
              <div style={{ textAlign:"center", marginBottom:40 }}>
                <div style={{ fontSize:64, marginBottom:12 }}>🤖</div>
                <h2 style={{ marginBottom:6 }}>Hi {userProfile?.display_name?.split(" ")[0] || "Coder"}!</h2>
                <p style={{ fontSize:13, color:"var(--text3)" }}>Ask me anything about programming — I can explain, generate code, debug, review, and more.</p>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:10 }}>
                {QUICK_PROMPTS.map(qp => (
                  <div key={qp.label} onClick={() => sendMessage(qp.prompt)}
                    style={{ padding:"12px 14px", background:"var(--bg3)", border:"1px solid var(--border)", borderRadius:10, cursor:"pointer", fontSize:12, transition:"all .15s" }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor="var(--accent)"; e.currentTarget.style.background="rgba(99,102,241,.08)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor="var(--border)"; e.currentTarget.style.background="var(--bg3)"; }}
                  >
                    <div style={{ fontWeight:700, marginBottom:4, color:"var(--accent3)" }}>💡 {qp.label}</div>
                    <div style={{ color:"var(--text3)", fontSize:11, lineHeight:1.5 }}>{qp.prompt.slice(0,60)}...</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ maxWidth:820, margin:"0 auto" }}>
              <AnimatePresence>
                {messages.map((msg, i) => (
                  <motion.div key={i} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                    style={{ display:"flex", gap:12, marginBottom:20, flexDirection:msg.role==="user"?"row-reverse":"row" }}>
                    {/* Avatar */}
                    <div style={{ width:34, height:34, borderRadius:"50%", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, overflow:"hidden",
                      background: msg.role==="user" ? "linear-gradient(135deg,var(--accent2),var(--purple))" : "var(--bg3)",
                      border:`1px solid ${msg.role==="user"?"var(--accent)":"var(--border)"}`,
                    }}>
                      {msg.role==="user"
                        ? (userProfile?.avatar ? <img src={userProfile.avatar} style={{ width:"100%",height:"100%",objectFit:"cover" }} alt="" /> : "👤")
                        : "🤖"}
                    </div>
                    {/* Bubble */}
                    <div style={{ flex:1, maxWidth:"87%" }}>
                      <div style={{ fontSize:10, color:"var(--text3)", marginBottom:5, textAlign:msg.role==="user"?"right":"left" }}>
                        {msg.role==="user" ? (userProfile?.display_name||"You") : "CodeBro AI"}
                        {msg.ts ? " · " + new Date(msg.ts).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}) : ""}
                      </div>
                      <div style={{
                        padding:"13px 16px",
                        borderRadius: msg.role==="user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
                        background: msg.role==="user" ? "rgba(99,102,241,.15)" : "var(--bg3)",
                        border:`1px solid ${msg.role==="user"?"rgba(99,102,241,.3)":"var(--border)"}`,
                      }}>
                        <MessageContent content={msg.content} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {loading && (
                <div style={{ display:"flex", gap:12, marginBottom:20 }}>
                  <div style={{ width:34,height:34,borderRadius:"50%",background:"var(--bg3)",border:"1px solid var(--border)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>🤖</div>
                  <div style={{ background:"var(--bg3)", border:"1px solid var(--border)", borderRadius:"4px 16px 16px 16px", overflow:"hidden" }}>
                    <TypingIndicator />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div style={{ padding:"12px 20px 16px", borderTop:"1px solid var(--border)", background:"var(--bg2)", flexShrink:0 }}>
          <div style={{ maxWidth:820, margin:"0 auto", display:"flex", gap:10, alignItems:"flex-end" }}>
            <div style={{ flex:1, position:"relative" }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask me anything… (Shift+Enter for new line, Enter to send)"
                rows={1}
                style={{ width:"100%", padding:"12px 14px", background:"var(--bg3)", border:"1px solid var(--border)", borderRadius:12, color:"var(--text)", fontSize:13, fontFamily:"inherit", resize:"none", lineHeight:1.55, maxHeight:130, overflow:"auto", outline:"none", transition:"border-color .15s" }}
                onInput={e => { e.target.style.height="auto"; e.target.style.height=Math.min(e.target.scrollHeight,130)+"px"; }}
                onFocus={e  => e.target.style.borderColor="var(--accent)"}
                onBlur={e   => e.target.style.borderColor="var(--border)"}
              />
            </div>
            <button onClick={() => sendMessage()} disabled={!input.trim()||loading}
              style={{ padding:"12px 18px", borderRadius:12, border:"1px solid var(--border)", cursor:input.trim()&&!loading?"pointer":"not-allowed", fontSize:18, flexShrink:0, transition:"all .15s",
                background: input.trim()&&!loading ? "linear-gradient(135deg,var(--accent2),var(--accent))" : "var(--bg3)",
                color: input.trim()&&!loading ? "#fff" : "var(--text3)",
              }}>
              {loading ? "⏳" : "↑"}
            </button>
          </div>
          <div style={{ maxWidth:820, margin:"6px auto 0", fontSize:10, color:"var(--text3)", textAlign:"center" }}>
            Conversations saved automatically · Access history in sidebar
          </div>
        </div>
      </div>
    </div>
  );
}
