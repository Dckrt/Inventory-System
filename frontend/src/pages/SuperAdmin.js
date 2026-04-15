import { useState, useEffect } from "react";
import { apiFetch } from "../services/api";

export default function SuperAdmin() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [shops, setShops] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ shop_name: "", admin_username: "", admin_password: "", theme_color: "#D50036", logo_text: "" });
  const [loading, setLoading] = useState(false);
  const [selectedShop, setSelectedShop] = useState(null);
  const [shopDetail, setShopDetail] = useState(null);

  const saToken = localStorage.getItem("sa_token");

  useEffect(() => {
    if (saToken) {
      setLoggedIn(true);
      loadShops();
    }
  }, []);

  const login = async () => {
    setLoginError("");
    const res = await fetch("http://localhost:5000/superadmin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    }).then(r => r.json());

    if (res.status === "success") {
      localStorage.setItem("sa_token", res.token);
      setLoggedIn(true);
      loadShops();
    } else {
      setLoginError("Invalid credentials.");
    }
  };

  const saFetch = (path, opts = {}) => fetch("http://localhost:5000" + path, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("sa_token")}`,
      ...(opts.headers || {})
    }
  }).then(r => r.json());

  const loadShops = () => saFetch("/superadmin/shops").then(d => setShops(d || []));

  const createShop = async () => {
    if (!form.shop_name || !form.admin_username || !form.admin_password) {
      return alert("Fill in all required fields.");
    }
    setLoading(true);
    const res = await saFetch("/superadmin/shops", {
      method: "POST",
      body: JSON.stringify(form)
    });
    setLoading(false);
    if (res.status === "created") {
      setShowCreate(false);
      setForm({ shop_name: "", admin_username: "", admin_password: "", theme_color: "#D50036", logo_text: "" });
      loadShops();
    } else {
      alert(res.message || "Failed to create shop.");
    }
  };

  const deleteShop = async (id) => {
    if (!window.confirm("Delete this shop and ALL its data? This cannot be undone.")) return;
    await saFetch(`/superadmin/shops/${id}`, { method: "DELETE" });
    loadShops();
  };

  const viewShop = async (id) => {
    setSelectedShop(id);
    const data = await saFetch(`/superadmin/shops/${id}`);
    setShopDetail(data);
  };

  if (!loggedIn) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#0A0A10",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'DM Sans', sans-serif"
      }}>
        <div style={{
          background: "#13131A",
          border: "1px solid #ffffff12",
          borderRadius: "20px",
          padding: "36px",
          width: "360px"
        }}>
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <div style={{ fontSize: "40px", marginBottom: "10px" }}>🔐</div>
            <h2 style={{ color: "#fff", margin: 0, fontFamily: "'Playfair Display', serif" }}>
              Super Admin
            </h2>
            <p style={{ color: "#556", fontSize: "13px", margin: "6px 0 0" }}>
              System administrator access
            </p>
          </div>

          {loginError && (
            <div style={{
              background: "#ff4b4b18",
              border: "1px solid #ff4b4b44",
              color: "#ff8080",
              padding: "10px 14px",
              borderRadius: "8px",
              fontSize: "13px",
              marginBottom: "16px"
            }}>⚠️ {loginError}</div>
          )}

          {[
            { label: "USERNAME", value: username, onChange: setUsername, placeholder: "superadmin" },
            { label: "PASSWORD", value: password, onChange: setPassword, placeholder: "••••••••", type: "password" },
          ].map(f => (
            <div key={f.label} style={{ marginBottom: "14px" }}>
              <label style={{ color: "#556", fontSize: "11px", display: "block", marginBottom: "5px" }}>{f.label}</label>
              <input
                type={f.type || "text"}
                value={f.value}
                placeholder={f.placeholder}
                onChange={e => f.onChange(e.target.value)}
                onKeyDown={e => e.key === "Enter" && login()}
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  background: "#0A0A10",
                  border: "1px solid #ffffff18",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </div>
          ))}

          <button onClick={login} style={{
            width: "100%",
            padding: "13px",
            background: "linear-gradient(135deg, #6644aa, #4422cc)",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "600",
            marginTop: "4px"
          }}>Access Panel →</button>

          <div style={{ textAlign: "center", marginTop: "16px" }}>
            <a href="/" style={{ color: "#444466", fontSize: "12px" }}>← Back to Login</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0A0A10", fontFamily: "'DM Sans', sans-serif", padding: "28px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
        <div>
          <h1 style={{ color: "#fff", margin: 0, fontFamily: "'Playfair Display', serif", fontSize: "26px" }}>
            🔐 Super Admin Panel
          </h1>
          <p style={{ color: "#556", margin: "4px 0 0", fontSize: "13px" }}>
            Manage all milk tea shops in the system
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button onClick={() => setShowCreate(!showCreate)} style={{
            padding: "10px 20px",
            background: "linear-gradient(135deg, #6644aa, #4422cc)",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "14px"
          }}>+ New Shop</button>
          <button onClick={() => {
            localStorage.removeItem("sa_token");
            setLoggedIn(false);
          }} style={{
            padding: "10px 16px",
            background: "#ff4b4b18",
            color: "#ff6b6b",
            border: "1px solid #ff4b4b33",
            borderRadius: "10px",
            cursor: "pointer",
            fontSize: "14px"
          }}>Logout</button>
        </div>
      </div>

      {/* Create Shop Form */}
      {showCreate && (
        <div style={{
          background: "#13131A",
          border: "1px solid #6644aa44",
          borderRadius: "16px",
          padding: "24px",
          marginBottom: "24px"
        }}>
          <h3 style={{ color: "#fff", margin: "0 0 20px", fontFamily: "'Playfair Display', serif" }}>
            ➕ Create New Shop
          </h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "14px" }}>
            {[
              { label: "SHOP NAME *", field: "shop_name", placeholder: "e.g. Boba Paradise" },
              { label: "ADMIN USERNAME *", field: "admin_username", placeholder: "shopadmin" },
              { label: "ADMIN PASSWORD *", field: "admin_password", placeholder: "password", type: "password" },
              { label: "LOGO TEXT", field: "logo_text", placeholder: "Boba Paradise" },
            ].map(f => (
              <div key={f.field}>
                <label style={{ color: "#556", fontSize: "11px", display: "block", marginBottom: "5px" }}>{f.label}</label>
                <input
                  type={f.type || "text"}
                  value={form[f.field]}
                  placeholder={f.placeholder}
                  onChange={e => setForm({ ...form, [f.field]: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    background: "#0A0A10",
                    border: "1px solid #ffffff18",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "13px",
                    outline: "none",
                    boxSizing: "border-box"
                  }}
                />
              </div>
            ))}
            <div>
              <label style={{ color: "#556", fontSize: "11px", display: "block", marginBottom: "5px" }}>THEME COLOR</label>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <input
                  type="color"
                  value={form.theme_color}
                  onChange={e => setForm({ ...form, theme_color: e.target.value })}
                  style={{ width: "40px", height: "40px", border: "none", borderRadius: "8px", cursor: "pointer", background: "none" }}
                />
                <input
                  value={form.theme_color}
                  onChange={e => setForm({ ...form, theme_color: e.target.value })}
                  style={{
                    flex: 1,
                    padding: "10px 12px",
                    background: "#0A0A10",
                    border: "1px solid #ffffff18",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "13px",
                    outline: "none"
                  }}
                />
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <button onClick={createShop} disabled={loading} style={{
              padding: "11px 28px",
              background: "linear-gradient(135deg, #6644aa, #4422cc)",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontWeight: "600"
            }}>{loading ? "Creating..." : "Create Shop"}</button>
            <button onClick={() => setShowCreate(false)} style={{
              padding: "11px 20px",
              background: "transparent",
              color: "#8888aa",
              border: "1px solid #ffffff18",
              borderRadius: "10px",
              cursor: "pointer"
            }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Shops Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "16px"
      }}>
        {shops.map(shop => (
          <div key={shop.id} style={{
            background: "#13131A",
            border: "1px solid #ffffff0f",
            borderRadius: "16px",
            padding: "22px",
            position: "relative",
            overflow: "hidden"
          }}>
            <div style={{
              position: "absolute", top: 0, right: 0,
              width: "80px", height: "80px",
              background: `radial-gradient(circle, ${shop.theme_color}22, transparent)`,
              borderRadius: "0 16px 0 100%"
            }} />

            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
              <div style={{
                width: "40px", height: "40px",
                background: shop.theme_color + "33",
                borderRadius: "12px",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "20px"
              }}>🧋</div>
              <div>
                <div style={{ color: "#fff", fontWeight: "700", fontSize: "15px" }}>{shop.name}</div>
                <div style={{ color: shop.theme_color, fontSize: "11px" }}>
                  {shop.is_setup ? "✓ Setup complete" : "⏳ Pending setup"}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "16px", marginBottom: "16px" }}>
              <div style={{ flex: 1, background: "#0A0A10", borderRadius: "8px", padding: "8px 12px" }}>
                <div style={{ color: "#556", fontSize: "10px" }}>USERS</div>
                <div style={{ color: "#fff", fontSize: "16px", fontWeight: "700" }}>{shop.user_count}</div>
              </div>
              <div style={{ flex: 1, background: "#0A0A10", borderRadius: "8px", padding: "8px 12px" }}>
                <div style={{ color: "#556", fontSize: "10px" }}>INGREDIENTS</div>
                <div style={{ color: "#fff", fontSize: "16px", fontWeight: "700" }}>{shop.ingredient_count}</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => viewShop(shop.id)} style={{
                flex: 1,
                padding: "8px",
                background: "#ffffff0a",
                color: "#8888aa",
                border: "1px solid #ffffff18",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "12px"
              }}>View Details</button>
              <button onClick={() => deleteShop(shop.id)} style={{
                padding: "8px 12px",
                background: "#ff4b4b18",
                color: "#ff6b6b",
                border: "1px solid #ff4b4b33",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "12px"
              }}>🗑</button>
            </div>
          </div>
        ))}
        {shops.length === 0 && (
          <div style={{
            gridColumn: "1/-1",
            textAlign: "center",
            padding: "60px",
            color: "#556",
            background: "#13131A",
            border: "1px dashed #ffffff18",
            borderRadius: "16px"
          }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>🏪</div>
            <p style={{ margin: 0 }}>No shops yet. Create the first one!</p>
          </div>
        )}
      </div>

      {/* Shop Detail Modal */}
      {selectedShop && shopDetail && (
        <div style={{
          position: "fixed", inset: 0,
          background: "#000000cc",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, padding: "20px"
        }}>
          <div style={{
            background: "#13131A",
            border: "1px solid #ffffff18",
            borderRadius: "20px",
            padding: "28px",
            width: "500px",
            maxHeight: "80vh",
            overflowY: "auto"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
              <h3 style={{ color: "#fff", margin: 0, fontFamily: "'Playfair Display', serif" }}>
                {shopDetail.shop?.name}
              </h3>
              <button onClick={() => setSelectedShop(null)} style={{
                background: "none", border: "none", color: "#8888aa",
                cursor: "pointer", fontSize: "20px"
              }}>×</button>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <h4 style={{ color: "#8888aa", fontSize: "12px", letterSpacing: "0.5px", margin: "0 0 10px" }}>USERS</h4>
              {shopDetail.users?.map(u => (
                <div key={u.id} style={{
                  display: "flex", justifyContent: "space-between",
                  padding: "8px 12px",
                  background: "#0D0D12",
                  borderRadius: "8px",
                  marginBottom: "6px"
                }}>
                  <span style={{ color: "#fff", fontSize: "13px" }}>{u.username}</span>
                  <span style={{
                    color: u.role === "admin" ? "#D50036" : "#8888aa",
                    fontSize: "12px", textTransform: "capitalize"
                  }}>{u.role}</span>
                </div>
              ))}
            </div>

            <div>
              <h4 style={{ color: "#8888aa", fontSize: "12px", letterSpacing: "0.5px", margin: "0 0 10px" }}>
                INGREDIENTS ({shopDetail.ingredients?.length || 0})
              </h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {shopDetail.ingredients?.map(i => (
                  <span key={i.id} style={{
                    padding: "4px 10px",
                    background: "#ffffff0a",
                    color: "#aaa",
                    borderRadius: "20px",
                    fontSize: "12px"
                  }}>{i.name}</span>
                ))}
                {shopDetail.ingredients?.length === 0 && (
                  <span style={{ color: "#556", fontSize: "13px" }}>Not set up yet.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}