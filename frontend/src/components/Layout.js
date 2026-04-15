import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getUser, getShop } from "../services/api";

const NAV_ITEMS = [
  { path: "/dashboard", icon: "🧋", label: "Dashboard", roles: ["admin", "staff"] },
  { path: "/pos", icon: "💳", label: "POS", roles: ["admin", "staff"] },
  { path: "/inventory", icon: "📦", label: "Inventory", roles: ["admin", "staff"] },
  { path: "/products", icon: "🍵", label: "Products", roles: ["admin", "staff"] },
  { path: "/sales", icon: "📋", label: "Sales", roles: ["admin", "staff"] },
  { path: "/reports", icon: "📊", label: "Reports", roles: ["admin"] },
  { path: "/users", icon: "👥", label: "Users", roles: ["admin"] },
];

function Layout({ children, title }) {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getUser();
  const shop = getShop();
  const [collapsed, setCollapsed] = useState(false);
  const [themeColor, setThemeColor] = useState(shop.theme_color || "#D50036");

  useEffect(() => {
    document.documentElement.style.setProperty("--brand", shop.theme_color || "#D50036");
    document.documentElement.style.setProperty("--brand-dark",
      shop.theme_color ? shop.theme_color + "cc" : "#a8002a");
    setThemeColor(shop.theme_color || "#D50036");
  }, [shop.theme_color]);

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  const navItems = NAV_ITEMS.filter(n => n.roles.includes(user.role));

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0D0D12", fontFamily: "'DM Sans', sans-serif" }}>

      {/* SIDEBAR */}
      <aside style={{
        width: collapsed ? "70px" : "230px",
        background: "linear-gradient(180deg, #13131A 0%, #0D0D12 100%)",
        borderRight: `1px solid ${themeColor}22`,
        display: "flex",
        flexDirection: "column",
        padding: "0",
        transition: "width 0.3s ease",
        position: "sticky",
        top: 0,
        height: "100vh",
        overflow: "hidden",
        flexShrink: 0,
        zIndex: 100
      }}>
        {/* Logo */}
        <div style={{
          padding: "24px 16px 20px",
          borderBottom: `1px solid ${themeColor}22`,
          display: "flex",
          alignItems: "center",
          gap: "12px",
          cursor: "pointer"
        }} onClick={() => setCollapsed(!collapsed)}>
          <div style={{
            width: "38px", height: "38px",
            background: `linear-gradient(135deg, ${themeColor}, ${themeColor}88)`,
            borderRadius: "12px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "18px", flexShrink: 0,
            boxShadow: `0 4px 15px ${themeColor}44`
          }}>🧋</div>
          {!collapsed && (
            <div>
              <div style={{ color: "#fff", fontWeight: "700", fontSize: "14px", lineHeight: "1.2" }}>
                {shop.logo_text || "MilkTea"}
              </div>
              <div style={{ color: themeColor, fontSize: "10px", letterSpacing: "1px", textTransform: "uppercase" }}>
                Inventory
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "16px 8px", overflowY: "auto" }}>
          {navItems.map(item => {
            const active = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} style={{ textDecoration: "none" }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "11px 12px",
                  borderRadius: "10px",
                  marginBottom: "4px",
                  background: active ? `${themeColor}22` : "transparent",
                  borderLeft: active ? `3px solid ${themeColor}` : "3px solid transparent",
                  color: active ? "#fff" : "#8888aa",
                  fontSize: "14px",
                  fontWeight: active ? "600" : "400",
                  transition: "all 0.2s",
                  whiteSpace: "nowrap"
                }}
                onMouseEnter={e => !active && (e.currentTarget.style.background = "#ffffff0a")}
                onMouseLeave={e => !active && (e.currentTarget.style.background = "transparent")}
                >
                  <span style={{ fontSize: "18px", flexShrink: 0 }}>{item.icon}</span>
                  {!collapsed && item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div style={{
          padding: "12px 8px",
          borderTop: `1px solid ${themeColor}22`
        }}>
          {!collapsed && (
            <div style={{
              padding: "10px 12px",
              background: "#ffffff08",
              borderRadius: "10px",
              marginBottom: "8px"
            }}>
              <div style={{ color: "#fff", fontSize: "13px", fontWeight: "600" }}>
                {user.username}
              </div>
              <div style={{
                color: themeColor,
                fontSize: "11px",
                textTransform: "capitalize",
                letterSpacing: "0.5px"
              }}>
                {user.role} • {shop.name}
              </div>
            </div>
          )}
          <button onClick={logout} style={{
            width: "100%",
            padding: "10px",
            background: "#ff4b4b18",
            color: "#ff6b6b",
            border: "1px solid #ff4b4b33",
            borderRadius: "10px",
            cursor: "pointer",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            gap: "8px"
          }}>
            <span>🚪</span>
            {!collapsed && "Logout"}
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflowX: "hidden"
      }}>
        {/* Header */}
        <div style={{
          padding: "20px 28px",
          borderBottom: "1px solid #ffffff0f",
          background: "#0D0D12",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 50
        }}>
          <h1 style={{
            color: "#fff",
            fontSize: "22px",
            fontWeight: "700",
            margin: 0,
            fontFamily: "'Playfair Display', serif"
          }}>{title}</h1>
          <div style={{
            color: "#555577",
            fontSize: "13px"
          }}>
            {new Date().toLocaleDateString("en-PH", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: "24px 28px", overflowY: "auto" }}>
          {children}
        </div>
      </main>
    </div>
  );
}

export default Layout;