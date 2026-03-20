"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, BookOpen, Clock, ChevronRight, Loader2, FileText, RefreshCw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { apiRequest } from "@/lib/api";

interface Note {
  id: number;
  title: string;
  content: string;
  ai_summary?: string;
  created_at: string;
  tags?: string;
}

const display = { fontFamily: "'DM Serif Display', serif" };
const body = { fontFamily: "'DM Sans', sans-serif" };
const mono = { fontFamily: "'IBM Plex Mono', monospace" };

export default function SummaryPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=IBM+Plex+Mono:wght@300;400;500&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    apiRequest("/notes/")
      .then(data => { setNotes(data); setPageLoading(false); })
      .catch(() => setPageLoading(false));
  }, []);

  async function generateSummary(id: number) {
    setLoadingId(id);
    setExpandedId(id);
    try {
      const data = await apiRequest(`/ai/summarize?note_id=${id}`, { method: "POST" });
      setNotes(prev => prev.map(note => note.id === id ? { ...note, ai_summary: data.summary } : note));
    } catch {
      alert("Failed to generate summary. Try again.");
    } finally {
      setLoadingId(null);
    }
  }

  const summarizedCount = notes.filter(n => n.ai_summary).length;

  return (
    <div style={{ minHeight: "100vh", background: "#02020a", paddingTop: "96px", paddingBottom: "80px", position: "relative" }}>

      {/* Static background */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, rgba(16,185,129,0.14) 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div style={{ position: "absolute", top: "-60px", left: "50%", transform: "translateX(-50%)", width: "1000px", height: "500px", background: "radial-gradient(ellipse at center top, rgba(16,185,129,0.07) 0%, transparent 65%)" }} />
        <div style={{ position: "absolute", bottom: 0, right: 0, width: "600px", height: "450px", background: "radial-gradient(ellipse at bottom right, rgba(6,182,212,0.05) 0%, transparent 65%)" }} />
        <div style={{ position: "absolute", top: "30%", left: 0, width: "400px", height: "500px", background: "radial-gradient(ellipse at left, rgba(139,92,246,0.04) 0%, transparent 65%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 120% 80% at 50% 50%, transparent 40%, rgba(2,2,10,0.65) 100%)" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: "960px", margin: "0 auto", padding: "0 32px" }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: "56px" }}>
          <p style={{ ...mono, fontSize: "11px", color: "#10b981", letterSpacing: "0.28em", textTransform: "uppercase", marginBottom: "12px" }}>
            AI Feature
          </p>
          <h1 style={{ ...display, fontSize: "clamp(44px, 6vw, 66px)", fontStyle: "italic", color: "#ffffff", marginBottom: "14px", lineHeight: 1.05 }}>
            Smart Summaries
          </h1>
          <p style={{ ...body, color: "#52526e", fontSize: "17px", fontWeight: 300, maxWidth: "520px", lineHeight: 1.65 }}>
            Generate structured AI summaries for your notes — key points extracted instantly
          </p>

          {!pageLoading && notes.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              style={{ display: "flex", gap: "16px", marginTop: "32px", flexWrap: "wrap" }}>
              {[
                { label: "Total Notes", value: notes.length, color: "#6366f1" },
                { label: "Summarized", value: summarizedCount, color: "#10b981" },
                { label: "Remaining", value: notes.length - summarizedCount, color: "#8b5cf6" },
              ].map((stat, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "16px 24px", borderRadius: "16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <span style={{ ...display, fontSize: "32px", fontStyle: "italic", color: stat.color, lineHeight: 1 }}>{stat.value}</span>
                  <span style={{ ...body, fontSize: "14px", fontWeight: 400, color: "#44445a" }}>{stat.label}</span>
                </div>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Loading */}
        {pageLoading && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0", gap: "14px" }}>
            <Loader2 size={22} style={{ color: "#10b981", animation: "spin 1s linear infinite" }} />
            <span style={{ ...body, color: "#44445a", fontSize: "16px", fontWeight: 300 }}>Loading notes...</span>
          </div>
        )}

        {/* Empty */}
        {!pageLoading && notes.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: "center", padding: "100px 0" }}>
            <FileText size={52} style={{ color: "#2a2a4a", margin: "0 auto 20px" }} />
            <p style={{ ...display, fontSize: "28px", fontStyle: "italic", color: "#44445a", marginBottom: "10px" }}>No notes yet</p>
            <p style={{ ...body, fontSize: "16px", fontWeight: 300, color: "#3a3a5a" }}>Add some notes first, then come back to summarize them.</p>
          </motion.div>
        )}

        {/* Notes list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {notes.map((note, i) => (
            <motion.div key={note.id}
              initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              style={{ borderRadius: "22px", background: "rgba(255,255,255,0.025)", border: `1px solid ${expandedId === note.id ? "rgba(16,185,129,0.28)" : "rgba(255,255,255,0.07)"}`, overflow: "hidden", transition: "border-color 0.3s" }}>

              <div onClick={() => setExpandedId(expandedId === note.id ? null : note.id)}
                style={{ display: "flex", alignItems: "center", gap: "18px", padding: "24px 28px", cursor: "pointer" }}>

                <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: note.ai_summary ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.04)", border: `1px solid ${note.ai_summary ? "rgba(16,185,129,0.22)" : "rgba(255,255,255,0.08)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {note.ai_summary ? <Sparkles size={20} style={{ color: "#10b981" }} /> : <BookOpen size={20} style={{ color: "#44445a" }} />}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ ...display, fontSize: "20px", fontStyle: "italic", color: "#f0f0ff", marginBottom: "6px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {note.title}
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "5px", ...mono, fontSize: "11px", color: "#44445a" }}>
                      <Clock size={10} /> {new Date(note.created_at).toLocaleDateString()}
                    </span>
                    {note.ai_summary && (
                      <span style={{ ...body, fontSize: "12px", fontWeight: 500, color: "#10b981", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.18)", padding: "3px 12px", borderRadius: "6px" }}>
                        Summarized
                      </span>
                    )}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    onClick={e => { e.stopPropagation(); generateSummary(note.id); }}
                    disabled={loadingId === note.id}
                    style={{ display: "flex", alignItems: "center", gap: "7px", padding: "11px 20px", borderRadius: "12px", cursor: loadingId === note.id ? "not-allowed" : "pointer", ...body, fontSize: "14px", fontWeight: 500, background: note.ai_summary ? "rgba(16,185,129,0.08)" : "rgba(99,102,241,0.1)", color: note.ai_summary ? "#10b981" : "#818cf8", border: `1px solid ${note.ai_summary ? "rgba(16,185,129,0.2)" : "rgba(99,102,241,0.2)"}` }}>
                    {loadingId === note.id ? (
                      <><Loader2 size={14} style={{ animation: "spin 0.8s linear infinite" }} /> Generating</>
                    ) : note.ai_summary ? (
                      <><RefreshCw size={14} /> Regenerate</>
                    ) : (
                      <>Summarize</>
                    )}
                  </motion.button>
                  <ChevronRight size={18} style={{ color: "#44445a", transform: expandedId === note.id ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.25s" }} />
                </div>
              </div>

              <AnimatePresence>
                {expandedId === note.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} style={{ overflow: "hidden" }}>
                    <div style={{ padding: "0 28px 28px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>

                      <div style={{ marginTop: "24px", marginBottom: "24px" }}>
                        <p style={{ ...mono, fontSize: "11px", color: "#44445a", textTransform: "uppercase", letterSpacing: "0.16em", marginBottom: "12px" }}>
                          Original Note
                        </p>
                        <p style={{ ...body, fontSize: "15px", fontWeight: 300, color: "#7070a0", lineHeight: 1.85, background: "rgba(255,255,255,0.02)", padding: "18px 22px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.05)" }}>
                          {note.content.length > 360 ? note.content.slice(0, 360) + "..." : note.content}
                        </p>
                      </div>

                      {loadingId === note.id && (
                        <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "22px 24px", borderRadius: "16px", background: "rgba(16,185,129,0.04)", border: "1px solid rgba(16,185,129,0.12)" }}>
                          <Loader2 size={18} style={{ color: "#10b981", animation: "spin 0.8s linear infinite", flexShrink: 0 }} />
                          <span style={{ ...body, fontSize: "15px", fontWeight: 400, color: "#10b981" }}>Generating summary with LLaMA 3.3...</span>
                        </div>
                      )}

                      {note.ai_summary && loadingId !== note.id && (
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                          style={{ position: "relative", padding: "24px 28px", borderRadius: "18px", background: "linear-gradient(135deg, rgba(16,185,129,0.06), rgba(6,182,212,0.04))", border: "1px solid rgba(16,185,129,0.2)", overflow: "hidden" }}>
                          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: "linear-gradient(90deg, #10b981, #06b6d4)" }} />
                          <div style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "16px" }}>
                            <Sparkles size={15} style={{ color: "#10b981" }} />
                            <p style={{ ...mono, fontSize: "11px", color: "#10b981", textTransform: "uppercase", letterSpacing: "0.16em", margin: 0 }}>AI Summary</p>
                          </div>
                          <div style={{ ...body, fontSize: "16px", fontWeight: 300, color: "#c0c0d8", lineHeight: 1.85 }}>
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
