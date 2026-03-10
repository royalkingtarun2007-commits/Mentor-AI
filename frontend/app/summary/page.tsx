"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, BookOpen, Clock, ChevronRight, Loader2, FileText, Zap, RefreshCw } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Note {
  id: number;
  title: string;
  content: string;
  ai_summary?: string;
  created_at: string;
  tags?: string;
}

const syne = { fontFamily: "'Syne', sans-serif" };
const mono = { fontFamily: "'JetBrains Mono', monospace" };

export default function SummaryPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/notes/`, { credentials: "include" })
      .then(res => res.json())
      .then(data => { setNotes(data); setPageLoading(false); })
      .catch(() => setPageLoading(false));
  }, []);

  async function generateSummary(id: number) {
    setLoadingId(id);
    setExpandedId(id);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/ai/summarize?note_id=${id}`,
        { method: "POST", credentials: "include" }
      );
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setNotes(prev =>
        prev.map(note => note.id === id ? { ...note, ai_summary: data.summary } : note)
      );
    } catch {
      alert("Failed to generate summary. Try again.");
    } finally {
      setLoadingId(null);
    }
  }

  const summarizedCount = notes.filter(n => n.ai_summary).length;

  return (
    <div style={{ minHeight: "100vh", background: "#030308", paddingTop: "96px", paddingBottom: "80px", position: "relative", overflow: "hidden" }}>

      {/* Background */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" }} />
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 8, repeat: Infinity }}
        style={{ position: "absolute", top: "-150px", right: "-150px", width: "500px", height: "500px", borderRadius: "50%", background: "rgba(16,185,129,0.05)", filter: "blur(80px)", pointerEvents: "none" }}
      />
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 10, repeat: Infinity, delay: 3 }}
        style={{ position: "absolute", bottom: "-150px", left: "-150px", width: "450px", height: "450px", borderRadius: "50%", background: "rgba(139,92,246,0.05)", filter: "blur(80px)", pointerEvents: "none" }}
      />

      <div style={{ position: "relative", maxWidth: "900px", margin: "0 auto", padding: "0 24px" }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: "48px" }}
        >
          <p style={{ ...mono, fontSize: "10px", color: "#10b981", letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: "12px" }}>
            AI Feature
          </p>
          <h1 style={{ ...syne, fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 800, letterSpacing: "-0.02em", marginBottom: "12px", background: "linear-gradient(135deg, #10b981 0%, #00d4ff 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            Smart Summaries
          </h1>
          <p style={{ ...mono, color: "#8888aa", fontSize: "14px", maxWidth: "500px", lineHeight: 1.6 }}>
            // Generate structured AI summaries for your notes — key points extracted instantly
          </p>

          {/* Stats */}
          {!pageLoading && notes.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={{ display: "flex", gap: "16px", marginTop: "24px", flexWrap: "wrap" }}
            >
              {[
                { label: "Total Notes", value: notes.length, color: "#00d4ff" },
                { label: "Summarized", value: summarizedCount, color: "#10b981" },
                { label: "Remaining", value: notes.length - summarizedCount, color: "#8b5cf6" },
              ].map((stat, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 16px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <span style={{ ...syne, fontSize: "20px", fontWeight: 800, color: stat.color }}>{stat.value}</span>
                  <span style={{ ...mono, fontSize: "10px", color: "#44445a", textTransform: "uppercase", letterSpacing: "0.1em" }}>{stat.label}</span>
                </div>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Loading state */}
        {pageLoading && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0", gap: "12px" }}>
            <Loader2 size={20} style={{ color: "#10b981", animation: "spin 1s linear infinite" }} />
            <span style={{ ...mono, color: "#44445a", fontSize: "13px" }}>Loading notes...</span>
          </div>
        )}

        {/* Empty state */}
        {!pageLoading && notes.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ textAlign: "center", padding: "80px 0" }}
          >
            <FileText size={48} style={{ color: "#2a2a3a", margin: "0 auto 16px" }} />
            <p style={{ ...syne, fontSize: "18px", fontWeight: 600, color: "#44445a", marginBottom: "8px" }}>No notes yet</p>
            <p style={{ ...mono, fontSize: "13px", color: "#2a2a3a" }}>Add some notes first, then come back to summarize them.</p>
          </motion.div>
        )}

        {/* Notes list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {notes.map((note, i) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              style={{ borderRadius: "20px", background: "rgba(255,255,255,0.025)", border: `1px solid ${expandedId === note.id ? "rgba(16,185,129,0.25)" : "rgba(255,255,255,0.07)"}`, overflow: "hidden", transition: "border-color 0.3s" }}
            >
              {/* Note header */}
              <div
                onClick={() => setExpandedId(expandedId === note.id ? null : note.id)}
                style={{ display: "flex", alignItems: "center", gap: "16px", padding: "20px 24px", cursor: "pointer" }}
              >
                {/* Icon */}
                <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: note.ai_summary ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.04)", border: `1px solid ${note.ai_summary ? "rgba(16,185,129,0.2)" : "rgba(255,255,255,0.08)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.3s" }}>
                  {note.ai_summary
                    ? <Sparkles size={18} style={{ color: "#10b981" }} />
                    : <BookOpen size={18} style={{ color: "#44445a" }} />
                  }
                </div>

                {/* Title + meta */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ ...syne, fontSize: "16px", fontWeight: 700, color: "#f0f0ff", marginBottom: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {note.title}
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ ...mono, fontSize: "10px", color: "#44445a", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Clock size={9} /> {new Date(note.created_at).toLocaleDateString()}
                    </span>
                    {note.ai_summary && (
                      <span style={{ ...mono, fontSize: "9px", color: "#10b981", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.15)", padding: "2px 8px", borderRadius: "4px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                        Summarized
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
                  <motion.button
                    whileHover={{ scale: 1.04, boxShadow: note.ai_summary ? "0 0 16px rgba(16,185,129,0.25)" : "0 0 16px rgba(0,212,255,0.25)" }}
                    whileTap={{ scale: 0.96 }}
                    onClick={(e) => { e.stopPropagation(); generateSummary(note.id); }}
                    disabled={loadingId === note.id}
                    style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "10px", cursor: loadingId === note.id ? "not-allowed" : "pointer", ...mono, fontSize: "11px", fontWeight: 600, transition: "all 0.2s", background: note.ai_summary ? "rgba(16,185,129,0.1)" : "linear-gradient(135deg, rgba(0,212,255,0.15), rgba(139,92,246,0.15))", color: note.ai_summary ? "#10b981" : "#00d4ff", border: `1px solid ${note.ai_summary ? "rgba(16,185,129,0.2)" : "rgba(0,212,255,0.2)"}` }}
                  >
                    {loadingId === note.id ? (
                      <><Loader2 size={12} style={{ animation: "spin 0.8s linear infinite" }} /> Generating...</>
                    ) : note.ai_summary ? (
                      <><RefreshCw size={12} /> Regenerate</>
                    ) : (
                      <><Zap size={12} fill="currentColor" /> Summarize</>
                    )}
                  </motion.button>

                  <ChevronRight
                    size={16}
                    style={{ color: "#44445a", transform: expandedId === note.id ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
                  />
                </div>
              </div>

              {/* Expanded content */}
              <AnimatePresence>
                {expandedId === note.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{ overflow: "hidden" }}
                  >
                    <div style={{ padding: "0 24px 24px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>

                      {/* Original note content */}
                      <div style={{ marginTop: "20px", marginBottom: "20px" }}>
                        <p style={{ ...mono, fontSize: "10px", color: "#44445a", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "10px" }}>Original Note</p>
                        <p style={{ ...mono, fontSize: "13px", color: "#8888aa", lineHeight: 1.7, background: "rgba(255,255,255,0.02)", padding: "14px 16px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)" }}>
                          {note.content.length > 300 ? note.content.slice(0, 300) + "..." : note.content}
                        </p>
                      </div>

                      {/* AI Summary */}
                      {loadingId === note.id && (
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "20px", borderRadius: "14px", background: "rgba(16,185,129,0.04)", border: "1px solid rgba(16,185,129,0.12)" }}>
                          <Loader2 size={16} style={{ color: "#10b981", animation: "spin 0.8s linear infinite", flexShrink: 0 }} />
                          <span style={{ ...mono, fontSize: "13px", color: "#10b981" }}>Generating summary with LLaMA 3.3...</span>
                        </div>
                      )}

                      {note.ai_summary && loadingId !== note.id && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          style={{ position: "relative", padding: "20px 24px", borderRadius: "14px", background: "linear-gradient(135deg, rgba(16,185,129,0.06), rgba(0,212,255,0.04))", border: "1px solid rgba(16,185,129,0.2)", overflow: "hidden" }}
                        >
                          {/* Top accent line */}
                          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg, #10b981, #00d4ff)" }} />

                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
                            <Sparkles size={14} style={{ color: "#10b981" }} />
                            <span style={{ ...mono, fontSize: "10px", color: "#10b981", textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 700 }}>
                              AI Summary
                            </span>
                          </div>

                          <div className="prose" style={{ ...mono, fontSize: "13px", color: "#c0c0d8", lineHeight: 1.8 }}>
                            <ReactMarkdown>{note.ai_summary}</ReactMarkdown>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
