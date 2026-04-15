import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { apiFetch, getUser, getShop } from "../services/api";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [modal, setModal] = useState(null); // null | 'add' | product (for edit)
  const [form, setForm] = useState({ name: "", price: "", category: "Drinks" });
  const [recipe, setRecipe] = useState([]); // [{ ingredient_id, quantity }]
  const [viewRecipe, setViewRecipe] = useState(null);
  const user = getUser();
  const shop = getShop();
  const themeColor = shop.theme_color || "#D50036";

  const load = () => {
    apiFetch("/products").then(d => setProducts(d || []));
    apiFetch("/ingredients").then(d => setIngredients(d || []));
  };

  useEffect(load, []);

  const openAdd = () => {
    setForm({ name: "", price: "", category: "Drinks" });
    setRecipe([]);
    setModal("add");
  };

  const openEdit = async (p) => {
    setForm({ name: p.name, price: p.price, category: p.category });
    const recipeData = await apiFetch(`/products/${p.id}/recipe`);
    setRecipe(recipeData.map(r => ({ ingredient_id: r.ingredient_id, quantity: r.quantity })) || []);
    setModal(p);
  };

  const addRecipeItem = (ing_id) => {
    if (recipe.find(r => r.ingredient_id == ing_id)) return;
    const ing = ingredients.find(i => i.id == ing_id);
    setRecipe([...recipe, { ingredient_id: ing_id, quantity: 1, _unit: ing?.unit }]);
  };

  const updateRecipeQty = (index, val) => {
    const updated = [...recipe];
    updated[index].quantity = parseFloat(val) || 0;
    setRecipe(updated);
  };

  const removeRecipeItem = (index) => {
    setRecipe(recipe.filter((_, i) => i !== index));
  };

  const save = async () => {
    if (!form.name || !form.price) return alert("Fill in product name and price.");
    const payload = { ...form, price: parseFloat(form.price), recipe };

    if (modal === "add") {
      await apiFetch("/products", { method: "POST", body: JSON.stringify(payload) });
    } else {
      await apiFetch(`/products/${modal.id}`, { method: "PUT", body: JSON.stringify(payload) });
    }
    setModal(null);
    load();
  };

  const del = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await apiFetch(`/products/${id}`, { method: "DELETE" });
    load();
  };

  const openRecipe = async (p) => {
    const data = await apiFetch(`/products/${p.id}/recipe`);
    setViewRecipe({ product: p, recipe: data || [] });
  };

  const categories = [...new Set(products.map(p => p.category))];

  return (
    <Layout title="Products">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <p style={{ color: "#8888aa", fontSize: "14px", margin: 0 }}>
          {products.length} products in your menu
        </p>
        {user.role === "admin" && (
          <button onClick={openAdd} style={{
            padding: "10px 20px",
            background: themeColor,
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "600"
          }}>+ Add Product</button>
        )}
      </div>

      {/* Products Grid */}
      {categories.length === 0 && (
        <div style={{
          background: "#13131A",
          border: "1px dashed #ffffff18",
          borderRadius: "16px",
          padding: "60px",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>🍵</div>
          <p style={{ color: "#8888aa", fontSize: "14px" }}>
            No products yet. Add your first menu item!
          </p>
        </div>
      )}

      {categories.map(cat => (
        <div key={cat} style={{ marginBottom: "28px" }}>
          <h3 style={{
            color: "#8888aa", fontSize: "12px",
            letterSpacing: "1px", margin: "0 0 14px",
            textTransform: "uppercase"
          }}>{cat}</h3>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
            gap: "14px"
          }}>
            {products.filter(p => p.category === cat).map(p => (
              <div key={p.id} style={{
                background: "#13131A",
                border: "1px solid #ffffff0f",
                borderRadius: "14px",
                padding: "18px",
                position: "relative"
              }}>
                <div style={{ fontSize: "32px", marginBottom: "10px" }}>🧋</div>
                <div style={{ color: "#fff", fontWeight: "600", fontSize: "15px", marginBottom: "4px" }}>
                  {p.name}
                </div>
                <div style={{ color: themeColor, fontWeight: "700", fontSize: "18px", marginBottom: "12px" }}>
                  ₱{parseFloat(p.price).toFixed(2)}
                </div>

                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  <button onClick={() => openRecipe(p)} style={{
                    flex: 1,
                    padding: "7px",
                    background: "#ffffff0a",
                    color: "#8888aa",
                    border: "1px solid #ffffff18",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "11px"
                  }}>📋 Recipe</button>
                  {user.role === "admin" && (
                    <>
                      <button onClick={() => openEdit(p)} style={{
                        flex: 1,
                        padding: "7px",
                        background: "#8888ff18",
                        color: "#8888ff",
                        border: "1px solid #8888ff33",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "11px"
                      }}>✏️ Edit</button>
                      <button onClick={() => del(p.id)} style={{
                        padding: "7px 10px",
                        background: "#ff4b4b18",
                        color: "#ff6b6b",
                        border: "1px solid #ff4b4b33",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "11px"
                      }}>🗑</button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Add/Edit Modal */}
      {modal !== null && (
        <div style={{
          position: "fixed", inset: 0,
          background: "#000000bb",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, padding: "20px"
        }}>
          <div style={{
            background: "#13131A",
            border: "1px solid #ffffff18",
            borderRadius: "20px",
            padding: "28px",
            width: "100%",
            maxWidth: "600px",
            maxHeight: "90vh",
            overflowY: "auto"
          }}>
            <h3 style={{
              color: "#fff", margin: "0 0 24px",
              fontFamily: "'Playfair Display', serif", fontSize: "20px"
            }}>
              {modal === "add" ? "➕ Add Product" : "✏️ Edit Product"}
            </h3>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: "12px", marginBottom: "20px" }}>
              {[
                { label: "PRODUCT NAME", field: "name", placeholder: "e.g. Brown Sugar Boba" },
                { label: "PRICE (₱)", field: "price", placeholder: "0.00", type: "number" },
                { label: "CATEGORY", field: "category", placeholder: "Drinks" },
              ].map(f => (
                <div key={f.field}>
                  <label style={{ color: "#556", fontSize: "11px", display: "block", marginBottom: "5px" }}>
                    {f.label}
                  </label>
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
            </div>

            {/* Recipe */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ color: "#556", fontSize: "11px", display: "block", marginBottom: "10px", letterSpacing: "0.5px" }}>
                RECIPE / INGREDIENTS
              </label>

              <div style={{
                display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "12px",
                padding: "12px",
                background: "#0D0D12",
                borderRadius: "10px",
                border: "1px solid #ffffff0f"
              }}>
                {ingredients.map(ing => (
                  <button
                    key={ing.id}
                    onClick={() => addRecipeItem(ing.id)}
                    disabled={!!recipe.find(r => r.ingredient_id == ing.id)}
                    style={{
                      padding: "5px 12px",
                      background: recipe.find(r => r.ingredient_id == ing.id) ? themeColor + "44" : "#ffffff0a",
                      color: recipe.find(r => r.ingredient_id == ing.id) ? themeColor : "#8888aa",
                      border: `1px solid ${recipe.find(r => r.ingredient_id == ing.id) ? themeColor + "66" : "#ffffff18"}`,
                      borderRadius: "20px",
                      cursor: "pointer",
                      fontSize: "12px"
                    }}
                  >
                    {ing.name}
                  </button>
                ))}
                {ingredients.length === 0 && (
                  <span style={{ color: "#556", fontSize: "12px" }}>
                    No ingredients in inventory. Add ingredients first.
                  </span>
                )}
              </div>

              {recipe.map((r, i) => {
                const ing = ingredients.find(x => x.id == r.ingredient_id);
                return (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    marginBottom: "8px"
                  }}>
                    <div style={{ flex: 1, color: "#fff", fontSize: "13px" }}>{ing?.name}</div>
                    <input
                      type="number"
                      value={r.quantity}
                      onChange={e => updateRecipeQty(i, e.target.value)}
                      style={{
                        width: "80px",
                        padding: "8px",
                        background: "#0D0D12",
                        border: "1px solid #ffffff18",
                        borderRadius: "8px",
                        color: "#fff",
                        fontSize: "13px",
                        outline: "none"
                      }}
                    />
                    <span style={{ color: "#556", fontSize: "12px", width: "30px" }}>{ing?.unit}</span>
                    <button onClick={() => removeRecipeItem(i)} style={{
                      padding: "5px 10px",
                      background: "#ff4b4b18",
                      color: "#ff6b6b",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "12px"
                    }}>✕</button>
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setModal(null)} style={{
                flex: 1, padding: "12px",
                background: "transparent",
                border: "1px solid #ffffff18",
                color: "#8888aa",
                borderRadius: "10px",
                cursor: "pointer"
              }}>Cancel</button>
              <button onClick={save} style={{
                flex: 2, padding: "12px",
                background: `linear-gradient(135deg, ${themeColor}, ${themeColor}88)`,
                border: "none",
                color: "#fff",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "14px"
              }}>Save Product</button>
            </div>
          </div>
        </div>
      )}

      {/* View Recipe Modal */}
      {viewRecipe && (
        <div style={{
          position: "fixed", inset: 0,
          background: "#000000bb",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: "#13131A",
            border: "1px solid #ffffff18",
            borderRadius: "20px",
            padding: "28px",
            width: "380px"
          }}>
            <h3 style={{ color: "#fff", margin: "0 0 6px", fontFamily: "'Playfair Display', serif" }}>
              📋 {viewRecipe.product.name}
            </h3>
            <p style={{ color: "#8888aa", fontSize: "13px", marginBottom: "20px" }}>
              ₱{parseFloat(viewRecipe.product.price).toFixed(2)} · {viewRecipe.product.category}
            </p>
            {viewRecipe.recipe.length === 0
              ? <p style={{ color: "#556", fontSize: "13px" }}>No recipe defined.</p>
              : viewRecipe.recipe.map((r, i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between",
                  padding: "10px 0",
                  borderBottom: i < viewRecipe.recipe.length - 1 ? "1px solid #ffffff08" : "none"
                }}>
                  <span style={{ color: "#fff", fontSize: "14px" }}>{r.ingredient_name}</span>
                  <span style={{ color: themeColor, fontSize: "14px", fontWeight: "600" }}>
                    {r.quantity} {r.unit}
                  </span>
                </div>
              ))
            }
            <button onClick={() => setViewRecipe(null)} style={{
              width: "100%", padding: "12px",
              background: "#ffffff0a",
              border: "1px solid #ffffff18",
              color: "#fff",
              borderRadius: "10px",
              cursor: "pointer",
              marginTop: "20px"
            }}>Close</button>
          </div>
        </div>
      )}
    </Layout>
  );
}