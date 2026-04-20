import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { apiFetch, getShop } from "../services/api";

const Card = ({label,value,icon,color,sub}) => (
  <div style={{background:"#13131A",border:"1px solid #ffffff0f",borderRadius:"14px",padding:"20px",position:"relative",overflow:"hidden"}}>
    <div style={{position:"absolute",top:"-16px",right:"-8px",fontSize:"56px",opacity:.06}}>{icon}</div>
    <div style={{color:"#8888aa",fontSize:"11px",letterSpacing:".8px",marginBottom:"6px"}}>{label}</div>
    <div style={{color:color||"#fff",fontSize:"26px",fontWeight:"700",marginBottom:"3px"}}>{value}</div>
    {sub && <div style={{color:"#556",fontSize:"11px"}}>{sub}</div>}
  </div>
);

export default function Dashboard() {
  const [summary, setSummary] = useState({});
  const [top, setTop] = useState([]);
  const [low, setLow] = useState([]);
  const shop = getShop();
  const tc = shop.theme_color || "#D50036";

  useEffect(() => {
    apiFetch("/reports/summary").then(d => d && setSummary(d));
    apiFetch("/reports/top-products").then(d => setTop((d||[]).slice(0,5)));
    apiFetch("/ingredients").then(d => d && setLow(d.filter(i => i.stock <= i.reorder_level)));
  }, []);

  const p = n => parseFloat(n||0).toLocaleString("en-PH",{minimumFractionDigits:2});

  return (
    <Layout title="Dashboard">
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))",gap:"14px",marginBottom:"22px"}}>
        <Card label="TODAY'S REVENUE" value={`₱${p(summary.today_revenue)}`} icon="💰" color={tc} sub={`${summary.today_transactions||0} transactions`}/>
        <Card label="MONTHLY REVENUE" value={`₱${p(summary.month_revenue)}`} icon="📈" color="#22cc77"/>
        <Card label="TOTAL PRODUCTS"  value={summary.total_products||0} icon="🍵" color="#8888ff"/>
        <Card label="LOW STOCK ALERTS" value={summary.low_stock_count||0} icon="⚠️" color={summary.low_stock_count>0?"#ffaa44":"#22cc77"} sub={summary.low_stock_count>0?"Needs restocking":"All good!"}/>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"18px"}}>
        <div style={{background:"#13131A",border:"1px solid #ffffff0f",borderRadius:"14px",padding:"18px"}}>
          <h3 style={{color:"#fff",fontSize:"14px",margin:"0 0 14px",fontWeight:"600"}}>🏆 Top Products</h3>
          {!top.length && <p style={{color:"#556",fontSize:"13px"}}>No sales yet.</p>}
          {top.map((p,i) => (
            <div key={i} style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"10px"}}>
              <div style={{width:"26px",height:"26px",background:i===0?"#ffd700":i===1?"#c0c0c0":i===2?"#cd7f32":"#ffffff18",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"11px",fontWeight:"700",color:"#000",flexShrink:0}}>{i+1}</div>
              <div style={{flex:1}}>
                <div style={{color:"#fff",fontSize:"12px"}}>{p.name}</div>
                <div style={{height:"3px",background:"#ffffff0f",borderRadius:"2px",marginTop:"4px",overflow:"hidden"}}>
                  <div style={{height:"100%",background:tc,width:`${(p.total_sold/(top[0]?.total_sold||1))*100}%`,borderRadius:"2px"}}/>
                </div>
              </div>
              <div style={{color:"#8888aa",fontSize:"11px"}}>{p.total_sold} sold</div>
            </div>
          ))}
        </div>

        <div style={{background:"#13131A",border:`1px solid ${low.length?"#ffaa4433":"#ffffff0f"}`,borderRadius:"14px",padding:"18px"}}>
          <h3 style={{color:"#fff",fontSize:"14px",margin:"0 0 14px",fontWeight:"600"}}>⚠️ Low Stock Alerts</h3>
          {!low.length && <p style={{color:"#22cc77",fontSize:"13px"}}>✓ All stocked!</p>}
          {low.slice(0,6).map((ing,i) => (
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:i<Math.min(low.length,6)-1?"1px solid #ffffff08":"none"}}>
              <div>
                <div style={{color:"#fff",fontSize:"12px"}}>{ing.name}</div>
                <div style={{color:"#556",fontSize:"10px"}}>Reorder at: {ing.reorder_level} {ing.unit}</div>
              </div>
              <span style={{padding:"3px 9px",background:ing.stock===0?"#ff4b4b22":"#ffaa4422",color:ing.stock===0?"#ff6b6b":"#ffaa44",borderRadius:"20px",fontSize:"11px",fontWeight:"600"}}>
                {ing.stock} {ing.unit}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}