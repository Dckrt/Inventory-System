import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch, getUser } from "../services/api";

const DRINK_TYPES = [
  { id:"milk_tea", label:"Milk Tea", emoji:"🧋", ingredients:[
    {name:"Black Tea",unit:"ml",cat:"Tea Base",ro:500},{name:"Oolong Tea",unit:"ml",cat:"Tea Base",ro:500},
    {name:"Jasmine Tea",unit:"ml",cat:"Tea Base",ro:500},{name:"Taro Powder",unit:"g",cat:"Tea Base",ro:200},
    {name:"Matcha Powder",unit:"g",cat:"Tea Base",ro:200},{name:"Brown Sugar",unit:"g",cat:"Sweetener",ro:300},
    {name:"Fresh Milk",unit:"ml",cat:"Milk",ro:1000},{name:"Evaporated Milk",unit:"ml",cat:"Milk",ro:500},
    {name:"Creamer",unit:"g",cat:"Milk",ro:300},{name:"Tapioca Pearls",unit:"g",cat:"Topping",ro:500},
    {name:"Nata de Coco",unit:"g",cat:"Topping",ro:200},{name:"Pudding",unit:"g",cat:"Topping",ro:200},
    {name:"Cheese Foam",unit:"ml",cat:"Topping",ro:200},{name:"Fructose",unit:"ml",cat:"Sweetener",ro:300},
  ]},
  { id:"ice_series", label:"Ice Series", emoji:"🧊", ingredients:[
    {name:"Crushed Ice",unit:"g",cat:"Base",ro:1000},{name:"Ice Cream (Vanilla)",unit:"g",cat:"Base",ro:500},
    {name:"Chocolate Powder",unit:"g",cat:"Base",ro:300},{name:"Strawberry Syrup",unit:"ml",cat:"Syrup",ro:300},
    {name:"Mango Syrup",unit:"ml",cat:"Syrup",ro:300},{name:"Condensed Milk",unit:"ml",cat:"Milk",ro:500},
    {name:"Caramel Syrup",unit:"ml",cat:"Syrup",ro:200},{name:"Popping Boba",unit:"g",cat:"Topping",ro:200},
    {name:"Grass Jelly",unit:"g",cat:"Topping",ro:200},
  ]},
  { id:"frappe", label:"Frappe", emoji:"☕", ingredients:[
    {name:"Espresso",unit:"ml",cat:"Coffee Base",ro:500},{name:"Coffee Powder",unit:"g",cat:"Coffee Base",ro:300},
    {name:"Mocha Syrup",unit:"ml",cat:"Syrup",ro:300},{name:"Caramel Syrup",unit:"ml",cat:"Syrup",ro:300},
    {name:"Vanilla Syrup",unit:"ml",cat:"Syrup",ro:300},{name:"Fresh Milk",unit:"ml",cat:"Milk",ro:1000},
    {name:"Whipped Cream",unit:"ml",cat:"Topping",ro:300},{name:"Coffee Jelly",unit:"g",cat:"Topping",ro:200},
    {name:"Hazelnut Syrup",unit:"ml",cat:"Syrup",ro:200},{name:"Crushed Ice",unit:"g",cat:"Base",ro:1000},
  ]},
  { id:"fruit_tea", label:"Fruit Tea", emoji:"🍊", ingredients:[
    {name:"Green Tea Base",unit:"ml",cat:"Tea Base",ro:500},{name:"Lemon Juice",unit:"ml",cat:"Fruit",ro:300},
    {name:"Mango Puree",unit:"ml",cat:"Fruit",ro:300},{name:"Passion Fruit Syrup",unit:"ml",cat:"Syrup",ro:300},
    {name:"Strawberry Puree",unit:"ml",cat:"Fruit",ro:300},{name:"Peach Syrup",unit:"ml",cat:"Syrup",ro:300},
    {name:"Lychee Syrup",unit:"ml",cat:"Syrup",ro:300},{name:"Fructose",unit:"ml",cat:"Sweetener",ro:300},
    {name:"Popping Boba",unit:"g",cat:"Topping",ro:200},{name:"Aloe Vera",unit:"g",cat:"Topping",ro:200},
  ]},
  { id:"original_tea", label:"Original Tea", emoji:"🍵", ingredients:[
    {name:"Black Tea",unit:"ml",cat:"Tea Base",ro:500},{name:"Green Tea",unit:"ml",cat:"Tea Base",ro:500},
    {name:"Earl Grey",unit:"ml",cat:"Tea Base",ro:500},{name:"Chamomile",unit:"g",cat:"Tea Base",ro:100},
    {name:"Honey",unit:"ml",cat:"Sweetener",ro:200},{name:"White Sugar",unit:"g",cat:"Sweetener",ro:500},
    {name:"Lemon Slice",unit:"pc",cat:"Garnish",ro:20},{name:"Mint Leaves",unit:"g",cat:"Garnish",ro:50},
  ]},
  { id:"hot_drinks", label:"Hot Drinks", emoji:"🔥", ingredients:[
    {name:"Espresso",unit:"ml",cat:"Coffee Base",ro:500},{name:"Ground Coffee",unit:"g",cat:"Coffee Base",ro:300},
    {name:"Fresh Milk",unit:"ml",cat:"Milk",ro:1000},{name:"Chocolate Powder",unit:"g",cat:"Base",ro:300},
    {name:"Caramel Syrup",unit:"ml",cat:"Syrup",ro:300},{name:"Vanilla Syrup",unit:"ml",cat:"Syrup",ro:300},
    {name:"Whipped Cream",unit:"ml",cat:"Topping",ro:300},{name:"Cinnamon Powder",unit:"g",cat:"Spice",ro:50},
  ]},
];

