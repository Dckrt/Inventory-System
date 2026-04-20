import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getUser, getShop } from "../services/api";

const NAV = [
  { path:"/dashboard", icon:"🧋", label:"Dashboard", roles:["admin","staff"] },
  { path:"/pos",       icon:"💳", label:"POS",       roles:["admin","staff"] },
  { path:"/inventory", icon:"📦", label:"Inventory", roles:["admin","staff"] },
  { path:"/products",  icon:"🍵", label:"Products",  roles:["admin","staff"] },
  { path:"/sales",     icon:"📋", label:"Sales",     roles:["admin","staff"] },
  { path:"/reports",   icon:"📊", label:"Reports",   roles:["admin"] },
  { path:"/users",     icon:"👥", label:"Users",     roles:["admin"] },
];

export default function Layout({ children, title }) {
  const loc = useLocation();
  const nav = useNavigate();
  const user = getUser();
  const shop = getShop();
  const [col, setCol] = useState(false);
  const tc = shop.theme_color || "#D50036";

  useEffect(() => {
    document.documentElement.style.setProperty("--brand", tc);
  }, [tc]);

  const logout = () => { localStorage.clear(); nav("/"); };
  const items = NAV.filter(n => n.roles.includes(user.role));

  return (
    <div style={{display:"flex",minHeight:"100vh",background:"#0D0D12",fontFamily:"'DM Sans',sans-serif"}}>

      {/* Sidebar */}
      <aside style={{width:col?"68px":"225px",background:"linear-gradient(180deg,#13131A,#0D0D12)",borderRight:`1px solid ${tc}22`,display:"flex",flexDirection:"column",transition:"width .3s",position:"sticky",top:0,height:"100vh",overflow:"hidden",flexShrink:0,zIndex:100}}>

        {/* Logo */}
        <div onClick={()=>setCol(!col)} style={{padding:"22px 14px 18px",borderBottom:`1px solid ${tc}22`,display:"flex",alignItems:"center",gap:"10px",cursor:"pointer"}}>
          <div style={{width:"36px",height:"36px",background:`linear-gradient(135deg,${tc},${tc}88)`,borderRadius:"11px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"17px",flexShrink:0,boxShadow:`0 4px 14px ${tc}44`}}>🧋</div>
          {!col && <div>
            <div style={{color:"#fff",fontWeight:"700",fontSize:"13px",lineHeight:"1.2"}}>{shop.logo_text||"MilkTea"}</div>
            <div style={{color:tc,fontSize:"10px",letterSpacing:"1px",textTransform:"uppercase"}}>Inventory</div>
          </div>}
        </div>

        {/* Nav */}
        <nav style={{flex:1,padding:"14px 7px",overflowY:"auto"}}>
          {items.map(item => {
            const active = loc.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} style={{textDecoration:"none"}}>
                <div style={{display:"flex",alignItems:"center",gap:"10px",padding:"10px 11px",borderRadius:"9px",marginBottom:"3px",background:active?`${tc}22`:"transparent",borderLeft:active?`3px solid ${tc}`:"3px solid transparent",color:active?"#fff":"#8888aa",fontSize:"13px",fontWeight:active?"600":"400",transition:"all .2s",whiteSpace:"nowrap"}}
                  onMouseEnter={e=>!active&&(e.currentTarget.style.background="#ffffff0a")}
                  onMouseLeave={e=>!active&&(e.currentTarget.style.background="transparent")}
                >
                  <span style={{fontSize:"17px",flexShrink:0}}>{item.icon}</span>
                  {!col && item.label}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User + Logout */}
        <div style={{padding:"10px 7px",borderTop:`1px solid ${tc}22`}}>
          {!col && <div style={{padding:"9px 11px",background:"#ffffff08",borderRadius:"9px",marginBottom:"7px"}}>
            <div style={{color:"#fff",fontSize:"13px",fontWeight:"600"}}>{user.username}</div>
            <div style={{color:tc,fontSize:"10px",textTransform:"capitalize",letterSpacing:".5px"}}>{user.role} • {shop.name}</div>
          </div>}
          <button onClick={logout} style={{width:"100%",padding:"9px",background:"#ff4b4b18",color:"#ff6b6b",border:"1px solid #ff4b4b33",borderRadius:"9px",cursor:"pointer",fontSize:"12px",display:"flex",alignItems:"center",justifyContent:col?"center":"flex-start",gap:"7px"}}>
            <span>🚪</span>{!col && "Logout"}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{flex:1,display:"flex",flexDirection:"column",overflowX:"hidden"}}>
        <div style={{padding:"18px 26px",borderBottom:"1px solid #ffffff0f",background:"#0D0D12",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:50}}>
          <h1 style={{color:"#fff",fontSize:"20px",fontWeight:"700",margin:0,fontFamily:"'Playfair Display',serif"}}>{title}</h1>
          <div style={{color:"#555577",fontSize:"12px"}}>{new Date().toLocaleDateString("en-PH",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}</div>
        </div>
        <div style={{flex:1,padding:"22px 26px",overflowY:"auto"}}>{children}</div>
      </main>
    </div>
  );
}