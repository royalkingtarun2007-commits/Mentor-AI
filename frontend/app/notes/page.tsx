"use client";

import { useEffect, useState } from "react";
import { fetchNotes, createNote, deleteNote, updateNote } from "@/lib/notes";
import {
  Plus, Trash2, Sparkles, BookOpen,
  Clock, Tag, X, Calendar, AlignLeft,
  Edit3, Save, MessageSquare, ChevronRight,
  Loader2, Search, FileText
} from "lucide-react";
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

const syne = { fontFamily: "'Syne', sans-serif" };
const mono = { fontFamily: "'JetBrains Mono', monospace" };

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

  const loadNotes = async () => {
    try {
      const data = await fetchNotes();
      setNotes(data);
    } catch (err) { console.error("Failed to load notes:", err); }
  };

  useEffect(() => { loadNotes(); }, []);

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
    setSelectedNote(note);
    setEditTitle(note.title);
    setEditContent(note.content);
    setIsEditing(false);
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
    <div style={{ minHeight: "100vh", background: "#030308", paddingTop: "96px", paddingBottom: "80px", position: "relative", overflow: "hidden" }}>

      {/* Background */}
      <div style={{ position: "absolute", top: "-150px", right: "-150px", width: "500px", height: "500px", borderRadius: "50%", background: "rgba(0,212,255,0.04)", filter: "blur(80px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-100px", left: "-100px", width: "400px", height: "400px", borderRadius: "50%", background: "rgba(139,92,246,0.04)", filter: "blur(80px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" }} />

      <div style={{ position: "relative", maxWidth: "1280px", margin: "0 auto", padding: "0 24px" }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: "24px", marginBottom: "40px" }}
        >
          <div>
            <p style={{ ...mono, fontSize: "10px", color: "#00d4ff", letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: "10px" }}>
              Knowledge Base
            </p>
            <h1 style={{ ...syne, fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 800, letterSpacing: "-0.02em", background: "linear-gradient(135deg, #00d4ff 0%, #a78bfa 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", marginBottom: "8px" }}>
              Your Notes
            </h1>
            <p style={{ ...mono, color: "#8888aa", fontSize: "13px" }}>
              // {notes.length} entries vectorized for semantic search
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.03, boxShadow: isAdding ? "none" : "0 0 20px rgba(0,212,255,0.3)" }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setIsAdding(!isAdding)}
            style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 24px", borderRadius: "12px", border: "none", cursor: "pointer", ...syne, fontSize: "14px", fontWeight: 700, transition: "all 0.2s", background: isAdding ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg, #00d4ff, #818cf8)", color: isAdding ? "#8888aa" : "#000", outline: isAdding ? "1px solid rgba(255,255,255,0.1)" : "none" }}
          >
            {isAdding ? <><X size={16} /> Cancel</> : <><Plus size={16} /> New Note</>}
          </motion.button>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ position: "relative", marginBottom: "32px" }}
        >
          <Search size={15} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#44445a", pointerEvents: "none" }} />
          <input
            type="text"
            placeholder="search your knowledge base..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: "100%", paddingLeft: "44px", paddingRight: "16px", paddingTop: "14px", paddingBottom: "14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "12px", ...mono, fontSize: "13px", color: "#f0f0ff", transition: "border-color 0.2s" }}
            onFocus={e => (e.target.style.borderColor = "rgba(0,212,255,0.4)")}
            onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.07)")}
          />
        </motion.div>

        {/* Add Note Panel */}
        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              style={{ overflow: "hidden", marginBottom: "32px" }}
            >
              <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(0,212,255,0.2)", borderRadius: "20px", padding: "28px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
                  <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00d4ff", display: "inline-block" }} />
                  <span style={{ ...mono, fontSize: "10px", color: "#00d4ff", letterSpacing: "0.2em", textTransform: "uppercase" }}>New entry</span>
                </div>

                <input
                  placeholder="Entry title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{ width: "100%", background: "transparent", border: "none", borderBottom: "1px solid rgba(255,255,255,0.06)", ...syne, fontSize: "24px", fontWeight: 700, color: "#ffffff", paddingBottom: "12px", marginBottom: "16px" }}
                />
                <textarea
                  placeholder="Write your knowledge here... The AI will vectorize this for semantic search."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  style={{ width: "100%", background: "transparent", border: "none", ...mono, fontSize: "13px", color: "#c0c0d0", lineHeight: 1.8, minHeight: "140px", resize: "none", marginBottom: "20px" }}
                />
                <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  <motion.button
                    whileHover={{ background: "rgba(255,255,255,0.07)" }}
                    onClick={() => setIsAdding(false)}
                    style={{ padding: "10px 20px", borderRadius: "10px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "#8888aa", cursor: "pointer", ...syne, fontSize: "13px" }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(0,212,255,0.3)" }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleCreate}
                    disabled={loading || !title.trim() || !content.trim()}
                    style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 24px", borderRadius: "10px", background: "linear-gradient(135deg, #00d4ff, #818cf8)", color: "#000", border: "none", cursor: loading ? "not-allowed" : "pointer", ...syne, fontSize: "13px", fontWeight: 700, opacity: loading || !title.trim() || !content.trim() ? 0.5 : 1 }}
                  >
                    {loading ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Sparkles size={14} />}
                    {loading ? "Vectorizing..." : "Save & Vectorize"}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notes Grid */}
        {filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center", padding: "80px 0" }}>
            <FileText size={40} style={{ color: "#2a2a3a", margin: "0 auto 16px" }} />
            <p style={{ ...mono, color: "#44445a", fontSize: "13px" }}>
              {searchQuery ? "no notes match your search" : "no notes yet — add your first one"}
            </p>
          </motion.div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
            {filtered.map((note, i) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -4, boxShadow: "0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,212,255,0.2)" }}
                onClick={() => openNote(note)}
                style={{ position: "relative", display: "flex", flexDirection: "column", padding: "24px", borderRadius: "20px", background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)", cursor: "pointer", overflow: "hidden", transition: "border-color 0.2s" }}
              >
                {/* Top glow line on hover handled by whileHover box-shadow */}
                <div style={{ position: "absolute", top: 0, left: "15%", right: "15%", height: "1px", background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.3), transparent)" }} />

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                  <div style={{ padding: "8px", borderRadius: "10px", background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.15)", color: "#00d4ff" }}>
                    <BookOpen size={16} />
                  </div>
                  <motion.button
                    whileHover={{ background: "rgba(239,68,68,0.1)" }}
                    onClick={(e) => handleDelete(e, note.id)}
                    style={{ padding: "8px", borderRadius: "10px", background: "transparent", border: "none", color: "#44445a", cursor: "pointer", transition: "color 0.2s" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#f87171")}
                    onMouseLeave={e => (e.currentTarget.style.color = "#44445a")}
                  >
                    <Trash2 size={14} />
                  </motion.button>
                </div>

                <h3 style={{ ...syne, fontSize: "17px", fontWeight: 700, color: "#f0f0ff", marginBottom: "10px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical" }}>
                  {note.title}
                </h3>

                <p style={{ ...mono, color: "#8888aa", fontSize: "12px", lineHeight: 1.7, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", marginBottom: "20px", flex: 1 }}>
                  {note.content}
                </p>

                {note.ai_summary && (
                  <div style={{ paddingTop: "14px", borderTop: "1px solid rgba(255,255,255,0.05)", marginBottom: "14px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                      <Sparkles size={9} style={{ color: "#a78bfa" }} />
                      <span style={{ ...mono, fontSize: "9px", color: "#a78bfa", textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 700 }}>AI Abstract</span>
                    </div>
                    <p style={{ ...mono, fontSize: "11px", color: "#66668a", fontStyle: "italic", lineHeight: 1.6, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                      {note.ai_summary}
                    </p>
                  </div>
                )}

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "4px", ...mono, fontSize: "10px", color: "#44445a" }}>
                      <Clock size={9} /> {new Date(note.created_at).toLocaleDateString()}
                    </span>
                    {note.tags && (
                      <span style={{ display: "flex", alignItems: "center", gap: "4px", ...mono, fontSize: "10px", color: "#44445a", textTransform: "uppercase" }}>
                        <Tag size={9} /> {note.tags}
                      </span>
                    )}
                  </div>
                  <ChevronRight size={13} style={{ color: "#2a2a3a" }} />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ── SIDE DRAWER ── */}
      <AnimatePresence>
        {selectedNote && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedNote(null)}
              style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)", zIndex: 60 }}
            />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 220 }}
              style={{ position: "fixed", right: 0, top: 0, height: "100%", width: "100%", maxWidth: "680px", background: "#08080f", borderLeft: "1px solid rgba(255,255,255,0.07)", zIndex: 70, overflowY: "auto" }}
            >
              {/* Drawer top glow */}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.4), transparent)" }} />

              {/* Drawer header */}
              <div style={{ position: "sticky", top: 0, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 32px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(8,8,15,0.95)", backdropFilter: "blur(20px)", zIndex: 10 }}>
                <div style={{ display: "flex", gap: "10px" }}>
                  <motion.button
                    whileHover={{ background: isEditing ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.07)" }}
                    onClick={() => setIsEditing(!isEditing)}
                    style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "10px", background: isEditing ? "#ffffff" : "transparent", border: isEditing ? "none" : "1px solid rgba(255,255,255,0.12)", color: isEditing ? "#000" : "#8888aa", cursor: "pointer", ...syne, fontSize: "12px", fontWeight: 600, transition: "all 0.2s" }}
                  >
                    {isEditing ? <><X size={12} /> Cancel</> : <><Edit3 size={12} /> Edit</>}
                  </motion.button>

                  {!isEditing && (
                    <motion.button
                      whileHover={{ background: "rgba(0,212,255,0.12)", boxShadow: "0 0 12px rgba(0,212,255,0.2)" }}
                      onClick={() => handleChatWithNote(selectedNote)}
                      style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "10px", background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.2)", color: "#00d4ff", cursor: "pointer", ...syne, fontSize: "12px", fontWeight: 600, transition: "all 0.2s" }}
                    >
                      <MessageSquare size={12} /> Chat with Note
                    </motion.button>
                  )}
                </div>

                <motion.button
                  whileHover={{ background: "rgba(255,255,255,0.06)", color: "#ffffff" }}
                  onClick={() => setSelectedNote(null)}
                  style={{ padding: "8px", borderRadius: "10px", background: "transparent", border: "none", color: "#44445a", cursor: "pointer", transition: "all 0.2s" }}
                >
                  <X size={18} />
                </motion.button>
              </div>

              <div style={{ padding: "36px 32px" }}>
                {isEditing ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                    <div>
                      <label style={{ ...mono, fontSize: "10px", color: "#44445a", textTransform: "uppercase", letterSpacing: "0.15em", display: "block", marginBottom: "8px" }}>Title</label>
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "16px 20px", ...syne, fontSize: "22px", fontWeight: 700, color: "#ffffff", transition: "border-color 0.2s" }}
                        onFocus={e => (e.target.style.borderColor = "rgba(0,212,255,0.4)")}
                        onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
                      />
                    </div>
                    <div>
                      <label style={{ ...mono, fontSize: "10px", color: "#44445a", textTransform: "uppercase", letterSpacing: "0.15em", display: "block", marginBottom: "8px" }}>Content</label>
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "16px 20px", ...mono, fontSize: "13px", color: "#c0c0d0", lineHeight: 1.8, minHeight: "360px", resize: "none", transition: "border-color 0.2s" }}
                        onFocus={e => (e.target.style.borderColor = "rgba(0,212,255,0.4)")}
                        onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
                      />
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02, boxShadow: "0 0 20px rgba(0,212,255,0.3)" }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleUpdate}
                      disabled={loading}
                      style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "16px", borderRadius: "12px", background: "linear-gradient(135deg, #00d4ff, #818cf8)", color: "#000", border: "none", cursor: loading ? "not-allowed" : "pointer", ...syne, fontSize: "15px", fontWeight: 700, opacity: loading ? 0.6 : 1 }}
                    >
                      {loading ? <Loader2 size={16} /> : <><Save size={16} /> Save Changes</>}
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <h2 style={{ ...syne, fontSize: "36px", fontWeight: 800, color: "#ffffff", marginBottom: "24px", lineHeight: 1.15, letterSpacing: "-0.02em" }}>
                      {selectedNote.title}
                    </h2>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "32px", paddingBottom: "24px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.04)", ...mono, fontSize: "10px", color: "#44445a" }}>
                        <Calendar size={11} /> {new Date(selectedNote.created_at).toLocaleDateString()}
                      </span>
                      {selectedNote.tags && (
                        <span style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.04)", ...mono, fontSize: "10px", color: "#44445a", textTransform: "uppercase" }}>
                          <Tag size={11} /> {selectedNote.tags}
                        </span>
                      )}
                      <span style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 12px", borderRadius: "8px", background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.15)", ...mono, fontSize: "10px", color: "#00d4ff" }}>
                        <Sparkles size={10} /> Vectorized
                      </span>
                    </div>

                    {selectedNote.ai_summary && (
                      <div style={{ marginBottom: "32px", padding: "24px", borderRadius: "16px", background: "linear-gradient(135deg, rgba(139,92,246,0.08), rgba(0,212,255,0.04))", border: "1px solid rgba(139,92,246,0.15)", position: "relative", overflow: "hidden" }}>
                        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.5), transparent)" }} />
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                          <Sparkles size={12} style={{ color: "#a78bfa" }} />
                          <span style={{ ...mono, fontSize: "10px", color: "#a78bfa", textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 700 }}>AI Abstract</span>
                        </div>
                        <p style={{ color: "#c0c0d8", fontSize: "15px", fontStyle: "italic", lineHeight: 1.7 }}>
                          "{selectedNote.ai_summary}"
                        </p>
                      </div>
                    )}

                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                        <AlignLeft size={12} style={{ color: "#44445a" }} />
                        <span style={{ ...mono, fontSize: "10px", color: "#44445a", textTransform: "uppercase", letterSpacing: "0.15em" }}>Content</span>
                      </div>
                      <p style={{ ...mono, color: "#b0b0c8", fontSize: "14px", lineHeight: 1.9, whiteSpace: "pre-wrap" }}>
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
    </div>
  );
}
