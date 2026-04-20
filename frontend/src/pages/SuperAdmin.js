import { useState, useEffect } from "react";

const API = "http://localhost:5000";
const saFetch = (path,opts={}) => fetch(API+path,{...opts,headers:{"Content-Type":"application/json",Authorization:`Bearer ${localStorage.getItem("sa_token")}`,...(opts.headers||{})}}).then(r=>r.json());
const inp = {width:"100%",padding:"9px 11px",background:"#0A0A10",border:"1px solid #ffffff18",borderRadius:"7px",color:"#fff",fontSize:"13px",outline:"none",boxSizing:"border-box"};

export default function SuperAdmin() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("sa_token"));
  const [creds, setCreds] = useState({username:"",password:""});
  const [shops, setShops] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({shop_name:"",admin_username:"",admin_password:"",theme_color:"#D50036",logo_text:""});
  const [detail, setDetail] = useState(null);
  const [err, setErr] = useState("");

  const loadShops = () => saFetch("/superadmin/shops").then(d=>setShops(d||[]));
  useEffect(()=>{ if(loggedIn) loadShops(); },[loggedIn]);

  const login = async () => {
    const r = await fetch(API+"/superadmin/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(creds)}).then(r=>r.json());
    if(r.status==="success"){localStorage.setItem("sa_token",r.token);setLoggedIn(true);}
    else setErr("Invalid credentials.");
  };

  const createShop = async () => {
    if(!form.shop_name||!form.admin_username||!form.admin_password) return alert("Fill all required fields.");
    const r = await saFetch("/superadmin/shops",{method:"POST",body:JSON.stringify(form)});
    if(r.status==="created"){setShowCreate(false);setForm({shop_name:"",admin_username:"",admin_password:"",theme_color:"#D50036",logo_text:""});loadShops();}
    else alert(r.message||"Failed.");
  };

  const delShop = async id => {
    if(!window.confirm("Delete this shop and ALL its data?")) return;
    await saFetch(`/superadmin/shops/${id}`,{method:"DELETE"}); loadShops();
  };

  if(!loggedIn) return (
    <div style={{minHeight:"100vh",background:"#0A0A10",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'DM Sans',sans-serif"}}>
      <div style={{background:"#13131A",border:"1px solid #ffffff12",borderRadius:"18px",padding:"32px",width:"340px"}}>
        <div style={{textAlign:"center",marginBottom:"24px"}}><div style={{fontSize:"36px",marginBottom:"8px"}}>🔐</div><h2 style={{color:"#fff",margin:0,fontFamily:"'Playfair Display',serif"}}>Super Admin</h2><p style={{color:"#556",fontSize:"12px",margin:"5px 0 0"}}>System administrator access</p></div>
        {err && <div style={{background:"#ff4b4b18",border:"1px solid #ff4b4b44",color:"#ff8080",padding:"10px 13px",borderRadius:"8px",fontSize:"12px",marginBottom:"14px"}}>⚠️ {err}</div>}
        {[{l:"USERNAME",f:"username",ph:"superadmin"},{l:"PASSWORD",f:"password",ph:"••••••••",t:"password"}].map(x=>(
          <div key={x.f} style={{marginBottom:"12px"}}>
            <label style={{color:"#556",fontSize:"10px",display:"block",marginBottom:"4px"}}>{x.l}</label>
            <input type={x.t||"text"} value={creds[x.f]} placeholder={x.ph} onChange={e=>setCreds({...creds,[x.f]:e.target.value})} onKeyDown={e=>e.key==="Enter"&&login()} style={inp}/>
          </div>
        ))}
        <button onClick={login} style={{width:"100%",padding:"12px",background:"linear-gradient(135deg,#6644aa,#4422cc)",color:"#fff",border:"none",borderRadius:"9px",cursor:"pointer",fontSize:"13px",fontWeight:"600",marginTop:"4px"}}>Access Panel →</button>
        <div style={{textAlign:"center",marginTop:"14px"}}><a href="/" style={{color:"#444466",fontSize:"11px"}}>← Back to Login</a></div>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"#0A0A10",fontFamily:"'DM Sans',sans-serif",padding:"24px"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"24px"}}>
        <div><h1 style={{color:"#fff",margin:0,fontFamily:"'Playfair Display',serif",fontSize:"22px"}}>🔐 Super Admin Panel</h1><p style={{color:"#556",margin:"3px 0 0",fontSize:"12px"}}>Manage all shops</p></div>
        <div style={{display:"flex",gap:"9px"}}>
          <button onClick={()=>setShowCreate(!showCreate)} style={{padding:"9px 18px",background:"linear-gradient(135deg,#6644aa,#4422cc)",color:"#fff",border:"none",borderRadius:"9px",cursor:"pointer",fontWeight:"600",fontSize:"13px"}}>+ New Shop</button>
          <button onClick={()=>{localStorage.removeItem("sa_token");setLoggedIn(false);}} style={{padding:"9px 14px",background:"#ff4b4b18",color:"#ff6b6b",border:"1px solid #ff4b4b33",borderRadius:"9px",cursor:"pointer",fontSize:"13px"}}>Logout</button>
        </div>
      </div>

      {showCreate && (
        <div style={{background:"#13131A",border:"1px solid #6644aa44",borderRadius:"14px",padding:"20px",marginBottom:"20px"}}>
          <h3 style={{color:"#fff",margin:"0 0 16px",fontFamily:"'Playfair Display',serif",fontSize:"16px"}}>➕ Create New Shop</h3>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))",gap:"12px"}}>
            {[{l:"SHOP NAME *",f:"shop_name",ph:"Boba Paradise"},{l:"ADMIN USERNAME *",f:"admin_username",ph:"shopadmin"},{l:"ADMIN PASSWORD *",f:"admin_password",ph:"password",t:"password"},{l:"LOGO TEXT",f:"logo_text",ph:"Boba Paradise"}].map(x=>(
              <div key={x.f}><label style={{color:"#556",fontSize:"10px",display:"block",marginBottom:"4px"}}>{x.l}</label><input type={x.t||"text"} value={form[x.f]} placeholder={x.ph} onChange={e=>setForm({...form,[x.f]:e.target.value})} style={inp}/></div>
            ))}
            <div><label style={{color:"#556",fontSize:"10px",display:"block",marginBottom:"4px"}}>THEME COLOR</label>
              <div style={{display:"flex",gap:"7px",alignItems:"center"}}>
                <input type="color" value={form.theme_color} onChange={e=>setForm({...form,theme_color:e.target.value})} style={{width:"38px",height:"38px",border:"none",borderRadius:"7px",cursor:"pointer",background:"none"}}/>
                <input value={form.theme_color} onChange={e=>setForm({...form,theme_color:e.target.value})} style={{...inp,flex:1}}/>
              </div>
            </div>
          </div>
          <div style={{display:"flex",gap:"9px",marginTop:"16px"}}>
            <button onClick={createShop} style={{padding:"10px 24px",background:"linear-gradient(135deg,#6644aa,#4422cc)",color:"#fff",border:"none",borderRadius:"9px",cursor:"pointer",fontWeight:"600"}}>Create Shop</button>
            <button onClick={()=>setShowCreate(false)} style={{padding:"10px 18px",background:"transparent",color:"#8888aa",border:"1px solid #ffffff18",borderRadius:"9px",cursor:"pointer"}}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:"14px"}}>
        {shops.map(s=>(
          <div key={s.id} style={{background:"#13131A",border:"1px solid #ffffff0f",borderRadius:"14px",padding:"18px",position:"relative",overflow:"hidden"}}>
            <div style={{position:"absolute",top:0,right:0,width:"70px",height:"70px",background:`radial-gradient(circle,${s.theme_color}22,transparent)`,borderRadius:"0 14px 0 100%"}}/>
            <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"12px"}}>
              <div style={{width:"36px",height:"36px",background:s.theme_color+"33",borderRadius:"10px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"18px"}}>🧋</div>
              <div><div style={{color:"#fff",fontWeight:"700",fontSize:"14px"}}>{s.name}</div><div style={{color:s.theme_color,fontSize:"10px"}}>{s.is_setup?"✓ Setup complete":"⏳ Pending setup"}</div></div>
            </div>
            <div style={{display:"flex",gap:"12px",marginBottom:"13px"}}>
              {[{l:"USERS",v:s.user_count},{l:"INGREDIENTS",v:s.ingredient_count}].map(x=>(
                <div key={x.l} style={{flex:1,background:"#0A0A10",borderRadius:"7px",padding:"7px 10px"}}><div style={{color:"#556",fontSize:"9px"}}>{x.l}</div><div style={{color:"#fff",fontSize:"15px",fontWeight:"700"}}>{x.v}</div></div>
              ))}
            </div>
            <div style={{display:"flex",gap:"7px"}}>
              <button onClick={async()=>{const d=await saFetch(`/superadmin/shops/${s.id}`);setDetail(d);}} style={{flex:1,padding:"7px",background:"#ffffff0a",color:"#8888aa",border:"1px solid #ffffff18",borderRadius:"7px",cursor:"pointer",fontSize:"11px"}}>View</button>
              <button onClick={()=>delShop(s.id)} style={{padding:"7px 11px",background:"#ff4b4b18",color:"#ff6b6b",border:"1px solid #ff4b4b33",borderRadius:"7px",cursor:"pointer",fontSize:"11px"}}>🗑</button>
            </div>
          </div>
        ))}
        {!shops.length && (
          <div style={{gridColumn:"1/-1",textAlign:"center",padding:"50px",color:"#556",background:"#13131A",border:"1px dashed #ffffff18",borderRadius:"14px"}}>
            <div style={{fontSize:"40px",marginBottom:"10px"}}>🏪</div><p style={{margin:0}}>No shops yet. Create the first one!</p>
          </div>
        )}
      </div>

      {detail && (
        <div style={{position:"fixed",inset:0,background:"#000000cc",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:"20px"}}>
          <div style={{background:"#13131A",border:"1px solid #ffffff18",borderRadius:"18px",padding:"24px",width:"460px",maxHeight:"80vh",overflowY:"auto"}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:"18px"}}>
              <h3 style={{color:"#fff",margin:0,fontFamily:"'Playfair Display',serif"}}>{detail.shop?.name}</h3>
              <button onClick={()=>setDetail(null)} style={{background:"none",border:"none",color:"#8888aa",cursor:"pointer",fontSize:"18px"}}>×</button>
            </div>
            <h4 style={{color:"#8888aa",fontSize:"11px",letterSpacing:".5px",margin:"0 0 9px"}}>USERS</h4>
            {detail.users?.map(u=>(
              <div key={u.id} style={{display:"flex",justifyContent:"space-between",padding:"7px 11px",background:"#0D0D12",borderRadius:"7px",marginBottom:"5px"}}>
                <span style={{color:"#fff",fontSize:"12px"}}>{u.username}</span>
                <span style={{color:u.role==="admin"?"#D50036":"#8888aa",fontSize:"11px",textTransform:"capitalize"}}>{u.role}</span>
              </div>
            ))}
            <h4 style={{color:"#8888aa",fontSize:"11px",letterSpacing:".5px",margin:"14px 0 9px"}}>INGREDIENTS ({detail.ingredients?.length||0})</h4>
            <div style={{display:"flex",flexWrap:"wrap",gap:"5px"}}>
              {detail.ingredients?.map(i=><span key={i.id} style={{padding:"3px 9px",background:"#ffffff0a",color:"#aaa",borderRadius:"20px",fontSize:"11px"}}>{i.name}</span>)}
              {!detail.ingredients?.length && <span style={{color:"#556",fontSize:"12px"}}>Not set up yet.</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}