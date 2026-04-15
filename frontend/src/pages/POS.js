import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { apiFetch, getShop } from "../services/api";

export default function POS() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [filterCat, setFilterCat] = useState("All");
  const shop = getShop();
  const themeColor = shop.theme_color || "#D50036";

  useEffect(() => {
    apiFetch("/products").then(d => setProducts(d || []));
  }, []);

  const categories = ["All", ...new Set(products.map(p => p.category))];

  const filteredProducts = filterCat === "All"
    ? products
    : products.filter(p => p.category === filterCat);

  const addToCart = (product) => {
    const exists = cart.find(c => c.product_id === product.id);
    if (exists) {
      setCart(cart.map(c => c.product_id === product.id
        ? { ...c, quantity: c.quantity + 1 }
        : c
      ));
    } else {
      setCart([...cart, {
        product_id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        quantity: 1
      }]);
    }
  };

  const updateCartQty = (product_id, qty) => {
    if (qty <= 0) {
      setCart(cart.filter(c => c.product_id !== product_id));
    } else {
      setCart(cart.map(c => c.product_id === product_id ? { ...c, quantity: qty } : c));
    }
  };

  const subtotal = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);
  const total = subtotal - parseFloat(discount || 0);

  const sell = async () => {
    if (cart.length === 0) return alert("Cart is empty!");
    if (total < 0) return alert("Discount cannot exceed subtotal.");
    setLoading(true);

    try {
      const res = await apiFetch("/sell", {
        method: "POST",
        body: JSON.stringify({
          items: cart.map(c => ({ product_id: c.product_id, quantity: c.quantity, price: c.price })),
          payment_method: paymentMethod,
          discount: parseFloat(discount || 0)
        })
      });

      if (res.status === "success") {
        setReceipt({ items: cart, subtotal, discount: parseFloat(discount || 0), total, paymentMethod, tx_id: res.transaction_id });
        setCart([]);
        setDiscount(0);
      } else {
        alert(res.message || "Transaction failed.");
      }
    } catch (err) {
      alert("Error processing sale.");
    }
    setLoading(false);
  };

  const printReceipt = () => {
    if (!receipt) return;
    const win = window.open("", "", "width=340,height=600");
    win.document.write(`
      <html><head><style>
        body { font-family: monospace; font-size: 13px; padding: 20px; }
        h2 { text-align: center; margin: 0 0 4px; }
        p { text-align: center; margin: 0 0 12px; color: #666; }
        hr { border: 1px dashed #ccc; margin: 10px 0; }
        .row { display: flex; justify-content: space-between; margin: 4px 0; }
        .total { font-weight: bold; font-size: 15px; }
      </style></head><body>
        <h2>🧋 ${shop.logo_text || "Milk Tea"}</h2>
        <p>${new Date().toLocaleString()}</p>
        <p>TX#${receipt.tx_id}</p>
        <hr/>
        ${receipt.items.map(i => `
          <div class="row"><span>${i.name} x${i.quantity}</span><span>₱${(i.price * i.quantity).toFixed(2)}</span></div>
        `).join("")}
        <hr/>
        <div class="row"><span>Subtotal</span><span>₱${receipt.subtotal.toFixed(2)}</span></div>
        ${receipt.discount > 0 ? `<div class="row"><span>Discount</span><span>-₱${receipt.discount.toFixed(2)}</span></div>` : ""}
        <div class="row total"><span>TOTAL</span><span>₱${receipt.total.toFixed(2)}</span></div>
        <div class="row"><span>Payment</span><span>${receipt.paymentMethod.toUpperCase()}</span></div>
        <hr/>
        <p>Thank you! Come again! 🧋</p>
      </body></html>
    `);
    win.print();
  };

  return (
    <Layout title="Point of Sale">
      <div style={{ display: "flex", gap: "20px", height: "calc(100vh - 120px)" }}>
        {/* Products Panel */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {/* Category tabs */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
            {categories.map(cat => (
              <button key={cat} onClick={() => setFilterCat(cat)} style={{
                padding: "7px 14px",
                background: filterCat === cat ? themeColor : "#13131A",
                color: filterCat === cat ? "#fff" : "#8888aa",
                border: `1px solid ${filterCat === cat ? themeColor : "#ffffff18"}`,
                borderRadius: "20px", cursor: "pointer", fontSize: "12px"
              }}>{cat}</button>
            ))}
          </div>

          {/* Products Grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
            gap: "12px"
          }}>
            {filteredProducts.map(p => {
              const inCart = cart.find(c => c.product_id === p.id);
              return (
                <div
                  key={p.id}
                  onClick={() => addToCart(p)}
                  style={{
                    background: inCart ? `${themeColor}18` : "#13131A",
                    border: `1px solid ${inCart ? themeColor + "55" : "#ffffff0f"}`,
                    borderRadius: "14px",
                    padding: "18px 14px",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    textAlign: "center",
                    position: "relative"
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = inCart ? `${themeColor}28` : "#1a1a24"}
                  onMouseLeave={e => e.currentTarget.style.background = inCart ? `${themeColor}18` : "#13131A"}
                >
                  {inCart && (
                    <div style={{
                      position: "absolute", top: "8px", right: "8px",
                      background: themeColor,
                      color: "#fff",
                      width: "20px", height: "20px",
                      borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "11px", fontWeight: "700"
                    }}>{inCart.quantity}</div>
                  )}
                  <div style={{ fontSize: "28px", marginBottom: "8px" }}>🧋</div>
                  <div style={{ color: "#fff", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>{p.name}</div>
                  <div style={{ color: themeColor, fontSize: "16px", fontWeight: "700" }}>
                    ₱{parseFloat(p.price).toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cart Panel */}
        <div style={{
          width: "300px",
          flexShrink: 0,
          background: "#13131A",
          border: "1px solid #ffffff0f",
          borderRadius: "16px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden"
        }}>
          <div style={{ padding: "20px 20px 14px", borderBottom: "1px solid #ffffff0f" }}>
            <h3 style={{ color: "#fff", margin: 0, fontSize: "16px", fontWeight: "700" }}>
              🛒 Order
            </h3>
          </div>

          {/* Cart Items */}
          <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
            {cart.length === 0 && (
              <div style={{
                textAlign: "center", padding: "40px 0",
                color: "#8888aa", fontSize: "13px"
              }}>
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>🧋</div>
                Tap a product to add
              </div>
            )}
            {cart.map(item => (
              <div key={item.product_id} style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "10px",
                background: "#0D0D12",
                borderRadius: "10px",
                marginBottom: "8px"
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ color: "#fff", fontSize: "13px", fontWeight: "500" }}>{item.name}</div>
                  <div style={{ color: "#8888aa", fontSize: "12px" }}>₱{item.price.toFixed(2)} each</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <button onClick={() => updateCartQty(item.product_id, item.quantity - 1)} style={{
                    width: "24px", height: "24px",
                    background: "#ffffff18",
                    border: "none",
                    borderRadius: "50%",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: "14px",
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}>−</button>
                  <span style={{ color: "#fff", fontSize: "14px", fontWeight: "600", minWidth: "18px", textAlign: "center" }}>
                    {item.quantity}
                  </span>
                  <button onClick={() => updateCartQty(item.product_id, item.quantity + 1)} style={{
                    width: "24px", height: "24px",
                    background: themeColor,
                    border: "none",
                    borderRadius: "50%",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: "14px",
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}>+</button>
                </div>
                <div style={{ color: themeColor, fontSize: "13px", fontWeight: "700", minWidth: "55px", textAlign: "right" }}>
                  ₱{(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div style={{ padding: "16px 20px", borderTop: "1px solid #ffffff0f" }}>
            {/* Payment Method */}
            <div style={{ marginBottom: "12px" }}>
              <label style={{ color: "#556", fontSize: "11px", display: "block", marginBottom: "6px" }}>
                PAYMENT METHOD
              </label>
              <div style={{ display: "flex", gap: "6px" }}>
                {["cash", "gcash", "card"].map(pm => (
                  <button key={pm} onClick={() => setPaymentMethod(pm)} style={{
                    flex: 1, padding: "7px 0",
                    background: paymentMethod === pm ? themeColor : "#0D0D12",
                    color: paymentMethod === pm ? "#fff" : "#8888aa",
                    border: `1px solid ${paymentMethod === pm ? themeColor : "#ffffff18"}`,
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "11px",
                    fontWeight: "500",
                    textTransform: "capitalize"
                  }}>{pm}</button>
                ))}
              </div>
            </div>

            {/* Discount */}
            <div style={{ marginBottom: "12px" }}>
              <label style={{ color: "#556", fontSize: "11px", display: "block", marginBottom: "5px" }}>
                DISCOUNT (₱)
              </label>
              <input
                type="number"
                value={discount}
                onChange={e => setDiscount(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
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

            {/* Totals */}
            <div style={{ marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ color: "#8888aa", fontSize: "13px" }}>Subtotal</span>
                <span style={{ color: "#fff", fontSize: "13px" }}>₱{subtotal.toFixed(2)}</span>
              </div>
              {parseFloat(discount) > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ color: "#8888aa", fontSize: "13px" }}>Discount</span>
                  <span style={{ color: "#ff6b6b", fontSize: "13px" }}>-₱{parseFloat(discount).toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px", paddingTop: "8px", borderTop: "1px solid #ffffff0f" }}>
                <span style={{ color: "#fff", fontSize: "15px", fontWeight: "700" }}>TOTAL</span>
                <span style={{ color: themeColor, fontSize: "18px", fontWeight: "800" }}>
                  ₱{total.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={sell}
              disabled={loading || cart.length === 0}
              style={{
                width: "100%",
                padding: "14px",
                background: cart.length > 0 ? `linear-gradient(135deg, ${themeColor}, ${themeColor}88)` : "#333",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                cursor: cart.length > 0 ? "pointer" : "not-allowed",
                fontSize: "15px",
                fontWeight: "700",
                boxShadow: cart.length > 0 ? `0 4px 20px ${themeColor}44` : "none"
              }}
            >
              {loading ? "Processing..." : `Charge ₱${total.toFixed(2)}`}
            </button>
          </div>
        </div>
      </div>

      {/* Receipt Modal */}
      {receipt && (
        <div style={{
          position: "fixed", inset: 0,
          background: "#000000bb",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            background: "#13131A",
            border: "1px solid #22cc7766",
            borderRadius: "20px",
            padding: "32px",
            width: "340px",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "48px", marginBottom: "8px" }}>✅</div>
            <h3 style={{ color: "#22cc77", margin: "0 0 4px", fontFamily: "'Playfair Display', serif" }}>
              Sale Complete!
            </h3>
            <p style={{ color: "#8888aa", fontSize: "12px", marginBottom: "20px" }}>
              TX#{receipt.tx_id}
            </p>

            {receipt.items.map((item, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ color: "#aaa", fontSize: "13px" }}>{item.name} ×{item.quantity}</span>
                <span style={{ color: "#fff", fontSize: "13px" }}>₱{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}

            <div style={{ borderTop: "1px solid #ffffff18", paddingTop: "12px", marginTop: "4px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#fff", fontWeight: "700", fontSize: "16px" }}>Total</span>
                <span style={{ color: themeColor, fontWeight: "800", fontSize: "20px" }}>
                  ₱{receipt.total.toFixed(2)}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button onClick={printReceipt} style={{
                flex: 1, padding: "11px",
                background: "#ffffff0a",
                border: "1px solid #ffffff18",
                color: "#fff",
                borderRadius: "10px",
                cursor: "pointer",
                fontSize: "13px"
              }}>🖨️ Print</button>
              <button onClick={() => setReceipt(null)} style={{
                flex: 1, padding: "11px",
                background: themeColor,
                border: "none",
                color: "#fff",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: "600"
              }}>New Order</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}