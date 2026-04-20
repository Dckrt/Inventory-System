import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { apiFetch, getShop } from "../services/api";

export default function Reports() {
  const [daily, setDaily] = useState([]);
  const [top, setTop] = useState([]);
  const shop = getShop(); const tc = shop.theme_color||"#D50036";

  useEffect(()=>{
    apiFetch("/reports/daily").then(d=>setDaily(d||[]));
    apiFetch("/reports/top-products").then(d=>setTop(d||[]));
  },[]);

  const maxR = Math.max(...daily.map(d=>d.revenue||0),1);
  const maxS = Math.max(...top.map(p=>p.total_sold||0),1);
  const totalRev = daily.reduce((s,d)=>s+parseFloat(d.revenue||0),0);
  const totalTx = daily.reduce((s,d)=>s+parseInt(d.transactions||0),0);
  const p = n => parseFloat(n||0).toLocaleString("en-PH",{minimumFractionDigits:2});

  return (
    <Layout title="Reports">
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"14px",marginBottom:"22px"}}>
        {[{l:"30-DAY REVENUE",v:`₱${p(totalRev)}`,c:tc},{l:"TOTAL TRANSACTIONS",v:totalTx,c:"#22cc77"},{l:"AVG. PER DAY",v:`₱${daily.length?(totalRev/daily.length).toFixed(2):"0.00"}`,c:"#8888ff"}].map((s,i)=>(
          <div key={i} style={{background:"#13131A",border:"1px solid #ffffff0f",borderRadius:"13px",padding:"18px 20px"}}>
            <div style={{color:"#8888aa",fontSize:"11px",letterSpacing:".8px",marginBottom:"6px"}}>{s.l}</div>
            <div style={{color:s.c,fontSize:"24px",fontWeight:"700"}}>{s.v}</div>
          </div>
        ))}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1.5fr 1fr",gap:"18px",marginBottom:"18px"}}>
        {/* Bar chart */}
        <div style={{background:"#13131A",border:"1px solid #ffffff0f",borderRadius:"13px",padding:"20px"}}>
          <h3 style={{color:"#fff",margin:"0 0 16px",fontSize:"14px"}}>📈 Daily Revenue (Last 30 Days)</h3>
          {!daily.length && <p style={{color:"#556",fontSize:"12px"}}>No data yet.</p>}
          <div style={{display:"flex",alignItems:"flex-end",gap:"3px",height:"180px"}}>
            {daily.slice().reverse().slice(0,20).map((d,i)=>{
              const h=(parseFloat(d.revenue)/maxR)*160;
              return(
                <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:"3px"}} title={`${d.date}\n₱${p(d.revenue)}`}>
                  <div style={{width:"100%",height:`${Math.max(h,2)}px`,background:`linear-gradient(180deg,${tc},${tc}66)`,borderRadius:"3px 3px 0 0",cursor:"pointer",transition:"opacity .2s"}} onMouseEnter={e=>e.currentTarget.style.opacity=".7"} onMouseLeave={e=>e.currentTarget.style.opacity="1"}/>
                  <div style={{color:"#556",fontSize:"8px",transform:"rotate(-45deg)",whiteSpace:"nowrap"}}>{d.date?.slice(5)}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top products */}
        <div style={{background:"#13131A",border:"1px solid #ffffff0f",borderRadius:"13px",padding:"20px"}}>
          <h3 style={{color:"#fff",margin:"0 0 16px",fontSize:"14px"}}>🏆 Top Products</h3>
          {!top.length && <p style={{color:"#556",fontSize:"12px"}}>No sales yet.</p>}
          {top.map((p,i)=>(
            <div key={i} style={{marginBottom:"13px"}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:"5px"}}>
                <span style={{color:"#fff",fontSize:"12px"}}>{i===0?"🥇":i===1?"🥈":i===2?"🥉":`${i+1}.`} {p.name}</span>
                <span style={{color:"#8888aa",fontSize:"11px"}}>{p.total_sold} sold</span>
              </div>
              <div style={{height:"5px",background:"#ffffff0a",borderRadius:"3px"}}>
                <div style={{height:"100%",width:`${(p.total_sold/maxS)*100}%`,background:tc,borderRadius:"3px"}}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Daily table */}
      <div style={{background:"#13131A",border:"1px solid #ffffff0f",borderRadius:"13px",overflow:"hidden"}}>
        <div style={{padding:"14px 18px",borderBottom:"1px solid #ffffff0f"}}><h3 style={{color:"#fff",margin:0,fontSize:"14px"}}>📅 Daily Breakdown</h3></div>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr style={{borderBottom:"1px solid #ffffff0f"}}>
            {["Date","Transactions","Revenue","Avg/TX","Discount"].map(h=><th key={h} style={{padding:"11px 14px",color:"#8888aa",fontSize:"11px",letterSpacing:".8px",textAlign:"left",fontWeight:"500"}}>{h}</th>)}
          </tr></thead>
          <tbody>
            {daily.map(d=>(
              <tr key={d.date} style={{borderBottom:"1px solid #ffffff06"}} onMouseEnter={e=>e.currentTarget.style.background="#ffffff04"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <td style={{padding:"11px 14px",color:"#fff",fontSize:"12px"}}>{d.date}</td>
                <td style={{padding:"11px 14px",color:"#8888aa",fontSize:"12px"}}>{d.transactions}</td>
                <td style={{padding:"11px 14px",color:tc,fontSize:"13px",fontWeight:"700"}}>₱{p(d.revenue)}</td>
                <td style={{padding:"11px 14px",color:"#8888aa",fontSize:"12px"}}>₱{d.transactions>0?(parseFloat(d.revenue)/d.transactions).toFixed(2):"0.00"}</td>
                <td style={{padding:"11px 14px",color:"#ff6b6b",fontSize:"12px"}}>₱{p(d.total_discount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}