import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { apiFetch, getShop } from "../services/api";

const pmColor = {cash:"#22cc77",gcash:"#4488ff",card:"#aa88ff"};

export default function Sales() {
  const [data, setData] = useState([]);
  const [from, setFrom] = useState(""); const [to, setTo] = useState("");
  const shop = getShop(); const tc = shop.theme_color||"#D50036";

  const load = () => {
    let q = "/sales"; const p=[];
    if(from) p.push(`from=${from}`); if(to) p.push(`to=${to}`);
    if(p.length) q+="?"+p.join("&");
    apiFetch(q).then(d=>setData(d||[]));
  };
  useEffect(load,[]);

  const total = data.reduce((s,r)=>s+parseFloat(r.total||0),0);
  const di = {padding:"7px 11px",background:"#0D0D12",border:"1px solid #ffffff18",borderRadius:"7px",color:"#fff",fontSize:"12px",outline:"none"};
  const TH = ({c})=><th style={{padding:"12px 14px",color:"#8888aa",fontSize:"11px",letterSpacing:".8px",textAlign:"left",fontWeight:"500"}}>{c}</th>;

  return (
    <Layout title="Sales History">
      <div style={{background:"#13131A",border:"1px solid #ffffff0f",borderRadius:"13px",padding:"14px 18px",display:"flex",alignItems:"center",gap:"14px",marginBottom:"18px",flexWrap:"wrap"}}>
        {[["FROM",from,setFrom],["TO",to,setTo]].map(([l,v,sv])=>(
          <div key={l} style={{display:"flex",alignItems:"center",gap:"7px"}}>
            <label style={{color:"#556",fontSize:"11px"}}>{l}</label>
            <input type="date" value={v} onChange={e=>sv(e.target.value)} style={di}/>
          </div>
        ))}
        <button onClick={load} style={{padding:"7px 18px",background:tc,color:"#fff",border:"none",borderRadius:"7px",cursor:"pointer",fontSize:"12px",fontWeight:"600"}}>Filter</button>
        <button onClick={()=>{setFrom("");setTo("");}} style={{padding:"7px 14px",background:"transparent",color:"#8888aa",border:"1px solid #ffffff18",borderRadius:"7px",cursor:"pointer",fontSize:"12px"}}>Clear</button>
        <div style={{marginLeft:"auto",textAlign:"right"}}>
          <div style={{color:"#8888aa",fontSize:"10px"}}>TOTAL REVENUE</div>
          <div style={{color:tc,fontSize:"18px",fontWeight:"700"}}>₱{total.toLocaleString("en-PH",{minimumFractionDigits:2})}</div>
        </div>
      </div>

      <div style={{background:"#13131A",border:"1px solid #ffffff0f",borderRadius:"13px",overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr style={{borderBottom:"1px solid #ffffff0f"}}>
            {["TX#","Products","Payment","Discount","Total","Cashier","Date"].map(c=><TH key={c} c={c}/>)}
          </tr></thead>
          <tbody>
            {data.map(s=>(
              <tr key={s.id} style={{borderBottom:"1px solid #ffffff06"}} onMouseEnter={e=>e.currentTarget.style.background="#ffffff04"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <td style={{padding:"11px 14px",color:"#8888aa",fontSize:"11px"}}>#{s.id}</td>
                <td style={{padding:"11px 14px",color:"#ccc",fontSize:"12px",maxWidth:"160px"}}><div style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.products}</div></td>
                <td style={{padding:"11px 14px"}}><span style={{padding:"2px 9px",background:(pmColor[s.payment_method]||"#888")+"22",color:pmColor[s.payment_method]||"#888",borderRadius:"20px",fontSize:"10px",fontWeight:"600",textTransform:"capitalize"}}>{s.payment_method}</span></td>
                <td style={{padding:"11px 14px",color:"#ff6b6b",fontSize:"12px"}}>{parseFloat(s.discount)>0?`-₱${parseFloat(s.discount).toFixed(2)}`:"—"}</td>
                <td style={{padding:"11px 14px",color:tc,fontSize:"13px",fontWeight:"700"}}>₱{parseFloat(s.total).toFixed(2)}</td>
                <td style={{padding:"11px 14px",color:"#8888aa",fontSize:"11px"}}>{s.cashier}</td>
                <td style={{padding:"11px 14px",color:"#8888aa",fontSize:"11px"}}>{new Date(s.created_at).toLocaleString("en-PH",{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}</td>
              </tr>
            ))}
            {!data.length && <tr><td colSpan={7} style={{padding:"40px",textAlign:"center",color:"#556"}}>No sales found.</td></tr>}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}