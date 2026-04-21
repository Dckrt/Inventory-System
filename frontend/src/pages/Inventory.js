import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { apiFetch, getUser, getShop } from "../services/api";

const inp = {padding:"8px 11px",background:"#0D0D12",border:"1px solid #ffffff18",borderRadius:"7px",color:"#fff",fontSize:"13px",outline:"none",boxSizing:"border-box"};

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({name:"",stock:"",unit:"ml",reorder_level:10,category:"Other"});
  const [modal, setModal] = useState(null); // {item, type}
  const [qty, setQty] = useState("1");
  const user = getUser(); const shop = getShop(); const tc = shop.theme_color||"#D50036";

  const load = () => { apiFetch("/ingredients").then(d => setItems(d||[])); };
  useEffect(() => { load(); }, []);

  const cats = ["All",...new Set(items.map(i=>i.category).filter(Boolean))];
  const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) && (cat==="All"||i.category===cat));

  const status = item => item.stock===0 ? {c:"#ff6b6b",l:"Out of Stock"} : item.stock<=item.reorder_level ? {c:"#ffaa44",l:"Low Stock"} : {c:"#22cc77",l:"In Stock"};

  const addIng = async () => {
    if (!form.name) return alert("Enter ingredient name.");
    await apiFetch("/ingredients",{method:"POST",body:JSON.stringify(form)});
    setForm({name:"",stock:"",unit:"ml",reorder_level:10,category:"Other"}); setShowAdd(false); load();
  };

  const doStock = async () => {
    const q = parseFloat(qty); if (!q||q<=0) return alert("Enter valid quantity.");
    const res = await apiFetch(`/ingredients/${modal.item.id}/stock-${modal.type}`,{method:"POST",body:JSON.stringify({quantity:q})});
    if (res.message && res.message.toLowerCase().includes("insufficient")) return alert(res.message);
    setModal(null); load();
  };

  const del = async id => { if (!window.confirm("Delete?")) return; await apiFetch(`/ingredients/${id}`,{method:"DELETE"}); load(); };

  const TH = ({c}) => <th style={{padding:"12px 14px",color:"#8888aa",fontSize:"11px",letterSpacing:".8px",textAlign:"left",fontWeight:"500"}}>{c}</th>;

  return (
    <Layout title="Inventory">
      {/* Toolbar */}
      <div style={{display:"flex",gap:"10px",marginBottom:"16px",flexWrap:"wrap"}}>
        <input placeholder="🔍 Search..." value={search} onChange={e=>setSearch(e.target.value)} style={{flex:1,minWidth:"180px",padding:"9px 14px",background:"#13131A",border:"1px solid #ffffff18",borderRadius:"9px",color:"#fff",fontSize:"13px",outline:"none"}}/>
        {user.role==="admin" && <button onClick={()=>setShowAdd(!showAdd)} style={{padding:"9px 18px",background:tc,color:"#fff",border:"none",borderRadius:"9px",cursor:"pointer",fontSize:"13px",fontWeight:"600"}}>+ Add</button>}
      </div>

      {/* Cat filter */}
      <div style={{display:"flex",gap:"6px",flexWrap:"wrap",marginBottom:"16px"}}>
        {cats.map(c=><button key={c} onClick={()=>setCat(c)} style={{padding:"5px 12px",background:cat===c?tc:"#ffffff0a",color:cat===c?"#fff":"#8888aa",border:`1px solid ${cat===c?tc:"#ffffff18"}`,borderRadius:"20px",cursor:"pointer",fontSize:"11px"}}>{c}</button>)}
      </div>

      {/* Add form */}
      {showAdd && (
        <div style={{background:"#13131A",border:`1px solid ${tc}44`,borderRadius:"13px",padding:"16px",marginBottom:"16px",display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr auto",gap:"10px",alignItems:"end"}}>
          {[{l:"NAME",f:"name",ph:"e.g. Black Tea"},{l:"STOCK",f:"stock",ph:"0",t:"number"},{l:"UNIT",f:"unit",ph:"ml"},{l:"REORDER",f:"reorder_level",ph:"10",t:"number"},{l:"CATEGORY",f:"category",ph:"Other"}].map(x=>(
            <div key={x.f}>
              <label style={{color:"#556",fontSize:"10px",display:"block",marginBottom:"3px"}}>{x.l}</label>
              <input type={x.t||"text"} value={form[x.f]} placeholder={x.ph} onChange={e=>setForm({...form,[x.f]:e.target.value})} style={{...inp,width:"100%"}}/>
            </div>
          ))}
          <button onClick={addIng} style={{padding:"8px 16px",background:tc,color:"#fff",border:"none",borderRadius:"7px",cursor:"pointer",fontWeight:"600"}}>Add</button>
        </div>
      )}

      {/* Table */}
      <div style={{background:"#13131A",border:"1px solid #ffffff0f",borderRadius:"13px",overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse"}}>
          <thead><tr style={{borderBottom:"1px solid #ffffff0f"}}>
            {["Ingredient","Category","Stock","Reorder","Status","Actions"].map(c=><TH key={c} c={c}/>)}
          </tr></thead>
          <tbody>
            {filtered.map(item => { const st=status(item); return(
              <tr key={item.id} style={{borderBottom:"1px solid #ffffff06"}} onMouseEnter={e=>e.currentTarget.style.background="#ffffff04"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <td style={{padding:"12px 14px",color:"#fff",fontSize:"13px"}}>{item.name}</td>
                <td style={{padding:"12px 14px"}}><span style={{padding:"2px 9px",background:"#ffffff0a",borderRadius:"20px",color:"#8888aa",fontSize:"11px"}}>{item.category}</span></td>
                <td style={{padding:"12px 14px",color:"#fff",fontSize:"13px",fontWeight:"600"}}>{item.stock} <span style={{color:"#556",fontSize:"10px",fontWeight:"400"}}>{item.unit}</span></td>
                <td style={{padding:"12px 14px",color:"#8888aa",fontSize:"12px"}}>{item.reorder_level} {item.unit}</td>
                <td style={{padding:"12px 14px"}}><span style={{padding:"3px 9px",background:st.c+"22",color:st.c,borderRadius:"20px",fontSize:"10px",fontWeight:"600"}}>{st.l}</span></td>
                <td style={{padding:"12px 14px"}}>
                  <div style={{display:"flex",gap:"5px"}}>
                    <button onClick={()=>{setModal({item,type:"in"});setQty("1");}} style={{padding:"4px 10px",background:"#22cc7722",color:"#22cc77",border:"1px solid #22cc7744",borderRadius:"5px",cursor:"pointer",fontSize:"11px"}}>+IN</button>
                    <button onClick={()=>{setModal({item,type:"out"});setQty("1");}} style={{padding:"4px 10px",background:"#ffaa4422",color:"#ffaa44",border:"1px solid #ffaa4444",borderRadius:"5px",cursor:"pointer",fontSize:"11px"}}>-OUT</button>
                    {user.role==="admin" && <button onClick={()=>del(item.id)} style={{padding:"4px 10px",background:"#ff4b4b18",color:"#ff6b6b",border:"1px solid #ff4b4b33",borderRadius:"5px",cursor:"pointer",fontSize:"11px"}}>Del</button>}
                  </div>
                </td>
              </tr>
            );})}
            {!filtered.length && <tr><td colSpan={6} style={{padding:"36px",textAlign:"center",color:"#556"}}>No ingredients found.</td></tr>}
          </tbody>
        </table>
      </div>

      {/* Stock modal */}
      {modal && (
        <div style={{position:"fixed",inset:0,background:"#000000aa",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
          <div style={{background:"#13131A",border:"1px solid #ffffff18",borderRadius:"14px",padding:"24px",width:"300px"}}>
            <h3 style={{color:"#fff",margin:"0 0 5px",fontFamily:"'Playfair Display',serif"}}>{modal.type==="in"?"📦 Stock In":"📤 Stock Out"}</h3>
            <p style={{color:"#8888aa",fontSize:"12px",marginBottom:"16px"}}>{modal.item.name} · Current: {modal.item.stock} {modal.item.unit}</p>
            <label style={{color:"#556",fontSize:"11px",display:"block",marginBottom:"5px"}}>QUANTITY ({modal.item.unit})</label>
            <input type="number" value={qty} onChange={e=>setQty(e.target.value)} autoFocus style={{...inp,width:"100%",fontSize:"15px",marginBottom:"16px"}}/>
            <div style={{display:"flex",gap:"8px"}}>
              <button onClick={()=>setModal(null)} style={{flex:1,padding:"10px",background:"transparent",border:"1px solid #ffffff18",color:"#8888aa",borderRadius:"8px",cursor:"pointer"}}>Cancel</button>
              <button onClick={doStock} style={{flex:1,padding:"10px",background:modal.type==="in"?"#22cc77":"#ffaa44",border:"none",color:"#000",borderRadius:"8px",cursor:"pointer",fontWeight:"600"}}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}