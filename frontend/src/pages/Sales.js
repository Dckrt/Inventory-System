import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { apiFetch, getShop } from "../services/api";

export default function Sales() {
  const [data, setData] = useState([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const shop = getShop();
  const themeColor = shop.theme_color || "#D50036";

  const load = () => {
    let query = "/sales";
    const params = [];
    if (from) params.push(`from=${from}`);
    if (to) params.push(`to=${to}`);
    if (params.length) query += "?" + params.join("&");
    apiFetch(query).then(d => setData(d || []));
  };

  useEffect(load, []);

  const totalRevenue = data.reduce((sum, s) => sum + parseFloat(s.total || 0), 0);

  const paymentColors = { cash: "#22cc77", gcash: "#4488ff", card: "#aa88ff" };

  return (
    <Layout title="Sales History">
      {/* Filters */}
      <div style={{
        background: "#13131A",
        border: "1px solid #ffffff0f",
        borderRadius: "14px",
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        gap: "16px",
        marginBottom: "20px",
        flexWrap: "wrap"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <label style={{ color: "#556", fontSize: "12px" }}>FROM</label>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} style={{
            padding: "8px 12px",
            background: "#0D0D12",
            border: "1px solid #ffffff18",
            borderRadius: "8px",
            color: "#fff",
            fontSize: "13px",
            outline: "none"
          }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <label style={{ color: "#556", fontSize: "12px" }}>TO</label>
          <input type="date" value={to} onChange={e => setTo(e.target.value)} style={{
            padding: "8px 12px",
            background: "#0D0D12",
            border: "1px solid #ffffff18",
            borderRadius: "8px",
            color: "#fff",
            fontSize: "13px",
            outline: "none"
          }} />
        </div>
        <button onClick={load} style={{
          padding: "8px 20px",
          background: themeColor,
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "13px",
          fontWeight: "600"
        }}>Filter</button>
        <button onClick={() => { setFrom(""); setTo(""); load(); }} style={{
          padding: "8px 16px",
          background: "transparent",
          color: "#8888aa",
          border: "1px solid #ffffff18",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "13px"
        }}>Clear</button>

        <div style={{ marginLeft: "auto", textAlign: "right" }}>
          <div style={{ color: "#8888aa", fontSize: "11px" }}>TOTAL REVENUE</div>
          <div style={{ color: themeColor, fontSize: "20px", fontWeight: "700" }}>
            ₱{totalRevenue.toLocaleString("en-PH", { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

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
              {["TX#", "Products", "Payment", "Discount", "Total", "Cashier", "Date"].map(h => (
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
            {data.map(s => (
              <tr key={s.id} style={{ borderBottom: "1px solid #ffffff06" }}
                onMouseEnter={e => e.currentTarget.style.background = "#ffffff04"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <td style={{ padding: "12px 16px", color: "#8888aa", fontSize: "12px" }}>#{s.id}</td>
                <td style={{ padding: "12px 16px", color: "#ccc", fontSize: "13px", maxWidth: "180px" }}>
                  <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {s.products}
                  </div>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{
                    padding: "3px 10px",
                    background: (paymentColors[s.payment_method] || "#888") + "22",
                    color: paymentColors[s.payment_method] || "#888",
                    borderRadius: "20px",
                    fontSize: "11px",
                    fontWeight: "600",
                    textTransform: "capitalize"
                  }}>{s.payment_method}</span>
                </td>
                <td style={{ padding: "12px 16px", color: "#ff6b6b", fontSize: "13px" }}>
                  {parseFloat(s.discount) > 0 ? `-₱${parseFloat(s.discount).toFixed(2)}` : "—"}
                </td>
                <td style={{ padding: "12px 16px", color: themeColor, fontSize: "14px", fontWeight: "700" }}>
                  ₱{parseFloat(s.total).toFixed(2)}
                </td>
                <td style={{ padding: "12px 16px", color: "#8888aa", fontSize: "12px" }}>
                  {s.cashier}
                </td>
                <td style={{ padding: "12px 16px", color: "#8888aa", fontSize: "12px" }}>
                  {new Date(s.created_at).toLocaleString("en-PH", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={7} style={{ padding: "50px", textAlign: "center", color: "#556" }}>
                  No sales found for the selected period.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}