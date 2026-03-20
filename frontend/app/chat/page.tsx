"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Send, Bot, User, Sparkles, BookOpen, Loader2, Copy, Check, Plus, Search, Trash2, Edit3, X, MoreVertical, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import { apiRequest } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
  isContext?: boolean;
  contextUsed?: string[];
}

interface Chat { id: number; title: string; }

const display = { fontFamily: "'DM Serif Display', serif" };
const body = { fontFamily: "'DM Sans', sans-serif" };
const script = { fontFamily: "'Cormorant Garamond', serif" };

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      style={{ position: "absolute", top: "12px", right: "12px", padding: "6px 9px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer", color: copied ? "#10b981" : "#44445a", display: "flex", alignItems: "center", transition: "all 0.2s" }}>
      {copied ? <Check size={13} /> : <Copy size={13} />}
    </button>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display: "flex", gap: "6px", alignItems: "center", padding: "18px 22px" }}>
      {[0, 1, 2].map(i => (
        <motion.div key={i} animate={{ opacity: [0.3, 1, 0.3], y: [0, -5, 0] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
          style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#818cf8" }} />
      ))}
    </div>
  );
}

const WELCOME: Message = {
  role: "assistant",
  content: "Hello! I'm **MentorAI** — your personal knowledge assistant.\n\nAsk me anything. I'll search your notes and give you answers grounded in your own knowledge.\n\n**Try asking:**\n- Summarize my notes on machine learning\n- Explain how React hooks work\n- What did I write about databases?",
};

