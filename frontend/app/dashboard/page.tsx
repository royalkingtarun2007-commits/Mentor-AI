"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/auth";
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, MessageSquare, Sparkles, ArrowRight, Brain, Database, TrendingUp, Clock } from "lucide-react";

const jakarta = { fontFamily: "'Plus Jakarta Sans', sans-serif" };
const script = { fontFamily: "'Cormorant Garamond', serif" };
const mono = { fontFamily: "'IBM Plex Mono', monospace" };

// Aurora background — same as login/signup for consistency
function AuroraBg() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = window.innerWidth;
    let H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;
    let t = 0;
    let animId: number;

    function draw() {
      t += 0.002; // slightly slower than login for a calm feel
      ctx!.clearRect(0, 0, W, H);

      ctx!.fillStyle = "#03030c";
      ctx!.fillRect(0, 0, W, H);

      const layers = [
        { color1: "rgba(99,102,241,0.2)", color2: "rgba(99,102,241,0)", freq: 0.6, amp: 0.15, speed: 0.8, yBase: 0.3 },
        { color1: "rgba(139,92,246,0.18)", color2: "rgba(139,92,246,0)", freq: 0.8, amp: 0.18, speed: 0.6, yBase: 0.25 },
        { color1: "rgba(6,182,212,0.14)", color2: "rgba(6,182,212,0)", freq: 1.0, amp: 0.12, speed: 1.0, yBase: 0.35 },
        { color1: "rgba(16,185,129,0.1)", color2: "rgba(16,185,129,0)", freq: 0.7, amp: 0.14, speed: 0.5, yBase: 0.28 },
      ];

      for (const layer of layers) {
        ctx!.beginPath();
        ctx!.moveTo(0, H);
        for (let i = 0; i <= 80; i++) {
          const x = (i / 80) * W;
          const y = layer.yBase * H
            + Math.sin(i * layer.freq * 0.1 + t * layer.speed) * layer.amp * H
            + Math.sin(i * layer.freq * 0.07 + t * layer.speed * 1.2 + 1) * layer.amp * 0.4 * H;
          ctx!.lineTo(x, y);
        }
        ctx!.lineTo(W, H);
        ctx!.closePath();
        const g = ctx!.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, layer.color1);
        g.addColorStop(1, layer.color2);
        ctx!.fillStyle = g;
        ctx!.fill();
      }

      // Stars — subtle
      for (let i = 0; i < 80; i++) {
        const sx = ((i * 9311) % W);
        const sy = ((i * 6271) % (H * 0.5));
        const tw = (Math.sin(t * 2 + i * 0.8) + 1) / 2;
        ctx!.fillStyle = `rgba(255,255,255,${0.1 + tw * 0.3})`;
        ctx!.beginPath();
        ctx!.arc(sx, sy, 0.5 + (i % 2) * 0.3, 0, Math.PI * 2);
        ctx!.fill();
      }

      // Fade bottom heavily so page content is readable
      const fade = ctx!.createLinearGradient(0, H * 0.4, 0, H);
      fade.addColorStop(0, "transparent");
      fade.addColorStop(1, "rgba(3,3,12,1)");
      ctx!.fillStyle = fade;
      ctx!.fillRect(0, 0, W, H);

      animId = requestAnimationFrame(draw);
    }

    draw();

    const onResize = () => { W = window.innerWidth; H = window.innerHeight; canvas.width = W; canvas.height = H; };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", onResize); };
  }, []);

  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} />;
}

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,300;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  const features = [
    {
      icon: BookOpen,
      title: "Knowledge Base",
      description: "Everything you save becomes searchable intelligence. Notes are vectorized for instant semantic retrieval.",
      href: "/notes",
      accent: "#6366f1",
      accentDim: "rgba(99,102,241,0.08)",
      accentBorder: "rgba(99,102,241,0.2)",
      cta: "Open Notes",
      number: "01",
    },
    {
      icon: MessageSquare,
      title: "AI Chat",
      description: "Chat with an AI that only knows what you've taught it. Powered by your notes, not the internet.",
      href: "/chat",
      accent: "#8b5cf6",
      accentDim: "rgba(139,92,246,0.08)",
      accentBorder: "rgba(139,92,246,0.2)",
      cta: "Start Chat",
      number: "02",
    },
    {
      icon: Sparkles,
      title: "Smart Summary",
      description: "Drop in any note and get a structured, AI-generated summary with key points extracted instantly.",
      href: "/summary",
      accent: "#06b6d4",
      accentDim: "rgba(6,182,212,0.08)",
      accentBorder: "rgba(6,182,212,0.2)",
      cta: "Try Summary",
      number: "03",
    },
  ];

  const stats = [
    { icon: Database, label: "Architecture", value: "RAG + pgvector", color: "#6366f1" },
    { icon: Brain, label: "AI Model", value: "LLaMA 3.3 70B", color: "#8b5cf6" },
    { icon: Clock, label: "Inference", value: "Groq Cloud", color: "#f59e0b" },
    { icon: TrendingUp, label: "Response", value: "< 1 second", color: "#10b981" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#03030c", color: "#f0f0ff", overflowX: "hidden", position: "relative" }}>
      <AuroraBg />

      {/* ── HERO ── */}
      <div style={{ position: "relative", zIndex: 1, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "100px 24px 60px", textAlign: "center" }}>

        {/* Floating particles */}
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -28, 0], opacity: [0, 0.5, 0] }}
            transition={{ duration: 5 + i * 0.6, repeat: Infinity, delay: i * 0.5 }}
            style={{ position: "absolute", width: "2px", height: "2px", borderRadius: "50%", background: i % 2 === 0 ? "#818cf8" : "#6ee7b7", left: `${10 + i * 8}%`, top: `${25 + (i % 4) * 14}%`, pointerEvents: "none" }}
          />
        ))}

        {/* Status badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "8px 18px", borderRadius: "999px", background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", marginBottom: "48px", backdropFilter: "blur(12px)" }}
        >
          <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
            style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#818cf8", display: "inline-block" }} />
          <span style={{ ...mono, color: "#818cf8", fontSize: "11px", letterSpacing: "0.15em", textTransform: "uppercase" }}>
            AI Online · Groq Connected
          </span>
        </motion.div>

        {/* Calligraphic greeting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginBottom: "16px" }}
        >
          <h1 style={{ ...script, fontSize: "clamp(52px, 9vw, 100px)", fontWeight: 300, fontStyle: "italic", lineHeight: 1, letterSpacing: "-0.01em', marginBottom: '0" }}>
            <span style={{ color: "rgba(255,255,255,0.9)" }}>Hello, </span>
            <span style={{ background: "linear-gradient(135deg, #c4b5fd 0%, #93c5fd 55%, #6ee7b7 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              {user?.email?.split("@")[0] ?? "friend"}
            </span>
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.4), rgba(6,182,212,0.3), transparent)", maxWidth: "300px", margin: "0 auto 28px" }}
        />

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          style={{ ...jakarta, fontSize: "18px", fontWeight: 400, color: "#6868a0", marginBottom: "52px", maxWidth: "480px", lineHeight: 1.6 }}
        >
          Your personal AI that learns from your notes
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}
        >
          <Link href="/notes" style={{ textDecoration: "none" }}>
            <motion.div
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              style={{ display: "flex", alignItems: "center", gap: "10px", padding: "16px 32px", borderRadius: "14px", background: "linear-gradient(135deg, #4f46e5, #7c3aed)", color: "#ffffff", ...jakarta, fontSize: "15px", fontWeight: 600, cursor: "pointer" }}
            >
              Add a Note <ArrowRight size={16} />
            </motion.div>
          </Link>
          <Link href="/chat" style={{ textDecoration: "none" }}>
            <motion.div
              whileHover={{ scale: 1.04, background: "rgba(255,255,255,0.07)" }}
              whileTap={{ scale: 0.97 }}
              style={{ display: "flex", alignItems: "center", gap: "10px", padding: "16px 32px", borderRadius: "14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", color: "#d0d0ff", ...jakarta, fontSize: "15px", fontWeight: 600, cursor: "pointer" }}
            >
              <MessageSquare size={16} /> Open Chat
            </motion.div>
          </Link>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ position: "absolute", bottom: "40px", left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}
        >
          <span style={{ ...mono, fontSize: "9px", color: "#3a3a5a", letterSpacing: "0.2em", textTransform: "uppercase" }}>scroll</span>
          <div style={{ width: "1px", height: "36px", background: "linear-gradient(180deg, rgba(139,92,246,0.4), transparent)" }} />
        </motion.div>
      </div>

      {/* ── STATS STRIP ── */}
      <div style={{ position: "relative", zIndex: 1, padding: "0 24px 80px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1px", background: "rgba(255,255,255,0.04)", borderRadius: "20px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ background: "rgba(255,255,255,0.03)" }}
                style={{ display: "flex", alignItems: "center", gap: "14px", padding: "24px", background: "rgba(3,3,12,0.8)", transition: "background 0.2s" }}
              >
                <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: `${stat.color}12`, border: `1px solid ${stat.color}25`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <stat.icon size={17} style={{ color: stat.color }} />
                </div>
                <div>
                  <p style={{ ...mono, fontSize: "9px", color: "#3a3a5a", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: "3px" }}>{stat.label}</p>
                  <p style={{ ...jakarta, fontSize: "15px", fontWeight: 600, color: "#e0e0ff" }}>{stat.value}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* ── FEATURES ── */}
      <div style={{ position: "relative", zIndex: 1, padding: "0 24px 100px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: "center", marginBottom: "56px" }}
          >
            <p style={{ ...mono, fontSize: "10px", color: "#6366f1", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: "12px" }}>What you can do</p>
            <h2 style={{ ...script, fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 300, fontStyle: "italic", color: "#ffffff", letterSpacing: "-0.01em" }}>
              Three tools. One brain.
            </h2>
          </motion.div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link href={f.href} style={{ textDecoration: "none", display: "block", height: "100%" }}>
                  <motion.div
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.2 }}
                    style={{ position: "relative", padding: "32px", borderRadius: "22px", background: f.accentDim, border: `1px solid ${f.accentBorder}`, overflow: "hidden", cursor: "pointer", height: "100%", backdropFilter: "blur(8px)" }}
                  >
                    {/* Top accent line */}
                    <div style={{ position: "absolute", top: 0, left: "20%", right: "20%", height: "1px", background: `linear-gradient(90deg, transparent, ${f.accent}, transparent)` }} />

                    {/* Number watermark */}
                    <div style={{ position: "absolute", top: "16px", right: "20px", ...script, fontSize: "52px", fontWeight: 300, fontStyle: "italic", color: "rgba(255,255,255,0.04)", lineHeight: 1, userSelect: "none" }}>
                      {f.number}
                    </div>

                    {/* Icon */}
                    <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: `${f.accent}15`, border: `1px solid ${f.accent}25`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "22px" }}>
                      <f.icon size={22} style={{ color: f.accent }} />
                    </div>

                    <h3 style={{ ...jakarta, fontSize: "20px", fontWeight: 700, color: "#ffffff", marginBottom: "10px" }}>{f.title}</h3>
                    <p style={{ ...jakarta, fontSize: "14px", lineHeight: 1.75, color: "#6868a0", marginBottom: "24px" }}>{f.description}</p>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px", ...jakarta, fontSize: "14px", fontWeight: 600, color: f.accent }}>
                      {f.cta} <ArrowRight size={14} />
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <div style={{ position: "relative", zIndex: 1, padding: "0 24px 100px" }}>
        <div style={{ maxWidth: "820px", margin: "0 auto" }}>
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            style={{ textAlign: "center", marginBottom: "52px" }}>
            <p style={{ ...mono, fontSize: "10px", color: "#8b5cf6", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: "12px" }}>How it works</p>
            <h2 style={{ ...script, fontSize: "clamp(30px, 4vw, 48px)", fontWeight: 300, fontStyle: "italic", color: "#ffffff" }}>
              Three steps to smarter learning
            </h2>
          </motion.div>

          <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            {[
              { step: "01", title: "Add your notes", desc: "Paste anything — study notes, docs, code snippets. MentorAI vectorizes each entry instantly.", color: "#6366f1" },
              { step: "02", title: "Ask anything", desc: "Chat naturally. The AI searches your knowledge base semantically and surfaces the most relevant notes.", color: "#8b5cf6" },
              { step: "03", title: "Get smart answers", desc: "Receive answers grounded in your knowledge, with citations showing which notes were used.", color: "#06b6d4" },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12 }}
                whileHover={{ x: 5 }}
                style={{ display: "flex", gap: "24px", padding: "26px 30px", borderRadius: "16px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", alignItems: "center" }}
              >
                <div style={{ ...script, fontSize: "44px", fontWeight: 300, fontStyle: "italic", color: item.color, opacity: 0.5, flexShrink: 0, lineHeight: 1, width: "68px" }}>{item.step}</div>
                <div style={{ width: "1px", height: "44px", background: `linear-gradient(180deg, transparent, ${item.color}, transparent)`, flexShrink: 0 }} />
                <div>
                  <h4 style={{ ...jakarta, fontSize: "17px", fontWeight: 700, color: "#e8e8ff", marginBottom: "5px" }}>{item.title}</h4>
                  <p style={{ ...jakarta, fontSize: "14px", color: "#5a5a7a", lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FINAL CTA ── */}
      <div style={{ position: "relative", zIndex: 1, padding: "0 24px 100px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ position: "relative", padding: "64px 48px", borderRadius: "28px", background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.12)", textAlign: "center", overflow: "hidden", backdropFilter: "blur(8px)" }}
          >
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.5), rgba(6,182,212,0.4), transparent)" }} />

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              style={{ ...script, fontSize: "clamp(32px, 5vw, 60px)", fontWeight: 300, fontStyle: "italic", color: "#ffffff", marginBottom: "16px", letterSpacing: "-0.01em" }}
            >
              Your knowledge. Your AI.
            </motion.h2>

            <p style={{ ...jakarta, fontSize: "16px", color: "#5a5a7a", marginBottom: "40px", maxWidth: "440px", margin: "0 auto 40px", lineHeight: 1.7 }}>
              Add your first note and watch MentorAI become the smartest assistant you've ever had.
            </p>

            <Link href="/notes" style={{ textDecoration: "none" }}>
              <motion.div
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                style={{ display: "inline-flex", alignItems: "center", gap: "10px", padding: "16px 36px", borderRadius: "14px", background: "linear-gradient(135deg, #4f46e5, #7c3aed)", color: "#ffffff", ...jakarta, fontSize: "16px", fontWeight: 600, cursor: "pointer" }}
              >
                Get Started <ArrowRight size={18} />
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
