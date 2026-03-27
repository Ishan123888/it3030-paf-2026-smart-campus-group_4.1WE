import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function OAuthCallback() {
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();
  const called = useRef(false); // prevent double-fire in StrictMode

  useEffect(() => {
    if (called.current) return;
    called.current = true;

    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");

      if (token) {
        await loginWithToken(token); // waits until profile is fetched
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/login?error=oauth_failed", { replace: true });
      }
    };

    handleCallback();
  }, [loginWithToken, navigate]); // include functions that are used in effect

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "#060812",
      flexDirection: "column", gap: 16
    }}>
      <div style={{
        width: 48, height: 48,
        border: "3px solid #1e2a3a",
        borderTop: "3px solid #4f6fff",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite"
      }} />
      <p style={{ color: "#6b7599", fontFamily: "'DM Sans', sans-serif", fontSize: 15 }}>
        Completing sign-in...
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}