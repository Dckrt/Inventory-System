import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { apiFetch, getShop } from "../services/api";

export default function Reports() {
  const [daily, setDaily] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const shop = getShop();
  const themeColor = shop.theme_color || "#D50036";

  useEffect(() => {
    apiFetch("/reports/daily").then(d => setDaily(d || []));
    apiFetch("/reports/top-products").then(d => setTopProducts(d || []));
  }, []);

  const maxRevenue = Math.max(...daily.map(d => d.revenue || 0), 1);
  const maxSold = Math.max(...topProducts.map(p => p.total_sold || 0), 1);

  const totalRevenue = daily.reduce((sum, d) => sum + parseFloat(d.revenue || 0), 0);
  const totalTx = daily.reduce((sum, d) => sum + parseInt(d.transactions || 0), 0);

  return (
    <Layout title="Reports">
      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "28px" }}>
        {[
          { label: "30-DAY REVENUE", value: `₱${totalRevenue.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`, color: themeColor },
          { label: "TOTAL TRANSACTIONS", value: totalTx, color: "#22cc77" },
          { label: "AVG. PER DAY", value: `₱${daily.length > 0 ? (totalRevenue / daily.length).toLocaleString("en-PH", { minimumFractionDigits: 2 }) : "0.00"}`, color: "#8888ff" },
        ].map((s, i) => (
          <div key={i} style={{
            background: "#13131A",
            border: "1px solid #ffffff0f",
            borderRadius: "16px",
            padding: "22px 24px"
          }}>
            <div style={{ color: "#8888aa", fontSize: "11px", letterSpacing: "0.8px", marginBottom: "8px" }}>{s.label}</div>
            <div style={{ color: s.color, fontSize: "28px", fontWeight: "700" }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "20px" }}>
        {/* Daily Revenue Chart */}
        <div style={{
          background: "#13131A",
          border: "1px solid #ffffff0f",
          borderRadius: "16px",
          padding: "24px"
        }}>
          <h3 style={{ color: "#fff", margin: "0 0 20px", fontSize: "15px" }}>📈 Daily Revenue (Last 30 Days)</h3>

          {daily.length === 0 && (
            <p style={{ color: "#556", fontSize: "13px" }}>No revenue data yet.</p>
          )}

          <div style={{ display: "flex", alignItems: "flex-end", gap: "4px", height: "200px" }}>
            {daily.slice().reverse().slice(0, 20).map((d, i) => {
              const height = (parseFloat(d.revenue) / maxRevenue) * 180;
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}
                  title={`${d.date}\n₱${parseFloat(d.revenue).toLocaleString("en-PH")}\n${d.transactions} transactions`}
                >
                  <div style={{
                    width: "100%",
                    height: `${Math.max(height, 2)}px`,
                    background: `linear-gradient(180deg, ${themeColor}, ${themeColor}66)`,
                    borderRadius: "4px 4px 0 0",
                    minHeight: "2px",
                    cursor: "pointer",
                    transition: "opacity 0.2s"
                  }}
                    onMouseEnter={e => e.currentTarget.style.opacity = "0.8"}
                    onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                  />
                  <div style={{ color: "#556", fontSize: "9px", transform: "rotate(-45deg)", whiteSpace: "nowrap" }}>
                    {d.date?.slice(5)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Products */}
        <div style={{
          background: "#13131A",
          border: "1px solid #ffffff0f",
          borderRadius: "16px",
          padding: "24px"
        }}>
          <h3 style={{ color: "#fff", margin: "0 0 20px", fontSize: "15px" }}>🏆 Top Products</h3>

          {topProducts.length === 0 && (
            <p style={{ color: "#556", fontSize: "13px" }}>No sales data yet.</p>
          )}

          {topProducts.map((p, i) => (
            <div key={i} style={{ marginBottom: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ color: "#fff", fontSize: "13px" }}>
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`} {p.name}
                </span>
                <span style={{ color: "#8888aa", fontSize: "12px" }}>
                  {p.total_sold} sold · ₱{parseFloat(p.revenue || 0).toFixed(0)}
                </span>
              </div>
              <div style={{ height: "6px", background: "#ffffff0a", borderRadius: "3px" }}>
                <div style={{
                  height: "100%",
                  width: `${(p.total_sold / maxSold) * 100}%`,
                  background: themeColor,
                  borderRadius: "3px",
                  transition: "width 0.5s"
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Table */}
      <div style={{
        background: "#13131A",
        border: "1px solid #ffffff0f",
        borderRadius: "16px",
        overflow: "hidden",
        marginTop: "20px"
      }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #ffffff0f" }}>
          <h3 style={{ color: "#fff", margin: 0, fontSize: "15px" }}>📅 Daily Breakdown</h3>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #ffffff0f" }}>
              {["Date", "Transactions", "Revenue", "Avg. per TX", "Discount"].map(h => (
                <th key={h} style={{
                  padding: "12px 16px",
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
            {daily.map(d => (
              <tr key={d.date} style={{ borderBottom: "1px solid #ffffff06" }}
                onMouseEnter={e => e.currentTarget.style.background = "#ffffff04"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <td style={{ padding: "12px 16px", color: "#fff", fontSize: "13px" }}>{d.date}</td>
                <td style={{ padding: "12px 16px", color: "#8888aa", fontSize: "13px" }}>{d.transactions}</td>
                <td style={{ padding: "12px 16px", color: themeColor, fontSize: "14px", fontWeight: "700" }}>
                  ₱{parseFloat(d.revenue || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}
                </td>
                <td style={{ padding: "12px 16px", color: "#8888aa", fontSize: "13px" }}>
                  ₱{d.transactions > 0 ? (parseFloat(d.revenue) / d.transactions).toFixed(2) : "0.00"}
                </td>
                <td style={{ padding: "12px 16px", color: "#ff6b6b", fontSize: "13px" }}>
                  ₱{parseFloat(d.total_discount || 0).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}