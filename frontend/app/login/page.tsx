"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/auth";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, ArrowRight, Lock, Mail } from "lucide-react";

const display = { fontFamily: "'Plus Jakarta Sans', sans-serif" };
const body = { fontFamily: "'Inter', sans-serif" };
const script = { fontFamily: "'Cormorant Garamond', serif" };

// ── Aurora background ──
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

      // Deep dark base
      ctx!.fillStyle = "#03030c";
      ctx!.fillRect(0, 0, W, H);

      // Aurora layers — multiple sine waves of color
      const layers = [
        { color1: "rgba(29,78,216,0.35)", color2: "rgba(29,78,216,0)", freq: 0.8, amp: 0.18, speed: 1, yBase: 0.45 },
        { color1: "rgba(109,40,217,0.3)", color2: "rgba(109,40,217,0)", freq: 0.6, amp: 0.22, speed: 0.7, yBase: 0.38 },
        { color1: "rgba(16,185,129,0.2)", color2: "rgba(16,185,129,0)", freq: 1.1, amp: 0.14, speed: 1.3, yBase: 0.52 },
        { color1: "rgba(6,182,212,0.22)", color2: "rgba(6,182,212,0)", freq: 0.9, amp: 0.16, speed: 0.9, yBase: 0.42 },
        { color1: "rgba(139,92,246,0.18)", color2: "rgba(139,92,246,0)", freq: 0.5, amp: 0.2, speed: 0.5, yBase: 0.35 },
      ];

      for (const layer of layers) {
        ctx!.beginPath();

        const points: [number, number][] = [];
        const steps = 80;

        for (let i = 0; i <= steps; i++) {
          const x = (i / steps) * W;
          const wave1 = Math.sin(i * layer.freq * 0.1 + t * layer.speed) * layer.amp * H;
          const wave2 = Math.sin(i * layer.freq * 0.07 + t * layer.speed * 1.3 + 1) * layer.amp * 0.5 * H;
          const y = layer.yBase * H + wave1 + wave2;
          points.push([x, y]);
        }

        ctx!.moveTo(0, H);
        for (const [x, y] of points) ctx!.lineTo(x, y);
        ctx!.lineTo(W, H);
        ctx!.closePath();

        const grad = ctx!.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, layer.color1);
        grad.addColorStop(1, layer.color2);
        ctx!.fillStyle = grad;
        ctx!.fill();
      }

      // Stars
      const starSeed = 42;
      const numStars = 120;
      for (let i = 0; i < numStars; i++) {
        const sx = ((i * 7919 + starSeed) % W);
        const sy = ((i * 6271 + starSeed) % (H * 0.7));
        const twinkle = (Math.sin(t * 2 + i * 0.5) + 1) / 2;
        const alpha = 0.2 + twinkle * 0.5;
        const r = 0.5 + (i % 3) * 0.4;
        ctx!.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx!.beginPath();
        ctx!.arc(sx, sy, r, 0, Math.PI * 2);
        ctx!.fill();
      }

      // Bottom fade to dark
      const bottomFade = ctx!.createLinearGradient(0, H * 0.6, 0, H);
      bottomFade.addColorStop(0, "transparent");
      bottomFade.addColorStop(1, "rgba(3,3,12,0.95)");
      ctx!.fillStyle = bottomFade;
      ctx!.fillRect(0, 0, W, H);

      // Center vignette for card readability
      const vg = ctx!.createRadialGradient(W / 2, H / 2, H * 0.1, W / 2, H / 2, H * 0.75);
      vg.addColorStop(0, "rgba(3,3,12,0.55)");
      vg.addColorStop(1, "rgba(3,3,12,0.2)");
      ctx!.fillStyle = vg;
      ctx!.fillRect(0, 0, W, H);

      animId = requestAnimationFrame(draw);
    }

    draw();

    const onResize = () => {
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W; canvas.height = H;
    };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", onResize); };
  }, []);

  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 0 }} />;
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [serverReady, setServerReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`)
      .then(r => { if (r.ok) setServerReady(true); })
      .catch(() => {});
  }, []);

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ username: email, password }).toString(),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      if (data.access_token) {
        localStorage.setItem("access_token", data.access_token);
        useAuthStore.getState().setUser({ id: 0, email });
        router.push("/dashboard");
      }
    } catch {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", padding: "24px" }}>
      <Aurora />

      {/* Server status */}
      <div style={{ position: "fixed", top: "24px", right: "24px", zIndex: 50, display: "flex", alignItems: "center", gap: "6px" }}>
        <motion.span
          animate={serverReady ? { opacity: 1 } : { opacity: [0.3, 1, 0.3] }}
          transition={serverReady ? {} : { duration: 1.5, repeat: Infinity }}
          style={{ width: "6px", height: "6px", borderRadius: "50%", background: serverReady ? "#34d399" : "#818cf8", display: "inline-block" }}
        />
        <span style={{ ...body, fontSize: "11px", color: serverReady ? "#34d399" : "#818cf8", opacity: 0.8 }}>
          {serverReady ? "Ready" : "Connecting"}
        </span>
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 36 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: "480px" }}
      >
        <div style={{ background: "rgba(6,6,20,0.82)", borderRadius: "28px", padding: "52px 48px", backdropFilter: "blur(32px)", border: "1px solid rgba(255,255,255,0.07)", position: "relative", overflow: "hidden" }}>

          {/* Subtle aurora reflection on card top */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "120px", background: "linear-gradient(180deg, rgba(109,40,217,0.08) 0%, transparent 100%)", pointerEvents: "none", borderRadius: "28px 28px 0 0" }} />
          <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: "1px", background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.6), rgba(6,182,212,0.4), transparent)" }} />

          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 1, ease: "easeOut" }}
            >
              {/* Calligraphic logo */}
              <motion.h2
                initial={{ opacity: 0, letterSpacing: "0.3em" }}
                animate={{ opacity: 1, letterSpacing: "0.08em" }}
                transition={{ delay: 0.3, duration: 1.2, ease: "easeOut" }}
                style={{ ...script, fontSize: "48px", fontWeight: 300, fontStyle: "italic", marginBottom: "4px", lineHeight: 1, background: "linear-gradient(135deg, #c4b5fd 0%, #93c5fd 50%, #6ee7b7 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}
              >
                MentorAI
              </motion.h2>
              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
                style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(139,92,246,0.4), rgba(6,182,212,0.4), transparent)", margin: "10px auto", maxWidth: "160px" }}
              />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              style={{ ...display, fontSize: "26px", fontWeight: 700, color: "#ffffff", marginBottom: "8px", letterSpacing: "-0.02em", marginTop: "16px" }}
            >
              Welcome back
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              style={{ ...body, fontSize: "15px", color: "#6b6b8a" }}
            >
              Sign in to your workspace
            </motion.p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
              <label style={{ ...body, fontSize: "13px", fontWeight: 500, color: "#7070a0", display: "block", marginBottom: "8px" }}>Email</label>
              <div style={{ position: "relative" }}>
                <Mail size={16} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: focused === "email" ? "#818cf8" : "#4a4a6a", transition: "color 0.2s", pointerEvents: "none" }} />
                <input
                  type="email" placeholder="you@example.com" required
                  value={email} onChange={e => setEmail(e.target.value)}
                  onFocus={() => setFocused("email")} onBlur={() => setFocused(null)}
                  style={{ width: "100%", paddingLeft: "46px", paddingRight: "16px", paddingTop: "15px", paddingBottom: "15px", background: focused === "email" ? "rgba(99,102,241,0.08)" : "rgba(255,255,255,0.04)", border: `1px solid ${focused === "email" ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.08)"}`, borderRadius: "14px", ...body, fontSize: "15px", color: "#e8e8ff", outline: "none", transition: "all 0.2s" }}
                />
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <label style={{ ...body, fontSize: "13px", fontWeight: 500, color: "#7070a0", display: "block", marginBottom: "8px" }}>Password</label>
              <div style={{ position: "relative" }}>
                <Lock size={16} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: focused === "password" ? "#818cf8" : "#4a4a6a", transition: "color 0.2s", pointerEvents: "none" }} />
                <input
                  type={showPassword ? "text" : "password"} placeholder="Enter your password" required
                  value={password} onChange={e => setPassword(e.target.value)}
                  onFocus={() => setFocused("password")} onBlur={() => setFocused(null)}
                  style={{ width: "100%", paddingLeft: "46px", paddingRight: "50px", paddingTop: "15px", paddingBottom: "15px", background: focused === "password" ? "rgba(99,102,241,0.08)" : "rgba(255,255,255,0.04)", border: `1px solid ${focused === "password" ? "rgba(99,102,241,0.4)" : "rgba(255,255,255,0.08)"}`, borderRadius: "14px", ...body, fontSize: "15px", color: "#e8e8ff", outline: "none", transition: "all 0.2s" }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#4a4a6a", display: "flex", transition: "color 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#818cf8")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#4a4a6a")}>
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
              style={{ width: "100%", padding: "16px 24px", borderRadius: "14px", border: "none", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", ...display, fontSize: "16px", fontWeight: 700, marginTop: "4px", background: "linear-gradient(135deg, #4f46e5, #7c3aed)", color: "#ffffff", opacity: loading ? 0.75 : 1, transition: "opacity 0.2s", position: "relative", overflow: "hidden" }}
            >
              {!loading && (
                <motion.div animate={{ x: ["-100%", "200%"] }} transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2 }}
                  style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)", pointerEvents: "none" }} />
              )}
              {loading ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                    style={{ width: "20px", height: "20px", border: "2px solid rgba(255,255,255,0.25)", borderTop: "2px solid #fff", borderRadius: "50%" }} />
                  Signing in...
                </>
              ) : (
                <>Sign In <ArrowRight size={18} /></>
              )}
            </motion.button>
          </form>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }}
            style={{ ...body, fontSize: "14px", color: "#4a4a6a", textAlign: "center", marginTop: "32px" }}>
            Don't have an account?{" "}
            <Link href="/signup" style={{ color: "#818cf8", textDecoration: "none", fontWeight: 600 }}
              onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.color = "#a5b4fc")}
              onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.color = "#818cf8")}>
              Create one
            </Link>
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
