import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiFetch } from "../services/api";

const COLORS = [
  { label: "Crimson", value: "#D50036" },
  { label: "Deep Purple", value: "#7C3AED" },
  { label: "Ocean Blue", value: "#0284C7" },
  { label: "Forest Green", value: "#16A34A" },
  { label: "Amber", value: "#D97706" },
  { label: "Hot Pink", value: "#DB2777" },
  { label: "Teal", value: "#0D9488" },
  { label: "Slate", value: "#475569" },
];

export default function Register() {
  const [shopName, setShopName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [themeColor, setThemeColor] = useState("#D50036");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const register = async () => {
    setError("");
    if (!shopName || !username || !password) return setError("All fields are required.");
    if (password !== confirmPass) return setError("Passwords don't match.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");

    setLoading(true);
    try {
      const data = await apiFetch("/register", {
        method: "POST",
        body: JSON.stringify({ shop_name: shopName, username, password, theme_color: themeColor })
      });

      if (data.status === "registered") {
        navigate("/", { state: { registered: true, shopName } });
      } else {
        setError(data.message || "Registration failed. Try again.");
      }
    } catch {
      setError("Cannot connect to server. Is the backend running?");
    }
    setLoading(false);
  };

  const inp = (extra = {}) => ({
    width: "100%",
    padding: "12px 14px",
    background: "#0D0D12",
    border: "1px solid #ffffff18",
    borderRadius: "9px",
    color: "#fff",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
    ...extra
  });

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0D0D12",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'DM Sans', sans-serif",
      padding: "40px 20px",
      position: "relative"
    }}>
      {/* Background blobs */}
      <div style={{ position: "fixed", top: "-150px", left: "-150px", width: "500px", height: "500px", background: `radial-gradient(circle, ${themeColor}15, transparent 70%)`, borderRadius: "50%", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: "-100px", right: "-100px", width: "400px", height: "400px", background: "radial-gradient(circle, #ffffff08, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: "440px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ fontSize: "44px", marginBottom: "10px" }}>🧋</div>
          <h1 style={{ color: "#fff", fontSize: "26px", fontWeight: "700", fontFamily: "'Playfair Display', serif", margin: "0 0 6px" }}>
            Create Your Shop
          </h1>
          <p style={{ color: "#8888aa", fontSize: "14px", margin: 0 }}>
            Set up your milk tea inventory system
          </p>
        </div>

        <div style={{ background: "#13131A", border: "1px solid #ffffff0f", borderRadius: "20px", padding: "28px" }}>
          {error && (
            <div style={{ background: "#ff4b4b18", border: "1px solid #ff4b4b44", color: "#ff8080", padding: "11px 14px", borderRadius: "9px", fontSize: "13px", marginBottom: "18px" }}>
              ⚠️ {error}
            </div>
          )}

          {/* Shop Name */}
          <div style={{ marginBottom: "14px" }}>
            <label style={{ color: "#8888aa", fontSize: "11px", letterSpacing: "0.6px", display: "block", marginBottom: "6px" }}>SHOP NAME</label>
            <input
              value={shopName}
              onChange={e => setShopName(e.target.value)}
              placeholder="e.g. Boba Paradise, Tea Haven..."
              style={inp()}
              onFocus={e => e.target.style.borderColor = themeColor}
              onBlur={e => e.target.style.borderColor = "#ffffff18"}
            />
          </div>

          {/* Theme Color */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ color: "#8888aa", fontSize: "11px", letterSpacing: "0.6px", display: "block", marginBottom: "8px" }}>BRAND COLOR</label>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {COLORS.map(c => (
                <button
                  key={c.value}
                  onClick={() => setThemeColor(c.value)}
                  title={c.label}
                  style={{
                    width: "32px", height: "32px",
                    background: c.value,
                    border: themeColor === c.value ? "3px solid #fff" : "3px solid transparent",
                    borderRadius: "50%",
                    cursor: "pointer",
                    transition: "transform 0.15s, border-color 0.15s",
                    transform: themeColor === c.value ? "scale(1.15)" : "scale(1)"
                  }}
                />
              ))}
              <input
                type="color"
                value={themeColor}
                onChange={e => setThemeColor(e.target.value)}
                title="Custom color"
                style={{
                  width: "32px", height: "32px",
                  border: "2px dashed #ffffff33",
                  borderRadius: "50%",
                  cursor: "pointer",
                  background: "transparent",
                  padding: "0"
                }}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
              <div style={{ width: "16px", height: "16px", borderRadius: "4px", background: themeColor, flexShrink: 0 }} />
              <span style={{ color: "#8888aa", fontSize: "12px" }}>Preview: </span>
              <span style={{ color: themeColor, fontSize: "13px", fontWeight: "600" }}>{shopName || "Your Shop Name"}</span>
            </div>
          </div>

          {/* Divider */}
          <div style={{ borderTop: "1px solid #ffffff0f", margin: "16px 0" }} />

          {/* Username */}
          <div style={{ marginBottom: "14px" }}>
            <label style={{ color: "#8888aa", fontSize: "11px", letterSpacing: "0.6px", display: "block", marginBottom: "6px" }}>ADMIN USERNAME</label>
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Choose a username"
              style={inp()}
              onFocus={e => e.target.style.borderColor = themeColor}
              onBlur={e => e.target.style.borderColor = "#ffffff18"}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: "14px" }}>
            <label style={{ color: "#8888aa", fontSize: "11px", letterSpacing: "0.6px", display: "block", marginBottom: "6px" }}>PASSWORD</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                style={inp({ paddingRight: "44px" })}
                onFocus={e => e.target.style.borderColor = themeColor}
                onBlur={e => e.target.style.borderColor = "#ffffff18"}
              />
              <button onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "#556", cursor: "pointer", fontSize: "15px" }}>
                {showPass ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div style={{ marginBottom: "22px" }}>
            <label style={{ color: "#8888aa", fontSize: "11px", letterSpacing: "0.6px", display: "block", marginBottom: "6px" }}>CONFIRM PASSWORD</label>
            <input
              type="password"
              value={confirmPass}
              onChange={e => setConfirmPass(e.target.value)}
              onKeyDown={e => e.key === "Enter" && register()}
              placeholder="Re-enter password"
              style={inp({
                borderColor: confirmPass && confirmPass !== password ? "#ff4b4b" : "#ffffff18"
              })}
              onFocus={e => e.target.style.borderColor = confirmPass !== password ? "#ff4b4b" : themeColor}
              onBlur={e => e.target.style.borderColor = confirmPass && confirmPass !== password ? "#ff4b4b" : "#ffffff18"}
            />
            {confirmPass && confirmPass !== password && (
              <p style={{ color: "#ff6b6b", fontSize: "11px", margin: "5px 0 0" }}>Passwords don't match</p>
            )}
          </div>

          <button onClick={register} disabled={loading} style={{
            width: "100%",
            padding: "13px",
            background: loading ? "#333" : `linear-gradient(135deg, ${themeColor}, ${themeColor}99)`,
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            fontSize: "15px",
            fontWeight: "600",
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: loading ? "none" : `0 4px 20px ${themeColor}44`,
            marginBottom: "16px"
          }}>
            {loading ? "Creating your shop..." : "Create Shop & Account →"}
          </button>

          <div style={{ textAlign: "center" }}>
            <span style={{ color: "#556", fontSize: "13px" }}>Already have an account? </span>
            <Link to="/" style={{ color: themeColor, fontSize: "13px", textDecoration: "none", fontWeight: "600" }}>
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}