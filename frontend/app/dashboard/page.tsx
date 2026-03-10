"use client";

import { useAuthStore } from "@/store/auth";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, MessageSquare, Sparkles, ArrowRight, Zap, Brain, Database, TrendingUp } from "lucide-react";

const syne = { fontFamily: "'Syne', sans-serif" };
const mono = { fontFamily: "'JetBrains Mono', monospace" };

// Floating orb component
function Orb({ style }: { style: React.CSSProperties }) {
  return (
    <motion.div
      animate={{ scale: [1, 1.08, 1], opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      style={{ position: "absolute", borderRadius: "50%", filter: "blur(80px)", pointerEvents: "none", ...style }}
    />
  );
}

// Animated gradient ring
function Ring({ size, color, delay = 0 }: { size: number; color: string; delay?: number }) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 20 + delay * 5, repeat: Infinity, ease: "linear" }}
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: "50%",
        border: `1px solid ${color}`,
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
      }}
    />
  );
}

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);

  const features = [
    {
      icon: BookOpen,
      title: "Knowledge Base",
      description: "Everything you save becomes searchable intelligence. Notes are vectorized and stored for instant semantic retrieval.",
      href: "/notes",
      gradient: "linear-gradient(135deg, rgba(0,212,255,0.15) 0%, rgba(0,212,255,0.03) 100%)",
      borderGlow: "rgba(0,212,255,0.3)",
      iconColor: "#00d4ff",
      iconGlow: "rgba(0,212,255,0.3)",
      tag: "RAG ENABLED",
      tagColor: "#00d4ff",
      cta: "Open Notes",
      number: "01",
    },
    {
      icon: MessageSquare,
      title: "AI Chat",
      description: "Chat with an AI that only knows what you've taught it. Powered by your notes, not the entire internet.",
      href: "/chat",
      gradient: "linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(139,92,246,0.03) 100%)",
      borderGlow: "rgba(139,92,246,0.3)",
      iconColor: "#8b5cf6",
      iconGlow: "rgba(139,92,246,0.3)",
      tag: "VECTOR SEARCH",
      tagColor: "#a78bfa",
      cta: "Start Chat",
      number: "02",
    },
    {
      icon: Sparkles,
      title: "Smart Summary",
      description: "Drop in any note and get a structured, AI-generated summary with key points extracted instantly.",
      href: "/summary",
      gradient: "linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(16,185,129,0.03) 100%)",
      borderGlow: "rgba(16,185,129,0.3)",
      iconColor: "#10b981",
      iconGlow: "rgba(16,185,129,0.3)",
      tag: "LLM POWERED",
      tagColor: "#34d399",
      cta: "Try Summary",
      number: "03",
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#030308", color: "#f0f0ff", overflowX: "hidden" }}>

      {/* ── HERO SECTION ── */}
      <div style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "100px 24px 60px" }}>

        {/* Atmospheric background */}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
          <Orb style={{ width: "800px", height: "800px", background: "rgba(0,212,255,0.06)", top: "-200px", left: "50%", transform: "translateX(-50%)" }} />
          <Orb style={{ width: "600px", height: "600px", background: "rgba(139,92,246,0.07)", bottom: "-100px", right: "-150px" }} />
          <Orb style={{ width: "400px", height: "400px", background: "rgba(16,185,129,0.05)", bottom: "100px", left: "-100px" }} />

          {/* Radial center glow */}
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "600px", height: "600px", background: "radial-gradient(circle, rgba(0,212,255,0.04) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />

          {/* Subtle grid */}
          <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

          {/* Animated rings in hero center */}
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "1px", height: "1px" }}>
            <Ring size={400} color="rgba(0,212,255,0.04)" delay={0} />
            <Ring size={600} color="rgba(139,92,246,0.03)" delay={1} />
            <Ring size={800} color="rgba(0,212,255,0.02)" delay={2} />
          </div>

          {/* Floating particles */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -30, 0], opacity: [0, 0.6, 0] }}
              transition={{ duration: 4 + i * 0.7, repeat: Infinity, delay: i * 0.5, ease: "easeInOut" }}
              style={{
                position: "absolute",
                width: i % 3 === 0 ? "3px" : "2px",
                height: i % 3 === 0 ? "3px" : "2px",
                borderRadius: "50%",
                background: i % 2 === 0 ? "#00d4ff" : "#8b5cf6",
                left: `${8 + i * 7}%`,
                top: `${20 + (i % 5) * 15}%`,
              }}
            />
          ))}
        </div>

        {/* Hero content */}
        <div style={{ position: "relative", textAlign: "center", maxWidth: "800px" }}>

          {/* Status badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 18px", borderRadius: "999px", background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.18)", marginBottom: "40px", backdropFilter: "blur(12px)" }}
          >
            <motion.span
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00d4ff", display: "inline-block", boxShadow: "0 0 6px #00d4ff" }}
            />
            <span style={{ ...mono, color: "#00d4ff", fontSize: "11px", letterSpacing: "0.18em", textTransform: "uppercase" }}>
              Neural Online · Groq · LLaMA 3.3 70B
            </span>
          </motion.div>

          {/* Main heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 style={{ ...syne, fontSize: "clamp(42px, 8vw, 88px)", fontWeight: 800, lineHeight: 1.05, marginBottom: "6px", letterSpacing: "-0.02em" }}>
              <span style={{ color: "#ffffff" }}>Welcome back,</span>
            </h1>
            <h1 style={{ ...syne, fontSize: "clamp(42px, 8vw, 88px)", fontWeight: 800, lineHeight: 1.05, marginBottom: "32px", letterSpacing: "-0.02em" }}>
              <span style={{
                background: "linear-gradient(135deg, #00d4ff 0%, #818cf8 50%, #34d399 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "drop-shadow(0 0 30px rgba(0,212,255,0.3))",
              }}>
                {user?.email?.split("@")[0] ?? "user"}
              </span>
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            style={{ ...mono, fontSize: "16px", color: "#8888aa", marginBottom: "48px", lineHeight: 1.6 }}
          >
            Your AI that learns from your notes — not the internet.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}
          >
            <Link href="/notes" style={{ textDecoration: "none" }}>
              <motion.div
                whileHover={{ scale: 1.04, boxShadow: "0 0 30px rgba(0,212,255,0.4)" }}
                whileTap={{ scale: 0.97 }}
                style={{ display: "flex", alignItems: "center", gap: "10px", padding: "16px 32px", borderRadius: "14px", background: "linear-gradient(135deg, #00d4ff, #818cf8)", color: "#000", ...syne, fontSize: "15px", fontWeight: 700, cursor: "pointer" }}
              >
                <Zap size={18} fill="currentColor" />
                Start Learning
                <ArrowRight size={16} />
              </motion.div>
            </Link>
            <Link href="/chat" style={{ textDecoration: "none" }}>
              <motion.div
                whileHover={{ scale: 1.04, background: "rgba(255,255,255,0.07)" }}
                whileTap={{ scale: 0.97 }}
                style={{ display: "flex", alignItems: "center", gap: "10px", padding: "16px 32px", borderRadius: "14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.12)", color: "#f0f0ff", ...syne, fontSize: "15px", fontWeight: 600, cursor: "pointer", backdropFilter: "blur(12px)" }}
              >
                <MessageSquare size={17} />
                Open Chat
              </motion.div>
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ position: "absolute", bottom: "40px", left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}
        >
          <span style={{ ...mono, fontSize: "10px", color: "#44445a", letterSpacing: "0.2em", textTransform: "uppercase" }}>scroll</span>
          <div style={{ width: "1px", height: "40px", background: "linear-gradient(180deg, rgba(0,212,255,0.5), transparent)" }} />
        </motion.div>
      </div>

      {/* ── STATS STRIP ── */}
      <div style={{ padding: "0 24px 80px" }}>
        <div style={{ maxWidth: "1152px", margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1px", background: "rgba(255,255,255,0.05)", borderRadius: "20px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            {[
              { icon: Database, label: "Architecture", value: "RAG + pgvector", color: "#00d4ff" },
              { icon: Brain, label: "AI Model", value: "LLaMA 3.3 70B", color: "#8b5cf6" },
              { icon: Zap, label: "Inference", value: "Groq Cloud", color: "#f59e0b" },
              { icon: TrendingUp, label: "Response Time", value: "< 1 second", color: "#10b981" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ background: "rgba(255,255,255,0.04)" }}
                style={{ display: "flex", alignItems: "center", gap: "14px", padding: "28px 28px", background: "#030308", transition: "background 0.2s" }}
              >
                <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: `${stat.color}15`, border: `1px solid ${stat.color}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <stat.icon size={18} style={{ color: stat.color }} />
                </div>
                <div>
                  <p style={{ ...mono, fontSize: "10px", color: "#44445a", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "4px" }}>{stat.label}</p>
                  <p style={{ ...syne, fontSize: "16px", fontWeight: 700, color: "#f0f0ff" }}>{stat.value}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── FEATURE CARDS ── */}
      <div style={{ padding: "0 24px 100px" }}>
        <div style={{ maxWidth: "1152px", margin: "0 auto" }}>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: "center", marginBottom: "60px" }}
          >
            <p style={{ ...mono, fontSize: "11px", color: "#00d4ff", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: "14px" }}>What you can do</p>
            <h2 style={{ ...syne, fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em" }}>
              Three tools. One brain.
            </h2>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link href={f.href} style={{ textDecoration: "none", display: "block" }}>
                  <motion.div
                    whileHover={{ y: -6, boxShadow: `0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px ${f.borderGlow}` }}
                    transition={{ duration: 0.25 }}
                    style={{ position: "relative", padding: "36px", borderRadius: "24px", background: f.gradient, border: `1px solid ${f.borderGlow}`, overflow: "hidden", cursor: "pointer", height: "100%" }}
                  >
                    {/* Card number watermark */}
                    <div style={{ position: "absolute", top: "20px", right: "24px", ...syne, fontSize: "56px", fontWeight: 800, color: "rgba(255,255,255,0.04)", lineHeight: 1, userSelect: "none" }}>
                      {f.number}
                    </div>

                    {/* Top glow line */}
                    <div style={{ position: "absolute", top: 0, left: "20%", right: "20%", height: "1px", background: `linear-gradient(90deg, transparent, ${f.iconColor}, transparent)` }} />

                    {/* Tag */}
                    <div style={{ display: "inline-flex", alignItems: "center", padding: "5px 12px", borderRadius: "6px", background: `${f.iconColor}15`, border: `1px solid ${f.iconColor}30`, marginBottom: "24px" }}>
                      <span style={{ ...mono, fontSize: "9px", fontWeight: 700, color: f.tagColor, letterSpacing: "0.15em" }}>{f.tag}</span>
                    </div>

                    {/* Icon with glow */}
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      style={{ width: "56px", height: "56px", borderRadius: "16px", background: `${f.iconColor}15`, border: `1px solid ${f.iconColor}30`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px", boxShadow: `0 0 20px ${f.iconGlow}` }}
                    >
                      <f.icon size={24} style={{ color: f.iconColor }} />
                    </motion.div>

                    <h3 style={{ ...syne, fontSize: "22px", fontWeight: 700, color: "#ffffff", marginBottom: "12px" }}>{f.title}</h3>
                    <p style={{ fontSize: "14px", lineHeight: 1.75, color: "#9999bb", marginBottom: "28px" }}>{f.description}</p>

                    <motion.div
                      whileHover={{ gap: "14px" }}
                      style={{ display: "flex", alignItems: "center", gap: "8px", ...syne, fontSize: "14px", fontWeight: 600, color: f.iconColor }}
                    >
                      {f.cta}
                      <motion.div whileHover={{ x: 4 }}>
                        <ArrowRight size={15} />
                      </motion.div>
                    </motion.div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <div style={{ padding: "0 24px 100px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: "center", marginBottom: "60px" }}
          >
            <p style={{ ...mono, fontSize: "11px", color: "#8b5cf6", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: "14px" }}>How it works</p>
            <h2 style={{ ...syne, fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em" }}>
              Three steps to smarter learning
            </h2>
          </motion.div>

          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {[
              { step: "01", title: "Add your notes", desc: "Paste anything — study notes, docs, code snippets, ideas. MentorAI vectorizes each entry instantly.", color: "#00d4ff" },
              { step: "02", title: "Ask anything", desc: "Chat naturally. The AI searches your knowledge base semantically and surfaces the most relevant notes.", color: "#8b5cf6" },
              { step: "03", title: "Get smart answers", desc: "Receive answers grounded in YOUR knowledge, with citations showing exactly which notes were used.", color: "#10b981" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                whileHover={{ x: 6 }}
                style={{ display: "flex", gap: "24px", padding: "28px 32px", borderRadius: "16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", cursor: "default", transition: "border-color 0.2s", alignItems: "center" }}
              >
                <div style={{ ...syne, fontSize: "42px", fontWeight: 800, color: item.color, opacity: 0.4, flexShrink: 0, lineHeight: 1, width: "70px" }}>{item.step}</div>
                <div style={{ width: "1px", height: "50px", background: `linear-gradient(180deg, transparent, ${item.color}, transparent)`, flexShrink: 0 }} />
                <div>
                  <h4 style={{ ...syne, fontSize: "18px", fontWeight: 700, color: "#f0f0ff", marginBottom: "6px" }}>{item.title}</h4>
                  <p style={{ fontSize: "14px", color: "#8888aa", lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FINAL CTA ── */}
      <div style={{ padding: "0 24px 100px" }}>
        <div style={{ maxWidth: "1152px", margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ position: "relative", padding: "64px 48px", borderRadius: "28px", background: "linear-gradient(135deg, rgba(0,212,255,0.06) 0%, rgba(139,92,246,0.06) 50%, rgba(16,185,129,0.06) 100%)", border: "1px solid rgba(255,255,255,0.08)", textAlign: "center", overflow: "hidden" }}
          >
            {/* Background rings */}
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "1px", height: "1px", pointerEvents: "none" }}>
              <Ring size={300} color="rgba(0,212,255,0.06)" delay={0} />
              <Ring size={500} color="rgba(139,92,246,0.04)" delay={1} />
            </div>

            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent, rgba(0,212,255,0.5), rgba(139,92,246,0.5), transparent)" }} />

            <div style={{ position: "relative" }}>
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "70px", height: "70px", borderRadius: "20px", background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.25)", marginBottom: "28px", boxShadow: "0 0 30px rgba(0,212,255,0.2)" }}
              >
                <Zap size={30} style={{ color: "#00d4ff" }} fill="#00d4ff" />
              </motion.div>

              <h2 style={{ ...syne, fontSize: "clamp(28px, 4vw, 48px)", fontWeight: 800, color: "#ffffff", marginBottom: "16px", letterSpacing: "-0.02em" }}>
                Your knowledge. Your AI.
              </h2>
              <p style={{ ...mono, fontSize: "15px", color: "#8888aa", marginBottom: "40px", maxWidth: "480px", margin: "0 auto 40px" }}>
                Add your first note and watch MentorAI become the smartest assistant you've ever had.
              </p>

              <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
                <Link href="/notes" style={{ textDecoration: "none" }}>
                  <motion.div
                    whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(0,212,255,0.4)" }}
                    whileTap={{ scale: 0.97 }}
                    style={{ display: "flex", alignItems: "center", gap: "10px", padding: "16px 36px", borderRadius: "14px", background: "linear-gradient(135deg, #00d4ff, #818cf8)", color: "#000", ...syne, fontSize: "16px", fontWeight: 700, cursor: "pointer" }}
                  >
                    Add First Note <ArrowRight size={18} />
                  </motion.div>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

    </div>
  );
}
