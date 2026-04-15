import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { apiFetch, getUser, getShop } from "../services/api";

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", stock: "", unit: "ml", reorder_level: 10, category: "Other" });
  const [stockModal, setStockModal] = useState(null); // { item, type: 'in'|'out' }
  const [stockQty, setStockQty] = useState("1");
  const user = getUser();
  const shop = getShop();
  const themeColor = shop.theme_color || "#D50036";

  const load = () => apiFetch("/ingredients").then(d => setItems(d || []));
  useEffect(() => { load(); }, []);

  const categories = ["All", ...new Set(items.map(i => i.category).filter(Boolean))];

  const filtered = items.filter(i => {
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === "All" || i.category === filterCat;
    return matchSearch && matchCat;
  });

  const addIngredient = async () => {
    if (!form.name) return alert("Enter ingredient name.");
    await apiFetch("/ingredients", {
      method: "POST",
      body: JSON.stringify(form)
    });
    setForm({ name: "", stock: "", unit: "ml", reorder_level: 10, category: "Other" });
    setShowAdd(false);
    load();
  };

  const doStock = async () => {
    const qty = parseFloat(stockQty);
    if (!qty || qty <= 0) return alert("Enter valid quantity.");
    const endpoint = stockModal.type === "in"
      ? `/ingredients/${stockModal.item.id}/stock-in`
      : `/ingredients/${stockModal.item.id}/stock-out`;

    const res = await apiFetch(endpoint, {
      method: "POST",
      body: JSON.stringify({ quantity: qty })
    });
    if (res.message) return alert(res.message);
    setStockModal(null);
    setStockQty("1");
    load();
  };

  const deleteItem = async (id) => {
    if (!window.confirm("Delete this ingredient?")) return;
    await apiFetch(`/ingredients/${id}`, { method: "DELETE" });
    load();
  };

  const stockStatus = (item) => {
    if (item.stock === 0) return { color: "#ff6b6b", label: "Out of Stock" };
    if (item.stock <= item.reorder_level) return { color: "#ffaa44", label: "Low Stock" };
    return { color: "#22cc77", label: "In Stock" };
  };

  return (
    <Layout title="Inventory">
      {/* Toolbar */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        <input
          placeholder="🔍 Search ingredients..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1, minWidth: "200px",
            padding: "10px 16px",
            background: "#13131A",
            border: "1px solid #ffffff18",
            borderRadius: "10px",
            color: "#fff",
            fontSize: "14px",
            outline: "none"
          }}
        />
        {user.role === "admin" && (
          <button onClick={() => setShowAdd(!showAdd)} style={{
            padding: "10px 20px",
            background: themeColor,
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "600"
          }}>
            + Add Ingredient
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setFilterCat(cat)} style={{
            padding: "6px 14px",
            background: filterCat === cat ? themeColor : "#ffffff0a",
            color: filterCat === cat ? "#fff" : "#8888aa",
            border: `1px solid ${filterCat === cat ? themeColor : "#ffffff18"}`,
            borderRadius: "20px", cursor: "pointer", fontSize: "12px"
          }}>{cat}</button>
        ))}
      </div>

      {/* Add Form */}
      {showAdd && (
        <div style={{
          background: "#13131A",
          border: `1px solid ${themeColor}44`,
          borderRadius: "16px",
          padding: "20px",
          marginBottom: "20px",
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr auto",
          gap: "12px",
          alignItems: "end"
        }}>
          {[
            { label: "NAME", field: "name", placeholder: "e.g. Black Tea" },
            { label: "STOCK", field: "stock", placeholder: "0", type: "number" },
            { label: "UNIT", field: "unit", placeholder: "ml" },
            { label: "REORDER AT", field: "reorder_level", placeholder: "10", type: "number" },
            { label: "CATEGORY", field: "category", placeholder: "Other" },
          ].map(f => (
            <div key={f.field}>
              <label style={{ color: "#556", fontSize: "11px", display: "block", marginBottom: "4px" }}>{f.label}</label>
              <input
                type={f.type || "text"}
                value={form[f.field]}
                placeholder={f.placeholder}
                onChange={e => setForm({ ...form, [f.field]: e.target.value })}
                style={{
                  width: "100%",
                  padding: "9px 12px",
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
          <button onClick={addIngredient} style={{
            padding: "9px 18px",
            background: themeColor,
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600"
          }}>Add</button>
        </div>
      )}

      {/* Table */}
      <div style={{
        background: "#13131A",
        border: "1px solid #ffffff0f",
        borderRadius: "16px",
        overflow: "hidden"
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #ffffff0f" }}>
              {["Ingredient", "Category", "Stock", "Reorder At", "Status", "Actions"].map(h => (
                <th key={h} style={{
                  padding: "14px 16px",
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
            {filtered.map(item => {
              const status = stockStatus(item);
              return (
                <tr key={item.id} style={{ borderBottom: "1px solid #ffffff06" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#ffffff04"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "14px 16px", color: "#fff", fontSize: "14px" }}>{item.name}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{
                      padding: "3px 10px",
                      background: "#ffffff0a",
                      borderRadius: "20px",
                      color: "#8888aa",
                      fontSize: "12px"
                    }}>{item.category}</span>
                  </td>
                  <td style={{ padding: "14px 16px", color: "#fff", fontSize: "14px", fontWeight: "600" }}>
                    {item.stock} <span style={{ color: "#556", fontSize: "11px", fontWeight: "400" }}>{item.unit}</span>
                  </td>
                  <td style={{ padding: "14px 16px", color: "#8888aa", fontSize: "13px" }}>
                    {item.reorder_level} {item.unit}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{
                      padding: "4px 10px",
                      background: status.color + "22",
                      color: status.color,
                      borderRadius: "20px",
                      fontSize: "11px",
                      fontWeight: "600"
                    }}>{status.label}</span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button onClick={() => { setStockModal({ item, type: "in" }); setStockQty("1"); }} style={{
                        padding: "5px 12px",
                        background: "#22cc7722",
                        color: "#22cc77",
                        border: "1px solid #22cc7744",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "12px"
                      }}>+ IN</button>
                      <button onClick={() => { setStockModal({ item, type: "out" }); setStockQty("1"); }} style={{
                        padding: "5px 12px",
                        background: "#ffaa4422",
                        color: "#ffaa44",
                        border: "1px solid #ffaa4444",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontSize: "12px"
                      }}>- OUT</button>
                      {user.role === "admin" && (
                        <button onClick={() => deleteItem(item.id)} style={{
                          padding: "5px 12px",
                          background: "#ff4b4b18",
                          color: "#ff6b6b",
                          border: "1px solid #ff4b4b33",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "12px"
                        }}>Del</button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "#556" }}>
                  No ingredients found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Stock Modal */}
      {stockModal && (
        <div style={{
          position: "fixed", inset: 0,
          background: "#000000aa",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: "#13131A",
            border: "1px solid #ffffff18",
            borderRadius: "16px",
            padding: "28px",
            width: "320px"
          }}>
            <h3 style={{ color: "#fff", margin: "0 0 6px", fontFamily: "'Playfair Display', serif" }}>
              {stockModal.type === "in" ? "📦 Stock In" : "📤 Stock Out"}
            </h3>
            <p style={{ color: "#8888aa", fontSize: "13px", marginBottom: "20px" }}>
              {stockModal.item.name} · Current: {stockModal.item.stock} {stockModal.item.unit}
            </p>
            <label style={{ color: "#556", fontSize: "12px", display: "block", marginBottom: "6px" }}>
              QUANTITY ({stockModal.item.unit})
            </label>
            <input
              type="number"
              value={stockQty}
              onChange={e => setStockQty(e.target.value)}
              autoFocus
              style={{
                width: "100%",
                padding: "12px",
                background: "#0D0D12",
                border: "1px solid #ffffff18",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "16px",
                outline: "none",
                boxSizing: "border-box",
                marginBottom: "20px"
              }}
            />
            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setStockModal(null)} style={{
                flex: 1, padding: "11px",
                background: "transparent",
                border: "1px solid #ffffff18",
                color: "#8888aa",
                borderRadius: "8px",
                cursor: "pointer"
              }}>Cancel</button>
              <button onClick={doStock} style={{
                flex: 1, padding: "11px",
                background: stockModal.type === "in" ? "#22cc77" : "#ffaa44",
                border: "none",
                color: "#000",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600"
              }}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}