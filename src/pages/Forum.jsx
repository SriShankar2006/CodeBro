// src/pages/Forum.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { getForumPosts, createForumPost, votePost } from "../services/supabase";
import { FORUM_POSTS_SEED } from "../data/courses";
import { Card, TabBar, Tag, Button, Modal } from "../components/UI";
import useStore from "../context/useStore";

export default function Forum() {
  const { user, userProfile } = useStore();
  const [posts,   setPosts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState("Trending");
  const [showNew, setShowNew] = useState(false);
  const [votes,   setVotes]   = useState({});
  const [search,  setSearch]  = useState("");
  const [newPost, setNewPost] = useState({ title:"", body:"", tags:"" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await getForumPosts(tab==="Latest"?"latest":"votes");
        setPosts(data.length > 0 ? data : FORUM_POSTS_SEED);
      } catch { setPosts(FORUM_POSTS_SEED); }
      setLoading(false);
    })();
  }, [tab]);

  const handleVote = async (post, dir) => {
    const key = post.id;
    const cur = votes[key] || 0;
    if (cur === dir) return;
    const delta = dir - cur;
    setVotes(v => ({ ...v, [key]: dir }));
    setPosts(ps => ps.map(p => p.id===key ? { ...p, votes:(p.votes||0)+delta } : p));
    if (post.id && typeof post.id === "string" && post.id.length > 10) {
      try { await votePost(post.id, delta); } catch {}
    }
  };

  const submitPost = async () => {
    if (!newPost.title.trim()) { toast.error("Title is required"); return; }
    setSubmitting(true);
    try {
      const tags = newPost.tags.split(",").map(t=>t.trim()).filter(Boolean);
      const post = {
        title: newPost.title.trim(),
        body:  newPost.body.trim(),
        tags,
        uid:      user?.uid || "demo",
        username: userProfile?.username || "coder",
        votes: 0, answers: 0, solved: false,
      };
      const saved = await createForumPost(post);
      setPosts(ps => [{ ...(saved||post), id: saved?.id || Date.now(), time:"Just now" }, ...ps]);
      toast.success("Post created! 🎉");
      setShowNew(false);
      setNewPost({ title:"", body:"", tags:"" });
    } catch (e) {
      // add locally even if Supabase fails
      setPosts(ps => [{ ...newPost, id:Date.now(), uid:user?.uid, username:userProfile?.username, votes:0, answers:0, solved:false, time:"Just now", tags:newPost.tags.split(",").map(t=>t.trim()).filter(Boolean) }, ...ps]);
      toast.success("Post created!");
      setShowNew(false);
      setNewPost({ title:"", body:"", tags:"" });
    }
    setSubmitting(false);
  };

  const filtered = posts.filter(p =>
    !search || p.title?.toLowerCase().includes(search.toLowerCase())
  );

  const HOT_TOPICS = ["Dynamic Programming","Graph Algorithms","System Design","Binary Trees","Two Pointers","Backtracking"];

  return (
    <div className="page-container fade-in">
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:12 }}>
        <div>
          <h2>💬 Discussion Forum</h2>
          <p style={{ fontSize:12,marginTop:2 }}>Ask questions, share solutions, help the community</p>
        </div>
        <div style={{ display:"flex",gap:8 }}>
          <input type="text" placeholder="🔍 Search discussions..." value={search} onChange={e=>setSearch(e.target.value)} style={{ width:200 }} />
          <Button variant="primary" onClick={() => setShowNew(true)}>+ New Post</Button>
        </div>
      </div>

      <div style={{ display:"flex",gap:20 }}>
        {/* Feed */}
        <div style={{ flex:1 }}>
          <div style={{ marginBottom:14, maxWidth:520 }}>
            <TabBar tabs={["Trending","Latest","Solved","Unsolved"]} active={tab} onChange={setTab} />
          </div>

          {loading ? (
            Array.from({length:5}).map((_,i) => (
              <div key={i} style={{ padding:"16px",borderBottom:"1px solid var(--border)",display:"flex",gap:14 }}>
                <div className="skeleton" style={{ width:36,height:60,borderRadius:6 }} />
                <div style={{ flex:1 }}>
                  <div className="skeleton" style={{ width:"70%",height:14,marginBottom:8 }} />
                  <div className="skeleton" style={{ width:"40%",height:10 }} />
                </div>
              </div>
            ))
          ) : (
            <Card style={{ padding:0,overflow:"hidden" }}>
              {filtered.length === 0 ? (
                <div style={{ textAlign:"center",padding:40,color:"var(--text3)",fontSize:13 }}>No posts match your search</div>
              ) : filtered.map((post,i) => (
                <motion.div key={post.id||i} initial={{ opacity:0,y:6 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*.04 }}
                  style={{ display:"flex",gap:14,padding:16,borderBottom:i<filtered.length-1?"1px solid rgba(42,58,92,.5)":"none",cursor:"pointer",transition:"background .1s" }}
                  onMouseEnter={e=>e.currentTarget.style.background="rgba(99,102,241,.03)"}
                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}
                >
                  {/* Vote column */}
                  <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:4,width:36 }}>
                    <button onClick={e=>{e.stopPropagation();handleVote(post,1);}} style={{ background:"none",border:"none",cursor:"pointer",fontSize:16,color:votes[post.id]===1?"var(--accent3)":"var(--text3)",padding:2 }}>▲</button>
                    <div style={{ fontSize:14,fontWeight:700 }}>{post.votes||0}</div>
                    <button onClick={e=>{e.stopPropagation();handleVote(post,-1);}} style={{ background:"none",border:"none",cursor:"pointer",fontSize:14,color:votes[post.id]===-1?"var(--red)":"var(--text3)",padding:2 }}>▼</button>
                  </div>
                  {/* Content */}
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex",alignItems:"flex-start",gap:8,marginBottom:8 }}>
                      <span style={{ fontSize:13,fontWeight:600,color:"var(--accent3)",flex:1,lineHeight:1.5 }}>{post.title}</span>
                      {post.solved&&<span className="tag tag-green" style={{ fontSize:10,flexShrink:0 }}>✓ SOLVED</span>}
                    </div>
                    <div style={{ display:"flex",gap:5,flexWrap:"wrap",alignItems:"center" }}>
                      {(post.tags||[]).map(t=><span key={t} className="tag tag-blue" style={{ fontSize:10 }}>{t}</span>)}
                      <span style={{ fontSize:10,color:"var(--text3)",marginLeft:4 }}>
                        💬{post.answers||0} · 👁{(post.views||0).toLocaleString()} · {post.time||"recently"}
                        {post.username && <span> · by @{post.username}</span>}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ width:240,flexShrink:0 }}>
          <Card style={{ marginBottom:14 }}>
            <h4 style={{ marginBottom:12 }}>🔥 Hot Topics</h4>
            {HOT_TOPICS.map((t,i) => (
              <div key={t} style={{ display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:i<5?"1px solid rgba(42,58,92,.4)":"none",fontSize:12,cursor:"pointer" }}
                onMouseEnter={e=>e.currentTarget.style.color="var(--accent3)"}
                onMouseLeave={e=>e.currentTarget.style.color="var(--text2)"}
              >
                <span>{t}</span>
                <span style={{ color:"var(--text3)" }}>{Math.floor(Math.random()*200+50)}</span>
              </div>
            ))}
          </Card>

          <Card style={{ marginBottom:14 }}>
            <h4 style={{ marginBottom:10 }}>📌 Forum Rules</h4>
            <div style={{ fontSize:11,color:"var(--text2)",lineHeight:1.8 }}>
              • Be respectful<br/>
              • Search before posting<br/>
              • Include code examples<br/>
              • Mark solved when done<br/>
              • No spam or off-topic
            </div>
          </Card>

          <Card>
            <h4 style={{ marginBottom:10 }}>❓ Ask a Question</h4>
            <p style={{ fontSize:11,color:"var(--text2)",marginBottom:12,lineHeight:1.6 }}>Stuck on a problem? The CodeBro community is here to help!</p>
            <Button variant="primary" style={{ width:"100%",justifyContent:"center" }} onClick={() => setShowNew(true)}>
              Post a Question
            </Button>
          </Card>
        </div>
      </div>

      {/* New Post Modal */}
      <Modal isOpen={showNew} onClose={() => setShowNew(false)} title="📝 Create New Post" width={560}>
        <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
          <div>
            <label>Title *</label>
            <input type="text" placeholder="What's your question?" value={newPost.title} onChange={e=>setNewPost(p=>({...p,title:e.target.value}))} />
          </div>
          <div>
            <label>Description</label>
            <textarea rows={5} placeholder="Describe your problem, include code snippets, what you've tried..." value={newPost.body} onChange={e=>setNewPost(p=>({...p,body:e.target.value}))} style={{ resize:"vertical" }} />
          </div>
          <div>
            <label>Tags (comma separated)</label>
            <input type="text" placeholder="e.g. Graph, DFS, Python" value={newPost.tags} onChange={e=>setNewPost(p=>({...p,tags:e.target.value}))} />
          </div>
          <div style={{ display:"flex",gap:8,justifyContent:"flex-end" }}>
            <Button variant="outline" onClick={()=>setShowNew(false)}>Cancel</Button>
            <Button variant="primary" onClick={submitPost} loading={submitting}>Post Question</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
