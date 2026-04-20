import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { apiFetch, getUser, getShop } from "../services/api";

const inp = {width:"100%",padding:"9px 11px",background:"#0D0D12",border:"1px solid #ffffff18",borderRadius:"7px",color:"#fff",fontSize:"13px",outline:"none",boxSizing:"border-box"};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({name:"",price:"",category:"Drinks"});
  const [recipe, setRecipe] = useState([]);
  const [recipeView, setRecipeView] = useState(null);
  const user = getUser(); const shop = getShop(); const tc = shop.theme_color||"#D50036";

  const load = () => { apiFetch("/products").then(d=>setProducts(d||[])); apiFetch("/ingredients").then(d=>setIngredients(d||[])); };
  useEffect(load,[]);

  const openAdd = () => { setForm({name:"",price:"",category:"Drinks"}); setRecipe([]); setModal("add"); };
  const openEdit = async p => {
    setForm({name:p.name,price:p.price,category:p.category});
    const r = await apiFetch(`/products/${p.id}/recipe`);
    setRecipe((r||[]).map(x=>({ingredient_id:x.ingredient_id,quantity:x.quantity})));
    setModal(p);
  };

  const toggleRecipeIng = id => {
    if (recipe.find(r=>r.ingredient_id==id)) return;
    setRecipe([...recipe,{ingredient_id:id,quantity:1}]);
  };
  const updQty = (i,v) => { const u=[...recipe]; u[i].quantity=parseFloat(v)||0; setRecipe(u); };
  const rmIng = i => setRecipe(recipe.filter((_,x)=>x!==i));

  const save = async () => {
    if (!form.name||!form.price) return alert("Fill in name and price.");
    const body = {...form,price:parseFloat(form.price),recipe};
    if (modal==="add") await apiFetch("/products",{method:"POST",body:JSON.stringify(body)});
    else await apiFetch(`/products/${modal.id}`,{method:"PUT",body:JSON.stringify(body)});
    setModal(null); load();
  };

  const del = async id => { if (!window.confirm("Delete?")) return; await apiFetch(`/products/${id}`,{method:"DELETE"}); load(); };
  const viewRecipe = async p => { const r=await apiFetch(`/products/${p.id}/recipe`); setRecipeView({product:p,recipe:r||[]}); };

  const cats = [...new Set(products.map(p=>p.category))];

  return (
    <Layout title="Products">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"18px"}}>
        <span style={{color:"#8888aa",fontSize:"13px"}}>{products.length} products in menu</span>
        {user.role==="admin" && <button onClick={openAdd} style={{padding:"9px 18px",background:tc,color:"#fff",border:"none",borderRadius:"9px",cursor:"pointer",fontWeight:"600",fontSize:"13px"}}>+ Add Product</button>}
      </div>

      {!cats.length && (
        <div style={{background:"#13131A",border:"1px dashed #ffffff18",borderRadius:"14px",padding:"50px",textAlign:"center"}}>
          <div style={{fontSize:"40px",marginBottom:"12px"}}>🍵</div>
          <p style={{color:"#8888aa",fontSize:"13px"}}>No products yet. Add your first menu item!</p>
        </div>
      )}

      {cats.map(cat=>(
        <div key={cat} style={{marginBottom:"24px"}}>
          <h3 style={{color:"#8888aa",fontSize:"11px",letterSpacing:"1px",margin:"0 0 12px",textTransform:"uppercase"}}>{cat}</h3>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))",gap:"12px"}}>
            {products.filter(p=>p.category===cat).map(p=>(
              <div key={p.id} style={{background:"#13131A",border:"1px solid #ffffff0f",borderRadius:"13px",padding:"16px"}}>
                <div style={{fontSize:"28px",marginBottom:"8px"}}>🧋</div>
                <div style={{color:"#fff",fontWeight:"600",fontSize:"14px",marginBottom:"3px"}}>{p.name}</div>
                <div style={{color:tc,fontWeight:"700",fontSize:"17px",marginBottom:"11px"}}>₱{parseFloat(p.price).toFixed(2)}</div>
                <div style={{display:"flex",gap:"5px",flexWrap:"wrap"}}>
                  <button onClick={()=>viewRecipe(p)} style={{flex:1,padding:"6px",background:"#ffffff0a",color:"#8888aa",border:"1px solid #ffffff18",borderRadius:"7px",cursor:"pointer",fontSize:"11px"}}>📋 Recipe</button>
                  {user.role==="admin" && <>
                    <button onClick={()=>openEdit(p)} style={{flex:1,padding:"6px",background:"#8888ff18",color:"#8888ff",border:"1px solid #8888ff33",borderRadius:"7px",cursor:"pointer",fontSize:"11px"}}>✏️ Edit</button>
                    <button onClick={()=>del(p.id)} style={{padding:"6px 9px",background:"#ff4b4b18",color:"#ff6b6b",border:"1px solid #ff4b4b33",borderRadius:"7px",cursor:"pointer",fontSize:"11px"}}>🗑</button>
                  </>}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Add/Edit Modal */}
      {modal!==null && (
        <div style={{position:"fixed",inset:0,background:"#000000bb",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:"20px"}}>
          <div style={{background:"#13131A",border:"1px solid #ffffff18",borderRadius:"18px",padding:"24px",width:"100%",maxWidth:"560px",maxHeight:"90vh",overflowY:"auto"}}>
            <h3 style={{color:"#fff",margin:"0 0 20px",fontFamily:"'Playfair Display',serif",fontSize:"18px"}}>{modal==="add"?"➕ Add Product":"✏️ Edit Product"}</h3>
            <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:"10px",marginBottom:"16px"}}>
              {[{l:"PRODUCT NAME",f:"name",ph:"e.g. Brown Sugar Boba"},{l:"PRICE (₱)",f:"price",ph:"0.00",t:"number"},{l:"CATEGORY",f:"category",ph:"Drinks"}].map(x=>(
                <div key={x.f}>
                  <label style={{color:"#556",fontSize:"10px",display:"block",marginBottom:"4px"}}>{x.l}</label>
                  <input type={x.t||"text"} value={form[x.f]} placeholder={x.ph} onChange={e=>setForm({...form,[x.f]:e.target.value})} style={inp}/>
                </div>
              ))}
            </div>

            <label style={{color:"#556",fontSize:"10px",display:"block",marginBottom:"8px",letterSpacing:".4px"}}>RECIPE / INGREDIENTS</label>
            <div style={{display:"flex",flexWrap:"wrap",gap:"5px",marginBottom:"10px",padding:"11px",background:"#0D0D12",borderRadius:"9px",border:"1px solid #ffffff0f"}}>
              {ingredients.map(i=>(
                <button key={i.id} onClick={()=>toggleRecipeIng(i.id)} disabled={!!recipe.find(r=>r.ingredient_id==i.id)} style={{padding:"4px 11px",background:recipe.find(r=>r.ingredient_id==i.id)?tc+"44":"#ffffff0a",color:recipe.find(r=>r.ingredient_id==i.id)?tc:"#8888aa",border:`1px solid ${recipe.find(r=>r.ingredient_id==i.id)?tc+"66":"#ffffff18"}`,borderRadius:"20px",cursor:"pointer",fontSize:"11px"}}>
                  {i.name}
                </button>
              ))}
              {!ingredients.length && <span style={{color:"#556",fontSize:"12px"}}>No ingredients yet.</span>}
            </div>

            {recipe.map((r,i)=>{ const ing=ingredients.find(x=>x.id==r.ingredient_id); return(
              <div key={i} style={{display:"flex",alignItems:"center",gap:"9px",marginBottom:"7px"}}>
                <div style={{flex:1,color:"#fff",fontSize:"12px"}}>{ing?.name}</div>
                <input type="number" value={r.quantity} onChange={e=>updQty(i,e.target.value)} style={{...inp,width:"75px",padding:"7px 9px"}}/>
                <span style={{color:"#556",fontSize:"11px",width:"28px"}}>{ing?.unit}</span>
                <button onClick={()=>rmIng(i)} style={{padding:"4px 9px",background:"#ff4b4b18",color:"#ff6b6b",border:"none",borderRadius:"5px",cursor:"pointer",fontSize:"11px"}}>✕</button>
              </div>
            );})}

            <div style={{display:"flex",gap:"9px",marginTop:"16px"}}>
              <button onClick={()=>setModal(null)} style={{flex:1,padding:"11px",background:"transparent",border:"1px solid #ffffff18",color:"#8888aa",borderRadius:"9px",cursor:"pointer"}}>Cancel</button>
              <button onClick={save} style={{flex:2,padding:"11px",background:`linear-gradient(135deg,${tc},${tc}88)`,border:"none",color:"#fff",borderRadius:"9px",cursor:"pointer",fontWeight:"600",fontSize:"13px"}}>Save Product</button>
            </div>
          </div>
        </div>
      )}

      {/* Recipe view modal */}
      {recipeView && (
        <div style={{position:"fixed",inset:0,background:"#000000bb",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
          <div style={{background:"#13131A",border:"1px solid #ffffff18",borderRadius:"18px",padding:"24px",width:"360px"}}>
            <h3 style={{color:"#fff",margin:"0 0 5px",fontFamily:"'Playfair Display',serif"}}>📋 {recipeView.product.name}</h3>
            <p style={{color:"#8888aa",fontSize:"12px",marginBottom:"16px"}}>₱{parseFloat(recipeView.product.price).toFixed(2)} · {recipeView.product.category}</p>
            {!recipeView.recipe.length ? <p style={{color:"#556",fontSize:"13px"}}>No recipe defined.</p>
            : recipeView.recipe.map((r,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:i<recipeView.recipe.length-1?"1px solid #ffffff08":"none"}}>
                <span style={{color:"#fff",fontSize:"13px"}}>{r.ingredient_name}</span>
                <span style={{color:tc,fontSize:"13px",fontWeight:"600"}}>{r.quantity} {r.unit}</span>
              </div>
            ))}
            <button onClick={()=>setRecipeView(null)} style={{width:"100%",padding:"11px",background:"#ffffff0a",border:"1px solid #ffffff18",color:"#fff",borderRadius:"9px",cursor:"pointer",marginTop:"16px"}}>Close</button>
          </div>
        </div>
      )}
    </Layout>
  );
}