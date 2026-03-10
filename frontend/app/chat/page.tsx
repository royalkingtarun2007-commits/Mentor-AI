"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Send, Bot, User, Sparkles, BookOpen, Loader2, Copy, Check, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import ChatSidebar from "@/components/ChatSidebar";

interface Message {
  role: "user" | "assistant";
  content: string;
  isContext?: boolean;
  contextUsed?: string[];
}

const mono = { fontFamily: "'JetBrains Mono', monospace" };
const syne = { fontFamily: "'Syne', sans-serif" };

function TypingIndicator() {
  return (
    <div style={{ display: "flex", gap: "6px", alignItems: "center", padding: "16px 20px" }}>
      {[0, 1, 2].map((i) => (
        <motion.div key={i} animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
          style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00d4ff" }} />
      ))}
    </div>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      style={{ position: "absolute", top: "10px", right: "10px", padding: "4px 6px", borderRadius: "6px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer", color: copied ? "#10b981" : "#44445a", display: "flex", alignItems: "center", transition: "all 0.2s" }}>
      {copied ? <Check size={11} /> : <Copy size={11} />}
    </button>
  );
}

const WELCOME: Message = {
  role: "assistant",
  content: "Hey! I'm **MentorAI** — ask me anything.\n\nI can answer general questions, help you learn topics, explain concepts, or if you've added notes, I'll search them and give you answers grounded in your own knowledge.\n\n**Try asking:**\n- *\"Explain how React hooks work\"*\n- *\"Summarize my notes on machine learning\"*\n- *\"What is the difference between SQL and NoSQL?\"*",
};

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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/history/${chatId}`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.length === 0 ? [WELCOME] : data.map((m: { role: string; content: string }) => ({ role: m.role as "user" | "assistant", content: m.content })));
      }
    } catch (err) { console.error(err); }
    finally { setHistoryLoading(false); }
  }, []);

  const handleSelectChat = useCallback((id: number) => {
    setCurrentChatId(id);
    loadChatHistory(id);
  }, [loadChatHistory]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const sentInput = input;
    setMessages(prev => [...prev, { role: "user", content: sentInput }]);
    setInput("");
    if (inputRef.current) inputRef.current.style.height = "22px";
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: sentInput, chat_id: currentChatId === -1 ? null : currentChatId }),
        credentials: "include",
      });
      const data = await res.json();
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
    <div style={{ display: "flex", height: "100vh", background: "#030308", overflow: "hidden", paddingTop: "64px" }}>
      <ChatSidebar currentChatId={currentChatId} setCurrentChatId={handleSelectChat} refreshKey={sidebarRefresh} />

      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>

        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 24px", borderBottom: "1px solid rgba(255,255,255,0.05)", background: "rgba(6,6,13,0.8)", backdropFilter: "blur(12px)", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "34px", height: "34px", borderRadius: "10px", background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Bot size={16} style={{ color: "#00d4ff" }} />
            </div>
            <div>
              <p style={{ ...syne, fontSize: "14px", fontWeight: 600, color: "#ffffff", lineHeight: 1 }}>MentorAI</p>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "3px" }}>
                <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }}
                  style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
                <span style={{ ...mono, fontSize: "9px", color: "#44445a", letterSpacing: "0.15em", textTransform: "uppercase" }}>Online</span>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <motion.button whileHover={{ background: "rgba(255,255,255,0.07)", color: "#ffffff" }}
              onClick={() => { setCurrentChatId(-1); setMessages([WELCOME]); setInput(""); }}
              style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "10px", background: "transparent", border: "1px solid rgba(255,255,255,0.08)", color: "#8888aa", cursor: "pointer", ...syne, fontSize: "12px", transition: "all 0.2s" }}>
              <Plus size={13} /> New Chat
            </motion.button>
            <Link href="/notes" style={{ textDecoration: "none" }}>
              <motion.div whileHover={{ background: "rgba(0,212,255,0.1)", color: "#00d4ff", borderColor: "rgba(0,212,255,0.25)" }}
                style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "10px", background: "transparent", border: "1px solid rgba(255,255,255,0.08)", color: "#8888aa", cursor: "pointer", ...syne, fontSize: "12px", transition: "all 0.2s" }}>
                <BookOpen size={13} /> Notes
              </motion.div>
            </Link>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: "32px 24px", display: "flex", flexDirection: "column", gap: "24px" }}>
          {historyLoading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
              <Loader2 size={24} style={{ color: "#44445a", animation: "spin 1s linear infinite" }} />
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {messages.map((msg, idx) => (
                <motion.div key={idx} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
                  style={{ display: "flex", gap: "12px", flexDirection: msg.role === "user" ? "row-reverse" : "row", maxWidth: "820px", width: "100%", alignSelf: msg.role === "user" ? "flex-end" : "flex-start" }}>

                  <div style={{ width: "32px", height: "32px", borderRadius: "10px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", marginTop: "2px", background: msg.role === "user" ? "rgba(255,255,255,0.05)" : "rgba(0,212,255,0.08)", border: msg.role === "user" ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,212,255,0.18)" }}>
                    {msg.role === "user" ? <User size={14} style={{ color: "#8888aa" }} /> : <Bot size={14} style={{ color: "#00d4ff" }} />}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "6px", minWidth: 0, flex: 1 }}>
                    {msg.isContext && (
                      <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 10px", borderRadius: "8px", background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.2)", alignSelf: "flex-start" }}>
                        <Sparkles size={10} style={{ color: "#a78bfa" }} />
                        <span style={{ ...mono, fontSize: "9px", color: "#a78bfa", textTransform: "uppercase", letterSpacing: "0.12em" }}>Note context loaded</span>
                      </div>
                    )}

                    <div style={{ position: "relative", padding: "14px 18px", borderRadius: msg.role === "user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px", background: msg.role === "user" ? "rgba(0,212,255,0.08)" : "rgba(255,255,255,0.03)", border: msg.role === "user" ? "1px solid rgba(0,212,255,0.15)" : "1px solid rgba(255,255,255,0.06)", fontSize: "13px", lineHeight: 1.7, color: msg.role === "user" ? "#e0e0f0" : "#d0d0e8" }}>
                      {msg.role === "assistant"
                        ? <div className="prose" style={{ ...mono }}><ReactMarkdown>{msg.content}</ReactMarkdown></div>
                        : <p style={{ ...mono }}>{msg.content}</p>
                      }
                      <CopyButton text={msg.content} />
                    </div>

                    {msg.contextUsed && msg.contextUsed.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        {msg.contextUsed.map((note, i) => (
                          <span key={i} style={{ display: "flex", alignItems: "center", gap: "4px", padding: "3px 8px", borderRadius: "6px", background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.1)", ...mono, fontSize: "10px", color: "rgba(0,212,255,0.5)" }}>
                            <BookOpen size={8} /> {note}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  style={{ display: "flex", gap: "12px", maxWidth: "820px" }}>
                  <div style={{ width: "32px", height: "32px", borderRadius: "10px", background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Bot size={14} style={{ color: "#00d4ff" }} />
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "4px 16px 16px 16px" }}>
                    <TypingIndicator />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        {/* Input */}
        <div style={{ padding: "16px 24px 20px", borderTop: "1px solid rgba(255,255,255,0.05)", background: "rgba(6,6,13,0.6)", flexShrink: 0 }}>
          <div style={{ maxWidth: "820px", margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", padding: "14px 16px", transition: "border-color 0.2s" }}
              onFocus={() => { }} >
              <textarea ref={inputRef} value={input}
                onChange={(e) => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px"; }}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything..."
                rows={1}
                style={{ flex: 1, background: "transparent", border: "none", ...mono, fontSize: "13px", color: "#e0e0f0", resize: "none", lineHeight: 1.6, minHeight: "22px", maxHeight: "160px" }}
              />
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleSend} disabled={loading || !input.trim()}
                style={{ width: "36px", height: "36px", borderRadius: "10px", background: input.trim() && !loading ? "linear-gradient(135deg, #00d4ff, #818cf8)" : "rgba(255,255,255,0.05)", border: "none", cursor: input.trim() && !loading ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s", opacity: loading || !input.trim() ? 0.4 : 1 }}>
                {loading ? <Loader2 size={15} style={{ color: "#000", animation: "spin 1s linear infinite" }} /> : <Send size={15} style={{ color: input.trim() ? "#000" : "#44445a" }} />}
              </motion.button>
            </div>
            <p style={{ textAlign: "center", ...mono, fontSize: "9px", color: "#2a2a3a", marginTop: "10px", letterSpacing: "0.15em", textTransform: "uppercase" }}>
              Enter to send · Shift+Enter for new line
            </p>
          </div>
        </div>
      </main>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:2px}`}</style>
    </div>
  );
}
