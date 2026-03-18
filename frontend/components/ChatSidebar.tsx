"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, MessageSquare, MoreVertical, Trash2, Edit3, Check, X, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { apiRequest } from "@/lib/api";

interface Chat {
  id: number;
  title: string;
}

interface SidebarProps {
  currentChatId: number;
  setCurrentChatId: (id: number) => void;
  refreshKey?: number;
}

const mono = { fontFamily: "'JetBrains Mono', monospace" };
const syne = { fontFamily: "'Syne', sans-serif" };

export default function ChatSidebar({ currentChatId, setCurrentChatId, refreshKey }: SidebarProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);

  const fetchChats = useCallback(async () => {
    try {
      const data = await apiRequest("/chats/");
      setChats(data);
    } catch (err) {
      console.error("Failed to fetch chats", err);
    }
  }, []);

  useEffect(() => {
    fetchChats();
  }, [currentChatId, refreshKey, fetchChats]);

  const deleteChat = async (id: number) => {
    if (!confirm("Delete this conversation?")) return;
    try {
      await apiRequest(`/chats/${id}`, { method: "DELETE" });
      setChats(chats.filter((c) => c.id !== id));
      if (currentChatId === id) setCurrentChatId(-1);
    } catch (err) { console.error(err); }
  };

  const renameChat = async (id: number) => {
    if (!editTitle.trim()) return;
    try {
      await apiRequest(`/chats/${id}?title=${encodeURIComponent(editTitle)}`, { method: "PUT" });
      setChats(chats.map(c => c.id === id ? { ...c, title: editTitle } : c));
      setEditingId(null);
    } catch (err) { console.error(err); }
  };

  return (
    <aside style={{ width: "260px", height: "100%", display: "flex", flexDirection: "column", background: "#08080f", borderRight: "1px solid rgba(255,255,255,0.05)", flexShrink: 0 }}>

      <div style={{ padding: "16px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <Link href="/dashboard" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
          <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Zap size={13} style={{ color: "#00d4ff" }} fill="#00d4ff" />
          </div>
          <span style={{ ...syne, fontWeight: 700, fontSize: "14px" }}>
            <span style={{ color: "#ffffff" }}>Mentor</span><span style={{ color: "#00d4ff" }}>AI</span>
          </span>
        </Link>

        <motion.button
          whileHover={{ background: "rgba(0,212,255,0.15)" }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setCurrentChatId(-1)}
          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "10px", borderRadius: "12px", background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)", color: "#00d4ff", cursor: "pointer", ...syne, fontSize: "13px", fontWeight: 600 }}
        >
          <Plus size={14} /> New Chat
        </motion.button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
        {chats.length === 0 && (
          <div style={{ padding: "32px 16px", textAlign: "center" }}>
            <MessageSquare size={20} style={{ color: "#2a2a3a", margin: "0 auto 8px" }} />
            <p style={{ ...mono, color: "#44445a", fontSize: "11px" }}>no chats yet</p>
          </div>
        )}

        <AnimatePresence>
          {chats.map((chat) => (
            <motion.div
              key={chat.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              style={{
                position: "relative", display: "flex", alignItems: "center", gap: "8px",
                padding: "10px 12px", borderRadius: "10px", cursor: "pointer", marginBottom: "2px",
                background: currentChatId === chat.id ? "rgba(0,212,255,0.08)" : "transparent",
                border: currentChatId === chat.id ? "1px solid rgba(0,212,255,0.15)" : "1px solid transparent",
                color: currentChatId === chat.id ? "#ffffff" : "#8888aa",
              }}
              onMouseEnter={e => { if (currentChatId !== chat.id) { (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.04)"; } }}
              onMouseLeave={e => { if (currentChatId !== chat.id) { (e.currentTarget as HTMLDivElement).style.background = "transparent"; } setMenuOpenId(null); }}
            >
              <MessageSquare size={12} style={{ opacity: 0.5, flexShrink: 0 }} />

              {editingId === chat.id ? (
                <div style={{ display: "flex", alignItems: "center", flex: 1, gap: "4px" }}>
                  <input autoFocus value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && renameChat(chat.id)}
                    style={{ flex: 1, background: "#0d0d1a", border: "1px solid rgba(0,212,255,0.4)", borderRadius: "6px", padding: "2px 6px", ...mono, fontSize: "11px", color: "#ffffff" }}
                  />
                  <button onClick={() => renameChat(chat.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#10b981" }}><Check size={11} /></button>
                  <button onClick={() => setEditingId(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#44445a" }}><X size={11} /></button>
                </div>
              ) : (
                <span onClick={() => setCurrentChatId(chat.id)}
                  style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", ...syne, fontSize: "12px" }}>
                  {chat.title}
                </span>
              )}

              <div style={{ position: "relative", flexShrink: 0 }}>
                <button onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === chat.id ? null : chat.id); }}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#44445a", padding: "2px", display: "flex" }}>
                  <MoreVertical size={11} />
                </button>

                <AnimatePresence>
                  {menuOpenId === chat.id && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                      style={{ position: "absolute", right: 0, top: "20px", width: "130px", background: "#0d0d1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", zIndex: 100, overflow: "hidden", boxShadow: "0 8px 24px rgba(0,0,0,0.5)" }}>
                      <button onClick={() => { setEditingId(chat.id); setEditTitle(chat.title); setMenuOpenId(null); }}
                        style={{ width: "100%", display: "flex", alignItems: "center", gap: "8px", padding: "10px 12px", background: "none", border: "none", cursor: "pointer", ...mono, fontSize: "11px", color: "#8888aa" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "none")}>
                        <Edit3 size={10} /> Rename
                      </button>
                      <button onClick={() => deleteChat(chat.id)}
                        style={{ width: "100%", display: "flex", alignItems: "center", gap: "8px", padding: "10px 12px", background: "none", border: "none", cursor: "pointer", ...mono, fontSize: "11px", color: "#f87171" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.08)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "none")}>
                        <Trash2 size={10} /> Delete
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 12px", borderRadius: "10px", background: "rgba(255,255,255,0.02)" }}>
          <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }}
            style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", display: "inline-block", flexShrink: 0 }} />
          <span style={{ ...mono, fontSize: "10px", color: "#44445a", letterSpacing: "0.1em", textTransform: "uppercase" }}>AI Online</span>
        </div>
      </div>
    </aside>
  );
}
