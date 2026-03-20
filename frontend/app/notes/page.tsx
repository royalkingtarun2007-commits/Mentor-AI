"use client";

import { useEffect, useState } from "react";
import { fetchNotes, createNote, deleteNote, updateNote } from "@/lib/notes";
import { Plus, Trash2, BookOpen, Clock, Tag, X, Calendar, AlignLeft, Edit3, Save, MessageSquare, ChevronRight, Loader2, Search, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";

interface Note {
  id: number;
  title: string;
  content: string;
  ai_summary?: string;
  tags?: string;
  created_at: string;
}

const display = { fontFamily: "'DM Serif Display', serif" };
const body = { fontFamily: "'DM Sans', sans-serif" };
const mono = { fontFamily: "'IBM Plex Mono', monospace" };

export default function NotesPage() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=IBM+Plex+Mono:wght@300;400;500&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try { const data = await fetchNotes(); setNotes(data); }
    catch (err) { console.error("Failed to load notes:", err); }
  };

  const handleCreate = async () => {
    if (!title.trim() || !content.trim()) return;
    setLoading(true);
    try {
      await createNote({ title, content, tags: "General" });
      setTitle(""); setContent(""); setIsAdding(false);
      await loadNotes();
    } catch { alert("Failed to create note"); }
    finally { setLoading(false); }
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!confirm("Delete this note?")) return;
    try {
      await deleteNote(id);
      await loadNotes();
      if (selectedNote?.id === id) setSelectedNote(null);
    } catch { alert("Failed to delete"); }
  };

  const handleUpdate = async () => {
    if (!selectedNote) return;
    setLoading(true);
    try {
      const updated = await updateNote(selectedNote.id, { title: editTitle, content: editContent });
      setSelectedNote(updated);
      setIsEditing(false);
      await loadNotes();
    } catch { alert("Failed to update"); }
    finally { setLoading(false); }
  };

  const openNote = (note: Note) => {
    setSelectedNote(note); setEditTitle(note.title); setEditContent(note.content); setIsEditing(false);
  };

  const handleChatWithNote = (note: Note) => {
    sessionStorage.setItem("context_note", JSON.stringify(note));
    router.push("/chat");
  };

  const filtered = notes.filter(n =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ minHeight: "100vh", background: "#02020a", paddingTop: "96px", paddingBottom: "80px", position: "relative" }}>

      {/* Static dot-grid background with soft gradient accents */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(99,102,241,0.16) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div style={{ position: "absolute", top: "-60px", left: "50%", transform: "translateX(-50%)", width: "1000px", height: "500px", background: "radial-gradient(ellipse at center top, rgba(99,102,241,0.08) 0%, transparent 65%)" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, width: "600px", height: "450px", background: "radial-gradient(ellipse at bottom left, rgba(139,92,246,0.06) 0%, transparent 65%)" }} />
        <div style={{ position: "absolute", top: "20%", right: 0, width: "400px", height: "600px", background: "radial-gradient(ellipse at right, rgba(6,182,212,0.04) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 120% 80% at 50% 50%, transparent 40%, rgba(2,2,10,0.65) 100%)" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: "1300px", margin: "0 auto", padding: "0 32px" }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: "24px", marginBottom: "48px" }}>
          <div>
            <p style={{ ...mono, fontSize: "11px", color: "#6366f1", letterSpacing: "0.28em", textTransform: "uppercase", marginBottom: "12px" }}>
              Knowledge Base
            </p>
            <h1 style={{ ...display, fontSize: "clamp(44px, 6vw, 66px)", fontStyle: "italic", color: "#ffffff", marginBottom: "12px", lineHeight: 1.05 }}>
              Your Notes
            </h1>
            <p style={{ ...body, color: "#52526e", fontSize: "17px", fontWeight: 300 }}>
              {notes.length} {notes.length === 1 ? "entry" : "entries"} — vectorized for semantic search
            </p>
          </div>

          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => setIsAdding(!isAdding)}
            style={{ display: "flex", alignItems: "center", gap: "9px", padding: "15px 30px", borderRadius: "14px", border: "none", cursor: "pointer", ...body, fontSize: "16px", fontWeight: 600, background: isAdding ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg, #4f46e5, #7c3aed)", color: isAdding ? "#7070a0" : "#ffffff", outline: isAdding ? "1px solid rgba(255,255,255,0.1)" : "none" }}>
            {isAdding ? <><X size={18} /> Cancel</> : <><Plus size={18} /> New Note</>}
          </motion.button>
        </motion.div>

        {/* Search */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ position: "relative", marginBottom: "36px" }}>
          <Search size={17} style={{ position: "absolute", left: "20px", top: "50%", transform: "translateY(-50%)", color: "#3a3a5a", pointerEvents: "none" }} />
          <input type="text" placeholder="Search your knowledge base..."
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            style={{ width: "100%", paddingLeft: "52px", paddingRight: "20px", paddingTop: "17px", paddingBottom: "17px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", ...body, fontSize: "16px", fontWeight: 400, color: "#e0e0ff", outline: "none", transition: "border-color 0.2s" }}
            onFocus={e => (e.target.style.borderColor = "rgba(99,102,241,0.45)")}
            onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.07)")} />
        </motion.div>

        {/* Add Note Panel */}
        <AnimatePresence>
          {isAdding && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}
              style={{ overflow: "hidden", marginBottom: "36px" }}>
              <div style={{ position: "relative", background: "rgba(99,102,241,0.04)", border: "1px solid rgba(99,102,241,0.18)", borderRadius: "22px", padding: "36px" }}>
                <div style={{ position: "absolute", top: 0, left: "15%", right: "15%", height: "1px", background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.55), transparent)" }} />
                <input placeholder="Note title"
                  value={title} onChange={e => setTitle(e.target.value)}
                  style={{ width: "100%", background: "transparent", border: "none", borderBottom: "1px solid rgba(255,255,255,0.07)", ...display, fontSize: "30px", fontStyle: "italic", color: "#ffffff", paddingBottom: "14px", marginBottom: "22px", outline: "none" }} />
                <textarea placeholder="Write your knowledge here. The AI will vectorize this for semantic search."
                  value={content} onChange={e => setContent(e.target.value)}
                  style={{ width: "100%", background: "transparent", border: "none", ...body, fontSize: "17px", fontWeight: 300, color: "#a0a0c0", lineHeight: 1.85, minHeight: "160px", resize: "none", outline: "none", marginBottom: "22px" }} />
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", paddingTop: "18px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  <motion.button whileHover={{ background: "rgba(255,255,255,0.06)" }} onClick={() => setIsAdding(false)}
                    style={{ padding: "13px 24px", borderRadius: "12px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "#7070a0", cursor: "pointer", ...body, fontSize: "15px" }}>
                    Cancel
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleCreate}
                    disabled={loading || !title.trim() || !content.trim()}
                    style={{ display: "flex", alignItems: "center", gap: "8px", padding: "13px 28px", borderRadius: "12px", background: "linear-gradient(135deg, #4f46e5, #7c3aed)", color: "#ffffff", border: "none", cursor: loading ? "not-allowed" : "pointer", ...body, fontSize: "15px", fontWeight: 600, opacity: loading || !title.trim() || !content.trim() ? 0.5 : 1 }}>
                    {loading ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <BookOpen size={16} />}
                    {loading ? "Saving..." : "Save Note"}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {filtered.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center", padding: "100px 0" }}>
            <FileText size={48} style={{ color: "#2a2a4a", margin: "0 auto 20px" }} />
            <p style={{ ...display, fontSize: "26px", fontStyle: "italic", color: "#44445a", marginBottom: "10px" }}>
              {searchQuery ? "No notes match your search" : "No notes yet"}
            </p>
            <p style={{ ...body, fontSize: "16px", fontWeight: 300, color: "#3a3a5a" }}>
              {searchQuery ? "Try a different search term" : "Create your first note to get started"}
            </p>
          </motion.div>
        )}

        {/* Notes Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "22px" }}>
          {filtered.map((note, i) => (
            <motion.div key={note.id}
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              whileHover={{ y: -5 }} onClick={() => openNote(note)}
              style={{ position: "relative", display: "flex", flexDirection: "column", padding: "30px", borderRadius: "22px", background: "rgba(255,255,255,0.028)", border: "1px solid rgba(255,255,255,0.07)", cursor: "pointer", overflow: "hidden", transition: "border-color 0.25s" }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(99,102,241,0.28)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)")}>

              <div style={{ position: "absolute", top: 0, left: "12%", right: "12%", height: "1px", background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.28), transparent)" }} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                <div style={{ padding: "10px", borderRadius: "12px", background: "rgba(99,102,241,0.09)", border: "1px solid rgba(99,102,241,0.16)" }}>
                  <BookOpen size={18} style={{ color: "#6366f1" }} />
                </div>
                <motion.button whileHover={{ background: "rgba(239,68,68,0.1)" }} onClick={e => handleDelete(e, note.id)}
                  style={{ padding: "9px", borderRadius: "10px", background: "transparent", border: "none", color: "#3a3a5a", cursor: "pointer", transition: "color 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#f87171")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#3a3a5a")}>
                  <Trash2 size={16} />
                </motion.button>
              </div>

              <h3 style={{ ...display, fontSize: "21px", fontStyle: "italic", color: "#f0f0ff", marginBottom: "12px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", lineHeight: 1.25 }}>
                {note.title}
              </h3>

              <p style={{ ...body, color: "#5a5a7a", fontSize: "15px", fontWeight: 300, lineHeight: 1.8, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", marginBottom: "22px", flex: 1 }}>
                {note.content}
              </p>

              {note.ai_summary && (
                <div style={{ paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.05)", marginBottom: "16px" }}>
                  <p style={{ ...mono, fontSize: "10px", color: "#8b5cf6", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: "7px" }}>AI Summary</p>
                  <p style={{ ...body, fontSize: "14px", fontStyle: "italic", fontWeight: 300, color: "#52527a", lineHeight: 1.65, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                    {note.ai_summary}
                  </p>
                </div>
              )}

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "14px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "5px", ...mono, fontSize: "11px", color: "#3a3a5a" }}>
                    <Clock size={10} /> {new Date(note.created_at).toLocaleDateString()}
                  </span>
                  {note.tags && (
                    <span style={{ display: "flex", alignItems: "center", gap: "5px", ...mono, fontSize: "11px", color: "#3a3a5a", textTransform: "uppercase" }}>
                      <Tag size={10} /> {note.tags}
                    </span>
                  )}
                </div>
                <ChevronRight size={15} style={{ color: "#3a3a5a" }} />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Side Drawer */}
      <AnimatePresence>
        {selectedNote && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedNote(null)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.78)", backdropFilter: "blur(10px)", zIndex: 60 }} />

            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 220 }}
              style={{ position: "fixed", right: 0, top: 0, height: "100%", width: "100%", maxWidth: "720px", background: "#07070f", borderLeft: "1px solid rgba(255,255,255,0.07)", zIndex: 70, overflowY: "auto" }}>

              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.55), transparent)" }} />

              <div style={{ position: "sticky", top: 0, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "22px 40px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(7,7,15,0.95)", backdropFilter: "blur(20px)", zIndex: 10 }}>
                <div style={{ display: "flex", gap: "10px" }}>
                  <motion.button whileHover={{ scale: 1.02 }} onClick={() => setIsEditing(!isEditing)}
                    style={{ display: "flex", alignItems: "center", gap: "7px", padding: "11px 20px", borderRadius: "11px", background: isEditing ? "#ffffff" : "transparent", border: isEditing ? "none" : "1px solid rgba(255,255,255,0.1)", color: isEditing ? "#000" : "#7070a0", cursor: "pointer", ...body, fontSize: "15px", fontWeight: 500 }}>
                    {isEditing ? <><X size={14} /> Cancel</> : <><Edit3 size={14} /> Edit</>}
                  </motion.button>
                  {!isEditing && (
                    <motion.button whileHover={{ scale: 1.02 }} onClick={() => handleChatWithNote(selectedNote)}
                      style={{ display: "flex", alignItems: "center", gap: "7px", padding: "11px 20px", borderRadius: "11px", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", color: "#818cf8", cursor: "pointer", ...body, fontSize: "15px", fontWeight: 500 }}>
                      <MessageSquare size={14} /> Chat with Note
                    </motion.button>
                  )}
                </div>
                <motion.button whileHover={{ background: "rgba(255,255,255,0.06)" }} onClick={() => setSelectedNote(null)}
                  style={{ padding: "10px", borderRadius: "10px", background: "transparent", border: "none", color: "#44445a", cursor: "pointer" }}>
                  <X size={20} />
                </motion.button>
              </div>

              <div style={{ padding: "44px 40px" }}>
                {isEditing ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    <div>
                      <label style={{ ...mono, fontSize: "11px", color: "#44445a", textTransform: "uppercase", letterSpacing: "0.16em", display: "block", marginBottom: "10px" }}>Title</label>
                      <input value={editTitle} onChange={e => setEditTitle(e.target.value)}
                        style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "18px 22px", ...display, fontSize: "26px", fontStyle: "italic", color: "#ffffff", outline: "none" }}
                        onFocus={e => (e.target.style.borderColor = "rgba(99,102,241,0.4)")}
                        onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.08)")} />
                    </div>
                    <div>
                      <label style={{ ...mono, fontSize: "11px", color: "#44445a", textTransform: "uppercase", letterSpacing: "0.16em", display: "block", marginBottom: "10px" }}>Content</label>
                      <textarea value={editContent} onChange={e => setEditContent(e.target.value)}
                        style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "14px", padding: "18px 22px", ...body, fontSize: "17px", fontWeight: 300, color: "#c0c0d0", lineHeight: 1.85, minHeight: "400px", resize: "none", outline: "none" }}
                        onFocus={e => (e.target.style.borderColor = "rgba(99,102,241,0.4)")}
                        onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.08)")} />
                    </div>
                    <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={handleUpdate} disabled={loading}
                      style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "9px", padding: "17px", borderRadius: "14px", background: "linear-gradient(135deg, #4f46e5, #7c3aed)", color: "#ffffff", border: "none", cursor: loading ? "not-allowed" : "pointer", ...body, fontSize: "17px", fontWeight: 600, opacity: loading ? 0.6 : 1 }}>
                      {loading ? <Loader2 size={17} style={{ animation: "spin 1s linear infinite" }} /> : <><Save size={17} /> Save Changes</>}
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <h2 style={{ ...display, fontSize: "44px", fontStyle: "italic", color: "#ffffff", marginBottom: "26px", lineHeight: 1.12 }}>
                      {selectedNote.title}
                    </h2>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "36px", paddingBottom: "28px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "7px", padding: "8px 16px", borderRadius: "9px", background: "rgba(255,255,255,0.04)", ...mono, fontSize: "12px", color: "#44445a" }}>
                        <Calendar size={12} /> {new Date(selectedNote.created_at).toLocaleDateString()}
                      </span>
                      {selectedNote.tags && (
                        <span style={{ display: "flex", alignItems: "center", gap: "7px", padding: "8px 16px", borderRadius: "9px", background: "rgba(255,255,255,0.04)", ...mono, fontSize: "12px", color: "#44445a" }}>
                          <Tag size={12} /> {selectedNote.tags}
                        </span>
                      )}
                      <span style={{ padding: "8px 16px", borderRadius: "9px", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.18)", ...mono, fontSize: "12px", color: "#818cf8" }}>
                        Vectorized
                      </span>
                    </div>
                    {selectedNote.ai_summary && (
                      <div style={{ marginBottom: "36px", padding: "26px 28px", borderRadius: "18px", background: "rgba(139,92,246,0.05)", border: "1px solid rgba(139,92,246,0.14)", position: "relative", overflow: "hidden" }}>
                        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.5), transparent)" }} />
                        <p style={{ ...mono, fontSize: "11px", color: "#8b5cf6", textTransform: "uppercase", letterSpacing: "0.16em", marginBottom: "14px" }}>AI Summary</p>
                        <p style={{ ...body, color: "#c0c0d8", fontSize: "17px", fontStyle: "italic", fontWeight: 300, lineHeight: 1.8 }}>"{selectedNote.ai_summary}"</p>
                      </div>
                    )}
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "18px" }}>
                        <AlignLeft size={14} style={{ color: "#3a3a5a" }} />
                        <span style={{ ...mono, fontSize: "11px", color: "#3a3a5a", textTransform: "uppercase", letterSpacing: "0.16em" }}>Content</span>
                      </div>
                      <p style={{ ...body, color: "#a0a0c0", fontSize: "17px", fontWeight: 300, lineHeight: 1.95, whiteSpace: "pre-wrap" }}>
                        {selectedNote.content}
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
