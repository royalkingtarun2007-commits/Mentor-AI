"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight, Lock, Mail, Sparkles } from "lucide-react";
import { signup } from "@/lib/auth";

const syne = { fontFamily: "'Syne', sans-serif" };
const mono = { fontFamily: "'JetBrains Mono', monospace" };

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signup(email, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unable to create account";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#030308", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", padding: "24px" }}>

      {/* Grid */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)", backgroundSize: "60px 60px", pointerEvents: "none" }} />

      {/* Orbs */}
      <motion.div
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 8, repeat: Infinity }}
        style={{ position: "absolute", top: "-200px", right: "-150px", width: "500px", height: "500px", borderRadius: "50%", background: "rgba(16,185,129,0.05)", filter: "blur(80px)", pointerEvents: "none" }}
      />
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 10, repeat: Infinity, delay: 2 }}
        style={{ position: "absolute", bottom: "-200px", left: "-150px", width: "450px", height: "450px", borderRadius: "50%", background: "rgba(0,212,255,0.05)", filter: "blur(80px)", pointerEvents: "none" }}
      />

      {/* Animated vertical lines */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.15, 0.5, 0.15] }}
            transition={{ duration: 5 + i, repeat: Infinity, delay: i * 0.8 }}
            style={{ position: "absolute", width: "1px", height: "100%", background: `linear-gradient(180deg, transparent, rgba(16,185,129,${0.06 + i * 0.02}), transparent)`, left: `${15 + i * 20}%` }}
          />
        ))}
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: "440px" }}
      >
        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "24px", padding: "40px", boxShadow: "0 32px 80px rgba(0,0,0,0.6)", backdropFilter: "blur(20px)", position: "relative", overflow: "hidden" }}>

          <div style={{ position: "absolute", top: 0, left: "20%", right: "20%", height: "1px", background: "linear-gradient(90deg, transparent, rgba(16,185,129,0.6), transparent)" }} />

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "36px" }}>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "60px", height: "60px", borderRadius: "18px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", marginBottom: "20px", boxShadow: "0 0 24px rgba(16,185,129,0.12)" }}
            >
              <Sparkles size={26} style={{ color: "#10b981" }} />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              style={{ ...syne, fontSize: "28px", fontWeight: 800, marginBottom: "8px", background: "linear-gradient(135deg, #10b981 0%, #00d4ff 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
            >
              Create account
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              style={{ ...mono, color: "#8888aa", fontSize: "12px" }}
            >
              // initialize your knowledge_base
            </motion.p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 }}
              style={{ position: "relative" }}
            >
              <Mail size={14} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#44445a", pointerEvents: "none" }} />
              <input
                type="email"
                placeholder="email@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: "100%", paddingLeft: "42px", paddingRight: "16px", paddingTop: "14px", paddingBottom: "14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", ...mono, fontSize: "13px", color: "#f0f0ff", transition: "border-color 0.2s, box-shadow 0.2s" }}
                onFocus={e => { e.target.style.borderColor = "rgba(16,185,129,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(16,185,129,0.06)"; }}
                onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.boxShadow = "none"; }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              style={{ position: "relative" }}
            >
              <Lock size={14} style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#44445a", pointerEvents: "none" }} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="create a password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: "100%", paddingLeft: "42px", paddingRight: "48px", paddingTop: "14px", paddingBottom: "14px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", ...mono, fontSize: "13px", color: "#f0f0ff", transition: "border-color 0.2s, box-shadow 0.2s" }}
                onFocus={e => { e.target.style.borderColor = "rgba(16,185,129,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(16,185,129,0.06)"; }}
                onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.08)"; e.target.style.boxShadow = "none"; }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#44445a", padding: "2px", display: "flex", alignItems: "center" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#8888aa")}
                onMouseLeave={e => (e.currentTarget.style.color = "#44445a")}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 14px", borderRadius: "10px", background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}
              >
                <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#f87171", flexShrink: 0 }} />
                <p style={{ ...mono, color: "#f87171", fontSize: "12px", margin: 0 }}>{error}</p>
              </motion.div>
            )}

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.02, boxShadow: "0 0 24px rgba(16,185,129,0.3)" }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              style={{ width: "100%", padding: "14px", borderRadius: "12px", background: "linear-gradient(135deg, #10b981, #00d4ff)", color: "#000", border: "none", cursor: loading ? "not-allowed" : "pointer", ...syne, fontSize: "14px", fontWeight: 700, letterSpacing: "0.03em", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", opacity: loading ? 0.7 : 1, marginTop: "6px" }}
            >
              {loading ? (
                <>
                  <div style={{ width: "16px", height: "16px", border: "2px solid rgba(0,0,0,0.2)", borderTop: "2px solid #000", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                  Creating...
                </>
              ) : (
                <>Get Started <ArrowRight size={16} /></>
              )}
            </motion.button>
          </form>

          <p style={{ textAlign: "center", ...mono, fontSize: "12px", color: "#44445a", marginTop: "24px" }}>
            have account?{" "}
            <Link
              href="/login"
              style={{ color: "#10b981", textDecoration: "none" }}
              onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.opacity = "0.7")}
              onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.opacity = "1")}
            >
              sign_in()
            </Link>
          </p>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          style={{ textAlign: "center", ...mono, fontSize: "10px", color: "#2a2a3a", marginTop: "24px", letterSpacing: "0.2em", textTransform: "uppercase" }}
        >
          MentorAI · Your Knowledge. Your AI.
        </motion.p>
      </motion.div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
