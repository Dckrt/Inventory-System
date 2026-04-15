import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch, getUser } from "../services/api";

const CATEGORIES = ["Tea Base", "Milk", "Sweetener", "Topping", "Supplies", "Other"];

export default function Setup() {
  const [templates, setTemplates] = useState([]);
  const [selected, setSelected] = useState([]);
  const [step, setStep] = useState(1); // 1=select, 2=stock, 3=done
  const [loading, setLoading] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customUnit, setCustomUnit] = useState("g");
  const [customCat, setCustomCat] = useState("Other");
  const [filterCat, setFilterCat] = useState("All");
  const navigate = useNavigate();
  const user = getUser();

  useEffect(() => {
    apiFetch("/ingredient-templates").then(data => setTemplates(data || []));
  }, []);

  const toggle = (t) => {
    const exists = selected.find(s => s.name === t.name);
    if (exists) {
      setSelected(selected.filter(s => s.name !== t.name));
    } else {
      setSelected([...selected, {
        name: t.name,
        unit: t.unit,
        category: t.category,
        stock: 0,
        reorder_level: t.default_reorder || 10
      }]);
    }
  };

  const addCustom = () => {
    if (!customName.trim()) return;
    if (selected.find(s => s.name === customName)) return alert("Already added!");
    setSelected([...selected, {
      name: customName,
      unit: customUnit,
      category: customCat,
      stock: 0,
      reorder_level: 10
    }]);
    setCustomName("");
  };

  const updateStock = (index, value) => {
    const updated = [...selected];
    updated[index].stock = parseFloat(value) || 0;
    setSelected(updated);
  };

  const updateReorder = (index, value) => {
    const updated = [...selected];
    updated[index].reorder_level = parseFloat(value) || 5;
    setSelected(updated);
  };

  const save = async () => {
    if (selected.length === 0) return alert("Please select at least one ingredient.");
    setLoading(true);
    const data = await apiFetch("/setup", {
      method: "POST",
      body: JSON.stringify({ ingredients: selected })
    });
    setLoading(false);
    if (data.status === "setup_complete") {
      // Update local shop info
      const shop = JSON.parse(localStorage.getItem("shop") || "{}");
      localStorage.setItem("shop", JSON.stringify({ ...shop, is_setup: 1 }));
      setStep(3);
      setTimeout(() => navigate("/dashboard"), 1500);
    }
  };

  const filtered = filterCat === "All" ? templates : templates.filter(t => t.category === filterCat);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0D0D12",
      fontFamily: "'DM Sans', sans-serif",
      padding: "40px 20px"
    }}>
      {/* Header */}
      <div style={{ maxWidth: "800px", margin: "0 auto 32px", textAlign: "center" }}>
        <div style={{ fontSize: "48px", marginBottom: "12px" }}>🧋</div>
        <h1 style={{
          color: "#fff", fontSize: "32px", fontWeight: "700",
          fontFamily: "'Playfair Display', serif", margin: "0 0 8px"
        }}>
          Set Up Your Shop
        </h1>
        <p style={{ color: "#556", fontSize: "15px" }}>
          Hi <strong style={{ color: "#D50036" }}>{user.username}</strong>! Before you start,
          let's set up the ingredients your shop uses.
        </p>

        {/* Steps */}
        <div style={{ display: "flex", justifyContent: "center", gap: "0", marginTop: "24px" }}>
          {["Select Ingredients", "Set Stock Levels", "Done!"].map((s, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center" }}>
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: "4px"
              }}>
                <div style={{
                  width: "32px", height: "32px", borderRadius: "50%",
                  background: step > i + 1 ? "#22cc77" : step === i + 1 ? "#D50036" : "#ffffff18",
                  color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "13px", fontWeight: "600"
                }}>
                  {step > i + 1 ? "✓" : i + 1}
                </div>
                <span style={{ color: step === i + 1 ? "#fff" : "#556", fontSize: "11px", whiteSpace: "nowrap" }}>
                  {s}
                </span>
              </div>
              {i < 2 && <div style={{ width: "60px", height: "1px", background: "#ffffff18", margin: "0 8px 16px" }} />}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1 - Select */}
      {step === 1 && (
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          {/* Category Filter */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "20px" }}>
            {["All", ...CATEGORIES].map(cat => (
              <button key={cat} onClick={() => setFilterCat(cat)} style={{
                padding: "6px 14px",
                background: filterCat === cat ? "#D50036" : "#ffffff0a",
                color: filterCat === cat ? "#fff" : "#8888aa",
                border: "1px solid " + (filterCat === cat ? "#D50036" : "#ffffff18"),
                borderRadius: "20px", cursor: "pointer", fontSize: "13px"
              }}>{cat}</button>
            ))}
          </div>

          {/* Templates Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: "10px",
            marginBottom: "24px"
          }}>
            {filtered.map(t => {
              const isSelected = !!selected.find(s => s.name === t.name);
              return (
                <div key={t.id} onClick={() => toggle(t)} style={{
                  padding: "14px",
                  background: isSelected ? "#D5003620" : "#13131A",
                  border: `1px solid ${isSelected ? "#D50036" : "#ffffff10"}`,
                  borderRadius: "12px",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}>
                  <div style={{ color: isSelected ? "#fff" : "#aaa", fontSize: "14px", fontWeight: "500" }}>
                    {t.name}
                  </div>
                  <div style={{ color: "#556", fontSize: "11px", marginTop: "4px" }}>
                    {t.unit} · {t.category}
                  </div>
                  {isSelected && <div style={{ color: "#D50036", fontSize: "11px", marginTop: "4px" }}>✓ Selected</div>}
                </div>
              );
            })}
          </div>

          {/* Add Custom */}
          <div style={{
            background: "#13131A",
            border: "1px solid #ffffff10",
            borderRadius: "16px",
            padding: "20px",
            marginBottom: "24px"
          }}>
            <h4 style={{ color: "#fff", margin: "0 0 14px", fontSize: "14px" }}>
              ➕ Add Custom Ingredient
            </h4>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <input
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                placeholder="Ingredient name"
                style={{
                  flex: 1, minWidth: "140px",
                  padding: "10px 14px",
                  background: "#0D0D12",
                  border: "1px solid #ffffff18",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "13px",
                  outline: "none"
                }}
              />
              <select value={customUnit} onChange={e => setCustomUnit(e.target.value)} style={{
                padding: "10px 12px", background: "#0D0D12",
                border: "1px solid #ffffff18", borderRadius: "8px",
                color: "#fff", fontSize: "13px", cursor: "pointer"
              }}>
                {["ml", "g", "pc", "L", "kg"].map(u => <option key={u}>{u}</option>)}
              </select>
              <select value={customCat} onChange={e => setCustomCat(e.target.value)} style={{
                padding: "10px 12px", background: "#0D0D12",
                border: "1px solid #ffffff18", borderRadius: "8px",
                color: "#fff", fontSize: "13px", cursor: "pointer"
              }}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <button onClick={addCustom} style={{
                padding: "10px 20px",
                background: "#D50036",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "600"
              }}>Add</button>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ color: "#556", fontSize: "13px" }}>
              {selected.length} ingredient{selected.length !== 1 ? "s" : ""} selected
            </span>
            <button
              disabled={selected.length === 0}
              onClick={() => setStep(2)}
              style={{
                padding: "12px 28px",
                background: selected.length > 0 ? "linear-gradient(135deg, #D50036, #8B0024)" : "#333",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                cursor: selected.length > 0 ? "pointer" : "not-allowed",
                fontSize: "14px",
                fontWeight: "600"
              }}>
              Next: Set Stock Levels →
            </button>
          </div>
        </div>
      )}

      {/* Step 2 - Stock levels */}
      {step === 2 && (
        <div style={{ maxWidth: "700px", margin: "0 auto" }}>
          <p style={{ color: "#556", fontSize: "14px", marginBottom: "20px" }}>
            Set your current stock and reorder alert levels. You can always update these later.
          </p>

          <div style={{
            background: "#13131A",
            border: "1px solid #ffffff10",
            borderRadius: "16px",
            overflow: "hidden",
            marginBottom: "24px"
          }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 120px 120px",
              gap: "0",
              padding: "12px 20px",
              borderBottom: "1px solid #ffffff0f",
              color: "#556",
              fontSize: "12px",
              letterSpacing: "0.5px"
            }}>
              <span>INGREDIENT</span>
              <span>CURRENT STOCK</span>
              <span>REORDER AT</span>
            </div>

            {selected.map((ing, index) => (
              <div key={index} style={{
                display: "grid",
                gridTemplateColumns: "1fr 120px 120px",
                gap: "0",
                padding: "12px 20px",
                borderBottom: "1px solid #ffffff08",
                alignItems: "center"
              }}>
                <div>
                  <div style={{ color: "#fff", fontSize: "14px" }}>{ing.name}</div>
                  <div style={{ color: "#556", fontSize: "11px" }}>{ing.unit} · {ing.category}</div>
                </div>
                <input
                  type="number"
                  value={ing.stock}
                  onChange={e => updateStock(index, e.target.value)}
                  style={{
                    width: "90px",
                    padding: "8px",
                    background: "#0D0D12",
                    border: "1px solid #ffffff18",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "13px",
                    outline: "none"
                  }}
                />
                <input
                  type="number"
                  value={ing.reorder_level}
                  onChange={e => updateReorder(index, e.target.value)}
                  style={{
                    width: "90px",
                    padding: "8px",
                    background: "#0D0D12",
                    border: "1px solid #ffffff18",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "13px",
                    outline: "none"
                  }}
                />
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <button onClick={() => setStep(1)} style={{
              padding: "12px 24px",
              background: "transparent",
              color: "#8888aa",
              border: "1px solid #ffffff18",
              borderRadius: "10px",
              cursor: "pointer",
              fontSize: "14px"
            }}>← Back</button>
            <button onClick={save} disabled={loading} style={{
              padding: "12px 28px",
              background: "linear-gradient(135deg, #D50036, #8B0024)",
              color: "#fff",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
              boxShadow: "0 4px 20px #D5003644"
            }}>
              {loading ? "Saving..." : "Complete Setup ✓"}
            </button>
          </div>
        </div>
      )}

      {/* Step 3 - Done */}
      {step === 3 && (
        <div style={{ maxWidth: "400px", margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: "64px", marginBottom: "20px" }}>🎉</div>
          <h2 style={{ color: "#fff", fontFamily: "'Playfair Display', serif" }}>
            You're all set!
          </h2>
          <p style={{ color: "#556" }}>Redirecting to your dashboard...</p>
        </div>
      )}
    </div>
  );
}