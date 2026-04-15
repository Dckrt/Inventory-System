import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { apiFetch, getShop, getUser } from "../services/api";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ username: "", password: "", role: "staff" });
  const shop = getShop();
  const currentUser = getUser();
  const themeColor = shop.theme_color || "#D50036";

  const load = () => apiFetch("/users").then(d => setUsers(d || []));
  useEffect(load, []);

  const add = async () => {
    if (!form.username || !form.password) return alert("Fill in all fields.");
    const res = await apiFetch("/users", {
      method: "POST",
      body: JSON.stringify(form)
    });
    if (res.status === "created") {
      setForm({ username: "", password: "", role: "staff" });
      setShowAdd(false);
      load();
    } else {
      alert(res.message || "Could not create user.");
    }
  };

  const del = async (id) => {
    if (id === currentUser.id) return alert("You cannot delete your own account!");
    if (!window.confirm("Delete this user?")) return;
    await apiFetch(`/users/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <Layout title="User Management">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <p style={{ color: "#8888aa", fontSize: "14px", margin: 0 }}>
          Manage staff accounts for <strong style={{ color: "#fff" }}>{shop.name}</strong>
        </p>
        <button onClick={() => setShowAdd(!showAdd)} style={{
          padding: "10px 20px",
          background: themeColor,
          color: "#fff",
          border: "none",
          borderRadius: "10px",
          cursor: "pointer",
          fontSize: "14px",
          fontWeight: "600"
        }}>+ Add User</button>
      </div>

      {showAdd && (
        <div style={{
          background: "#13131A",
          border: `1px solid ${themeColor}44`,
          borderRadius: "14px",
          padding: "20px",
          marginBottom: "20px",
          display: "flex",
          gap: "12px",
          alignItems: "flex-end",
          flexWrap: "wrap"
        }}>
          {[
            { label: "USERNAME", field: "username", placeholder: "staffname" },
            { label: "PASSWORD", field: "password", placeholder: "password", type: "password" },
          ].map(f => (
            <div key={f.field} style={{ flex: 1, minWidth: "160px" }}>
              <label style={{ color: "#556", fontSize: "11px", display: "block", marginBottom: "5px" }}>{f.label}</label>
              <input
                type={f.type || "text"}
                value={form[f.field]}
                placeholder={f.placeholder}
                onChange={e => setForm({ ...form, [f.field]: e.target.value })}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: "#0D0D12",
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
          <div style={{ minWidth: "120px" }}>
            <label style={{ color: "#556", fontSize: "11px", display: "block", marginBottom: "5px" }}>ROLE</label>
            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} style={{
              width: "100%",
              padding: "10px 12px",
              background: "#0D0D12",
              border: "1px solid #ffffff18",
              borderRadius: "8px",
              color: "#fff",
              fontSize: "13px",
              cursor: "pointer"
            }}>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button onClick={add} style={{
            padding: "10px 22px",
            background: themeColor,
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600"
          }}>Create</button>
          <button onClick={() => setShowAdd(false)} style={{
            padding: "10px 16px",
            background: "transparent",
            color: "#8888aa",
            border: "1px solid #ffffff18",
            borderRadius: "8px",
            cursor: "pointer"
          }}>Cancel</button>
        </div>
      )}

      <div style={{
        background: "#13131A",
        border: "1px solid #ffffff0f",
        borderRadius: "16px",
        overflow: "hidden"
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #ffffff0f" }}>
              {["Username", "Role", "Joined", "Actions"].map(h => (
                <th key={h} style={{
                  padding: "14px 20px",
                  color: "#8888aa",
                  fontSize: "11px",
                  letterSpacing: "0.8px",
                  textAlign: "left",
                  fontWeight: "500"
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: "1px solid #ffffff06" }}
                onMouseEnter={e => e.currentTarget.style.background = "#ffffff04"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <td style={{ padding: "16px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{
                      width: "34px", height: "34px",
                      background: u.role === "admin" ? `${themeColor}33` : "#ffffff0f",
                      borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "14px"
                    }}>
                      {u.role === "admin" ? "👑" : "👤"}
                    </div>
                    <div>
                      <div style={{ color: "#fff", fontSize: "14px", fontWeight: "500" }}>
                        {u.username}
                        {u.id === currentUser.id && (
                          <span style={{
                            marginLeft: "8px",
                            padding: "2px 8px",
                            background: themeColor + "33",
                            color: themeColor,
                            borderRadius: "10px",
                            fontSize: "10px"
                          }}>You</span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "16px 20px" }}>
                  <span style={{
                    padding: "4px 12px",
                    background: u.role === "admin" ? themeColor + "22" : "#ffffff0a",
                    color: u.role === "admin" ? themeColor : "#8888aa",
                    border: `1px solid ${u.role === "admin" ? themeColor + "44" : "#ffffff18"}`,
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: "500",
                    textTransform: "capitalize"
                  }}>{u.role}</span>
                </td>
                <td style={{ padding: "16px 20px", color: "#8888aa", fontSize: "12px" }}>
                  {new Date(u.created_at).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" })}
                </td>
                <td style={{ padding: "16px 20px" }}>
                  {u.id !== currentUser.id && (
                    <button onClick={() => del(u.id)} style={{
                      padding: "6px 14px",
                      background: "#ff4b4b18",
                      color: "#ff6b6b",
                      border: "1px solid #ff4b4b33",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "12px"
                    }}>Remove</button>
                  )}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: "40px", textAlign: "center", color: "#556" }}>
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}