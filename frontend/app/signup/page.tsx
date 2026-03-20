"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, ArrowRight, Lock, Mail } from "lucide-react";
import { signup } from "@/lib/auth";

const display = { fontFamily: "'Plus Jakarta Sans', sans-serif" };
const body = { fontFamily: "'Inter', sans-serif" };
const script = { fontFamily: "'Cormorant Garamond', serif" };

function Aurora() {
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
      t += 0.003;
      ctx!.clearRect(0, 0, W, H);

      ctx!.fillStyle = "#03060a";
      ctx!.fillRect(0, 0, W, H);

      // Slightly different aurora palette for signup — more teal/green
      const layers = [
        { color1: "rgba(16,185,129,0.3)", color2: "rgba(16,185,129,0)", freq: 0.7, amp: 0.2, speed: 0.9, yBase: 0.44 },
        { color1: "rgba(6,182,212,0.25)", color2: "rgba(6,182,212,0)", freq: 0.9, amp: 0.16, speed: 1.1, yBase: 0.38 },
        { color1: "rgba(59,130,246,0.2)", color2: "rgba(59,130,246,0)", freq: 0.6, amp: 0.22, speed: 0.6, yBase: 0.5 },
        { color1: "rgba(139,92,246,0.15)", color2: "rgba(139,92,246,0)", freq: 1.0, amp: 0.14, speed: 1.2, yBase: 0.42 },
        { color1: "rgba(16,185,129,0.12)", color2: "rgba(16,185,129,0)", freq: 0.5, amp: 0.18, speed: 0.4, yBase: 0.35 },
      ];

      for (const layer of layers) {
        ctx!.beginPath();
        const steps = 80;
        ctx!.moveTo(0, H);
        for (let i = 0; i <= steps; i++) {
          const x = (i / steps) * W;
          const wave1 = Math.sin(i * layer.freq * 0.1 + t * layer.speed) * layer.amp * H;
          const wave2 = Math.sin(i * layer.freq * 0.07 + t * layer.speed * 1.3 + 2) * layer.amp * 0.5 * H;
          ctx!.lineTo(x, layer.yBase * H + wave1 + wave2);
        }
        ctx!.lineTo(W, H);
        ctx!.closePath();

        const grad = ctx!.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, layer.color1);
        grad.addColorStop(1, layer.color2);
        ctx!.fillStyle = grad;
        ctx!.fill();
      }

      // Stars
      for (let i = 0; i < 100; i++) {
        const sx = ((i * 8191) % W);
        const sy = ((i * 5347) % (H * 0.65));
        const twinkle = (Math.sin(t * 1.8 + i * 0.6) + 1) / 2;
        ctx!.fillStyle = `rgba(255,255,255,${0.15 + twinkle * 0.45})`;
        ctx!.beginPath();
        ctx!.arc(sx, sy, 0.5 + (i % 3) * 0.3, 0, Math.PI * 2);
        ctx!.fill();
      }

      const bottomFade = ctx!.createLinearGradient(0, H * 0.55, 0, H);
      bottomFade.addColorStop(0, "transparent");
      bottomFade.addColorStop(1, "rgba(3,6,10,0.95)");
      ctx!.fillStyle = bottomFade;
      ctx!.fillRect(0, 0, W, H);

      const vg = ctx!.createRadialGradient(W / 2, H / 2, H * 0.1, W / 2, H / 2, H * 0.75);
      vg.addColorStop(0, "rgba(3,6,10,0.5)");
      vg.addColorStop(1, "rgba(3,6,10,0.15)");
      ctx!.fillStyle = vg;
      ctx!.fillRect(0, 0, W, H);

      animId = requestAnimationFrame(draw);
    }

    draw();

    const onResize = () => { W = window.innerWidth; H = window.innerHeight; canvas.width = W; canvas.height = H; };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", onResize); };
  }, []);

  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 0 }} />;
}

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signup(email, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to create account");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", padding: "24px" }}>
      <Aurora />

      <motion.div
        initial={{ opacity: 0, y: 36 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: "480px" }}
      >
        <div style={{ background: "rgba(4,8,14,0.84)", borderRadius: "28px", padding: "52px 48px", backdropFilter: "blur(32px)", border: "1px solid rgba(255,255,255,0.07)", position: "relative", overflow: "hidden" }}>

          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "120px", background: "linear-gradient(180deg, rgba(16,185,129,0.06) 0%, transparent 100%)", pointerEvents: "none", borderRadius: "28px 28px 0 0" }} />
          <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: "1px", background: "linear-gradient(90deg, transparent, rgba(16,185,129,0.55), rgba(6,182,212,0.4), transparent)" }} />

          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 1 }}
            >
              <motion.h2
                initial={{ opacity: 0, letterSpacing: "0.3em" }}
                animate={{ opacity: 1, letterSpacing: "0.08em" }}
                transition={{ delay: 0.3, duration: 1.2, ease: "easeOut" }}
                style={{ ...script, fontSize: "48px", fontWeight: 300, fontStyle: "italic", marginBottom: "4px", lineHeight: 1, background: "linear-gradient(135deg, #6ee7b7 0%, #67e8f9 50%, #a5b4fc 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
              >
                MentorAI
              </motion.h2>
              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.8 }}
                style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(16,185,129,0.5), rgba(6,182,212,0.4), transparent)", margin: "10px auto", maxWidth: "160px" }}
              />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              style={{ ...display, fontSize: "26px", fontWeight: 700, color: "#ffffff", marginBottom: "8px", letterSpacing: "-0.02em", marginTop: "16px" }}
            >
              Create your account
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              style={{ ...body, fontSize: "15px", color: "#4a6a5a" }}
            >
              Start building your knowledge base today
            </motion.p>
          </div>

          {/* Form */}
          <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
              <label style={{ ...body, fontSize: "13px", fontWeight: 500, color: "#4a7a6a", display: "block", marginBottom: "8px" }}>Email</label>
              <div style={{ position: "relative" }}>
                <Mail size={16} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: focused === "email" ? "#10b981" : "#2a4a3a", transition: "color 0.2s", pointerEvents: "none" }} />
                <input
                  type="email" placeholder="you@example.com" required
                  value={email} onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocused("email")} onBlur={() => setFocused(null)}
                  style={{ width: "100%", paddingLeft: "46px", paddingRight: "16px", paddingTop: "15px", paddingBottom: "15px", background: focused === "email" ? "rgba(16,185,129,0.07)" : "rgba(255,255,255,0.04)", border: `1px solid ${focused === "email" ? "rgba(16,185,129,0.38)" : "rgba(255,255,255,0.08)"}`, borderRadius: "14px", ...body, fontSize: "15px", color: "#e8ffe8", outline: "none", transition: "all 0.2s" }}
                />
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <label style={{ ...body, fontSize: "13px", fontWeight: 500, color: "#4a7a6a", display: "block", marginBottom: "8px" }}>Password</label>
              <div style={{ position: "relative" }}>
                <Lock size={16} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: focused === "password" ? "#10b981" : "#2a4a3a", transition: "color 0.2s", pointerEvents: "none" }} />
                <input
                  type={showPassword ? "text" : "password"} placeholder="Create a strong password" required
                  value={password} onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocused("password")} onBlur={() => setFocused(null)}
                  style={{ width: "100%", paddingLeft: "46px", paddingRight: "50px", paddingTop: "15px", paddingBottom: "15px", background: focused === "password" ? "rgba(16,185,129,0.07)" : "rgba(255,255,255,0.04)", border: `1px solid ${focused === "password" ? "rgba(16,185,129,0.38)" : "rgba(255,255,255,0.08)"}`, borderRadius: "14px", ...body, fontSize: "15px", color: "#e8ffe8", outline: "none", transition: "all 0.2s" }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#2a4a3a", display: "flex", transition: "color 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#10b981")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#2a4a3a")}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </motion.div>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  style={{ padding: "12px 16px", borderRadius: "12px", background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.18)" }}>
                  <p style={{ ...body, color: "#f87171", fontSize: "13px", margin: 0 }}>{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
              whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }}
              type="submit" disabled={loading}
              style={{ width: "100%", padding: "16px 24px", borderRadius: "14px", border: "none", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", ...display, fontSize: "16px", fontWeight: 700, marginTop: "4px", background: "linear-gradient(135deg, #059669, #0891b2)", color: "#ffffff", opacity: loading ? 0.75 : 1, transition: "opacity 0.2s", position: "relative", overflow: "hidden" }}
            >
              {!loading && (
                <motion.div animate={{ x: ["-100%", "200%"] }} transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2 }}
                  style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)", pointerEvents: "none" }} />
              )}
              {loading ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                    style={{ width: "20px", height: "20px", border: "2px solid rgba(255,255,255,0.25)", borderTop: "2px solid #fff", borderRadius: "50%" }} />
                  Creating account...
                </>
              ) : (
                <>Get Started <ArrowRight size={18} /></>
              )}
            </motion.button>
          </form>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }}
            style={{ ...body, fontSize: "14px", color: "#2a4a3a", textAlign: "center", marginTop: "32px" }}>
            Already have an account?{" "}
            <Link href="/login" style={{ color: "#10b981", textDecoration: "none", fontWeight: 600 }}
              onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = "#34d399")}
              onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = "#10b981")}>
              Sign in
            </Link>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
