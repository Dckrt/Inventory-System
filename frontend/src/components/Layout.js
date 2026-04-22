import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getUser, getShop } from "../services/api";

// SVG icon components — clean, professional
const Icon = ({ d, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
    {Array.isArray(d) ? d.map((p,i) => <path key={i} d={p}/>) : <path d={d}/>}
  </svg>
);

const ICONS = {
  dashboard: ["M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z","M9 22V12h6v10"],
  pos:       ["M3 3h18","M3 9h18","M9 3v18","M15 3v6","M3 15h6","M3 21h6","M15 15h6","M15 21h6","M15 15v6"],
  inventory: ["M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z","M16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z","M12 12v5","M9.5 12v5","M14.5 12v5"],
  products:  ["M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"],
  sales:     ["M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z","M14 2v6h6","M16 13H8","M16 17H8","M10 9H8"],
  reports:   ["M18 20V10","M12 20V4","M6 20v-6"],
  users:     ["M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2","M9 11a4 4 0 100-8 4 4 0 000 8z","M23 21v-2a4 4 0 00-3-3.87","M16 3.13a4 4 0 010 7.75"],
  logout:    ["M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4","M16 17l5-5-5-5","M21 12H9"],
  collapse:  "M15 18l-6-6 6-6",
  expand:    "M9 18l6-6-6-6",
  bubble:    ["M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z","M8 12h8","M12 8v8"],
};

const NavIcon = ({ name, size }) => <Icon d={ICONS[name] || ICONS.dashboard} size={size}/>;

const NAV = [
  { path:"/dashboard", icon:"dashboard", label:"Dashboard", roles:["admin","staff"] },
  { path:"/pos",       icon:"pos",       label:"POS",       roles:["admin","staff"] },
  { path:"/inventory", icon:"inventory", label:"Inventory", roles:["admin","staff"] },
  { path:"/products",  icon:"products",  label:"Products",  roles:["admin","staff"] },
  { path:"/sales",     icon:"sales",     label:"Sales",     roles:["admin","staff"] },
  { path:"/reports",   icon:"reports",   label:"Reports",   roles:["admin"] },
  { path:"/users",     icon:"users",     label:"Users",     roles:["admin"] },
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
          <div style={{width:"36px",height:"36px",background:`linear-gradient(135deg,${tc},${tc}88)`,borderRadius:"11px",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:`0 4px 14px ${tc}44`,color:"#fff"}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 3H7a2 2 0 00-2 2v5a6 6 0 0012 0V5a2 2 0 00-2-2h-1"/>
              <path d="M8 3V2M16 3V2"/>
              <path d="M7 15c0 3.314 2.239 6 5 6s5-2.686 5-6"/>
              <path d="M17 7h2a2 2 0 012 2v1a2 2 0 01-2 2h-2"/>
            </svg>
          </div>
          {!col && <div>
            <div style={{color:"#fff",fontWeight:"700",fontSize:"13px",lineHeight:"1.2"}}>{shop.logo_text||"MilkTea"}</div>
            <div style={{color:tc,fontSize:"10px",letterSpacing:"1px",textTransform:"uppercase"}}>Inventory</div>
          </div>}
          {!col && <div style={{marginLeft:"auto",color:"#8888aa"}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d={col ? "M9 18l6-6-6-6" : "M15 18l-6-6 6-6"}/>
            </svg>
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
                  <NavIcon name={item.icon} size={17}/>
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
            <NavIcon name="logout" size={15}/>
            {!col && "Logout"}
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