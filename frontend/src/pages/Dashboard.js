import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { apiFetch, getShop } from "../services/api";

function StatCard({ label, value, icon, color, sub }) {
  return (
    <div style={{
      background: "#13131A",
      border: "1px solid #ffffff0f",
      borderRadius: "16px",
      padding: "24px",
      position: "relative",
      overflow: "hidden"
    }}>
      <div style={{
        position: "absolute", top: "-20px", right: "-10px",
        fontSize: "64px", opacity: "0.06"
      }}>{icon}</div>
      <div style={{ color: "#8888aa", fontSize: "12px", letterSpacing: "0.8px", marginBottom: "8px" }}>
        {label}
      </div>
      <div style={{ color: color || "#fff", fontSize: "30px", fontWeight: "700", marginBottom: "4px" }}>
        {value}
      </div>
      {sub && <div style={{ color: "#556", fontSize: "12px" }}>{sub}</div>}
    </div>
  );
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const shop = getShop();
  const themeColor = shop.theme_color || "#D50036";

  useEffect(() => {
    apiFetch("/reports/summary").then(setSummary);
    apiFetch("/reports/top-products").then(d => setTopProducts((d || []).slice(0, 5)));
    apiFetch("/ingredients").then(data => {
      if (data) setLowStock(data.filter(i => i.stock <= i.reorder_level));
    });
  }, []);

  return (
    <Layout title="Dashboard">
      {/* Stats */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: "16px",
        marginBottom: "28px"
      }}>
        <StatCard
          label="TODAY'S REVENUE"
          value={`₱${parseFloat(summary?.today_revenue || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`}
          icon="💰"
          color={themeColor}
          sub={`${summary?.today_transactions || 0} transactions`}
        />
        <StatCard
          label="MONTHLY REVENUE"
          value={`₱${parseFloat(summary?.month_revenue || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`}
          icon="📈"
          color="#22cc77"
        />
        <StatCard
          label="TOTAL PRODUCTS"
          value={summary?.total_products || 0}
          icon="🍵"
          color="#8888ff"
        />
        <StatCard
          label="LOW STOCK ALERTS"
          value={summary?.low_stock_count || 0}
          icon="⚠️"
          color={summary?.low_stock_count > 0 ? "#ffaa44" : "#22cc77"}
          sub={summary?.low_stock_count > 0 ? "Needs restocking" : "All good!"}
        />
      </div>

      {/* Bottom Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {/* Top Products */}
        <div style={{
          background: "#13131A",
          border: "1px solid #ffffff0f",
          borderRadius: "16px",
          padding: "20px"
        }}>
          <h3 style={{ color: "#fff", fontSize: "15px", margin: "0 0 16px", fontWeight: "600" }}>
            🏆 Top Products
          </h3>
          {topProducts.length === 0 && (
            <p style={{ color: "#556", fontSize: "13px" }}>No sales data yet.</p>
          )}
          {topProducts.map((p, i) => (
            <div key={i} style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "12px"
            }}>
              <div style={{
                width: "28px", height: "28px",
                background: i === 0 ? "#ffd700" : i === 1 ? "#c0c0c0" : i === 2 ? "#cd7f32" : "#ffffff18",
                borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "12px", fontWeight: "700", color: "#000", flexShrink: 0
              }}>{i + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ color: "#fff", fontSize: "13px" }}>{p.name}</div>
                <div style={{
                  height: "4px", background: "#ffffff0f",
                  borderRadius: "2px", marginTop: "4px", overflow: "hidden"
                }}>
                  <div style={{
                    height: "100%",
                    background: themeColor,
                    width: `${(p.total_sold / (topProducts[0]?.total_sold || 1)) * 100}%`,
                    borderRadius: "2px"
                  }} />
                </div>
              </div>
              <div style={{ color: "#8888aa", fontSize: "12px" }}>{p.total_sold} sold</div>
            </div>
          ))}
        </div>

        {/* Low Stock */}
        <div style={{
          background: "#13131A",
          border: `1px solid ${lowStock.length > 0 ? "#ffaa4433" : "#ffffff0f"}`,
          borderRadius: "16px",
          padding: "20px"
        }}>
          <h3 style={{ color: "#fff", fontSize: "15px", margin: "0 0 16px", fontWeight: "600" }}>
            ⚠️ Low Stock Alerts
          </h3>
          {lowStock.length === 0 && (
            <p style={{ color: "#22cc77", fontSize: "13px" }}>✓ All ingredients are sufficiently stocked!</p>
          )}
          {lowStock.slice(0, 6).map((ing, i) => (
            <div key={i} style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 0",
              borderBottom: i < lowStock.slice(0, 6).length - 1 ? "1px solid #ffffff08" : "none"
            }}>
              <div>
                <div style={{ color: "#fff", fontSize: "13px" }}>{ing.name}</div>
                <div style={{ color: "#556", fontSize: "11px" }}>
                  Reorder at: {ing.reorder_level} {ing.unit}
                </div>
              </div>
              <div style={{
                padding: "4px 10px",
                background: ing.stock === 0 ? "#ff4b4b22" : "#ffaa4422",
                color: ing.stock === 0 ? "#ff6b6b" : "#ffaa44",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "600"
              }}>
                {ing.stock} {ing.unit}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}