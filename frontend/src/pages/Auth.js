import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { apiFetch } from "../services/api";

const C = "#D50036"; // brand color
const COLORS = ["#D50036","#7C3AED","#0284C7","#16A34A","#D97706","#DB2777","#0D9488","#475569"];

const s = { // shared input style
  width:"100%", padding:"11px 14px", background:"#0D0D12",
  border:"1px solid #ffffff18", borderRadius:"9px", color:"#fff",
  fontSize:"14px", outline:"none", boxSizing:"border-box"
};

const Inp = ({ label, ...p }) => (
  <div style={{marginBottom:"13px"}}>
    <label style={{color:"#8888aa",fontSize:"11px",letterSpacing:".5px",display:"block",marginBottom:"5px"}}>{label}</label>
    <input style={s} onFocus={e=>e.target.style.borderColor=p.tc||C} onBlur={e=>e.target.style.borderColor="#ffffff18"} {...p} label={undefined} tc={undefined}/>
  </div>
);

function LoginForm({ tc, onSuccess }) {
  const [f, setF] = useState({ username:"", password:"" });
  const [err, setErr] = useState(""); const [load, setLoad] = useState(false);
  const [show, setShow] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const regMsg = location.state?.shopName;

  const submit = async () => {
    if (!f.username || !f.password) return setErr("Fill in all fields.");
    setLoad(true); setErr("");
    try {
      const d = await apiFetch("/login", { method:"POST", body:JSON.stringify(f) });
      if (d.status === "success") {
        localStorage.setItem("token", d.token);
        localStorage.setItem("user", JSON.stringify({ id:d.id, username:f.username, role:d.role, shop_id:d.shop_id }));
        localStorage.setItem("shop", JSON.stringify({ id:d.shop_id, name:d.shop_name, theme_color:d.theme_color, logo_text:d.logo_text, is_setup:d.is_setup }));
        navigate(d.role === "admin" && !d.is_setup ? "/setup" : "/dashboard");
      } else setErr("Invalid username or password.");
    } catch { setErr("Cannot connect to server. Is the backend running?"); }
    setLoad(false);
  };

  return (
    <div>
      {regMsg && <div style={{background:"#22cc7722",border:"1px solid #22cc7744",color:"#22cc77",padding:"11px 14px",borderRadius:"9px",fontSize:"13px",marginBottom:"16px"}}>🎉 <strong>{regMsg}</strong> created! Sign in now.</div>}
      {err && <div style={{background:"#ff4b4b18",border:"1px solid #ff4b4b44",color:"#ff8080",padding:"11px 14px",borderRadius:"9px",fontSize:"13px",marginBottom:"16px"}}>⚠️ {err}</div>}
      <Inp label="USERNAME" value={f.username} onChange={e=>setF({...f,username:e.target.value})} placeholder="Enter username" tc={tc} onKeyDown={e=>e.key==="Enter"&&submit()}/>
      <div style={{marginBottom:"22px",position:"relative"}}>
        <label style={{color:"#8888aa",fontSize:"11px",letterSpacing:".5px",display:"block",marginBottom:"5px"}}>PASSWORD</label>
        <input type={show?"text":"password"} value={f.password} onChange={e=>setF({...f,password:e.target.value})} onKeyDown={e=>e.key==="Enter"&&submit()} placeholder="Enter password" style={{...s,paddingRight:"42px"}} onFocus={e=>e.target.style.borderColor=tc} onBlur={e=>e.target.style.borderColor="#ffffff18"}/>
        <button onClick={()=>setShow(!show)} style={{position:"absolute",right:"12px",top:"34px",background:"none",border:"none",color:"#556",cursor:"pointer",fontSize:"15px"}}>{show?"🙈":"👁"}</button>
      </div>
      <button onClick={submit} disabled={load} style={{width:"100%",padding:"13px",background:load?"#333":`linear-gradient(135deg,${tc},${tc}99)`,color:"#fff",border:"none",borderRadius:"10px",fontSize:"15px",fontWeight:"600",cursor:load?"not-allowed":"pointer",boxShadow:load?"none":`0 4px 20px ${tc}44`}}>
        {load ? "Signing in..." : "Sign In →"}
      </button>
    </div>
  );
}