const SUPPLIES = [
  {name:"Cup (M)",unit:"pc",cat:"Supplies",ro:100},{name:"Cup (L)",unit:"pc",cat:"Supplies",ro:100},
  {name:"Cup (XL)",unit:"pc",cat:"Supplies",ro:100},{name:"Straw",unit:"pc",cat:"Supplies",ro:100},
  {name:"Sealing Film",unit:"pc",cat:"Supplies",ro:100},{name:"Ice",unit:"g",cat:"Supplies",ro:2000},
];

const inp = {padding:"8px 11px",background:"#0D0D12",border:"1px solid #ffffff18",borderRadius:"8px",color:"#fff",fontSize:"13px",outline:"none",boxSizing:"border-box"};

export default function Setup() {
  const [step, setStep] = useState(1);
  const [types, setTypes] = useState([]);
  const [available, setAvailable] = useState([]);
  const [selected, setSelected] = useState([]);
  const [cat, setCat] = useState("All");
  const [custom, setCustom] = useState({name:"",unit:"g",cat:"Other"});
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const navigate = useNavigate();
  const user = getUser();
  const shop = JSON.parse(localStorage.getItem("shop")||"{}");
  const tc = shop.theme_color || "#D50036";

  const toggleType = id => setTypes(p => p.includes(id) ? p.filter(t=>t!==id) : [...p,id]);

  const next1 = () => {
    if (!types.length) return setErr("Select at least one drink type.");
    const map = new Map();
    SUPPLIES.forEach(i => map.set(i.name,{...i,category:i.cat,reorder_level:i.ro}));
    types.forEach(tid => {
      DRINK_TYPES.find(d=>d.id===tid)?.ingredients.forEach(i => {
        if (!map.has(i.name)) map.set(i.name,{...i,category:i.cat,reorder_level:i.ro});
      });
    });
    setAvailable(Array.from(map.values()));
    setSelected([]); setErr(""); setStep(2);
  };

  const toggleIng = ing => {
    const exists = selected.find(s=>s.name===ing.name);
    setSelected(exists ? selected.filter(s=>s.name!==ing.name) : [...selected,{name:ing.name,unit:ing.unit,category:ing.category,stock:0,reorder_level:ing.reorder_level||10}]);
  };

  const filtered = cat==="All" ? available : available.filter(i=>i.category===cat);
  const cats = ["All",...new Set(available.map(i=>i.category))];
  const allInView = filtered.length>0 && filtered.every(i=>selected.find(s=>s.name===i.name));

  const toggleAll = () => {
    if (allInView) setSelected(selected.filter(s=>!filtered.find(f=>f.name===s.name)));
    else setSelected([...selected,...filtered.filter(i=>!selected.find(s=>s.name===i.name)).map(i=>({name:i.name,unit:i.unit,category:i.category,stock:0,reorder_level:i.reorder_level||10}))]);
  };

  const addCustom = () => {
    if (!custom.name.trim() || selected.find(s=>s.name===custom.name)) return;
    setSelected([...selected,{name:custom.name,unit:custom.unit,category:custom.cat,stock:0,reorder_level:10}]);
    setCustom({...custom,name:""});
  };

  const upd = (idx, key, val) => { const u=[...selected]; u[idx][key]=parseFloat(val)||0; setSelected(u); };

  const save = async () => {
    if (!selected.length) return setErr("Select at least one ingredient.");
    setLoading(true); setErr("");
    try {
      const r = await apiFetch("/setup",{method:"POST",body:JSON.stringify({ingredients:selected})});
      if (r?.status==="setup_complete") {
        const s=JSON.parse(localStorage.getItem("shop")||"{}");
        localStorage.setItem("shop",JSON.stringify({...s,is_setup:1}));
        setStep(4); setTimeout(()=>navigate("/dashboard"),2000);
      } else setErr(r?.message||"Setup failed. Is the backend running?");
    } catch { setErr("Cannot reach server. Make sure backend is running on port 5000."); }
    setLoading(false);
  };

  const StepDot = ({n,label}) => (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"4px"}}>
      <div style={{width:"30px",height:"30px",borderRadius:"50%",background:step>n?"#22cc77":step===n?tc:"#ffffff10",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"12px",fontWeight:"700"}}>{step>n?"✓":n}</div>
      <span style={{color:step===n?"#fff":"#556",fontSize:"10px",whiteSpace:"nowrap"}}>{label}</span>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:"#0D0D12",fontFamily:"'DM Sans',sans-serif",padding:"28px 16px"}}>
      <div style={{maxWidth:"780px",margin:"0 auto"}}>

        {/* Header */}
        <div style={{textAlign:"center",marginBottom:"24px"}}>
          <div style={{fontSize:"36px",marginBottom:"6px"}}>🧋</div>
          <h1 style={{color:"#fff",fontSize:"24px",fontWeight:"700",fontFamily:"'Playfair Display',serif",margin:"0 0 4px"}}>Set Up Your Shop</h1>
          <p style={{color:"#8888aa",fontSize:"13px",margin:0}}>Hi <span style={{color:tc,fontWeight:"600"}}>{user.username}</span>! Configure <span style={{color:"#fff",fontWeight:"600"}}>{shop.name}</span></p>
        </div>

        {/* Step dots */}
        <div style={{display:"flex",justifyContent:"center",alignItems:"center",marginBottom:"28px",gap:"0"}}>
          {[["Drink Types",1],["Ingredients",2],["Stock Levels",3],["Done!",4]].map(([l,n],i)=>(
            <div key={n} style={{display:"flex",alignItems:"center"}}>
              <StepDot n={n} label={l}/>
              {i<3 && <div style={{width:"40px",height:"1px",background:step>n?"#22cc7744":"#ffffff10",margin:"0 5px 14px"}}/>}
            </div>
          ))}
        </div>

        {err && <div style={{background:"#ff4b4b18",border:"1px solid #ff4b4b44",color:"#ff8080",padding:"11px 14px",borderRadius:"9px",fontSize:"13px",marginBottom:"16px"}}>⚠️ {err}</div>}

        {/* Step 1 */}
        {step===1 && (
          <div>
            <div style={{background:"#13131A",border:"1px solid #ffffff0f",borderRadius:"14px",padding:"20px",marginBottom:"16px"}}>
              <h3 style={{color:"#fff",margin:"0 0 4px",fontSize:"15px"}}>What drinks does your shop serve?</h3>
              <p style={{color:"#8888aa",fontSize:"12px",margin:"0 0 16px"}}>Pick all that apply — you can select multiple!</p>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:"9px"}}>
                {DRINK_TYPES.map(dt=>{const sel=types.includes(dt.id); return(
                  <div key={dt.id} onClick={()=>toggleType(dt.id)} style={{padding:"14px",background:sel?`${tc}18`:"#0D0D12",border:`2px solid ${sel?tc:"#ffffff10"}`,borderRadius:"11px",cursor:"pointer",display:"flex",alignItems:"center",gap:"10px",transition:"all .15s"}}>
                    <span style={{fontSize:"22px"}}>{dt.emoji}</span>
                    <div style={{flex:1}}>
                      <div style={{color:"#fff",fontWeight:"600",fontSize:"13px"}}>{dt.label}</div>
                      <div style={{color:"#556",fontSize:"11px"}}>{dt.ingredients.length} ingredients</div>
                    </div>
                    {sel && <div style={{width:"16px",height:"16px",borderRadius:"50%",background:tc,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"9px",flexShrink:0}}>✓</div>}
                  </div>
                );})}
              </div>
            </div>
            <div style={{display:"flex",justifyContent:"flex-end",gap:"10px",alignItems:"center"}}>
              <span style={{color:"#556",fontSize:"13px"}}>{types.length} selected</span>
              <button onClick={next1} style={{padding:"11px 24px",background:types.length?`linear-gradient(135deg,${tc},${tc}99)`:"#333",color:"#fff",border:"none",borderRadius:"10px",cursor:types.length?"pointer":"not-allowed",fontWeight:"600",fontSize:"13px"}}>Next →</button>
            </div>
          </div>
        )}

        {/* Step 2 */}
        {step===2 && (
          <div>
            <div style={{background:"#13131A",border:"1px solid #ffffff0f",borderRadius:"14px",padding:"18px",marginBottom:"12px"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"13px"}}>
                <div><h3 style={{color:"#fff",margin:"0 0 2px",fontSize:"14px"}}>Select Ingredients</h3><p style={{color:"#8888aa",fontSize:"12px",margin:0}}>From your chosen drink types</p></div>
                <div style={{textAlign:"right"}}><div style={{color:tc,fontSize:"18px",fontWeight:"700"}}>{selected.length}</div><div style={{color:"#556",fontSize:"11px"}}>selected</div></div>
              </div>
              <div style={{display:"flex",gap:"5px",flexWrap:"wrap",marginBottom:"12px",alignItems:"center"}}>
                {cats.map(c=><button key={c} onClick={()=>setCat(c)} style={{padding:"4px 11px",background:cat===c?tc:"#ffffff08",color:cat===c?"#fff":"#8888aa",border:`1px solid ${cat===c?tc:"#ffffff10"}`,borderRadius:"20px",cursor:"pointer",fontSize:"11px"}}>{c}</button>)}
                <button onClick={toggleAll} style={{marginLeft:"auto",padding:"4px 11px",background:"transparent",color:"#8888ff",border:"1px solid #8888ff44",borderRadius:"20px",cursor:"pointer",fontSize:"11px"}}>{allInView?"Deselect All":"Select All"}</button>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:"6px",maxHeight:"280px",overflowY:"auto"}}>
                {filtered.map((ing,i)=>{const isSel=!!selected.find(s=>s.name===ing.name); return(
                  <div key={i} onClick={()=>toggleIng(ing)} style={{padding:"10px",background:isSel?`${tc}18`:"#0D0D12",border:`1px solid ${isSel?tc+"77":"#ffffff0f"}`,borderRadius:"8px",cursor:"pointer",position:"relative"}}>
                    {isSel&&<div style={{position:"absolute",top:"5px",right:"5px",width:"13px",height:"13px",borderRadius:"50%",background:tc,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"8px"}}>✓</div>}
                    <div style={{color:isSel?"#fff":"#bbb",fontSize:"12px",fontWeight:"500",paddingRight:isSel?"16px":"0"}}>{ing.name}</div>
                    <div style={{color:"#556",fontSize:"10px",marginTop:"2px"}}>{ing.unit} · {ing.category}</div>
                  </div>
                );})}
              </div>
            </div>

            {/* Custom */}
            <div style={{background:"#13131A",border:"1px solid #ffffff0f",borderRadius:"11px",padding:"14px",marginBottom:"14px"}}>
              <p style={{color:"#8888aa",fontSize:"11px",margin:"0 0 9px",letterSpacing:".4px"}}>➕ CUSTOM INGREDIENT</p>
              <div style={{display:"flex",gap:"7px",flexWrap:"wrap"}}>
                <input value={custom.name} onChange={e=>setCustom({...custom,name:e.target.value})} onKeyDown={e=>e.key==="Enter"&&addCustom()} placeholder="Name" style={{...inp,flex:1,minWidth:"120px"}}/>
                <select value={custom.unit} onChange={e=>setCustom({...custom,unit:e.target.value})} style={{...inp,cursor:"pointer"}}>
                  {["ml","g","pc","L","kg"].map(u=><option key={u}>{u}</option>)}
                </select>
                <select value={custom.cat} onChange={e=>setCustom({...custom,cat:e.target.value})} style={{...inp,cursor:"pointer"}}>
                  {["Tea Base","Milk","Sweetener","Topping","Syrup","Fruit","Coffee Base","Base","Supplies","Other"].map(c=><option key={c}>{c}</option>)}
                </select>
                <button onClick={addCustom} style={{padding:"8px 16px",background:tc,color:"#fff",border:"none",borderRadius:"8px",cursor:"pointer",fontWeight:"600",fontSize:"13px"}}>Add</button>
              </div>
            </div>

            <div style={{display:"flex",justifyContent:"space-between"}}>
              <button onClick={()=>setStep(1)} style={{padding:"10px 20px",background:"transparent",border:"1px solid #ffffff18",color:"#8888aa",borderRadius:"10px",cursor:"pointer",fontSize:"13px"}}>← Back</button>
              <button disabled={!selected.length} onClick={()=>setStep(3)} style={{padding:"10px 22px",background:selected.length?`linear-gradient(135deg,${tc},${tc}99)`:"#333",color:"#fff",border:"none",borderRadius:"10px",cursor:selected.length?"pointer":"not-allowed",fontWeight:"600",fontSize:"13px"}}>
                Stock Levels ({selected.length}) →
              </button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step===3 && (
          <div>
            <div style={{background:"#13131A",border:"1px solid #ffffff0f",borderRadius:"14px",overflow:"hidden",marginBottom:"16px"}}>
              <div style={{padding:"14px 18px",borderBottom:"1px solid #ffffff08"}}>
                <h3 style={{color:"#fff",margin:"0 0 2px",fontSize:"14px"}}>Set Starting Stock & Reorder Levels</h3>
                <p style={{color:"#8888aa",fontSize:"12px",margin:0}}>You can update these anytime from Inventory.</p>
              </div>
              <div style={{maxHeight:"380px",overflowY:"auto"}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 115px 115px",padding:"9px 18px",borderBottom:"1px solid #ffffff08",color:"#556",fontSize:"11px",letterSpacing:".4px"}}>
                  <span>INGREDIENT</span><span>CURRENT STOCK</span><span>REORDER AT</span>
                </div>
                {selected.map((ing,idx)=>(
                  <div key={idx} style={{display:"grid",gridTemplateColumns:"1fr 115px 115px",padding:"9px 18px",borderBottom:"1px solid #ffffff06",alignItems:"center"}}>
                    <div><div style={{color:"#fff",fontSize:"13px"}}>{ing.name}</div><div style={{color:"#556",fontSize:"10px"}}>{ing.unit} · {ing.category}</div></div>
                    <div style={{display:"flex",alignItems:"center",gap:"4px"}}>
                      <input type="number" min="0" value={ing.stock} onChange={e=>upd(idx,"stock",e.target.value)} style={{...inp,width:"72px",padding:"6px 8px"}}/>
                      <span style={{color:"#556",fontSize:"10px"}}>{ing.unit}</span>
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:"4px"}}>
                      <input type="number" min="0" value={ing.reorder_level} onChange={e=>upd(idx,"reorder_level",e.target.value)} style={{...inp,width:"72px",padding:"6px 8px"}}/>
                      <span style={{color:"#556",fontSize:"10px"}}>{ing.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{display:"flex",justifyContent:"space-between"}}>
              <button onClick={()=>setStep(2)} style={{padding:"10px 20px",background:"transparent",border:"1px solid #ffffff18",color:"#8888aa",borderRadius:"10px",cursor:"pointer",fontSize:"13px"}}>← Back</button>
              <button onClick={save} disabled={loading} style={{padding:"10px 26px",background:loading?"#333":`linear-gradient(135deg,${tc},${tc}99)`,color:"#fff",border:"none",borderRadius:"10px",cursor:loading?"not-allowed":"pointer",fontWeight:"600",fontSize:"13px",boxShadow:loading?"none":`0 4px 16px ${tc}44`}}>
                {loading?"⏳ Saving...":"Complete Setup ✓"}
              </button>
            </div>
          </div>
        )}

        {/* Step 4 */}
        {step===4 && (
          <div style={{textAlign:"center",padding:"40px 0"}}>
            <div style={{fontSize:"56px",marginBottom:"12px"}}>🎉</div>
            <h2 style={{color:"#fff",fontFamily:"'Playfair Display',serif",margin:"0 0 6px"}}>Setup Complete!</h2>
            <p style={{color:"#8888aa",fontSize:"14px"}}>{shop.name} is ready. Redirecting...</p>
            <div style={{display:"inline-block",marginTop:"16px",width:"160px",height:"3px",background:"#ffffff10",borderRadius:"2px",overflow:"hidden"}}>
              <div style={{height:"100%",background:tc,animation:"prog 2s linear forwards"}}/>
            </div>
            <style>{`@keyframes prog{from{width:0}to{width:100%}}`}</style>
          </div>
        )}
      </div>
    </div>
  );
}