function Sidebar({ currentChatId, setCurrentChatId, refreshKey }: { currentChatId: number; setCurrentChatId: (id: number) => void; refreshKey: number }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);

  const fetchChats = useCallback(async () => {
    try { const data = await apiRequest("/chats/"); setChats(data); }
    catch (err) { console.error(err); }
  }, []);

  useEffect(() => { fetchChats(); }, [currentChatId, refreshKey, fetchChats]);

  const deleteChat = async (id: number) => {
    if (!confirm("Delete this conversation?")) return;
    try {
      await apiRequest(`/chats/${id}`, { method: "DELETE" });
      setChats(c => c.filter(x => x.id !== id));
      if (currentChatId === id) setCurrentChatId(-1);
    } catch (err) { console.error(err); }
  };

  const renameChat = async (id: number) => {
    if (!editTitle.trim()) return;
    try {
      await apiRequest(`/chats/${id}?title=${encodeURIComponent(editTitle)}`, { method: "PUT" });
      setChats(c => c.map(x => x.id === id ? { ...x, title: editTitle } : x));
      setEditingId(null);
    } catch (err) { console.error(err); }
  };

  const filtered = chats.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <aside style={{ width: "310px", height: "100%", display: "flex", flexDirection: "column", background: "#05050e", borderRight: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>

      <div style={{ padding: "22px 20px 18px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <Link href="/dashboard" style={{ textDecoration: "none", display: "block", marginBottom: "20px" }}>
          <span style={{ ...script, fontSize: "30px", fontWeight: 400, fontStyle: "italic", letterSpacing: "0.05em", background: "linear-gradient(135deg, #c4b5fd 0%, #93c5fd 55%, #6ee7b7 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", display: "block" }}>
            MentorAI
          </span>
        </Link>

        <div style={{ position: "relative", marginBottom: "14px" }}>
          <Search size={15} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#3a3a5a", pointerEvents: "none" }} />
          <input type="text" placeholder="Search chats..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            style={{ width: "100%", paddingLeft: "40px", paddingRight: "14px", paddingTop: "12px", paddingBottom: "12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "11px", ...body, fontSize: "14px", color: "#d0d0ff", outline: "none", transition: "border-color 0.2s" }}
            onFocus={e => (e.target.style.borderColor = "rgba(99,102,241,0.4)")}
            onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.07)")} />
        </div>

        <motion.button whileHover={{ background: "rgba(99,102,241,0.18)" }} whileTap={{ scale: 0.97 }}
          onClick={() => setCurrentChatId(-1)}
          style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "13px", borderRadius: "12px", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.22)", color: "#818cf8", cursor: "pointer", ...body, fontSize: "15px", fontWeight: 600 }}>
          <Plus size={17} /> New Chat
        </motion.button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
        {filtered.length === 0 && (
          <div style={{ padding: "48px 16px", textAlign: "center" }}>
            <MessageSquare size={24} style={{ color: "#2a2a4a", margin: "0 auto 10px" }} />
            <p style={{ ...body, color: "#3a3a5a", fontSize: "14px", fontWeight: 300 }}>
              {searchQuery ? "No chats match" : "No chats yet"}
            </p>
          </div>
        )}

        <AnimatePresence>
          {filtered.map(chat => (
            <motion.div key={chat.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
              onMouseLeave={() => setMenuOpenId(null)}
              style={{ position: "relative", display: "flex", alignItems: "center", gap: "10px", padding: "13px 14px", borderRadius: "13px", cursor: "pointer", marginBottom: "4px", background: currentChatId === chat.id ? "rgba(99,102,241,0.1)" : "transparent", border: currentChatId === chat.id ? "1px solid rgba(99,102,241,0.2)" : "1px solid transparent", transition: "all 0.15s" }}
              onMouseEnter={e => { if (currentChatId !== chat.id) (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.04)"; }}
            >
              {editingId === chat.id ? (
                <div style={{ display: "flex", alignItems: "center", flex: 1, gap: "6px" }}>
                  <input autoFocus value={editTitle} onChange={e => setEditTitle(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && renameChat(chat.id)}
                    style={{ flex: 1, background: "#0d0d1a", border: "1px solid rgba(99,102,241,0.4)", borderRadius: "7px", padding: "5px 10px", ...body, fontSize: "14px", color: "#ffffff", outline: "none" }} />
                  <button onClick={() => renameChat(chat.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "#10b981" }}><Check size={15} /></button>
                  <button onClick={() => setEditingId(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#44445a" }}><X size={15} /></button>
                </div>
              ) : (
                <span onClick={() => setCurrentChatId(chat.id)} style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", ...body, fontSize: "15px", fontWeight: currentChatId === chat.id ? 500 : 400, color: currentChatId === chat.id ? "#ffffff" : "#7070a0" }}>
                  {chat.title}
                </span>
              )}

              <div style={{ position: "relative", flexShrink: 0 }}>
                <button onClick={e => { e.stopPropagation(); setMenuOpenId(menuOpenId === chat.id ? null : chat.id); }}
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#44445a", padding: "4px", display: "flex", borderRadius: "6px", transition: "color 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#8888aa")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#44445a")}>
                  <MoreVertical size={14} />
                </button>

                <AnimatePresence>
                  {menuOpenId === chat.id && (
                    <motion.div initial={{ opacity: 0, scale: 0.95, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.1 }}
                      style={{ position: "absolute", right: 0, top: "26px", width: "148px", background: "#0d0d1a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", zIndex: 100, overflow: "hidden", boxShadow: "0 10px 28px rgba(0,0,0,0.6)" }}>
                      <button onClick={() => { setEditingId(chat.id); setEditTitle(chat.title); setMenuOpenId(null); }}
                        style={{ width: "100%", display: "flex", alignItems: "center", gap: "9px", padding: "13px 16px", background: "none", border: "none", cursor: "pointer", ...body, fontSize: "14px", color: "#9090b0", textAlign: "left" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "none")}>
                        <Edit3 size={13} /> Rename
                      </button>
                      <button onClick={() => deleteChat(chat.id)}
                        style={{ width: "100%", display: "flex", alignItems: "center", gap: "9px", padding: "13px 16px", background: "none", border: "none", cursor: "pointer", ...body, fontSize: "14px", color: "#f87171", textAlign: "left" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.08)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "none")}>
                        <Trash2 size={13} /> Delete
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }}
            style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
          <span style={{ ...body, fontSize: "13px", fontWeight: 300, color: "#3a3a5a" }}>AI Online</span>
        </div>
      </div>
    </aside>
  );
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<number>(-1);
  const [sidebarRefresh, setSidebarRefresh] = useState(0);
  const [historyLoading, setHistoryLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,300;1,400&family=DM+Serif+Display:ital@0;1&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=IBM+Plex+Mono:wght@300;400&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  useEffect(() => {
    const savedNote = sessionStorage.getItem("context_note");
    if (savedNote) {
      const note = JSON.parse(savedNote);
      setMessages([{ role: "assistant", content: `I've loaded your note: **${note.title}**\n\nAsk me anything about it!`, isContext: true }]);
      sessionStorage.removeItem("context_note");
    }
  }, []);

  const loadChatHistory = useCallback(async (chatId: number) => {
    if (chatId === -1) { setMessages([WELCOME]); return; }
    setHistoryLoading(true);
    try {
      const data = await apiRequest(`/ai/history/${chatId}`);
      setMessages(data.length === 0 ? [WELCOME] : data.map((m: { role: string; content: string }) => ({ role: m.role as "user" | "assistant", content: m.content })));
    } catch (err) { console.error(err); }
    finally { setHistoryLoading(false); }
  }, []);

  const handleSelectChat = useCallback((id: number) => {
    setCurrentChatId(id); loadChatHistory(id);
  }, [loadChatHistory]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const sentInput = input;
    setMessages(prev => [...prev, { role: "user", content: sentInput }]);
    setInput("");
    if (inputRef.current) inputRef.current.style.height = "26px";
    setLoading(true);
    try {
      const data = await apiRequest("/ai/chat", {
        method: "POST",
        body: JSON.stringify({ message: sentInput, chat_id: currentChatId === -1 ? null : currentChatId }),
      });
      setMessages(prev => [...prev, { role: "assistant", content: data.response, contextUsed: data.context_used?.filter((n: string) => n) }]);
      if (data.chat_id && data.chat_id !== currentChatId) setCurrentChatId(data.chat_id);
      setSidebarRefresh(prev => prev + 1);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, something went wrong. Please try again." }]);
    } finally { setLoading(false); }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#02020a", overflow: "hidden", paddingTop: "68px" }}>
      <Sidebar currentChatId={currentChatId} setCurrentChatId={handleSelectChat} refreshKey={sidebarRefresh} />

      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 32px", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(5,5,14,0.92)", backdropFilter: "blur(20px)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.22)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Bot size={20} style={{ color: "#818cf8" }} />
            </div>
            <div>
              <p style={{ ...display, fontSize: "18px", fontStyle: "italic", color: "#ffffff", lineHeight: 1, marginBottom: "3px" }}>MentorAI Chat</p>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }}
                  style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
                <span style={{ ...body, fontSize: "12px", fontWeight: 300, color: "#44445a" }}>Online</span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <motion.button whileHover={{ background: "rgba(255,255,255,0.07)" }}
              onClick={() => { setCurrentChatId(-1); setMessages([WELCOME]); setInput(""); }}
              style={{ display: "flex", alignItems: "center", gap: "7px", padding: "11px 20px", borderRadius: "11px", background: "transparent", border: "1px solid rgba(255,255,255,0.08)", color: "#7070a0", cursor: "pointer", ...body, fontSize: "15px" }}>
              <Plus size={16} /> New Chat
            </motion.button>
            <Link href="/notes" style={{ textDecoration: "none" }}>
              <motion.div whileHover={{ background: "rgba(99,102,241,0.1)" }}
                style={{ display: "flex", alignItems: "center", gap: "7px", padding: "11px 20px", borderRadius: "11px", background: "transparent", border: "1px solid rgba(255,255,255,0.08)", color: "#7070a0", cursor: "pointer", ...body, fontSize: "15px" }}>
                <BookOpen size={16} /> Notes
              </motion.div>
            </Link>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "40px 36px", display: "flex", flexDirection: "column", gap: "32px" }}>
          {historyLoading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
              <Loader2 size={26} style={{ color: "#44445a", animation: "spin 1s linear infinite" }} />
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {messages.map((msg, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
                  style={{ display: "flex", gap: "14px", flexDirection: msg.role === "user" ? "row-reverse" : "row", maxWidth: "880px", width: "100%", alignSelf: msg.role === "user" ? "flex-end" : "flex-start" }}>

                  <div style={{ width: "38px", height: "38px", borderRadius: "12px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", marginTop: "2px", background: msg.role === "user" ? "rgba(255,255,255,0.05)" : "rgba(99,102,241,0.1)", border: msg.role === "user" ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(99,102,241,0.22)" }}>
                    {msg.role === "user" ? <User size={17} style={{ color: "#7070a0" }} /> : <Bot size={17} style={{ color: "#818cf8" }} />}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: 0, flex: 1 }}>
                    {msg.isContext && (
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "7px", padding: "6px 14px", borderRadius: "9px", background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.22)", alignSelf: "flex-start" }}>
                        <Sparkles size={12} style={{ color: "#a78bfa" }} />
                        <span style={{ ...body, fontSize: "13px", color: "#a78bfa" }}>Note context loaded</span>
                      </div>
                    )}

                    <div style={{ position: "relative", padding: "18px 22px", borderRadius: msg.role === "user" ? "20px 4px 20px 20px" : "4px 20px 20px 20px", background: msg.role === "user" ? "rgba(99,102,241,0.1)" : "rgba(255,255,255,0.03)", border: msg.role === "user" ? "1px solid rgba(99,102,241,0.2)" : "1px solid rgba(255,255,255,0.07)", lineHeight: 1.8, color: msg.role === "user" ? "#e0e0ff" : "#d8d8f0" }}>
                      {msg.role === "assistant"
                        ? <div className="prose prose-invert" style={{ ...body, fontSize: "16px", fontWeight: 400 }}><ReactMarkdown>{msg.content}</ReactMarkdown></div>
                        : <p style={{ ...body, fontSize: "16px", fontWeight: 400, margin: 0 }}>{msg.content}</p>
                      }
                      <CopyButton text={msg.content} />
                    </div>

                    {msg.contextUsed && msg.contextUsed.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        {msg.contextUsed.map((note, i) => (
                          <span key={i} style={{ display: "flex", alignItems: "center", gap: "5px", padding: "4px 12px", borderRadius: "8px", background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.14)", ...body, fontSize: "12px", color: "rgba(129,140,248,0.65)" }}>
                            <BookOpen size={10} /> {note}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", gap: "14px", maxWidth: "880px" }}>
                  <div style={{ width: "38px", height: "38px", borderRadius: "12px", background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.22)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Bot size={17} style={{ color: "#818cf8" }} />
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "4px 20px 20px 20px" }}>
                    <TypingIndicator />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        {/* Input */}
        <div style={{ padding: "20px 32px 26px", borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(5,5,14,0.7)", flexShrink: 0 }}>
          <div style={{ maxWidth: "880px", margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: "18px", padding: "16px 20px" }}>
              <textarea ref={inputRef} value={input}
                onChange={e => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px"; }}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything..."
                rows={1}
                style={{ flex: 1, background: "transparent", border: "none", ...body, fontSize: "16px", fontWeight: 400, color: "#e0e0f0", resize: "none", lineHeight: 1.65, minHeight: "26px", maxHeight: "160px", outline: "none" }}
              />
              <motion.button whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }} onClick={handleSend} disabled={loading || !input.trim()}
                style={{ width: "42px", height: "42px", borderRadius: "12px", background: input.trim() && !loading ? "linear-gradient(135deg, #4f46e5, #7c3aed)" : "rgba(255,255,255,0.05)", border: "none", cursor: input.trim() && !loading ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s", opacity: loading || !input.trim() ? 0.4 : 1 }}>
                {loading ? <Loader2 size={17} style={{ color: "#fff", animation: "spin 1s linear infinite" }} /> : <Send size={17} style={{ color: input.trim() ? "#ffffff" : "#44445a" }} />}
              </motion.button>
            </div>
            <p style={{ textAlign: "center", ...body, fontSize: "12px", fontWeight: 300, color: "#2a2a3a", marginTop: "10px" }}>
              Enter to send · Shift+Enter for new line
            </p>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.07); border-radius: 2px; }
        .prose p { margin: 0.5em 0; }
        .prose ul { padding-left: 1.4em; margin: 0.5em 0; }
        .prose li { margin: 0.25em 0; }
        .prose strong { color: #e0e0ff; font-weight: 600; }
        .prose em { color: #c0c0e0; }
        .prose code { font-family: 'IBM Plex Mono', monospace; font-size: 0.88em; background: rgba(99,102,241,0.12); padding: 2px 6px; border-radius: 5px; color: #a5b4fc; }
        .prose pre { background: rgba(0,0,0,0.35); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 14px 18px; overflow-x: auto; margin: 0.75em 0; }
        .prose pre code { background: none; padding: 0; color: #c4b5fd; font-size: 0.87em; }
        .prose h1, .prose h2, .prose h3 { color: #f0f0ff; font-family: 'DM Serif Display', serif; font-style: italic; margin: 0.75em 0 0.4em; }
      `}</style>
    </div>
  );
}
