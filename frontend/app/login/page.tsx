"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/auth";
import { motion } from "framer-motion";
import { Eye, EyeOff, Zap, ArrowRight, Lock, Mail } from "lucide-react";

const syne = { fontFamily: "'Syne', sans-serif" };
const mono = { fontFamily: "'JetBrains Mono', monospace" };

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          username: email,
          password: password,
        }).toString(),
      });

      if (!res.ok) {
        throw new Error("Login failed");
      }

      const data = await res.json();

      if (data.access_token) {
        localStorage.setItem("access_token", data.access_token);

        const setUser = useAuthStore.getState().setUser;
        setUser({ id: 0, email });

        router.push("/dashboard");
      } else {
        setError("No token received");
      }
    } catch (err) {
      console.error(err);
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#030308",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        padding: "24px",
      }}
    >
      {/* Grid background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          pointerEvents: "none",
        }}
      />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: "440px",
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "24px",
            padding: "40px",
            boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "36px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "60px",
                height: "60px",
                borderRadius: "18px",
                background: "rgba(0,212,255,0.08)",
                border: "1px solid rgba(0,212,255,0.2)",
                marginBottom: "20px",
              }}
            >
              <Zap size={26} style={{ color: "#00d4ff" }} />
            </div>

            <h1
              style={{
                ...syne,
                fontSize: "28px",
                fontWeight: 800,
                marginBottom: "8px",
                background: "linear-gradient(135deg,#00d4ff,#a78bfa)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Welcome back
            </h1>

            <p style={{ ...mono, color: "#8888aa", fontSize: "12px" }}>
              // sign_in to your workspace
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleLogin}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            {/* Email */}
            <div style={{ position: "relative" }}>
              <Mail
                size={14}
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#44445a",
                }}
              />

              <input
                type="email"
                placeholder="email@example.com"
                required
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEmail(e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "14px 16px 14px 42px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "12px",
                  ...mono,
                  fontSize: "13px",
                  color: "#f0f0ff",
                }}
              />
            </div>

            {/* Password */}
            <div style={{ position: "relative" }}>
              <Lock
                size={14}
                style={{
                  position: "absolute",
                  left: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#44445a",
                }}
              />

              <input
                type={showPassword ? "text" : "password"}
                placeholder="password"
                required
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setPassword(e.target.value)
                }
                style={{
                  width: "100%",
                  padding: "14px 48px 14px 42px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "12px",
                  ...mono,
                  fontSize: "13px",
                  color: "#f0f0ff",
                }}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "14px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#44445a",
                }}
              >
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>

            {error && (
              <p
                style={{
                  ...mono,
                  color: "#f87171",
                  fontSize: "12px",
                  textAlign: "center",
                }}
              >
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "12px",
                background: "linear-gradient(135deg,#00d4ff,#818cf8)",
                color: "#000",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                ...syne,
                fontSize: "14px",
                fontWeight: 700,
              }}
            >
              {loading ? "Authenticating..." : "Sign In"}
            </button>
          </form>

          <p
            style={{
              textAlign: "center",
              ...mono,
              fontSize: "12px",
              color: "#44445a",
              marginTop: "24px",
            }}
          >
            no account?{" "}
            <Link href="/signup" style={{ color: "#00d4ff" }}>
              create_one()
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}