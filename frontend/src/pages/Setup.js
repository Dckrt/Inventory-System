import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch, getUser } from "../services/api";

const DRINK_TYPES = [
  {
    id: "milk_tea", label: "Milk Tea", emoji: "🧋",
    ingredients: [
      { name: "Black Tea", unit: "ml", category: "Tea Base", default_reorder: 500 },
      { name: "Oolong Tea", unit: "ml", category: "Tea Base", default_reorder: 500 },
      { name: "Jasmine Tea", unit: "ml", category: "Tea Base", default_reorder: 500 },
      { name: "Taro Powder", unit: "g", category: "Tea Base", default_reorder: 200 },
      { name: "Matcha Powder", unit: "g", category: "Tea Base", default_reorder: 200 },
      { name: "Brown Sugar", unit: "g", category: "Sweetener", default_reorder: 300 },
      { name: "Fresh Milk", unit: "ml", category: "Milk", default_reorder: 1000 },
      { name: "Evaporated Milk", unit: "ml", category: "Milk", default_reorder: 500 },
      { name: "Creamer", unit: "g", category: "Milk", default_reorder: 300 },
      { name: "Tapioca Pearls", unit: "g", category: "Topping", default_reorder: 500 },
      { name: "Nata de Coco", unit: "g", category: "Topping", default_reorder: 200 },
      { name: "Pudding", unit: "g", category: "Topping", default_reorder: 200 },
      { name: "Cheese Foam", unit: "ml", category: "Topping", default_reorder: 200 },
      { name: "Fructose", unit: "ml", category: "Sweetener", default_reorder: 300 },
    ]
  },
  {
    id: "ice_series", label: "Ice Series", emoji: "🧊",
    ingredients: [
      { name: "Crushed Ice", unit: "g", category: "Base", default_reorder: 1000 },
      { name: "Ice Cream (Vanilla)", unit: "g", category: "Base", default_reorder: 500 },
      { name: "Ice Cream (Chocolate)", unit: "g", category: "Base", default_reorder: 500 },
      { name: "Chocolate Powder", unit: "g", category: "Base", default_reorder: 300 },
      { name: "Strawberry Syrup", unit: "ml", category: "Syrup", default_reorder: 300 },
      { name: "Mango Syrup", unit: "ml", category: "Syrup", default_reorder: 300 },
      { name: "Condensed Milk", unit: "ml", category: "Milk", default_reorder: 500 },
      { name: "Caramel Syrup", unit: "ml", category: "Syrup", default_reorder: 200 },
      { name: "Popping Boba", unit: "g", category: "Topping", default_reorder: 200 },
      { name: "Grass Jelly", unit: "g", category: "Topping", default_reorder: 200 },
    ]
  },
  {
    id: "frappe", label: "Frappe", emoji: "☕",
    ingredients: [
      { name: "Espresso", unit: "ml", category: "Coffee Base", default_reorder: 500 },
      { name: "Coffee Powder", unit: "g", category: "Coffee Base", default_reorder: 300 },
      { name: "Mocha Syrup", unit: "ml", category: "Syrup", default_reorder: 300 },
      { name: "Caramel Syrup", unit: "ml", category: "Syrup", default_reorder: 300 },
      { name: "Vanilla Syrup", unit: "ml", category: "Syrup", default_reorder: 300 },
      { name: "Fresh Milk", unit: "ml", category: "Milk", default_reorder: 1000 },
      { name: "Whipped Cream", unit: "ml", category: "Topping", default_reorder: 300 },
      { name: "Chocolate Drizzle", unit: "ml", category: "Topping", default_reorder: 200 },
      { name: "Crushed Ice", unit: "g", category: "Base", default_reorder: 1000 },
      { name: "Coffee Jelly", unit: "g", category: "Topping", default_reorder: 200 },
      { name: "Hazelnut Syrup", unit: "ml", category: "Syrup", default_reorder: 200 },
    ]
  },
  {
    id: "fruit_tea", label: "Fruit Tea", emoji: "🍊",
    ingredients: [
      { name: "Green Tea Base", unit: "ml", category: "Tea Base", default_reorder: 500 },
      { name: "Black Tea Base", unit: "ml", category: "Tea Base", default_reorder: 500 },
      { name: "Lemon Juice", unit: "ml", category: "Fruit", default_reorder: 300 },
      { name: "Mango Puree", unit: "ml", category: "Fruit", default_reorder: 300 },
      { name: "Passion Fruit Syrup", unit: "ml", category: "Syrup", default_reorder: 300 },
      { name: "Strawberry Puree", unit: "ml", category: "Fruit", default_reorder: 300 },
      { name: "Peach Syrup", unit: "ml", category: "Syrup", default_reorder: 300 },
      { name: "Lychee Syrup", unit: "ml", category: "Syrup", default_reorder: 300 },
      { name: "Fructose", unit: "ml", category: "Sweetener", default_reorder: 300 },
      { name: "Popping Boba", unit: "g", category: "Topping", default_reorder: 200 },
      { name: "Aloe Vera", unit: "g", category: "Topping", default_reorder: 200 },
    ]
  },
  {
    id: "original_tea", label: "Original Tea", emoji: "🍵",
    ingredients: [
      { name: "Black Tea", unit: "ml", category: "Tea Base", default_reorder: 500 },
      { name: "Green Tea", unit: "ml", category: "Tea Base", default_reorder: 500 },
      { name: "Oolong Tea", unit: "ml", category: "Tea Base", default_reorder: 500 },
      { name: "Earl Grey", unit: "ml", category: "Tea Base", default_reorder: 500 },
      { name: "Chamomile", unit: "g", category: "Tea Base", default_reorder: 100 },
      { name: "Honey", unit: "ml", category: "Sweetener", default_reorder: 200 },
      { name: "White Sugar", unit: "g", category: "Sweetener", default_reorder: 500 },
      { name: "Lemon Slice", unit: "pc", category: "Garnish", default_reorder: 20 },
      { name: "Mint Leaves", unit: "g", category: "Garnish", default_reorder: 50 },
    ]
  },
  {
    id: "hot_drinks", label: "Hot Drinks", emoji: "🔥",
    ingredients: [
      { name: "Espresso", unit: "ml", category: "Coffee Base", default_reorder: 500 },
      { name: "Ground Coffee", unit: "g", category: "Coffee Base", default_reorder: 300 },
      { name: "Fresh Milk", unit: "ml", category: "Milk", default_reorder: 1000 },
      { name: "Chocolate Powder", unit: "g", category: "Base", default_reorder: 300 },
      { name: "Matcha Powder", unit: "g", category: "Tea Base", default_reorder: 200 },
      { name: "Caramel Syrup", unit: "ml", category: "Syrup", default_reorder: 300 },
      { name: "Vanilla Syrup", unit: "ml", category: "Syrup", default_reorder: 300 },
      { name: "Whipped Cream", unit: "ml", category: "Topping", default_reorder: 300 },
      { name: "Cinnamon Powder", unit: "g", category: "Spice", default_reorder: 50 },
    ]
  }
];

