import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  const handleLogin = () => {
    // ✅ Fixed port: 8081
    window.location.href = "http://localhost:8081/oauth2/authorization/google";
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #060812 0%, #0d1120 50%, #060812 100%)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif",
      position: "relative", overflow: "hidden"
    }}>
      {/* Background orbs */}
      <div style={{
        position: "absolute", width: 400, height: 400, borderRadius: "50%",
        background: "rgba(79,111,255,0.12)", filter: "blur(80px)",
        top: -100, left: -100, pointerEvents: "none"
      }} />
      <div style={{
        position: "absolute", width: 300, height: 300, borderRadius: "50%",
        background: "rgba(0,229,195,0.08)", filter: "blur(80px)",
        bottom: -50, right: -50, pointerEvents: "none"
      }} />

      <div style={{
        background: "rgba(13,17,32,0.9)",
        border: "1px solid rgba(99,130,255,0.2)",
        borderRadius: 24, padding: "48px 40px",
        width: "100%", maxWidth: 420,
        boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
        textAlign: "center", position: "relative", zIndex: 1,
        backdropFilter: "blur(12px)"
      }}>
        {/* Logo */}
        <div style={{
          width: 64, height: 64, borderRadius: 18, margin: "0 auto 20px",
          background: "linear-gradient(135deg, #4f6fff, #7b6fff)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 28, boxShadow: "0 0 32px rgba(79,111,255,0.4)"
        }}>🏫</div>

        <h1 style={{ color: "#e8ecff", margin: "0 0 8px", fontSize: 28, fontWeight: 800, letterSpacing: -1 }}>
          Smart<span style={{ color: "#4f6fff" }}>Campus</span>
        </h1>
        <p style={{ color: "#6b7599", marginBottom: 8, fontSize: 14 }}>
          Operations Hub — SLIIT
        </p>
        <div style={{
          display: "inline-block", padding: "4px 12px", borderRadius: 100,
          background: "rgba(0,229,195,0.1)", border: "1px solid rgba(0,229,195,0.3)",
          color: "#00e5c3", fontSize: 11, fontWeight: 600, marginBottom: 36,
          letterSpacing: "0.06em", textTransform: "uppercase"
        }}>IT3030 · PAF 2026</div>

        {/* Google Sign In Button */}
        <button
          onClick={handleLogin}
          style={{
            width: "100%", padding: "14px 20px",
            background: "white", border: "none", borderRadius: 12,
            cursor: "pointer", display: "flex", alignItems: "center",
            justifyContent: "center", gap: 12, fontSize: 15, fontWeight: 600,
            color: "#3c4043", transition: "all 0.2s",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.3)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
          }}
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google" style={{ width: 22, height: 22 }}
          />
          Sign in with Google
        </button>

        <p style={{ color: "#3d4360", fontSize: 12, marginTop: 24, lineHeight: 1.6 }}>
          Only authorized SLIIT members can access this system.<br />
          Your account is created automatically on first sign-in.
        </p>
      </div>
    </div>
  );
}