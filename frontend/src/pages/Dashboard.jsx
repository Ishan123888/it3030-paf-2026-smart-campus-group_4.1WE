import { useAuth } from "../context/AuthContext";
import Navbar from "../components/common/Navbar";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Loading Screen
  if (loading) return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "#060812"
    }}>
      <div style={{
        width: 40, height: 40, border: "3px solid #1e2a3a",
        borderTop: "3px solid #4f6fff", borderRadius: "50%",
        animation: "spin 0.8s linear infinite"
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  // User status check
  const isAuthenticated = user && user.authenticated !== false;
  const displayName = isAuthenticated ? user.name?.split(' ')[0] : "Guest";

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#060812",
                  paddingTop: 60, fontFamily: "'DM Sans', sans-serif" }}>
      <Navbar />
      <div style={{ padding: "32px", maxWidth: "800px", margin: "0 auto" }}>
        
        {/* Header Section */}
        <h1 style={{ color: "#e8ecff", fontSize: 28, fontWeight: 800, marginBottom: 8 }}>
          Welcome back, {displayName}! 👋
        </h1>
        <p style={{ color: "#6b7599", marginBottom: 32 }}>
          {isAuthenticated ? "Manage your profile and activities below." : "Login to access personalized features."}
        </p>

        {/* Profile Card - Only shown if Logged In */}
        {isAuthenticated && (
          <div style={{
            background: "rgba(13,17,32,0.9)",
            border: "1px solid rgba(99,130,255,0.15)",
            borderRadius: 16, padding: 24, marginBottom: 32,
            display: "flex", alignItems: "center", gap: 20
          }}>
            <img 
              src={user.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "User")}&background=4f6fff&color=fff`}
              alt="profile" 
              style={{ width: 80, height: 80, borderRadius: "50%", border: "3px solid #4f6fff" }} 
            />
            <div>
              <h2 style={{ margin: "0 0 4px", fontSize: "1.25rem", color: "#e8ecff" }}>
                {user.name}
              </h2>
              <p style={{ margin: "0 0 10px", color: "#6b7599" }}>📧 {user.email}</p>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {(user.roles || []).map(role => (
                  <span key={role} style={{
                    padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                    background: role === "ROLE_ADMIN" ? "rgba(239,68,68,0.15)" : "rgba(59,130,246,0.15)",
                    color: role === "ROLE_ADMIN" ? "#ef4444" : "#3b82f6",
                    textTransform: "uppercase"
                  }}>
                    {role.replace("ROLE_", "")}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: 16 }}>
          {[
            { label: "My Bookings", icon: "📅", path: "/dashboard/bookings", color: "#4f6fff", protected: true },
            { label: "Incidents", icon: "🔧", path: "/dashboard/incidents", color: "#ff5b8d", protected: true },
            { label: "Resources", icon: "🏛️", path: "/dashboard/resources", color: "#00e5c3", protected: false },
            ...(user?.roles?.includes("ROLE_ADMIN") ? [
              { label: "Admin Panel", icon: "⚙️", path: "/admin", color: "#f59e0b", protected: true }
            ] : [])
          ]
          .filter(item => !item.protected || isAuthenticated) // Show only public items or if logged in
          .map(item => (
            <button 
              key={item.label} 
              onClick={() => navigate(item.path)} 
              style={{
                background: "rgba(13,17,32,0.9)",
                border: `1px solid ${item.color}33`,
                borderRadius: 12, padding: "24px 16px",
                cursor: "pointer", textAlign: "center",
                transition: "all 0.2s", color: item.color,
                outline: "none"
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.background = "rgba(13,17,32,1)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.background = "rgba(13,17,32,0.9)";
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 12 }}>{item.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{item.label}</div>
            </button>
          ))}
        </div>
        
        {/* Guest CTA */}
        {!isAuthenticated && (
          <div style={{ 
            marginTop: 40, padding: 20, borderRadius: 12, 
            background: "rgba(79, 111, 255, 0.05)", border: "1px dashed rgba(79, 111, 255, 0.3)",
            textAlign: "center" 
          }}>
            <p style={{ color: "#e8ecff", margin: "0 0 12px 0" }}>Want to see your personal bookings?</p>
            <button 
              onClick={() => navigate("/login")}
              style={{ 
                background: "#4f6fff", color: "white", border: "none", 
                padding: "10px 24px", borderRadius: 8, fontWeight: 600, cursor: "pointer" 
              }}
            >
              Login to Account
            </button>
          </div>
        )}
      </div>
    </div>
  );
}