const COMMON_SUPPLIES = [
  { name: "Cup (M)", unit: "pc", category: "Supplies", default_reorder: 100 },
  { name: "Cup (L)", unit: "pc", category: "Supplies", default_reorder: 100 },
  { name: "Cup (XL)", unit: "pc", category: "Supplies", default_reorder: 100 },
  { name: "Straw", unit: "pc", category: "Supplies", default_reorder: 100 },
  { name: "Sealing Film", unit: "pc", category: "Supplies", default_reorder: 100 },
  { name: "Ice", unit: "g", category: "Supplies", default_reorder: 2000 },
];

const CUSTOM_CATS = ["Tea Base", "Milk", "Sweetener", "Topping", "Syrup", "Fruit", "Coffee Base", "Base", "Supplies", "Other"];

export default function Setup() {
  const [step, setStep] = useState(1);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [available, setAvailable] = useState([]);
  const [selected, setSelected] = useState([]);
  const [filterCat, setFilterCat] = useState("All");
  const [customName, setCustomName] = useState("");
  const [customUnit, setCustomUnit] = useState("g");
  const [customCat, setCustomCat] = useState("Other");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const user = getUser();
  const shop = JSON.parse(localStorage.getItem("shop") || "{}");
  const themeColor = shop.theme_color || "#D50036";

  const toggleType = (id) => {
    setError("");
    setSelectedTypes(p => p.includes(id) ? p.filter(t => t !== id) : [...p, id]);
  };

  const proceedToIngredients = () => {
    if (!selectedTypes.length) return setError("Please select at least one drink type.");
    const map = new Map();
    COMMON_SUPPLIES.forEach(i => map.set(i.name, { ...i }));
    selectedTypes.forEach(tid => {
      const dt = DRINK_TYPES.find(d => d.id === tid);
      dt?.ingredients.forEach(i => { if (!map.has(i.name)) map.set(i.name, { ...i }); });
    });
    setAvailable(Array.from(map.values()));
    setSelected([]);
    setStep(2);
  };

  const toggleIng = (ing) => {
    const exists = selected.find(s => s.name === ing.name);
    if (exists) setSelected(selected.filter(s => s.name !== ing.name));
    else setSelected([...selected, { name: ing.name, unit: ing.unit, category: ing.category, stock: 0, reorder_level: ing.default_reorder || 10 }]);
  };

  const filteredAvail = filterCat === "All" ? available : available.filter(i => i.category === filterCat);
  const allSelectedInView = filteredAvail.length > 0 && filteredAvail.every(i => selected.find(s => s.name === i.name));

  const toggleSelectAll = () => {
    if (allSelectedInView) {
      const names = filteredAvail.map(i => i.name);
      setSelected(selected.filter(s => !names.includes(s.name)));
    } else {
      const toAdd = filteredAvail.filter(i => !selected.find(s => s.name === i.name))
        .map(i => ({ name: i.name, unit: i.unit, category: i.category, stock: 0, reorder_level: i.default_reorder || 10 }));
      setSelected([...selected, ...toAdd]);
    }
  };

  const addCustom = () => {
    if (!customName.trim()) return;
    if (selected.find(s => s.name === customName)) return alert("Already added!");
    setSelected([...selected, { name: customName, unit: customUnit, category: customCat, stock: 0, reorder_level: 10 }]);
    setCustomName("");
  };

  const updateStock = (i, v) => {
    const u = [...selected]; u[i].stock = parseFloat(v) || 0; setSelected(u);
  };
  const updateReorder = (i, v) => {
    const u = [...selected]; u[i].reorder_level = parseFloat(v) || 5; setSelected(u);
  };

  const save = async () => {
    if (!selected.length) return setError("Select at least one ingredient.");
    setLoading(true); setError("");
    try {
      const res = await apiFetch("/setup", {
        method: "POST",
        body: JSON.stringify({ ingredients: selected })
      });
      if (res && res.status === "setup_complete") {
        const s = JSON.parse(localStorage.getItem("shop") || "{}");
        localStorage.setItem("shop", JSON.stringify({ ...s, is_setup: 1 }));
        setStep(4);
        setTimeout(() => navigate("/dashboard"), 2000);
      } else {
        setError(res?.message || "Setup failed. Check that the backend server is running.");
      }
    } catch (e) {
      setError("Cannot reach server. Make sure backend is running on http://localhost:5000");
    }
    setLoading(false);
  };

  const inp = { padding: "9px 12px", background: "#0D0D12", border: "1px solid #ffffff18", borderRadius: "8px", color: "#fff", fontSize: "13px", outline: "none", boxSizing: "border-box" };
  const cats = ["All", ...new Set(available.map(i => i.category))];

  return (
    <div style={{ minHeight: "100vh", background: "#0D0D12", fontFamily: "'DM Sans', sans-serif", padding: "32px 20px" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ fontSize: "40px", marginBottom: "8px" }}>🧋</div>
          <h1 style={{ color: "#fff", fontSize: "26px", fontWeight: "700", fontFamily: "'Playfair Display', serif", margin: "0 0 6px" }}>
            Set Up Your Shop
          </h1>
          <p style={{ color: "#8888aa", fontSize: "14px", margin: 0 }}>
            Hi <span style={{ color: themeColor, fontWeight: "600" }}>{user.username}</span>! Configure{" "}
            <span style={{ color: "#fff", fontWeight: "600" }}>{shop.name || "your shop"}</span> before you start.
          </p>
        </div>

        {/* Steps */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginBottom: "32px" }}>
          {["Drink Types", "Ingredients", "Stock Levels", "Done!"].map((label, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "5px" }}>
                <div style={{
                  width: "32px", height: "32px", borderRadius: "50%",
                  background: step > i + 1 ? "#22cc77" : step === i + 1 ? themeColor : "#ffffff10",
                  color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "12px", fontWeight: "700"
                }}>{step > i + 1 ? "✓" : i + 1}</div>
                <span style={{ color: step === i + 1 ? "#fff" : "#556", fontSize: "10px", whiteSpace: "nowrap" }}>{label}</span>
              </div>
              {i < 3 && <div style={{ width: "44px", height: "1px", background: step > i + 1 ? "#22cc7744" : "#ffffff12", margin: "0 6px 16px" }} />}
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: "#ff4b4b18", border: "1px solid #ff4b4b44", color: "#ff8080", padding: "12px 16px", borderRadius: "10px", fontSize: "13px", marginBottom: "20px" }}>
            ⚠️ {error}
          </div>
        )}

        {/* ─── STEP 1: DRINK TYPES ─── */}
        {step === 1 && (
          <div>
            <div style={{ background: "#13131A", border: "1px solid #ffffff0f", borderRadius: "16px", padding: "22px", marginBottom: "20px" }}>
              <h3 style={{ color: "#fff", margin: "0 0 4px", fontSize: "15px" }}>What drinks does your shop serve?</h3>
              <p style={{ color: "#8888aa", fontSize: "12px", margin: "0 0 18px" }}>Select all that apply. You can pick multiple types!</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: "10px" }}>
                {DRINK_TYPES.map(dt => {
                  const sel = selectedTypes.includes(dt.id);
                  return (
                    <div key={dt.id} onClick={() => toggleType(dt.id)} style={{
                      padding: "16px", background: sel ? `${themeColor}18` : "#0D0D12",
                      border: `2px solid ${sel ? themeColor : "#ffffff10"}`,
                      borderRadius: "12px", cursor: "pointer", transition: "all 0.15s",
                      display: "flex", alignItems: "center", gap: "12px"
                    }}>
                      <span style={{ fontSize: "26px" }}>{dt.emoji}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: "#fff", fontWeight: "600", fontSize: "14px" }}>{dt.label}</div>
                        <div style={{ color: "#556", fontSize: "11px" }}>{dt.ingredients.length} ingredients</div>
                      </div>
                      {sel && <div style={{ width: "18px", height: "18px", borderRadius: "50%", background: themeColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", flexShrink: 0 }}>✓</div>}
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "12px" }}>
              <span style={{ color: "#556", fontSize: "13px" }}>{selectedTypes.length} selected</span>
              <button onClick={proceedToIngredients} style={{
                padding: "12px 26px",
                background: selectedTypes.length ? `linear-gradient(135deg, ${themeColor}, ${themeColor}99)` : "#333",
                color: "#fff", border: "none", borderRadius: "10px",
                cursor: selectedTypes.length ? "pointer" : "not-allowed",
                fontSize: "14px", fontWeight: "600"
              }}>Next →</button>
            </div>
          </div>
        )}

        {/* ─── STEP 2: SELECT INGREDIENTS ─── */}
        {step === 2 && (
          <div>
            <div style={{ background: "#13131A", border: "1px solid #ffffff0f", borderRadius: "16px", padding: "20px", marginBottom: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <div>
                  <h3 style={{ color: "#fff", margin: "0 0 2px", fontSize: "15px" }}>Select Your Ingredients</h3>
                  <p style={{ color: "#8888aa", fontSize: "12px", margin: 0 }}>Based on your chosen drink types</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: themeColor, fontSize: "20px", fontWeight: "700" }}>{selected.length}</div>
                  <div style={{ color: "#556", fontSize: "11px" }}>selected</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "14px", alignItems: "center" }}>
                {cats.map(c => (
                  <button key={c} onClick={() => setFilterCat(c)} style={{
                    padding: "5px 12px", background: filterCat === c ? themeColor : "#ffffff08",
                    color: filterCat === c ? "#fff" : "#8888aa",
                    border: `1px solid ${filterCat === c ? themeColor : "#ffffff12"}`,
                    borderRadius: "20px", cursor: "pointer", fontSize: "12px"
                  }}>{c}</button>
                ))}
                <button onClick={toggleSelectAll} style={{
                  marginLeft: "auto", padding: "5px 12px",
                  background: "transparent", color: "#8888ff",
                  border: "1px solid #8888ff44", borderRadius: "20px",
                  cursor: "pointer", fontSize: "12px"
                }}>{allSelectedInView ? "Deselect View" : "Select All"}</button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(148px, 1fr))", gap: "7px", maxHeight: "300px", overflowY: "auto" }}>
                {filteredAvail.map((ing, i) => {
                  const isSel = !!selected.find(s => s.name === ing.name);
                  return (
                    <div key={i} onClick={() => toggleIng(ing)} style={{
                      padding: "11px", background: isSel ? `${themeColor}18` : "#0D0D12",
                      border: `1px solid ${isSel ? themeColor + "77" : "#ffffff0f"}`,
                      borderRadius: "9px", cursor: "pointer", transition: "all 0.15s", position: "relative"
                    }}>
                      {isSel && <div style={{ position: "absolute", top: "5px", right: "5px", width: "14px", height: "14px", borderRadius: "50%", background: themeColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "8px" }}>✓</div>}
                      <div style={{ color: isSel ? "#fff" : "#bbb", fontSize: "12px", fontWeight: "500", paddingRight: isSel ? "18px" : "0" }}>{ing.name}</div>
                      <div style={{ color: "#556", fontSize: "10px", marginTop: "2px" }}>{ing.unit} · {ing.category}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Custom ingredient */}
            <div style={{ background: "#13131A", border: "1px solid #ffffff0f", borderRadius: "12px", padding: "16px", marginBottom: "16px" }}>
              <p style={{ color: "#8888aa", fontSize: "12px", margin: "0 0 10px", letterSpacing: "0.4px" }}>➕ CUSTOM INGREDIENT</p>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <input value={customName} onChange={e => setCustomName(e.target.value)} onKeyDown={e => e.key === "Enter" && addCustom()} placeholder="Name" style={{ ...inp, flex: 1, minWidth: "130px" }} />
                <select value={customUnit} onChange={e => setCustomUnit(e.target.value)} style={{ ...inp, cursor: "pointer" }}>
                  {["ml", "g", "pc", "L", "kg"].map(u => <option key={u}>{u}</option>)}
                </select>
                <select value={customCat} onChange={e => setCustomCat(e.target.value)} style={{ ...inp, cursor: "pointer" }}>
                  {CUSTOM_CATS.map(c => <option key={c}>{c}</option>)}
                </select>
                <button onClick={addCustom} style={{ padding: "9px 18px", background: themeColor, color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "13px" }}>Add</button>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button onClick={() => setStep(1)} style={{ padding: "11px 22px", background: "transparent", border: "1px solid #ffffff18", color: "#8888aa", borderRadius: "10px", cursor: "pointer", fontSize: "13px" }}>← Back</button>
              <button disabled={!selected.length} onClick={() => setStep(3)} style={{
                padding: "11px 24px",
                background: selected.length ? `linear-gradient(135deg, ${themeColor}, ${themeColor}99)` : "#333",
                color: "#fff", border: "none", borderRadius: "10px",
                cursor: selected.length ? "pointer" : "not-allowed", fontWeight: "600", fontSize: "13px"
              }}>Next: Stock Levels ({selected.length}) →</button>
            </div>
          </div>
        )}

        {/* ─── STEP 3: STOCK LEVELS ─── */}
        {step === 3 && (
          <div>
            <div style={{ background: "#13131A", border: "1px solid #ffffff0f", borderRadius: "16px", overflow: "hidden", marginBottom: "20px" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid #ffffff08" }}>
                <h3 style={{ color: "#fff", margin: "0 0 3px", fontSize: "15px" }}>Set Starting Stock & Reorder Levels</h3>
                <p style={{ color: "#8888aa", fontSize: "12px", margin: 0 }}>You can always update these later from Inventory.</p>
              </div>
              <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 120px", padding: "10px 20px", borderBottom: "1px solid #ffffff08", color: "#556", fontSize: "11px", letterSpacing: "0.4px" }}>
                  <span>INGREDIENT</span><span>CURRENT STOCK</span><span>REORDER AT</span>
                </div>
                {selected.map((ing, idx) => (
                  <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 120px 120px", padding: "10px 20px", borderBottom: "1px solid #ffffff06", alignItems: "center" }}>
                    <div>
                      <div style={{ color: "#fff", fontSize: "13px" }}>{ing.name}</div>
                      <div style={{ color: "#556", fontSize: "10px" }}>{ing.unit} · {ing.category}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <input type="number" min="0" value={ing.stock} onChange={e => updateStock(idx, e.target.value)}
                        style={{ ...inp, width: "78px", padding: "7px 9px" }} />
                      <span style={{ color: "#556", fontSize: "10px" }}>{ing.unit}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <input type="number" min="0" value={ing.reorder_level} onChange={e => updateReorder(idx, e.target.value)}
                        style={{ ...inp, width: "78px", padding: "7px 9px" }} />
                      <span style={{ color: "#556", fontSize: "10px" }}>{ing.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button onClick={() => setStep(2)} style={{ padding: "11px 22px", background: "transparent", border: "1px solid #ffffff18", color: "#8888aa", borderRadius: "10px", cursor: "pointer", fontSize: "13px" }}>← Back</button>
              <button onClick={save} disabled={loading} style={{
                padding: "11px 28px",
                background: loading ? "#333" : `linear-gradient(135deg, ${themeColor}, ${themeColor}99)`,
                color: "#fff", border: "none", borderRadius: "10px",
                cursor: loading ? "not-allowed" : "pointer", fontWeight: "600", fontSize: "13px",
                boxShadow: loading ? "none" : `0 4px 16px ${themeColor}44`
              }}>{loading ? "⏳ Saving..." : "Complete Setup ✓"}</button>
            </div>
          </div>
        )}

        {/* ─── STEP 4: DONE ─── */}
        {step === 4 && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <div style={{ fontSize: "60px", marginBottom: "16px" }}>🎉</div>
            <h2 style={{ color: "#fff", fontFamily: "'Playfair Display', serif", margin: "0 0 8px" }}>Setup Complete!</h2>
            <p style={{ color: "#8888aa", fontSize: "14px" }}>{shop.name} is ready. Redirecting to dashboard...</p>
            <div style={{ display: "inline-block", marginTop: "20px", width: "180px", height: "4px", background: "#ffffff10", borderRadius: "2px", overflow: "hidden" }}>
              <div style={{ height: "100%", background: themeColor, borderRadius: "2px", animation: "prog 2s linear forwards" }} />
            </div>
            <style>{`@keyframes prog{from{width:0}to{width:100%}}`}</style>
          </div>
        )}
      </div>
    </div>
  );
}