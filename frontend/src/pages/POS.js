import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { apiFetch, getShop } from "../services/api";

export default function POS() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [pm, setPm] = useState("cash");
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [cat, setCat] = useState("All");
  const shop = getShop(); const tc = shop.theme_color||"#D50036";

  useEffect(()=>{ apiFetch("/products").then(d=>setProducts(d||[])); },[]);

  const cats = ["All",...new Set(products.map(p=>p.category))];
  const shown = cat==="All" ? products : products.filter(p=>p.category===cat);

  const addToCart = p => {
    const ex = cart.find(c=>c.product_id===p.id);
    setCart(ex ? cart.map(c=>c.product_id===p.id?{...c,quantity:c.quantity+1}:c) : [...cart,{product_id:p.id,name:p.name,price:parseFloat(p.price),quantity:1}]);
  };
  const updQty = (id,q) => q<=0 ? setCart(cart.filter(c=>c.product_id!==id)) : setCart(cart.map(c=>c.product_id===id?{...c,quantity:q}:c));

  const subtotal = cart.reduce((s,c)=>s+c.price*c.quantity,0);
  const total = subtotal - parseFloat(discount||0);

  const sell = async () => {
    if (!cart.length) return alert("Cart is empty!");
    if (total<0) return alert("Discount cannot exceed subtotal.");
    setLoading(true);
    const res = await apiFetch("/sell",{method:"POST",body:JSON.stringify({items:cart.map(c=>({product_id:c.product_id,quantity:c.quantity,price:c.price})),payment_method:pm,discount:parseFloat(discount||0)})});
    if (res.status==="success") { setReceipt({items:cart,subtotal,discount:parseFloat(discount||0),total,pm,tx_id:res.transaction_id}); setCart([]); setDiscount(0); }
    else alert(res.message||"Transaction failed.");
    setLoading(false);
  };

  const print = () => {
    if (!receipt) return;
    const w = window.open("","","width=320,height=580");
    w.document.write(`<html><head><style>body{font-family:monospace;font-size:13px;padding:16px}h2{text-align:center;margin:0 0 3px}p{text-align:center;margin:0 0 10px;color:#666}hr{border:1px dashed #ccc;margin:8px 0}.r{display:flex;justify-content:space-between;margin:3px 0}.b{font-weight:bold;font-size:15px}</style></head><body>
      <h2>🧋 ${shop.logo_text||"Milk Tea"}</h2><p>${new Date().toLocaleString()}</p><p>TX#${receipt.tx_id}</p><hr/>
      ${receipt.items.map(i=>`<div class="r"><span>${i.name} x${i.quantity}</span><span>₱${(i.price*i.quantity).toFixed(2)}</span></div>`).join("")}
      <hr/><div class="r"><span>Subtotal</span><span>₱${receipt.subtotal.toFixed(2)}</span></div>
      ${receipt.discount>0?`<div class="r"><span>Discount</span><span>-₱${receipt.discount.toFixed(2)}</span></div>`:""}
      <div class="r b"><span>TOTAL</span><span>₱${receipt.total.toFixed(2)}</span></div>
      <div class="r"><span>Payment</span><span>${receipt.pm.toUpperCase()}</span></div>
      <hr/><p>Thank you! Come again 🧋</p></body></html>`);
    w.print();
  };

  const Btn = ({style,...p}) => <button style={{border:"none",cursor:"pointer",borderRadius:"8px",...style}} {...p}/>;

  return (
    <Layout title="Point of Sale">
      <div style={{display:"flex",gap:"18px",height:"calc(100vh - 112px)"}}>

        {/* Products */}
        <div style={{flex:1,overflowY:"auto"}}>
          <div style={{display:"flex",gap:"6px",flexWrap:"wrap",marginBottom:"14px"}}>
            {cats.map(c=><button key={c} onClick={()=>setCat(c)} style={{padding:"6px 13px",background:cat===c?tc:"#13131A",color:cat===c?"#fff":"#8888aa",border:`1px solid ${cat===c?tc:"#ffffff18"}`,borderRadius:"20px",cursor:"pointer",fontSize:"12px"}}>{c}</button>)}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:"10px"}}>
            {shown.map(p=>{const inCart=cart.find(c=>c.product_id===p.id); return(
              <div key={p.id} onClick={()=>addToCart(p)} style={{background:inCart?`${tc}18`:"#13131A",border:`1px solid ${inCart?tc+"55":"#ffffff0f"}`,borderRadius:"12px",padding:"15px 12px",cursor:"pointer",textAlign:"center",position:"relative",transition:"all .15s"}}
                onMouseEnter={e=>e.currentTarget.style.background=inCart?`${tc}28`:"#1a1a24"} onMouseLeave={e=>e.currentTarget.style.background=inCart?`${tc}18`:"#13131A"}>
                {inCart && <div style={{position:"absolute",top:"7px",right:"7px",background:tc,color:"#fff",width:"18px",height:"18px",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"10px",fontWeight:"700"}}>{inCart.quantity}</div>}
                <div style={{fontSize:"26px",marginBottom:"7px"}}>🧋</div>
                <div style={{color:"#fff",fontSize:"12px",fontWeight:"600",marginBottom:"3px"}}>{p.name}</div>
                <div style={{color:tc,fontSize:"15px",fontWeight:"700"}}>₱{parseFloat(p.price).toFixed(2)}</div>
              </div>
            );})}
          </div>
        </div>

        {/* Cart */}
        <div style={{width:"280px",flexShrink:0,background:"#13131A",border:"1px solid #ffffff0f",borderRadius:"14px",display:"flex",flexDirection:"column",overflow:"hidden"}}>
          <div style={{padding:"16px 18px 12px",borderBottom:"1px solid #ffffff0f"}}>
            <h3 style={{color:"#fff",margin:0,fontSize:"15px",fontWeight:"700"}}>🛒 Order</h3>
          </div>

          <div style={{flex:1,overflowY:"auto",padding:"10px"}}>
            {!cart.length && <div style={{textAlign:"center",padding:"32px 0",color:"#8888aa",fontSize:"12px"}}><div style={{fontSize:"28px",marginBottom:"7px"}}>🧋</div>Tap a product to add</div>}
            {cart.map(item=>(
              <div key={item.product_id} style={{display:"flex",alignItems:"center",gap:"8px",padding:"9px",background:"#0D0D12",borderRadius:"9px",marginBottom:"7px"}}>
                <div style={{flex:1}}>
                  <div style={{color:"#fff",fontSize:"12px",fontWeight:"500"}}>{item.name}</div>
                  <div style={{color:"#8888aa",fontSize:"11px"}}>₱{item.price.toFixed(2)} each</div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:"5px"}}>
                  <Btn style={{width:"22px",height:"22px",background:"#ffffff18",color:"#fff",fontSize:"13px",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:"50%"}} onClick={()=>updQty(item.product_id,item.quantity-1)}>−</Btn>
                  <span style={{color:"#fff",fontSize:"13px",fontWeight:"600",minWidth:"16px",textAlign:"center"}}>{item.quantity}</span>
                  <Btn style={{width:"22px",height:"22px",background:tc,color:"#fff",fontSize:"13px",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:"50%"}} onClick={()=>updQty(item.product_id,item.quantity+1)}>+</Btn>
                </div>
                <div style={{color:tc,fontSize:"12px",fontWeight:"700",minWidth:"48px",textAlign:"right"}}>₱{(item.price*item.quantity).toFixed(2)}</div>
              </div>
            ))}
          </div>

          <div style={{padding:"14px 16px",borderTop:"1px solid #ffffff0f"}}>
            <label style={{color:"#556",fontSize:"10px",display:"block",marginBottom:"5px"}}>PAYMENT</label>
            <div style={{display:"flex",gap:"5px",marginBottom:"10px"}}>
              {["cash","gcash","card"].map(p=>(
                <button key={p} onClick={()=>setPm(p)} style={{flex:1,padding:"6px 0",background:pm===p?tc:"#0D0D12",color:pm===p?"#fff":"#8888aa",border:`1px solid ${pm===p?tc:"#ffffff18"}`,borderRadius:"7px",cursor:"pointer",fontSize:"11px",textTransform:"capitalize"}}>{p}</button>
              ))}
            </div>
            <label style={{color:"#556",fontSize:"10px",display:"block",marginBottom:"4px"}}>DISCOUNT (₱)</label>
            <input type="number" value={discount} onChange={e=>setDiscount(e.target.value)} style={{width:"100%",padding:"7px 10px",background:"#0D0D12",border:"1px solid #ffffff18",borderRadius:"7px",color:"#fff",fontSize:"12px",outline:"none",boxSizing:"border-box",marginBottom:"10px"}}/>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:"4px"}}><span style={{color:"#8888aa",fontSize:"12px"}}>Subtotal</span><span style={{color:"#fff",fontSize:"12px"}}>₱{subtotal.toFixed(2)}</span></div>
            {parseFloat(discount)>0 && <div style={{display:"flex",justifyContent:"space-between",marginBottom:"4px"}}><span style={{color:"#8888aa",fontSize:"12px"}}>Discount</span><span style={{color:"#ff6b6b",fontSize:"12px"}}>-₱{parseFloat(discount).toFixed(2)}</span></div>}
            <div style={{display:"flex",justifyContent:"space-between",margin:"7px 0",paddingTop:"7px",borderTop:"1px solid #ffffff0f"}}>
              <span style={{color:"#fff",fontSize:"14px",fontWeight:"700"}}>TOTAL</span>
              <span style={{color:tc,fontSize:"17px",fontWeight:"800"}}>₱{total.toFixed(2)}</span>
            </div>
            <button onClick={sell} disabled={loading||!cart.length} style={{width:"100%",padding:"12px",background:cart.length?`linear-gradient(135deg,${tc},${tc}88)`:"#333",color:"#fff",border:"none",borderRadius:"9px",cursor:cart.length?"pointer":"not-allowed",fontSize:"14px",fontWeight:"700",boxShadow:cart.length?`0 4px 16px ${tc}44`:"none"}}>
              {loading?"Processing...":`Charge ₱${total.toFixed(2)}`}
            </button>
          </div>
        </div>
      </div>

      {/* Receipt */}
      {receipt && (
        <div style={{position:"fixed",inset:0,background:"#000000bb",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000}}>
          <div style={{background:"#13131A",border:"1px solid #22cc7766",borderRadius:"18px",padding:"28px",width:"320px",textAlign:"center"}}>
            <div style={{fontSize:"44px",marginBottom:"7px"}}>✅</div>
            <h3 style={{color:"#22cc77",margin:"0 0 3px",fontFamily:"'Playfair Display',serif"}}>Sale Complete!</h3>
            <p style={{color:"#8888aa",fontSize:"11px",marginBottom:"16px"}}>TX#{receipt.tx_id}</p>
            {receipt.items.map((item,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",marginBottom:"7px"}}>
                <span style={{color:"#aaa",fontSize:"12px"}}>{item.name} ×{item.quantity}</span>
                <span style={{color:"#fff",fontSize:"12px"}}>₱{(item.price*item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div style={{borderTop:"1px solid #ffffff18",paddingTop:"10px",marginTop:"4px",display:"flex",justifyContent:"space-between"}}>
              <span style={{color:"#fff",fontWeight:"700",fontSize:"14px"}}>Total</span>
              <span style={{color:tc,fontWeight:"800",fontSize:"18px"}}>₱{receipt.total.toFixed(2)}</span>
            </div>
            <div style={{display:"flex",gap:"9px",marginTop:"18px"}}>
              <button onClick={print} style={{flex:1,padding:"10px",background:"#ffffff0a",border:"1px solid #ffffff18",color:"#fff",borderRadius:"9px",cursor:"pointer",fontSize:"12px"}}>🖨️ Print</button>
              <button onClick={()=>setReceipt(null)} style={{flex:1,padding:"10px",background:tc,border:"none",color:"#fff",borderRadius:"9px",cursor:"pointer",fontWeight:"600"}}>New Order</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}