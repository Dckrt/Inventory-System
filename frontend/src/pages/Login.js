import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { apiFetch } from "../services/api";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const themeColor = "#D50036";
  const navigate = useNavigate();
  const location = useLocation();
  const registered = location.state?.registered;
  const registeredShop = location.state?.shopName;

  const login = async () => {
    if (!username || !password) return setError("Please fill in all fields.");
    setLoading(true);
    setError("");

    try {
      const data = await apiFetch("/login", {
        method: "POST",
        body: JSON.stringify({ username, password })
      });

      if (data.status === "success") {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify({
          id: data.id,
          username,
          role: data.role,
          shop_id: data.shop_id
        }));
        localStorage.setItem("shop", JSON.stringify({
          id: data.shop_id,
          name: data.shop_name,
          theme_color: data.theme_color,
          logo_text: data.logo_text,
          is_setup: data.is_setup
        }));

        // First time setup for admins
        if (data.role === "admin" && !data.is_setup) {
          navigate("/setup");
        } else {
          navigate("/dashboard");
        }
      } else {
        setError("Invalid username or password.");
      }
    } catch {
      setError("Cannot connect to server. Is the backend running?");
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0D0D12",
      display: "flex",
      fontFamily: "'DM Sans', sans-serif",
      overflow: "hidden",
      position: "relative"
    }}>
      {/* Background blobs */}
      <div style={{
        position: "absolute", top: "-200px", right: "-200px",
        width: "600px", height: "600px",
        background: "radial-gradient(circle, #D5003622 0%, transparent 70%)",
        borderRadius: "50%", pointerEvents: "none"
      }} />
      <div style={{
        position: "absolute", bottom: "-200px", left: "-100px",
        width: "400px", height: "400px",
        background: "radial-gradient(circle, #8B005522 0%, transparent 70%)",
        borderRadius: "50%", pointerEvents: "none"
      }} />

      {/* Left Panel */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        padding: "60px",
        display: window.innerWidth < 768 ? "none" : "flex"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "80px", marginBottom: "20px" }}>🧋</div>
          <h1 style={{
            color: "#fff",
            fontSize: "42px",
            fontWeight: "800",
            margin: "0 0 12px",
            fontFamily: "'Playfair Display', serif",
            lineHeight: "1.1"
          }}>
            Milk Tea<br />
            <span style={{ color: "#D50036" }}>Inventory</span>
          </h1>
          <p style={{ color: "#556", fontSize: "16px", maxWidth: "300px", lineHeight: "1.6" }}>
            Complete inventory management for your milk tea business
          </p>

          <div style={{ marginTop: "40px", display: "flex", gap: "20px", justifyContent: "center", flexWrap: "wrap" }}>
            {["POS System", "Stock Tracking", "Sales Reports", "Multi-Branch"].map(f => (
              <span key={f} style={{
                padding: "8px 16px",
                background: "#ffffff0a",
                border: "1px solid #ffffff15",
                borderRadius: "20px",
                color: "#8888aa",
                fontSize: "13px"
              }}>{f}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div style={{
        width: "420px",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px",
        background: "#13131A",
        borderLeft: "1px solid #ffffff0f"
      }}>
        <div style={{ width: "100%" }}>
          <div style={{ marginBottom: "36px" }}>
            <h2 style={{
              color: "#fff",
              fontSize: "28px",
              fontWeight: "700",
              margin: "0 0 8px",
              fontFamily: "'Playfair Display', serif"
            }}>Welcome back</h2>
            <p style={{ color: "#556", margin: 0, fontSize: "14px" }}>
              Sign in to manage your shop
            </p>
          </div>

          {registered && (
            <div style={{ background: '#22cc7722', border: '1px solid #22cc7744', color: '#22cc77', padding: '12px 16px', borderRadius: '10px', fontSize: '13px', marginBottom: '20px' }}>
              🎉 Shop <strong>{registeredShop}</strong> created! Sign in with your new account.
            </div>
          )}

          {error && (
            <div style={{
              background: "#ff4b4b18",
              border: "1px solid #ff4b4b44",
              color: "#ff8080",
              padding: "12px 16px",
              borderRadius: "10px",
              fontSize: "13px",
              marginBottom: "20px"
            }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ marginBottom: "16px" }}>
            <label style={{ color: "#8888aa", fontSize: "12px", display: "block", marginBottom: "6px", letterSpacing: "0.5px" }}>
              USERNAME
            </label>
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === "Enter" && login()}
              placeholder="Enter username"
              style={{
                width: "100%",
                padding: "13px 16px",
                background: "#0D0D12",
                border: "1px solid #ffffff18",
                borderRadius: "10px",
                color: "#fff",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.2s"
              }}
              onFocus={e => e.target.style.borderColor = "#D50036"}
              onBlur={e => e.target.style.borderColor = "#ffffff18"}
            />
          </div>

          <div style={{ marginBottom: "28px" }}>
            <label style={{ color: "#8888aa", fontSize: "12px", display: "block", marginBottom: "6px", letterSpacing: "0.5px" }}>
              PASSWORD
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && login()}
                placeholder="Enter password"
                style={{
                  width: "100%",
                  padding: "13px 44px 13px 16px",
                  background: "#0D0D12",
                  border: "1px solid #ffffff18",
                  borderRadius: "10px",
                  color: "#fff",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s"
                }}
                onFocus={e => e.target.style.borderColor = "#D50036"}
                onBlur={e => e.target.style.borderColor = "#ffffff18"}
              />
              <button
                onClick={() => setShowPass(!showPass)}
                style={{
                  position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", color: "#556", cursor: "pointer", fontSize: "16px"
                }}
              >
                {showPass ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          <button
            onClick={login}
            disabled={loading}
            style={{
              width: "100%",
              padding: "14px",
              background: loading ? "#333" : "linear-gradient(135deg, #D50036, #8B0024)",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              fontSize: "15px",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "opacity 0.2s",
              boxShadow: loading ? "none" : "0 4px 20px #D5003644"
            }}
          >
            {loading ? "Signing in..." : "Sign In →"}
          </button>

          <div style={{
            marginTop: "28px",
            paddingTop: "20px",
            borderTop: "1px solid #ffffff0f",
            textAlign: "center"
          }}>
            <Link to="/register" style={{ color: themeColor, fontSize: '13px', textDecoration: 'none', fontWeight: '600' }}>
              Create New Shop
            </Link>
            <span style={{ color: '#333', fontSize: '12px' }}> · </span>
            <a
              href="/superadmin"
              style={{ color: "#444466", fontSize: "12px", textDecoration: "none" }}
            >
              Super Admin Access
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;