function RegisterForm({ tc, setTc }) {
  const [f, setF] = useState({ shop_name:"", username:"", password:"", confirm:"" });
  const [err, setErr] = useState(""); const [load, setLoad] = useState(false);
  const navigate = useNavigate();

  const submit = async () => {
    if (!f.shop_name || !f.username || !f.password) return setErr("All fields are required.");
    if (f.password !== f.confirm) return setErr("Passwords don't match.");
    if (f.password.length < 6) return setErr("Password must be at least 6 characters.");
    setLoad(true); setErr("");
    try {
      const d = await apiFetch("/register", { method:"POST", body:JSON.stringify({ shop_name:f.shop_name, username:f.username, password:f.password, theme_color:tc }) });
      if (d.status === "registered") navigate("/", { state:{ shopName:f.shop_name } });
      else setErr(d.message || "Registration failed.");
    } catch { setErr("Cannot connect to server. Is the backend running?"); }
    setLoad(false);
  };

  return (
    <div>
      {err && <div style={{background:"#ff4b4b18",border:"1px solid #ff4b4b44",color:"#ff8080",padding:"11px 14px",borderRadius:"9px",fontSize:"13px",marginBottom:"16px"}}>⚠️ {err}</div>}
      <Inp label="SHOP NAME" value={f.shop_name} onChange={e=>setF({...f,shop_name:e.target.value})} placeholder="e.g. Boba Paradise" tc={tc}/>
      <div style={{marginBottom:"13px"}}>
        <label style={{color:"#8888aa",fontSize:"11px",letterSpacing:".5px",display:"block",marginBottom:"7px"}}>BRAND COLOR</label>
        <div style={{display:"flex",gap:"7px",flexWrap:"wrap",alignItems:"center"}}>
          {COLORS.map(c=>(
            <button key={c} onClick={()=>setTc(c)} style={{width:"28px",height:"28px",background:c,border:tc===c?"3px solid #fff":"3px solid transparent",borderRadius:"50%",cursor:"pointer",transform:tc===c?"scale(1.15)":"scale(1)",transition:"all .15s"}}/>
          ))}
          <input type="color" value={tc} onChange={e=>setTc(e.target.value)} style={{width:"28px",height:"28px",border:"2px dashed #ffffff33",borderRadius:"50%",cursor:"pointer",background:"none",padding:0}}/>
        </div>
        <div style={{marginTop:"7px",display:"flex",alignItems:"center",gap:"7px"}}>
          <div style={{width:"14px",height:"14px",borderRadius:"3px",background:tc}}/>
          <span style={{color:tc,fontSize:"13px",fontWeight:"600"}}>{f.shop_name||"Your Shop Name"}</span>
        </div>
      </div>
      <div style={{borderTop:"1px solid #ffffff0f",margin:"14px 0"}}/>
      <Inp label="ADMIN USERNAME" value={f.username} onChange={e=>setF({...f,username:e.target.value})} placeholder="Choose a username" tc={tc}/>
      <Inp label="PASSWORD" type="password" value={f.password} onChange={e=>setF({...f,password:e.target.value})} placeholder="At least 6 characters" tc={tc}/>
      <div style={{marginBottom:"20px"}}>
        <label style={{color:"#8888aa",fontSize:"11px",letterSpacing:".5px",display:"block",marginBottom:"5px"}}>CONFIRM PASSWORD</label>
        <input type="password" value={f.confirm} onChange={e=>setF({...f,confirm:e.target.value})} onKeyDown={e=>e.key==="Enter"&&submit()} placeholder="Re-enter password" style={{...s,borderColor:f.confirm&&f.confirm!==f.password?"#ff4b4b":"#ffffff18"}} onFocus={e=>e.target.style.borderColor=f.confirm!==f.password?"#ff4b4b":tc} onBlur={e=>e.target.style.borderColor=f.confirm&&f.confirm!==f.password?"#ff4b4b":"#ffffff18"}/>
        {f.confirm && f.confirm!==f.password && <p style={{color:"#ff6b6b",fontSize:"11px",margin:"4px 0 0"}}>Passwords don't match</p>}
      </div>
      <button onClick={submit} disabled={load} style={{width:"100%",padding:"13px",background:load?"#333":`linear-gradient(135deg,${tc},${tc}99)`,color:"#fff",border:"none",borderRadius:"10px",fontSize:"15px",fontWeight:"600",cursor:load?"not-allowed":"pointer",boxShadow:load?"none":`0 4px 20px ${tc}44`}}>
        {load ? "Creating shop..." : "Create Shop & Account →"}
      </button>
    </div>
  );
}

export default function Auth() {
  const [tab, setTab] = useState("login");
  const [tc, setTc] = useState(C);

  return (
    <div style={{minHeight:"100vh",background:"#0D0D12",display:"flex",fontFamily:"'DM Sans',sans-serif",overflow:"hidden",position:"relative"}}>
      <div style={{position:"fixed",top:"-200px",right:"-200px",width:"600px",height:"600px",background:`radial-gradient(circle,${tc}18,transparent 70%)`,borderRadius:"50%",pointerEvents:"none"}}/>
      <div style={{position:"fixed",bottom:"-200px",left:"-100px",width:"400px",height:"400px",background:"radial-gradient(circle,#8B005518,transparent 70%)",borderRadius:"50%",pointerEvents:"none"}}/>

      {/* Left panel */}
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",padding:"60px"}}>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:"72px",marginBottom:"16px"}}>🧋</div>
          <h1 style={{color:"#fff",fontSize:"38px",fontWeight:"800",margin:"0 0 10px",fontFamily:"'Playfair Display',serif",lineHeight:"1.1"}}>
            Milk Tea<br/><span style={{color:tc}}>Inventory</span>
          </h1>
          <p style={{color:"#556",fontSize:"15px",maxWidth:"280px",lineHeight:"1.7",margin:"0 auto"}}>Complete inventory management for your milk tea business</p>
          <div style={{marginTop:"32px",display:"flex",gap:"10px",justifyContent:"center",flexWrap:"wrap"}}>
            {["POS System","Stock Tracking","Sales Reports","Multi-Branch"].map(f=>(
              <span key={f} style={{padding:"7px 14px",background:"#ffffff0a",border:"1px solid #ffffff12",borderRadius:"20px",color:"#8888aa",fontSize:"12px"}}>{f}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div style={{width:"420px",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",padding:"40px",background:"#13131A",borderLeft:"1px solid #ffffff0f",overflowY:"auto"}}>
        <div style={{width:"100%"}}>
          <div style={{marginBottom:"24px"}}>
            <h2 style={{color:"#fff",fontSize:"24px",fontWeight:"700",margin:"0 0 6px",fontFamily:"'Playfair Display',serif"}}>
              {tab==="login" ? "Welcome back" : "Create Your Shop"}
            </h2>
            <p style={{color:"#556",margin:0,fontSize:"14px"}}>
              {tab==="login" ? "Sign in to manage your shop" : "Set up your milk tea inventory"}
            </p>
          </div>

          {/* Tabs */}
          <div style={{display:"flex",background:"#0D0D12",borderRadius:"10px",padding:"4px",marginBottom:"22px"}}>
            {[["login","Sign In"],["register","Create Shop"]].map(([id,label])=>(
              <button key={id} onClick={()=>setTab(id)} style={{flex:1,padding:"9px",background:tab===id?tc:"transparent",color:tab===id?"#fff":"#8888aa",border:"none",borderRadius:"8px",cursor:"pointer",fontSize:"13px",fontWeight:tab===id?"600":"400",transition:"all .2s"}}>
                {label}
              </button>
            ))}
          </div>

          {tab==="login" ? <LoginForm tc={tc}/> : <RegisterForm tc={tc} setTc={setTc}/>}

          <div style={{marginTop:"20px",paddingTop:"16px",borderTop:"1px solid #ffffff0f",textAlign:"center"}}>
            <a href="/superadmin" style={{color:"#444466",fontSize:"12px",textDecoration:"none"}}>Super Admin Access</a>
          </div>
        </div>
      </div>
    </div>
  );
}